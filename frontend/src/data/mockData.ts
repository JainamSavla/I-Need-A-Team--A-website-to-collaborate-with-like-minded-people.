import { UserProfile, Opening, Application } from '../types';

export const mockUsers: UserProfile[] = [
  {
    id: 'user-1',
    email: 'john.doe@college.edu',
    displayName: 'John Doe',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    bio: 'Passionate full-stack developer with 5 years of experience in React and Node.js. Love building social impact apps.',
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
    primaryRole: 'Full-stack Developer',
    experienceLevel: 8,
    availability: 15,
    interests: ['AI', 'Social Impact', 'Web3'],
    portfolio: [
      { id: 'p1', title: 'EcoTrack', url: 'https://github.com/johndoe/ecotrack', description: 'Personal sustainability tracker.' }
    ],
    strengthScore: 85,
    socialLinks: {
      github: 'https://github.com/johndoe',
      linkedin: 'https://linkedin.com/in/johndoe',
      gmail: 'john.doe@gmail.com'
    }
  },
  {
    id: 'user-2',
    email: 'jane.smith@college.edu',
    displayName: 'Jane Smith',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    bio: 'UI/UX Designer turned Frontend Developer. Focused on creating beautiful and accessible user interfaces.',
    skills: ['Figma', 'React', 'Tailwind CSS', 'Next.js'],
    primaryRole: 'Frontend Developer',
    experienceLevel: 7,
    availability: 10,
    interests: ['Design Systems', 'UX Research', 'Frontend'],
    portfolio: [],
    strengthScore: 70,
    socialLinks: {
      github: 'https://github.com/janesmith',
      linkedin: 'https://linkedin.com/in/janesmith',
      twitter: 'https://twitter.com/janesmith'
    }
  }
];

export const mockOpenings: Opening[] = [
  {
    id: 'opening-1',
    recruiterId: 'user-1',
    recruiterName: 'John Doe',
    recruiterAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    recruiterStrengthScore: 85,
    title: 'Building AI Crypto Dashboard for ETHIndia',
    type: 'Hackathon',
    stage: 'Idea Only',
    description: 'Looking for a solid team to build a revolutionary AI-powered crypto dashboard during the ETHIndia hackathon. We need people who can move fast and break things!',
    timeline: 'Dec 2025',
    commitment: 'Full-time',
    compensation: 'None/For Fun',
    location: 'Mumbai In-Person',
    roles: [
      { id: 'role-1', name: 'Web3 Developer', slots: 1, filled: 0 },
      { id: 'role-2', name: 'Frontend Developer', slots: 2, filled: 1 }
    ],
    tags: ['web3', 'AI', 'blockchain', 'Mumbai'],
    status: 'Open',
    createdAt: Date.now() - 86400000
  },
  {
    id: 'opening-2',
    recruiterId: 'user-2',
    recruiterName: 'Jane Smith',
    recruiterAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    recruiterStrengthScore: 70,
    title: 'Sustainability Tracker Side Project',
    type: 'Side Project/Indie App',
    stage: 'Prototype/MVP Built',
    description: 'An app to help users track and reduce their carbon footprint. MVP is already built, looking for more hands to polish it and add social features.',
    timeline: 'Ongoing',
    commitment: 'Part-time (5-15 hrs/week)',
    compensation: 'Revenue Share',
    location: 'Remote/Online Only',
    roles: [
      { id: 'role-3', name: 'Backend Developer', slots: 1, filled: 0 }
    ],
    tags: ['Sustainability', 'Mobile', 'Node.js'],
    status: 'Open',
    createdAt: Date.now() - 172800000
  }
];
