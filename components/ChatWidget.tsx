import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User, Bot, Image as ImageIcon, Trash2 } from 'lucide-react';
import { getChatTutorResponse, ChatMessage } from '../services/geminiService';
import MathRenderer from './MathRenderer';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Chào em! 👋 Thầy là Gia sư Toán AI.\nEm có thể hỏi bài hoặc gửi ảnh đề bài để thầy giải giúp nhé! 📸💡' }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input only if not interacting with file selection
      if (!selectedImage) {
         setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  }, [isOpen, messages, selectedImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset value so same file can be selected again
    e.target.value = '';
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsgText = input.trim();
    const userImage = selectedImage;
    
    setInput('');
    setSelectedImage(null);
    
    // Add user message to UI immediately
    const newHistory: ChatMessage[] = [
        ...messages, 
        { 
            role: 'user', 
            text: userMsgText,
            image: userImage || undefined
        }
    ];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Get AI response
      const responseText = await getChatTutorResponse(messages, userMsgText, userImage || undefined);
      setMessages([...newHistory, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages([...newHistory, { role: 'model', text: 'Thầy xin lỗi, có chút trục trặc kỹ thuật. Em thử lại sau nhé!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 group"
          title="Hỏi thầy Toán AI"
        >
          <MessageCircle className="w-8 h-8" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] items-center justify-center font-bold">1</span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[90vw] md:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col border border-gray-100 animate-fade-in overflow-hidden ring-1 ring-black/5">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Thầy Toán AI</h3>
                <div className="flex items-center gap-1.5 opacity-90">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium">Sẵn sàng giải toán</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div key={idx} className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-sm
                    ${isUser ? 'bg-indigo-500' : 'bg-blue-600'}`}>
                    {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-4 h-4" />}
                  </div>

                  {/* Bubble Content */}
                  <div className={`max-w-[80%] flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
                     {/* Image in message */}
                     {msg.image && (
                         <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm max-w-full">
                             <img src={msg.image} alt="User upload" className="w-full h-auto object-cover max-h-48" />
                         </div>
                     )}

                     {/* Text Bubble */}
                     {(msg.text || !msg.image) && (
                        <div className={`p-3 rounded-2xl shadow-sm text-sm leading-relaxed
                            ${isUser 
                            ? 'bg-indigo-500 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                            }`}>
                            <MathRenderer text={msg.text} />
                        </div>
                     )}
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white">
                   <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Image Preview Area */}
          {selectedImage && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-start gap-2 animate-fade-in">
                <div className="relative group">
                    <img src={selectedImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-300" />
                    <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
                <div className="text-xs text-gray-500 italic mt-1">
                    Đã chọn ảnh. Nhấn gửi để thầy giải nhé!
                </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              
              {/* Image Upload Button */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
                title="Gửi ảnh đề bài"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleFileSelect}
              />

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={selectedImage ? "Thêm ghi chú..." : "Nhập câu hỏi..."}
                className="flex-1 bg-transparent px-2 py-1 outline-none text-gray-700 placeholder:text-gray-400 text-sm"
                disabled={isLoading}
              />
              
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className={`p-2 rounded-full transition-all flex-shrink-0
                  ${(!input.trim() && !selectedImage) || isLoading 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2 font-medium">
              AI có thể mắc lỗi, hãy kiểm tra lại thông tin quan trọng.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;