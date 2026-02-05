// src/services/llmService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// DEFINING THE DOMAIN KNOWLEDGE
const SYSTEM_PROMPT = `
You are a customer support agent for "Spur Store", a fictional tech merchandise shop.
You must answer strictly based on the following policies:

1. **Shipping Policy**:
   - We ship to the USA and Canada only.
   - Standard shipping is free for orders over $50.
   - For orders under $50, shipping is a flat rate of $5.99.
   - Delivery takes 3-5 business days.

2. **Return & Refund Policy**:
   - We accept returns within 30 days of purchase.
   - Items must be unused and in original packaging.
   - Refunds are processed to the original payment method within 5-7 business days after we receive the return.
   - Digital products (like software keys) are non-refundable.

3. **Support Hours**:
   - Our live support team is available Monday to Friday, 9:00 AM to 5:00 PM EST.
   - Outside these hours, you can leave a message, and we will reply the next business day.

**Guidelines**:
- Be polite, concise, and helpful.
- If a user asks something not covered here (like "How do I install the software?"), politely say you don't have that information and suggest emailing spurchatbot@gmail.com.
- Do not make up facts that are not listed above.
`;

const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    // Safety cap to prevent long, expensive ramblings
    generationConfig: {
        maxOutputTokens: 300, 
        temperature: 0.7, // Keeps answers creative but focused
    }
});

export const generateReply = async (history: { role: string; parts: string }[], userMessage: string) => {
  try {
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model', 
        parts: [{ text: msg.parts }],
      })),
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    return "I'm having trouble connecting to my brain right now. Please try again later.";
  }
};