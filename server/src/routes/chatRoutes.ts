import { Router } from 'express';
import { handleChatMessage, getChatHistory } from '../controllers/chatController';

const router = Router();

// Endpoint: POST http://localhost:5000/api/chat/message
router.post('/message', handleChatMessage); 

// Endpoint: GET http://localhost:5000/api/chat/history/:sessionId
router.get('/history/:sessionId', getChatHistory); 

export default router;