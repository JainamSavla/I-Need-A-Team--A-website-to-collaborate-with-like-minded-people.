export type CollaborationType = 
  | 'Hackathon' 
  | 'Side Project/Indie App' 
  | 'Startup/Co-founder' 
  | 'Open Source' 
  | 'Freelance/Paid Gig' 
  | 'Student/College Project' 
  | 'Other';

export type ProjectStage = 
  | 'Idea Only' 
  | 'Prototype/MVP Built' 
  | 'Scaling/Growth' 
  | 'Maintenance/Polish';

export type CommitmentLevel = 
  | 'Casual/Weekends Only' 
  | 'Part-time (5-15 hrs/week)' 
  | 'Full-time' 
  | 'One-off Task';

export type CompensationType = 
  | 'Equity %' 
  | 'Paid' 
  | 'Revenue Share' 
  | 'Credit/Shoutout' 
  | 'None/For Fun';

export type LocationPreference = 
  | 'Remote/Online Only' 
  | 'Mumbai In-Person' 
  | 'Hybrid' 
  | 'Anywhere';

export type OpeningStatus = 'Open' | 'Closed / Team Formed';

export interface Project {
  id: string;
  title: string;
  url: string;
  description: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  displayName: string;
  avatarUrl?: string;
  bio: string;
  skills: string[];
  primaryRole?: string;
  experienceLevel: number; // 1-10
  availability: number; // hours/week
  interests: string[];
  portfolio: Project[];
  strengthScore: number;
  openings?: Opening[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    gmail?: string;
    portfolio?: string;
  };
}

export interface Role {
  id: string;
  name: string;
  slots: number;
  filled: number;
}

export interface Opening {
  id: string;
  recruiterId: string;
  recruiterName: string;
  recruiterAvatarUrl?: string;
  recruiterStrengthScore: number;
  title: string;
  type: CollaborationType;
  stage: ProjectStage;
  description: string;
  timeline: string;
  commitment: CommitmentLevel;
  compensation: string;
  location: LocationPreference;
  roles: Role[];
  tags: string[];
  status: OpeningStatus;
  createdAt: number;
}

export interface Application {
  id: string;
  openingId: string;
  applicantId: string;
  applicantName: string;
  applicantStrengthScore: number;
  coverLetter: string;
  preferredRoleId: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: number;
  opening?: Partial<Opening>;
}

export interface Message {
  id: string;
  teamId: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  senderAvatarUrl?: string;
  text: string;
  timestamp: number;
}

export interface Team {
  id: string;
  openingId: string;
  name: string;
  code: string;
  memberIds: string[];
  createdAt: number;
}
