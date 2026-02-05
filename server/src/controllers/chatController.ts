// src/controllers/chatController.ts
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { generateReply } from '../services/llmService';
import { v4 as uuidv4 } from 'uuid';

export const handleChatMessage = async (req: Request, res: Response): Promise<void> => {
  let { message, sessionId } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  // Idiot-Proofing: Truncate long messages
  if (message.length > 500) message = message.substring(0, 500) + "...";

  const activeSessionId = sessionId || uuidv4();

  try {
    // 1. Find or Create Conversation
    const conversation = await prisma.conversation.upsert({
      where: { sessionId: activeSessionId },
      update: {},
      create: { sessionId: activeSessionId },
    });

    // 2. Save User Message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'user',
        content: message,
      },
    });

    // 3. Fetch History (Limit 10)
    const pastMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    // Format for Gemini Service
    const history = pastMessages.map((msg) => ({
      role: msg.sender,
      parts: msg.content,
    }));

    // 4. Generate AI Reply
    const aiReply = await generateReply(history, message);

    // 5. Save AI Reply
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'ai',
        content: aiReply,
      },
    });

    res.json({ reply: aiReply, sessionId: activeSessionId });
  } catch (error) {
    console.error('Chat Handler Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  // FIX: Explicitly cast req.params to tell TS "sessionId is a string"
  const { sessionId } = req.params as { sessionId: string };

  if (!sessionId) {
    res.status(400).json({ error: 'Session ID is required' });
    return;
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { sessionId }, // This is now safe
      include: { 
        messages: { 
          orderBy: { createdAt: 'asc' },
          select: { sender: true, content: true, createdAt: true } 
        } 
      },
    });

    if (!conversation) {
      res.json([]);
      return;
    }

    // Now TypeScript knows 'messages' exists because the query above is valid
    res.json(conversation.messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};