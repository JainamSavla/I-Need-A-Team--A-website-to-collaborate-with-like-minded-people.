import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Minus, Info, ChevronLeft, Users, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { authService } from '../services/authService';
import { openingService } from '../services/openingService';
import { 
  CollaborationType, 
  ProjectStage, 
  CommitmentLevel, 
  LocationPreference,
  Role,
  Opening
} from '../types';
import { v4 as uuidv4 } from 'uuid';

const PostOpening: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const user = authService.getCurrentUser();

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Hackathon' as CollaborationType,
    stage: 'Idea Only' as ProjectStage,
    description: '',
    timeline: '',
    commitment: 'Casual/Weekends Only' as CommitmentLevel,
    compensation: 'None/For Fun',
    location: 'Remote/Online Only' as LocationPreference,
    tags: '',
  });

  const [roles, setRoles] = useState<Role[]>([
    { id: uuidv4(), name: '', slots: 1, filled: 0 }
  ]);

  useEffect(() => {
    if (isEditing) {
      const fetchOpening = async () => {
        try {
          const opening = await openingService.getOpeningById(id!);
          if (opening.recruiterId !== user?.id) {
            navigate('/');
            return;
          }
          setFormData({
            title: opening.title,
            type: opening.type,
            stage: opening.stage,
            description: opening.description,
            timeline: opening.timeline,
            commitment: opening.commitment,
            compensation: opening.compensation,
            location: opening.location,
            tags: opening.tags.join(', '),
          });
          setRoles(opening.roles);
        } catch (error) {
          console.error(error);
          navigate('/');
        } finally {
          setLoading(false);
        }
      };
      fetchOpening();
    }
  }, [id, isEditing, user?.id, navigate]);

  const handleAddRole = () => {
    setRoles([...roles, { id: uuidv4(), name: '', slots: 1, filled: 0 }]);
  };

  const handleRemoveRole = (roleId: string) => {
    if (roles.length > 1) {
      setRoles(roles.filter(r => r.id !== roleId));
    }
  };

  const handleRoleChange = (roleId: string, field: keyof Role, value: string | number) => {
    setRoles(roles.map(r => r.id === roleId ? { ...r, [field]: value } : r));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const openingData = {
      title: formData.title,
      type: formData.type,
      stage: formData.stage,
      description: formData.description,
      timeline: formData.timeline,
      commitment: formData.commitment,
      compensation: formData.compensation,
      location: formData.location,
      roles: roles.filter(r => r.name.trim() !== ''),
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
    };

    try {
      if (isEditing) {
        await openingService.updateOpening(id!, openingData);
        navigate(`/opening/${id}`);
      } else {
        const opening = await openingService.createOpening(openingData);
        navigate(`/opening/${opening.id}`);
      }
    } catch (error) {
      alert('Failed to save opening');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-in slide-in-from-bottom-8 duration-500 bg-black">
      <button 
        onClick={() => navigate(-1)}
        className="group flex items-center text-slate-500 hover:text-white transition-all bg-white/5 px-4 py-2 rounded-xl border border-white/5 w-fit"
      >
        <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm uppercase tracking-widest">Back</span>
      </button>

      <div className="space-y-3">
        <h1 className="text-4xl font-black text-white tracking-tight">{isEditing ? 'Refine your mission' : 'Launch a new team'}</h1>
        <p className="text-slate-400 text-lg">Define your project goals and find the perfect collaborators to scale your vision.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="bg-[#0a0a0a] border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-white/5 p-8">
            <h2 className="text-xl font-bold flex items-center gap-3 text-white">
              <div className="p-2 bg-indigo-600/10 rounded-xl">
                <Info size={22} className="text-indigo-500" />
              </div>
              Project Core Details
            </h2>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Visionary Project Title</label>
              <input
                required
                placeholder="e.g. Building AI Crypto Dashboard for ETHIndia"
                className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 outline-none transition-all text-lg font-bold placeholder:text-slate-600"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collaboration Category</label>
                <select
                  className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as CollaborationType })}
                >
                  <option className="bg-[#0a0a0a]">Hackathon</option>
                  <option className="bg-[#0a0a0a]">Side Project/Indie App</option>
                  <option className="bg-[#0a0a0a]">Startup/Co-founder</option>
                  <option className="bg-[#0a0a0a]">Open Source</option>
                  <option className="bg-[#0a0a0a]">Freelance/Paid Gig</option>
                  <option className="bg-[#0a0a0a]">Student/College Project</option>
                  <option className="bg-[#0a0a0a]">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Stage</label>
                <select
                  className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer"
                  value={formData.stage}
                  onChange={e => setFormData({ ...formData, stage: e.target.value as ProjectStage })}
                >
                  <option className="bg-[#0a0a0a]">Idea Only</option>
                  <option className="bg-[#0a0a0a]">Prototype/MVP Built</option>
                  <option className="bg-[#0a0a0a]">Scaling/Growth</option>
                  <option className="bg-[#0a0a0a]">Maintenance/Polish</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mission Description</label>
              <textarea
                required
                rows={6}
                placeholder="What are you building? Why does it matter? Who do you need?"
                className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 outline-none transition-all resize-none text-base leading-relaxed placeholder:text-slate-600"
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Execution Timeline</label>
                <input
                  placeholder="e.g. Dec 2025 or 3 months"
                  className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                  value={formData.timeline}
                  onChange={e => setFormData({ ...formData, timeline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Commitment Required</label>
                <select
                  className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer"
                  value={formData.commitment}
                  onChange={e => setFormData({ ...formData, commitment: e.target.value as CommitmentLevel })}
                >
                  <option className="bg-[#0a0a0a]">Casual/Weekends Only</option>
                  <option className="bg-[#0a0a0a]">Part-time (5-15 hrs/week)</option>
                  <option className="bg-[#0a0a0a]">Full-time</option>
                  <option className="bg-[#0a0a0a]">One-off Task</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Incentives / Compensation</label>
                <input
                  placeholder="e.g. 5% Equity, $500, or Passion Project"
                  className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                  value={formData.compensation}
                  onChange={e => setFormData({ ...formData, compensation: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collaboration Space</label>
                <select
                  className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value as LocationPreference })}
                >
                  <option className="bg-[#0a0a0a]">Remote/Online Only</option>
                  <option className="bg-[#0a0a0a]">Mumbai In-Person</option>
                  <option className="bg-[#0a0a0a]">Hybrid</option>
                  <option className="bg-[#0a0a0a]">Anywhere</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tech Stack & Tags (comma-separated)</label>
              <input
                placeholder="e.g. React, Web3, AI, Python"
                className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-white/5 p-8 flex flex-row justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-3 text-white">
              <div className="p-2 bg-indigo-600/10 rounded-xl">
                <Users size={22} className="text-indigo-500" />
              </div>
              Talent Needed
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={handleAddRole} className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 rounded-xl px-4">
              <Plus size={16} className="mr-1" /> Add Role
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 p-8">
            {roles.map((role, index) => (
              <div key={role.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end p-6 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all">
                <div className="flex-grow space-y-2 w-full">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Role Identification</label>
                  <input
                    placeholder="e.g. Senior Web3 Developer"
                    className="w-full px-4 py-3 rounded-xl border border-white/5 bg-white/5 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                    value={role.name}
                    onChange={e => handleRoleChange(role.id, 'name', e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-28 space-y-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Slots</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-white/5 bg-white/5 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm font-bold"
                    value={role.slots}
                    onChange={e => handleRoleChange(role.id, 'slots', parseInt(e.target.value) || 1)}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:bg-red-500/10 rounded-xl shrink-0 h-11 w-11"
                  onClick={() => handleRemoveRole(role.id)}
                  disabled={roles.length === 1}
                >
                  <Minus size={20} />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button type="submit" size="lg" className="flex-1 py-6 text-xl font-black bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin mr-2" /> : isEditing ? 'Update Mission Details' : 'Broadcast Mission'}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)} className="py-6 rounded-2xl border-white/10 text-slate-400 px-10">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostOpening;