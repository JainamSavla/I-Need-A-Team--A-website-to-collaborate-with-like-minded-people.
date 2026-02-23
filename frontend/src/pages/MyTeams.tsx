import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { chatService } from '../services/chatService';
import { Team } from '../types';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const MyTeams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const data = await chatService.getMyTeams();
        setTeams(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12 animate-in fade-in duration-500 bg-black">
      <div className="space-y-3">
        <h1 className="text-4xl font-black text-white tracking-tight">Active Operations</h1>
        <p className="text-slate-400 text-lg">Your collaborative spaces for real-time planning and mission coordination.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {teams.map(team => (
          <TeamCard key={team.id} team={team} onClick={() => navigate(`/chat/${team.id}`)} />
        ))}

        {teams.length === 0 && (
          <div className="text-center py-24 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] shadow-2xl">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-slate-600 mx-auto mb-8 border border-white/5">
              <Users size={48} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No active teams</h3>
            <p className="text-slate-400 mb-10 max-w-sm mx-auto text-lg italic">
              Join a mission or broadcast your own to start building your elite squad.
            </p>
            <Button onClick={() => navigate('/')} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl px-10 py-6 font-black text-lg shadow-xl shadow-indigo-600/20">
              Browse Missions
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const TeamCard: React.FC<{ team: Team, onClick: () => void }> = ({ team, onClick }) => {
  const memberCount = (team as any).members?.length || team.memberIds?.length || 0;
  return (
    <Card className="bg-[#0a0a0a] border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer group rounded-[2rem] overflow-hidden" onClick={onClick}>
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex gap-6 items-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 shrink-0 group-hover:scale-110 transition-transform">
              <Users size={32} />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors">{(team as any).opening?.title || team.name}</h3>
                <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/5">
                  {team.code}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <span className="flex items-center gap-2 text-slate-400 font-medium">
                  <Users size={16} className="text-indigo-400" /> {memberCount} Operators
                </span>
                <span className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-[10px]">
                  <ShieldCheck size={16} className="text-green-500" /> Secure Transmission Active
                </span>
              </div>
            </div>
          </div>
          
          <Button className="w-full md:w-auto bg-white/5 hover:bg-indigo-600 text-white border border-white/10 hover:border-indigo-600 py-6 px-8 rounded-2xl font-black transition-all">
            Enter Channel <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyTeams;