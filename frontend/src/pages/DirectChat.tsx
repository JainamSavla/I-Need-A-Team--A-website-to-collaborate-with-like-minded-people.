import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ChevronLeft, Shield, Loader2, User as UserIcon, Mail, ExternalLink } from 'lucide-react';
import { chatService } from '../services/chatService';
import { authService } from '../services/authService';
import { api } from '../lib/api';

const DirectChat: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  
  const [otherUser, setOtherUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!userId) return;
    try {
      const data = await chatService.getDirectMessages(userId);
      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOtherUser = async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/users/${userId}`);
      setOtherUser(response.data);
    } catch (error) {
      console.error(error);
      navigate('/teams');
    }
  };

  useEffect(() => {
    const initChat = async () => {
      if (!userId || !currentUser) return;
      if (userId === currentUser.id) {
        navigate('/teams');
        return;
      }
      try {
        setLoading(true);
        await Promise.all([fetchOtherUser(), fetchMessages()]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    initChat();

    // Poll for messages
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [userId, navigate, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !userId || !currentUser) return;

    try {
      const sentText = inputText;
      setInputText('');
      
      const newMessage = await chatService.sendDirectMessage(userId, sentText);
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      alert('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!otherUser) return null;

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-6rem)] flex bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
      <div className="flex flex-col flex-grow">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
            >
              <ChevronLeft size={20} className="text-slate-400" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center border border-white/10 overflow-hidden">
                {otherUser.avatarUrl ? (
                  <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-full h-full object-cover" />
                ) : (
                  (otherUser.name || 'U').charAt(0)
                )}
              </div>
              <div>
                <h2 className="font-black text-xl leading-none mb-1.5 text-white">{otherUser.name || 'User'}</h2>
                <div className="flex items-center gap-2 text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Direct Secure Link
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-grow overflow-y-auto p-8 space-y-6 no-scrollbar bg-black/40">
          {messages.map((msg, index) => {
            const isOwn = msg.senderId === currentUser?.id;
            const sender = isOwn ? currentUser : otherUser;
            const senderName = sender?.name || 'User';
            const senderAvatar = sender?.avatarUrl;
            const showName = index === 0 || messages[index - 1].senderId !== msg.senderId;
            const timestamp = msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now();
            
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} gap-4 items-end animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`shrink-0 w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-indigo-600/20 flex items-center justify-center text-[10px] font-black text-white uppercase`}>
                  {senderAvatar ? (
                    <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
                  ) : (
                    senderName.charAt(0)
                  )}
                </div>

                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <div 
                    className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                      isOwn 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/10 font-medium' 
                        : 'bg-white/5 text-slate-200 rounded-tl-none border border-white/5 shadow-inner'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[8px] font-bold text-slate-600 mt-1.5 px-1 uppercase">
                    {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-6 bg-white/[0.02] border-t border-white/5">
          <div className="relative flex items-center max-w-3xl mx-auto w-full">
            <input 
              type="text"
              placeholder="Transmit private message..."
              className="w-full pl-6 pr-16 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 shadow-2xl transition-all placeholder:text-slate-600"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-2 p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 disabled:grayscale text-white rounded-xl shadow-xl shadow-indigo-600/30 transition-all active:scale-90"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DirectChat;