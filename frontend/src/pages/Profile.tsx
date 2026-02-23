import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Edit3, 
  Plus, 
  ExternalLink, 
  Trash2, 
  Star, 
  Briefcase, 
  Clock, 
  Mail,
  Award,
  Link as LinkIcon,
  Loader2,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Camera
} from 'lucide-react';
import { authService } from '../services/authService';
import { openingService } from '../services/openingService';
import { UserProfile, Project, Opening, Application } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { v4 as uuidv4 } from 'uuid';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [skillsInput, setSkillsInput] = useState('');
  const [interestsInput, setInterestsInput] = useState('');

  const fetchProfile = async () => {
    const targetId = id || currentUser?.id;
    if (!targetId) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const data = await authService.getUserById(targetId);
      const profileData = {
        ...data,
        displayName: data.name || data.email.split('@')[0],
        portfolio: (data as any).portfolio || [],
        skills: data.skills || [],
        interests: data.interests || [],
      };
      setProfile(profileData);
      setEditData(profileData);
      setSkillsInput(profileData.skills.join(', '));
      setInterestsInput(profileData.interests.join(', '));
      
      const isOwn = targetId === currentUser?.id;
      setIsOwnProfile(isOwn);

      if (isOwn) {
        const apps = await openingService.getMyApplications();
        setApplications(apps);
      }
    } catch (error) {
      console.error(error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id, currentUser?.id]);

  const handleSave = async () => {
    if (isOwnProfile) {
      try {
        setSaving(true);
        const updatedSkills = skillsInput.split(',').map(s => s.trim()).filter(s => s !== '');
        const updatedInterests = interestsInput.split(',').map(s => s.trim()).filter(s => s !== '');
        
        const updated = await authService.updateProfile({
          ...editData,
          name: editData.displayName, // Map displayName back to name for API
          skills: updatedSkills,
          interests: updatedInterests,
        });
        const profileData = {
          ...updated,
          displayName: updated.name || updated.email.split('@')[0],
          portfolio: (updated as any).portfolio || [],
        };
        setProfile(profileData);
        setSkillsInput(profileData.skills.join(', '));
        setInterestsInput(profileData.interests.join(', '));
        setIsEditing(false);
      } catch (error) {
        alert('Failed to save profile');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleAddProject = () => {
    const newProject: Project = {
      id: uuidv4(),
      title: 'New Project',
      url: '',
      description: ''
    };
    const updatedPortfolio = [...(editData.portfolio || []), newProject];
    setEditData({ ...editData, portfolio: updatedPortfolio });
  };

  const handleRemoveProject = (projectId: string) => {
    const updatedPortfolio = (editData.portfolio || []).filter(p => p.id !== projectId);
    setEditData({ ...editData, portfolio: updatedPortfolio });
  };

  const handleProjectChange = (projectId: string, field: keyof Project, value: string) => {
    const updatedPortfolio = (editData.portfolio || []).map(p => 
      p.id === projectId ? { ...p, [field]: value } : p
    );
    setEditData({ ...editData, portfolio: updatedPortfolio });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!profile) return null;

  const displayName = profile.displayName || profile.email.split('@')[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500 bg-black">
      {/* Header Profile Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0a0a] border border-white/10 p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
          <div className="relative group shrink-0">
            <div className="w-32 h-32 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-indigo-600/20 overflow-hidden transition-transform duration-500 border-2 border-white/10">
              {isEditing ? (
                editData.avatarUrl ? (
                  <img src={editData.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )
              ) : (
                profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )
              )}
            </div>
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl hover:bg-indigo-500 transition-colors border-2 border-[#0a0a0a]"
              >
                <Camera size={18} />
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>
          
          <div className="flex-grow space-y-6 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 w-full">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black tracking-tight text-white">{displayName}</h1>
                  {profile.primaryRole && (
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {profile.primaryRole}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center text-slate-500 text-sm gap-x-6 gap-y-2">
                  <span className="flex items-center gap-2 font-medium"><Mail size={16} className="text-indigo-400" /> {profile.email}</span>
                  <span className="flex items-center gap-2 font-medium"><Award size={16} className="text-indigo-400" /> Level {profile.experienceLevel}/10</span>
                </div>
                
                {profile.socialLinks && (
                  <div className="flex items-center gap-4 pt-2">
                    {profile.socialLinks.github && (
                      <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                        <Github size={20} />
                      </a>
                    )}
                    {profile.socialLinks.linkedin && (
                      <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0077b5] transition-colors">
                        <Linkedin size={20} />
                      </a>
                    )}
                    {profile.socialLinks.twitter && (
                      <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#1da1f2] transition-colors">
                        <Twitter size={20} />
                      </a>
                    )}
                    {profile.socialLinks.gmail && (
                      <a href={`mailto:${profile.socialLinks.gmail}`} className="text-slate-500 hover:text-[#ea4335] transition-colors">
                        <Mail size={20} />
                      </a>
                    )}
                    {profile.socialLinks.portfolio && (
                      <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-400 transition-colors">
                        <Globe size={20} />
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                {isOwnProfile && !isEditing && (
                  <Button onClick={() => setIsEditing(true)} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl px-6">
                    <Edit3 size={18} className="mr-2" /> Edit Profile
                  </Button>
                )}
                {isOwnProfile && isEditing && (
                  <>
                    <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6">
                      {saving ? <Loader2 className="animate-spin mr-2" /> : 'Save Changes'}
                    </Button>
                    <Button variant="ghost" onClick={() => { setIsEditing(false); setEditData(profile); }} className="text-slate-400 hover:text-white rounded-xl">Cancel</Button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Display Name</label>
                    <input 
                      className="w-full px-5 py-3 rounded-2xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      value={editData.displayName}
                      onChange={e => setEditData({ ...editData, displayName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Primary Role (e.g. Frontend Developer)</label>
                    <input 
                      className="w-full px-5 py-3 rounded-2xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      value={editData.primaryRole || ''}
                      onChange={e => setEditData({ ...editData, primaryRole: e.target.value })}
                      placeholder="e.g. Frontend Developer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Bio</label>
                  <textarea 
                    className="w-full px-5 py-3 rounded-2xl border border-white/10 bg-white/5 text-white resize-none outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    rows={3}
                    value={editData.bio || ''}
                    onChange={e => setEditData({ ...editData, bio: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">GitHub URL</label>
                    <input 
                      className="w-full px-5 py-3 rounded-2xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      value={editData.socialLinks?.github || ''}
                      onChange={e => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, github: e.target.value } })}
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">LinkedIn URL</label>
                    <input 
                      className="w-full px-5 py-3 rounded-2xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      value={editData.socialLinks?.linkedin || ''}
                      onChange={e => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, linkedin: e.target.value } })}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Twitter URL</label>
                    <input 
                      className="w-full px-5 py-3 rounded-2xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      value={editData.socialLinks?.twitter || ''}
                      onChange={e => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, twitter: e.target.value } })}
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Website / Portfolio</label>
                    <input 
                      className="w-full px-5 py-3 rounded-2xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      value={editData.socialLinks?.portfolio || ''}
                      onChange={e => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, portfolio: e.target.value } })}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Experience (1-10)</label>
                    <input 
                      type="number"
                      className="w-full px-5 py-3 rounded-2xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      value={editData.experienceLevel}
                      onChange={e => setEditData({ ...editData, experienceLevel: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Availability (hrs/week)</label>
                    <input 
                      type="number"
                      className="w-full px-5 py-3 rounded-2xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      value={editData.availability}
                      onChange={e => setEditData({ ...editData, availability: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 leading-relaxed max-w-3xl text-lg italic">
                {profile.bio ? `"${profile.bio}"` : "No bio yet."}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-10 pt-8 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-1">Strength Score</span>
                <div className="flex items-center text-indigo-400 font-black text-2xl">
                  <Star size={24} className="fill-indigo-500/20 mr-2" />
                  {profile.strengthScore}<span className="text-sm font-bold text-slate-600 ml-1">/100</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-1">Weekly Commitment</span>
                <span className="font-bold text-lg text-slate-200 flex items-center gap-2"><Clock size={18} className="text-indigo-400" /> {profile.availability} hours</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-1">Active Portfolio</span>
                <span className="font-bold text-lg text-slate-200 flex items-center gap-2"><Briefcase size={18} className="text-indigo-400" /> {profile.portfolio.length} Projects</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="bg-[#0a0a0a] border-white/10 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-white/5 p-6">
              <h3 className="font-bold text-lg text-white">Skills & Expertise</h3>
            </CardHeader>
            <CardContent className="p-6">
              {isEditing ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Separate with commas</label>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                    value={skillsInput}
                    onChange={e => setSkillsInput(e.target.value)}
                    placeholder="React, TypeScript, Node.js..."
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.length > 0 ? profile.skills.map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold">
                      {skill}
                    </span>
                  )) : <span className="text-xs text-slate-600 italic">No skills added yet.</span>}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#0a0a0a] border-white/10 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-white/5 p-6">
              <h3 className="font-bold text-lg text-white">Interests</h3>
            </CardHeader>
            <CardContent className="p-6">
              {isEditing ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Separate with commas</label>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                    value={interestsInput}
                    onChange={e => setInterestsInput(e.target.value)}
                    placeholder="Web3, AI, Open Source..."
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.length > 0 ? profile.interests.map(interest => (
                    <span key={interest} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold">
                      {interest}
                    </span>
                  )) : <span className="text-xs text-slate-600 italic">No interests added yet.</span>}
                </div>
              )}
            </CardContent>
          </Card>

          {isOwnProfile && applications.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-white px-2">Applied Missions</h3>
              <div className="space-y-3">
                {applications.map(app => (
                  <Card key={app.id} className="bg-[#0a0a0a] border-white/10 rounded-2xl cursor-pointer hover:border-indigo-500/50 hover:bg-white/5 transition-all p-5" onClick={() => navigate(`/opening/${app.openingId}`)}>
                    <h4 className="font-bold text-white mb-2">{app.opening?.title}</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{app.opening?.type}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                        app.status === 'Accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        app.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {profile.openings && profile.openings.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-white px-2">Recent Openings</h3>
              <div className="space-y-3">
                {profile.openings.map(opening => (
                  <Card key={opening.id} className="bg-[#0a0a0a] border-white/10 rounded-2xl cursor-pointer hover:border-indigo-500/50 hover:bg-white/5 transition-all p-5" onClick={() => navigate(`/opening/${opening.id}`)}>
                    <h4 className="font-bold text-white mb-2">{opening.title}</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{opening.type}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${opening.status === 'Open' ? 'text-green-400 border-green-400/20 bg-green-400/5' : 'text-slate-600 border-white/5 bg-transparent'}`}>
                        {opening.status}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-3xl font-black text-white tracking-tight">Portfolio & Work</h2>
            {isEditing && (
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5" onClick={handleAddProject}>
                <Plus size={16} className="mr-2" /> Add New Project
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6">
            {(isEditing ? editData.portfolio : profile.portfolio)?.map((project: Project) => (
              <Card key={project.id} className="bg-[#0a0a0a] border-white/10 rounded-3xl overflow-hidden group hover:border-indigo-500/30 transition-all duration-500">
                {isEditing ? (
                  <CardContent className="space-y-6 p-8">
                    <div className="flex justify-between items-start gap-6">
                      <div className="flex-grow space-y-5">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project Title</label>
                          <input 
                            className="w-full text-xl font-bold bg-white/5 border border-white/5 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all text-white"
                            placeholder="Project Title"
                            value={project.title}
                            onChange={e => handleProjectChange(project.id, 'title', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project URL</label>
                          <input 
                            className="w-full text-sm text-indigo-400 bg-white/5 border border-white/5 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all"
                            placeholder="Project URL (GitHub, Website, etc.)"
                            value={project.url}
                            onChange={e => handleProjectChange(project.id, 'url', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                          <textarea 
                            className="w-full text-sm text-slate-400 bg-white/5 border border-white/5 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all resize-none"
                            placeholder="Short description..."
                            rows={3}
                            value={project.description || ''}
                            onChange={e => handleProjectChange(project.id, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:bg-red-500/10 rounded-xl"
                        onClick={() => handleRemoveProject(project.id)}
                      >
                        <Trash2 size={20} />
                      </Button>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="p-8 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">{project.title}</h3>
                      {project.url && (
                        <a 
                          href={project.url.startsWith('http') ? project.url : `https://${project.url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-lg"
                        >
                          <ExternalLink size={20} />
                        </a>
                      )}
                    </div>
                    <p className="text-slate-400 leading-relaxed text-base italic">
                      {project.description}
                    </p>
                    {project.url && (
                      <div className="flex items-center gap-3 text-xs text-slate-500 bg-white/[0.02] w-fit px-4 py-2 rounded-xl border border-white/5">
                        <LinkIcon size={14} className="text-indigo-500" />
                        <span className="truncate max-w-md font-medium">{project.url.replace(/^https?:\/\//, '')}</span>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
            
            {(!isEditing && profile.portfolio.length === 0) && (
              <div className="text-center py-20 bg-[#0a0a0a] border-2 border-dashed border-white/5 rounded-[2.5rem]">
                <Briefcase size={48} className="mx-auto text-slate-700 mb-4" />
                <p className="text-slate-500 font-medium">No projects added to showcase yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;