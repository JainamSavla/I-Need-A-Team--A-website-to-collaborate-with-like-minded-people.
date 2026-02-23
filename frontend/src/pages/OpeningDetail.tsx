import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Star, 
  ChevronLeft, 
  Send,
  CheckCircle2,
  XCircle,
  Users,
  MessageSquare,
  Edit,
  Trash2,
  Loader2,
  Tag
} from 'lucide-react';
import { openingService } from '../services/openingService';
import { authService } from '../services/authService';
import { chatService } from '../services/chatService';
import { Opening, Application } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

const OpeningDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  
  const [opening, setOpening] = useState<Opening | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyData, setApplyData] = useState({ coverLetter: '', preferredRoleId: '' });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOpeningData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await openingService.getOpeningById(id);
      setOpening(data);
      if (data.recruiterId === currentUser?.id) {
        const apps = await openingService.getApplicationsByOpening(id);
        setApplications(apps);
      } else if (currentUser) {
        const myApps = await openingService.getMyApplications();
        const currentApp = myApps.find(a => a.openingId === id);
        if (currentApp) {
          setApplications([currentApp]);
        }
      }
      
      if (data.roles.length > 0) {
        setApplyData(prev => ({ ...prev, preferredRoleId: data.roles[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch opening:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpeningData();
  }, [id, currentUser?.id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opening || !id) return;

    try {
      setActionLoading(true);
      await openingService.apply(id, {
        coverLetter: applyData.coverLetter,
        preferredRoleId: applyData.preferredRoleId,
      });
      setShowApplyForm(false);
      alert('Application submitted successfully!');
      fetchOpeningData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async (appId: string, roleId: string) => {
    try {
      setActionLoading(true);
      await openingService.updateApplicationStatus(appId, { status: 'Accepted', roleId });
      fetchOpeningData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (appId: string) => {
    try {
      setActionLoading(true);
      await openingService.updateApplicationStatus(appId, { status: 'Rejected' });
      fetchOpeningData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this opening?')) return;
    try {
      setActionLoading(true);
      await openingService.deleteOpening(id);
      navigate('/');
    } catch (err) {
      alert('Failed to delete opening');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!opening) return null;

  const isRecruiter = opening.recruiterId === currentUser?.id;
  const isClosed = opening.status === 'Closed / Team Formed';
  const hasApplied = applications.some(a => a.applicantId === currentUser?.id);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12 animate-in fade-in duration-500 bg-black">
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center text-slate-500 hover:text-white transition-all bg-white/5 px-4 py-2 rounded-xl border border-white/5"
        >
          <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm uppercase tracking-widest">Back</span>
        </button>

        {isRecruiter && (
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(`/edit/${opening.id}`)}
              className="flex items-center gap-2 border-white/10 text-slate-400 hover:text-white rounded-xl px-5"
            >
              <Edit size={16} /> Edit Mission
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-500 border-red-500/10 hover:bg-red-500/10 rounded-xl px-5"
              disabled={actionLoading}
            >
              <Trash2 size={16} /> Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
                isClosed ? 'bg-slate-900/50 text-slate-500 border-white/5' : 'bg-green-500/10 text-green-400 border-green-500/20'
              }`}>
                {opening.status}
              </span>
              <span className="px-4 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                {opening.type}
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-white leading-tight">{opening.title}</h1>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-8 border-y border-white/5">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={12} className="text-indigo-400" /> Space
                </span>
                <span className="font-bold text-slate-200">{opening.location}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} className="text-indigo-400" /> Intensity
                </span>
                <span className="font-bold text-slate-200">{opening.commitment}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={12} className="text-indigo-400" /> Horizon
                </span>
                <span className="font-bold text-slate-200">{opening.timeline}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Star size={12} className="text-indigo-400" /> Value
                </span>
                <span className="font-bold text-slate-200">{opening.compensation}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-600 rounded-full" />
              Mission Briefing
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-400 leading-relaxed text-lg whitespace-pre-wrap italic">
                {opening.description}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-600 rounded-full" />
              Talent Required
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {opening.roles.map(role => (
                <Card key={role.id} className={`rounded-[1.5rem] bg-[#0a0a0a] border-white/10 transition-all ${role.filled >= role.slots ? 'opacity-40 grayscale' : 'hover:border-indigo-500/50'}`}>
                  <CardContent className="flex justify-between items-center p-6">
                    <div>
                      <h3 className="font-bold text-white text-lg">{role.name}</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                        {role.filled} of {role.slots} Filled
                      </p>
                    </div>
                    {role.filled >= role.slots ? (
                      <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-600 border border-white/5">
                        <XCircle size={20} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                        <Users size={20} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-600 rounded-full" />
              Technical Labels
            </h2>
            <div className="flex flex-wrap gap-3">
              {opening.tags.map(tag => (
                <span key={tag} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-slate-300 hover:text-indigo-400 hover:border-indigo-500/30 transition-all">
                  <Tag size={16} className="text-indigo-500" />
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <Card className="bg-[#0a0a0a] border-white/10 rounded-[2rem] overflow-hidden">
            <CardHeader className="border-b border-white/5 p-8">
              <h3 className="font-bold text-lg text-white uppercase tracking-widest">Originator</h3>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-600/20 overflow-hidden border border-white/10 shrink-0">
                  {((opening as any).recruiter?.avatarUrl || opening.recruiterAvatarUrl) ? (
                    <img src={(opening as any).recruiter?.avatarUrl || opening.recruiterAvatarUrl} alt={opening.recruiterName} className="w-full h-full object-cover" />
                  ) : (
                    (opening as any).recruiter?.name?.charAt(0) || opening.recruiterName?.charAt(0)
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">{(opening as any).recruiter?.name || opening.recruiterName}</h4>
                  <div className="flex items-center text-indigo-400 text-xs font-black uppercase tracking-widest mt-1">
                    <Star size={14} className="fill-indigo-500 mr-1.5" />
                    Score: {(opening as any).recruiter?.strengthScore || opening.recruiterStrengthScore}/100
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-white/10 text-slate-300 hover:text-white rounded-xl py-6 font-bold"
                onClick={() => navigate(`/profile/${opening.recruiterId}`)}
              >
                Inspect Agent Profile
              </Button>
            </CardContent>
          </Card>

          {isRecruiter ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                  <Users size={22} className="text-indigo-500" />
                  Applicants
                </h3>
                <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-lg">{applications.length}</span>
              </div>
              <div className="space-y-4">
                {applications.map(app => (
                  <Card key={app.id} className="bg-[#0a0a0a] border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-slate-300 border border-white/10 overflow-hidden shrink-0">
                            {((app as any).applicant?.avatarUrl || (app as any).applicantAvatarUrl) ? (
                              <img src={(app as any).applicant?.avatarUrl || (app as any).applicantAvatarUrl} alt={app.applicantName} className="w-full h-full object-cover" />
                            ) : (
                              (app as any).applicant?.name?.charAt(0) || app.applicantName?.charAt(0)
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm">{(app as any).applicant?.name || app.applicantName}</span>
                            <div className="flex items-center text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-0.5">
                              <Star size={10} className="fill-indigo-500 mr-1" />
                              {(app as any).applicant?.strengthScore || app.applicantStrengthScore} Score
                            </div>
                          </div>
                        </div>
                        <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border ${
                          app.status === 'Accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          app.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed italic bg-white/[0.02] p-3 rounded-xl border border-white/5">
                        "{app.coverLetter}"
                      </p>
                      <div className="flex gap-3 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-[10px] font-bold border-white/10 rounded-lg h-9"
                          onClick={() => navigate(`/profile/${app.applicantId}`)}
                        >
                          Profile
                        </Button>
                        {app.status === 'Pending' && (
                          <>
                            <Button 
                              size="sm" 
                              className="flex-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 rounded-lg h-9"
                              onClick={() => handleAccept(app.id, app.preferredRoleId)}
                              disabled={actionLoading}
                            >
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-500 text-[10px] font-bold hover:bg-red-500/10 rounded-lg h-9"
                              onClick={() => handleReject(app.id)}
                              disabled={actionLoading}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {applications.length === 0 && (
                  <div className="text-center py-12 bg-[#0a0a0a] border border-white/5 rounded-[2rem] text-slate-600 text-sm font-medium italic">
                    Waiting for transmissions...
                  </div>
                )}
                {isClosed && (
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-600/20 py-8 rounded-2xl text-lg font-black"
                    onClick={async () => {
                      try {
                        const teams = await chatService.getMyTeams();
                        const existingTeam = teams.find(t => t.openingId === opening.id);
                        if (existingTeam) {
                          navigate(`/chat/${existingTeam.id}`);
                        } else {
                          alert('Team channel initializing...');
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                  >
                    <MessageSquare className="mr-3" size={24} />
                    Open Team Channel
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {currentUser && !isClosed ? (
                hasApplied ? (
                  <div className="p-10 bg-indigo-500/5 border border-indigo-500/20 rounded-[2.5rem] text-center space-y-4 shadow-2xl">
                    <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mx-auto border border-indigo-500/30">
                      <CheckCircle2 size={48} className="animate-in zoom-in duration-500" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-xl">Transmission Successful</h4>
                      <p className="text-sm text-slate-500 mt-2 font-medium">Your request is being reviewed by the originator.</p>
                    </div>
                  </div>
                ) : showApplyForm ? (
                  <Card className="bg-[#0a0a0a] border-indigo-500/30 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.15)] animate-in slide-in-from-bottom-8 duration-500">
                    <CardHeader className="border-b border-white/5 p-8">
                      <h3 className="font-black text-white text-xl uppercase tracking-widest">Apply to Mission</h3>
                    </CardHeader>
                    <CardContent className="space-y-6 p-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Target Role</label>
                        <select 
                          className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
                          value={applyData.preferredRoleId}
                          onChange={e => setApplyData({ ...applyData, preferredRoleId: e.target.value })}
                        >
                          {opening.roles.filter(r => r.filled < r.slots).map(role => (
                            <option key={role.id} value={role.id} className="bg-[#0a0a0a]">{role.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cover Letter / Protocol</label>
                        <textarea 
                          rows={5}
                          className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none placeholder:text-slate-700"
                          placeholder="Why are you essential for this project?"
                          value={applyData.coverLetter || ''}
                          onChange={e => setApplyData({ ...applyData, coverLetter: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-3 pt-2">
                        <Button className="w-full py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg shadow-xl shadow-indigo-600/20" onClick={handleApply} disabled={actionLoading}>
                          <Send size={20} className="mr-2" /> {actionLoading ? 'Transmitting...' : 'Execute Application'}
                        </Button>
                        <Button variant="ghost" className="text-slate-500 hover:text-white rounded-2xl" onClick={() => setShowApplyForm(false)}>
                          Abort
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Button 
                    className="w-full py-8 text-xl font-black rounded-2xl bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-600/25 animate-pulse hover:animate-none transition-all" 
                    onClick={() => setShowApplyForm(true)}
                  >
                    Join the Mission
                  </Button>
                )
              ) : !currentUser ? (
                <div className="space-y-4 p-8 bg-white/5 rounded-[2.5rem] border border-white/5 text-center">
                  <p className="text-sm text-slate-400 font-medium italic">Identity verification required to join this mission.</p>
                  <Button 
                    className="w-full py-6 text-lg font-black bg-indigo-600 hover:bg-indigo-500 rounded-2xl" 
                    onClick={() => navigate('/login')}
                  >
                    Authenticate
                  </Button>
                </div>
              ) : isClosed ? (
                <div className="p-10 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] text-center space-y-4 opacity-60">
                  <XCircle size={48} className="mx-auto text-slate-700" />
                  <div>
                    <h4 className="font-black text-white text-xl">Mission Complete</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Team fully formed. No new entries.</p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpeningDetail;