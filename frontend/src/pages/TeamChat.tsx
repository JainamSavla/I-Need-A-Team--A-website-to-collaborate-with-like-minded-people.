import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ChevronLeft, Shield, Info, MoreVertical, Loader2, X, User as UserIcon, Mail, Award, ExternalLink } from 'lucide-react';
import { chatService } from '../services/chatService';
import { authService } from '../services/authService';
import { Message, Team, UserProfile } from '../types';

const TeamChat: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  
  const [team, setTeam] = useState<Team | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!teamId) return;
    try {
      const data = await chatService.getTeamMessages(teamId);
      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMembers = async () => {
    if (!teamId) return;
    try {
      const data = await chatService.getTeamMembers(teamId);
      setMembers(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const initChat = async () => {
      if (!teamId) return;
      try {
        setLoading(true);
        const teams = await chatService.getMyTeams();
        const foundTeam = teams.find(t => t.id === teamId);
        if (foundTeam) {
          setTeam(foundTeam);
          await Promise.all([fetchMessages(), fetchMembers()]);
        } else {
          navigate('/teams');
        }
      } catch (error) {
        console.error(error);
        navigate('/teams');
      } finally {
        setLoading(false);
      }
    };
    initChat();

    // Poll for messages
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [teamId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !teamId || !currentUser) return;

    try {
      const sentText = inputText;
      setInputText('');
      
      const newMessage = await chatService.sendMessage(teamId, sentText);
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

  if (!team) return null;

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-6rem)] flex bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
      <div className={`flex flex-col flex-grow transition-all duration-300 ${showMembers ? 'md:mr-80' : ''}`}>
        {/* Chat Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => navigate('/teams')}
              className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
            >
              <ChevronLeft size={20} className="text-slate-400" />
            </button>
            <div>
              <h2 className="font-black text-xl leading-none mb-1.5 text-white">{(team as any).opening?.title || team.name}</h2>
              <div className="flex items-center gap-2 text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">
                <Shield size={10} className="text-green-500" />
                Secure Protocol Active
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowMembers(!showMembers)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border border-white/5 ${showMembers ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}
            >
              <Info size={20} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-slate-500 hover:text-white">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-grow overflow-y-auto p-8 space-y-6 no-scrollbar bg-black/40">
          {messages.map((msg, index) => {
            const isOwn = msg.senderId === currentUser?.id;
            const senderName = msg.sender?.name || 'Unknown';
            const memberInfo = members.find(m => m.id === msg.senderId);
            const senderRole = memberInfo?.teamRole || msg.sender?.primaryRole;
            const senderAvatar = msg.sender?.avatarUrl;
            const showName = index === 0 || messages[index - 1].senderId !== msg.senderId;
            const timestamp = msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now();
            
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} gap-4 items-end animate-in slide-in-from-bottom-2 duration-300`}>
                {/* Avatar */}
                <div className={`shrink-0 w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-indigo-600/20 flex items-center justify-center text-xs font-black text-white uppercase shadow-lg`}>
                  {senderAvatar ? (
                    <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
                  ) : (
                    senderName.charAt(0)
                  )}
                </div>

                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  {showName && (
                    <div className={`flex items-center gap-2 mb-1.5 ${isOwn ? 'flex-row-reverse mr-1' : 'ml-1'}`}>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isOwn ? 'You' : senderName}</span>
                      {senderRole && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded uppercase tracking-tighter">
                          {senderRole}
                        </span>
                      )}
                    </div>
                  )}
                  <div 
                    className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                      isOwn 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/10 font-medium' 
                        : 'bg-white/5 text-slate-200 rounded-tl-none border border-white/5 shadow-inner'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 mt-1.5 px-1 uppercase">
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
              placeholder="Transmit message..."
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
          <p className="text-[9px] text-slate-600 text-center mt-3 font-bold uppercase tracking-[0.2em] italic opacity-50">
            Secure end-to-end encrypted channel
          </p>
        </form>
      </div>

      {/* Members Sidebar */}
      <div className={`absolute top-0 right-0 h-full w-80 bg-[#0c0c0c] border-l border-white/10 transition-transform duration-300 z-20 ${showMembers ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Team Members</h3>
            <button onClick={() => setShowMembers(false)} className="text-slate-500 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto p-6 space-y-4 no-scrollbar">
            {members.map(member => (
              <div 
                key={member.id} 
                className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all cursor-pointer"
                onClick={() => navigate(`/profile/${member.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center text-white font-black text-lg border border-white/10 overflow-hidden">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      (member.name || 'U').charAt(0)
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">{member.name || 'Anonymous User'}</h4>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-tighter truncate">
                      {member.teamRole || member.primaryRole || 'Collaborator'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 pt-3 border-t border-white/5">
                  <span className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase">
                    <Award size={10} className="text-indigo-500" /> LVL {member.experienceLevel || 1}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/chat/direct/${member.id}`);
                    }}
                    className="flex items-center gap-1.5 text-[9px] text-indigo-400 hover:text-indigo-300 font-bold uppercase transition-colors"
                  >
                    <Mail size={10} className="text-indigo-500" /> Contact
                  </button>
                  <ExternalLink size={10} className="ml-auto text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-white/5 bg-black/40">
            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield size={16} className="text-green-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocol Stats</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-relaxed font-bold uppercase tracking-tighter">
                {members.length} Agents synchronized on this channel. Data transmission is encrypted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamChat;