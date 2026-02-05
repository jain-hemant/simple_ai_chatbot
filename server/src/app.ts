// src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors()); // Allow frontend to access
app.use(express.json()); // Parse JSON bodies

// Mount the routes
app.use('/api/chat', chatRoutes);

// Basic Health Check Route
app.get('/', (req, res) => {
  res.send('Spur Chat API is running');
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Something went wrong on our end.' });
});

// Start Server
const startServer = async () => {

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();