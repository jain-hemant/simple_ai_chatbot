import { Request, Response } from 'express';
import { query } from '../config/db';
import { generateReply } from '../services/llmService';
import { v4 as uuidv4 } from 'uuid';

export const handleChatMessage = async (req: Request, res: Response): Promise<void> => {
    let { message, sessionId } = req.body;

    if (!message) {
        res.status(400).json({ error: 'Message is required' });
        return;
    }
    // Truncate messages longer than 500 characters
    if (message.length > 500) {
        message = message.substring(0, 500) + "... (truncated)";
    }

    // Use provided sessionId (if user refreshes) or create a new one
    const activeSessionId = sessionId || uuidv4();

    try {
        // 1. Ensure conversation exists in DB
        // "ON CONFLICT DO NOTHING" ensures we don't crash if the session already exists
        await query(
            `INSERT INTO conversations (session_id) VALUES ($1) ON CONFLICT (session_id) DO NOTHING`,
            [activeSessionId]
        );

        // Get the internal UUID for this session
        const convoResult = await query(
            `SELECT id FROM conversations WHERE session_id = $1`,
            [activeSessionId]
        );
        const conversationId = convoResult.rows[0]?.id;

        // 2. Save USER Message to DB
        await query(
            `INSERT INTO messages (conversation_id, sender, content) VALUES ($1, 'user', $2)`,
            [conversationId, message]
        );

        // 3. Fetch History (Limit to last 10 messages to save tokens)
        const historyResult = await query(
            `SELECT sender, content FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC LIMIT 10`,
            [conversationId]
        );

        // Format history for Gemini Service
        const history = historyResult.rows.map(row => ({
            role: row.sender,
            parts: row.content
        }));

        // 4. Generate AI Reply (Call Gemini)
        const aiReply = await generateReply(history, message);

        // 5. Save AI Reply to DB
        await query(
            `INSERT INTO messages (conversation_id, sender, content) VALUES ($1, 'ai', $2)`,
            [conversationId, aiReply]
        );

        // 6. Respond to Frontend
        res.json({ reply: aiReply, sessionId: activeSessionId });

    } catch (error) {
        console.error('Chat Handler Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Endpoint to load past messages when user refreshes the page
export const getChatHistory = async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    try {
        const result = await query(
            `SELECT m.sender, m.content, m.created_at 
             FROM messages m 
             JOIN conversations c ON m.conversation_id = c.id 
             WHERE c.session_id = $1 
             ORDER BY m.created_at ASC`,
            [sessionId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};