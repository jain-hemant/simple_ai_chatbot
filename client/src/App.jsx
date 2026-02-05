import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { sendMessage, getHistory } from './services/api';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 1. Load History on Mount
  useEffect(() => {
    const loadHistory = async () => {
      const history = await getHistory();
      // Map DB format to UI format if needed, or just use as is
      setMessages(history);
    };
    loadHistory();
  }, []);

  // 2. Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 3. Handle Send
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setIsLoading(true);

    // Optimistically add user message to UI
    setMessages(prev => [...prev, { sender: 'user', content: userText }]);

    try {
      const data = await sendMessage(userText);
      // Add AI response
      setMessages(prev => [...prev, { sender: 'ai', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', content: "⚠️ Error connecting to server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 items-center justify-center p-4">
      {/* Chat Container */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden flex flex-col h-[600px]">
        
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white font-bold flex justify-between items-center">
          <span>Spur Support Agent</span>
          <span className="text-xs bg-blue-500 px-2 py-1 rounded">Live</span>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 mt-10">Ask me anything about Spur!</p>
          )}
          
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                {/* Use ReactMarkdown to render AI lists/bold text nicely */}
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 p-3 rounded-lg rounded-bl-none text-xs text-gray-500 animate-pulse">
                Agent is typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;