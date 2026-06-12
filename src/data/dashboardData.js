export const initialStats = {
  totalUsers: 14250,
  activeUsers: 3840,
  matchesCount: 98230,
  premiumUsers: 1890,
  growthRate: "+12.4%",
  activeRate: "+8.2%",
  matchRate: "+15.1%",
  revenueMonthly: 18881,
  revenueRate: "+18.3%",
  dailyActiveTrend: [
    { day: 'Mon', active: 2900, matches: 8100 },
    { day: 'Tue', active: 3100, matches: 8900 },
    { day: 'Wed', active: 3400, matches: 9500 },
    { day: 'Thu', active: 3200, matches: 9200 },
    { day: 'Fri', active: 3840, matches: 11200 },
    { day: 'Sat', active: 4100, matches: 12400 },
    { day: 'Sun', active: 3950, matches: 11800 },
  ],
  registrationsTrend: [
    { month: 'Jan', free: 800, premium: 120 },
    { month: 'Feb', free: 950, premium: 150 },
    { month: 'Mar', free: 1200, premium: 180 },
    { month: 'Apr', free: 1100, premium: 160 },
    { month: 'May', free: 1400, premium: 220 },
    { month: 'Jun', free: 1650, premium: 310 },
  ],
  genderDistribution: [
    { name: 'Male', value: 7410, color: '#ec4899' },
    { name: 'Female', value: 6540, color: '#8b5cf6' },
    { name: 'Non-binary', value: 300, color: '#f59e0b' }
  ]
};

export const initialUsers = [
  {
    id: "USR-001",
    name: "Alex Rivera",
    age: 26,
    gender: "Male",
    email: "alex.rivera@example.com",
    location: "New York, USA",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    joinedDate: "2026-02-14",
    isPremium: true,
    status: "active",
    verificationStatus: "verified",
    bio: "Coffee enthusiast. Music producer. Looking for someone to explore vinyl shops with.",
    reportedCount: 0
  },
  {
    id: "USR-002",
    name: "Emma Watson",
    age: 24,
    gender: "Female",
    email: "emma.watson@example.com",
    location: "Los Angeles, USA",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    joinedDate: "2026-03-01",
    isPremium: false,
    status: "active",
    verificationStatus: "pending",
    bio: "UX Designer by day, amateur salsa dancer by night. Let's get tacos!",
    reportedCount: 1
  },
  {
    id: "USR-003",
    name: "Jordan Lee",
    age: 29,
    gender: "Non-binary",
    email: "jordan.lee@example.com",
    location: "Chicago, USA",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    joinedDate: "2026-01-10",
    isPremium: true,
    status: "active",
    verificationStatus: "verified",
    bio: "Plant parent. Triathlete. Always reading three books at once.",
    reportedCount: 0
  },
  {
    id: "USR-004",
    name: "Sophia Chen",
    age: 23,
    gender: "Female",
    email: "sophia.chen@example.com",
    location: "San Francisco, USA",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop",
    joinedDate: "2026-04-12",
    isPremium: false,
    status: "warned",
    verificationStatus: "unverified",
    bio: "Dog lover. Software Engineer. Ask me about my favorite hikes.",
    reportedCount: 3
  },
  {
    id: "USR-005",
    name: "Marcus Vance",
    age: 31,
    gender: "Male",
    email: "marcus.vance@example.com",
    location: "Miami, USA",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    joinedDate: "2026-05-20",
    isPremium: true,
    status: "banned",
    verificationStatus: "unverified",
    bio: "Entrepeneur. Yacht life. High standards only.",
    reportedCount: 8
  },
  {
    id: "USR-006",
    name: "Chloe Dupont",
    age: 27,
    gender: "Female",
    email: "chloe.dupont@example.com",
    location: "Boston, USA",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop",
    joinedDate: "2026-05-25",
    isPremium: false,
    status: "active",
    verificationStatus: "pending",
    bio: "Pastry chef. Traveling is my therapy. Looking for a genuine connection.",
    reportedCount: 0
  }
];

export const initialVerifications = [
  {
    id: "VER-101",
    userId: "USR-002",
    userName: "Emma Watson",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    verificationPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop", // A selfie to compare
    date: "2026-06-11T14:32:00Z"
  },
  {
    id: "VER-102",
    userId: "USR-006",
    userName: "Chloe Dupont",
    userAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop",
    verificationPhoto: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop", // A selfie to compare
    date: "2026-06-12T05:10:00Z"
  }
];

export const initialReports = [
  {
    id: "REP-201",
    reporterId: "USR-001",
    reporterName: "Alex Rivera",
    reportedId: "USR-005",
    reportedName: "Marcus Vance",
    reportedAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    reason: "Abusive behavior & solicitation",
    details: "Sent multiple unsolicited requests to buy crypto and insulted me when I refused.",
    chatSnippet: "Marcus: 'If you want to go on a real date you should buy my token first.'\nAlex: 'No thanks.'\nMarcus: 'You are broke anyway, don't waste my time.'",
    status: "pending",
    date: "2026-06-10T22:15:00Z"
  },
  {
    id: "REP-202",
    reporterId: "USR-003",
    reporterName: "Jordan Lee",
    reportedId: "USR-004",
    reportedName: "Sophia Chen",
    reportedAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop",
    reason: "Catfishing / Fake Profile",
    details: "Using pictures of an influencer. Refuses to verify or do video calls.",
    chatSnippet: "Jordan: 'Can we video call sometime?'\nSophia: 'No my camera is broken, and I don't like video calls anyway.'",
    status: "pending",
    date: "2026-06-11T18:40:00Z"
  }
];

export const initialSettings = {
  swipeLimitFree: 50,
  minAgeLimit: 18,
  premiumPriceMonthly: 9.99,
  matchAlgorithmWeightBio: 25,
  matchAlgorithmWeightLocation: 45,
  matchAlgorithmWeightInterests: 30,
  enableShadowBans: true,
  moderationStrictness: "moderate", // relaxed, moderate, strict
};
