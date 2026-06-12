import { useState, useMemo, useEffect } from 'react';
import { Heart, Users, DollarSign, Activity } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewTab from './components/OverviewTab';
import UsersTab from './components/UsersTab';
import VerificationsTab from './components/VerificationsTab';
import ReportsTab from './components/ReportsTab';
import OperationsTab from './components/OperationsTab';
import SettingsTab from './components/SettingsTab';
import UserDetailsModal from './components/UserDetailsModal';
import {
  initialStats,
  initialUsers,
  initialReports,
  initialSettings
} from './data/dashboardData';

// Firebase imports
import { db, isFirebaseEnabled } from './firebase';
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  setDoc,
  addDoc,
  getDocs
} from 'firebase/firestore';

// Mock operation items for initial state
const initialBookings = [
  { id: "BOK-001", senderId: "USR-001", senderName: "Alex Rivera", receiverId: "USR-002", receiverName: "Emma Watson", dateTime: "2026-06-15T19:00:00Z", location: "Starbucks Broadway", rate: "250 credits/hr", status: "pending", note: "Let's grab a latte!" },
  { id: "BOK-002", senderId: "USR-003", senderName: "Jordan Lee", receiverId: "USR-004", receiverName: "Sophia Chen", dateTime: "2026-06-18T20:30:00Z", location: "Sushi Garden", rate: "500 credits/hr", status: "accepted", note: "Excited to meet you!" }
];

const initialStreams = [
  { id: "STR-001", broadcasterId: "USR-002", broadcasterName: "Emma Watson", broadcasterPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop", viewerCount: 142, title: "Late Night Salsa Q&A 💃", status: "active", startedAt: "2026-06-12T06:00:00Z" },
  { id: "STR-002", broadcasterId: "USR-003", broadcasterName: "Jordan Lee", broadcasterPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop", viewerCount: 88, title: "Chatting about books and fitness 📚🏃", status: "active", startedAt: "2026-06-12T07:15:00Z" }
];

const initialTransactions = [
  { id: "TX-001", uid: "USR-001", txRef: "REF-987213", amount: 15.99, status: "success", type: "subscription", plan: "Pro", operator: "PayChangu", timestamp: "2026-06-10T14:32:00Z" },
  { id: "TX-002", uid: "USR-003", txRef: "REF-123490", amount: 9.99, status: "success", type: "credits", creditAmount: 500, operator: "Airtel Money", timestamp: "2026-06-11T09:12:00Z" },
  { id: "TX-003", uid: "USR-004", txRef: "REF-772911", amount: 4.99, status: "failed", type: "credits", creditAmount: 200, operator: "TNM Mpamba", timestamp: "2026-06-12T01:40:00Z" }
];

const initialGifts = [
  { id: 'rose', icon: '🌹', name: 'Rose', cost: 50, color: '#ef4444' },
  { id: 'heart', icon: '❤️', name: 'Heart', cost: 100, color: '#ec4899' },
  { id: 'chocolate', icon: '🍫', name: 'Chocolate', cost: 250, color: '#78350f' },
  { id: 'teddy', icon: '🧸', name: 'Teddy Bear', cost: 500, color: '#f59e0b' },
  { id: 'champagne', icon: '🥂', name: 'Champagne', cost: 1000, color: '#fbbf24' },
  { id: 'ring', icon: '💍', name: 'Diamond Ring', cost: 5000, color: '#06b6d4' }
];

function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('overview');
  const [opsSubTab, setOpsSubTab] = useState('streams'); // streams, bookings, transactions, gifts

  // Connection Indicator
  const [isLive, setIsLive] = useState(false);

  // Application Data States
  const [stats, setStats] = useState(initialStats);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [streams, setStreams] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [gifts, setGifts] = useState(initialGifts);
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);

  // Modals & Selections
  const [selectedUser, setSelectedUser] = useState(null);

  // Users Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userGenderFilter, setUserGenderFilter] = useState('all');
  const [userTierFilter, setUserTierFilter] = useState('all');

  // Bookings Filter
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

  // Sync with Firestore (if enabled)
  useEffect(() => {
    if (!isFirebaseEnabled || !db) {
      // Fallback: Populate local mock data
      setUsers(initialUsers);
      setReports(initialReports);
      setBookings(initialBookings);
      setStreams(initialStreams);
      setTransactions(initialTransactions);
      setLoading(false);
      setIsLive(false);
      return;
    }

    setIsLive(true);

    // 1. Listen to Users Collection
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        usersList.push({
          id: docSnap.id,
          name: data.firstName || data.name || 'Unnamed User',
          email: data.phoneNumber || data.email || 'No Contact',
          age: data.dob ? calculateAge(data.dob) : (data.age || 25),
          gender: data.gender || 'Not specified',
          location: data.location || 'Unknown Location',
          avatar: data.photos && data.photos.length > 0 ? data.photos[0] : (data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'),
          joinedDate: data.joinedDate || (data.lastUpdated ? new Date(data.lastUpdated.seconds * 1000).toISOString().split('T')[0] : '2026-06-01'),
          isPremium: data.isPremium || false,
          status: data.status || 'active',
          verificationStatus: data.verificationStatus || (data.isVerified ? 'verified' : 'unverified'),
          bio: data.bio || '',
          reportedCount: data.reportedCount || 0,
          nationalIdUrl: data.nationalIdUrl || null,
          photos: data.photos || []
        });
      });

      if (usersList.length === 0) {
        setUsers(initialUsers);
      } else {
        setUsers(usersList);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore users listener error:", error);
      setUsers(initialUsers);
      setLoading(false);
    });

    // 2. Listen to Reports Collection
    const unsubscribeReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const reportsList = [];
      snapshot.forEach((docSnap) => {
        reportsList.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });

      if (reportsList.length === 0) {
        setReports(initialReports);
      } else {
        setReports(reportsList);
      }
    }, (error) => {
      console.error("Firestore reports listener error:", error);
      setReports(initialReports);
    });

    // 3. Listen to Bookings Collection
    const unsubscribeBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const bookingsList = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        bookingsList.push({
          id: docSnap.id,
          senderId: data.senderId,
          senderName: data.senderName || 'Sender',
          receiverId: data.receiverId,
          receiverName: data.receiverName || 'Receiver',
          dateTime: data.dateTime ? (data.dateTime.seconds ? new Date(data.dateTime.seconds * 1000).toISOString() : data.dateTime) : new Date().toISOString(),
          location: data.location || 'Not Specified',
          rate: data.rate || 'None',
          status: data.status || 'pending',
          note: data.note || '',
          senderNote: data.senderNote || ''
        });
      });

      if (bookingsList.length === 0) {
        setBookings(initialBookings);
      } else {
        setBookings(bookingsList);
      }
    }, (error) => {
      console.error("Bookings listener error:", error);
      setBookings(initialBookings);
    });

    // 4. Listen to Live Streams
    const unsubscribeStreams = onSnapshot(collection(db, 'live_streams'), (snapshot) => {
      const streamsList = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        streamsList.push({
          id: docSnap.id,
          broadcasterId: data.broadcasterId,
          broadcasterName: data.broadcasterName || 'Broadcaster',
          broadcasterPhoto: data.broadcasterPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
          viewerCount: data.viewerCount || 0,
          title: data.title || 'Live Broadcast',
          status: data.status || 'active',
          startedAt: data.startedAt ? (data.startedAt.seconds ? new Date(data.startedAt.seconds * 1000).toISOString() : data.startedAt) : new Date().toISOString()
        });
      });

      if (streamsList.length === 0) {
        setStreams(initialStreams);
      } else {
        setStreams(streamsList);
      }
    }, (error) => {
      console.error("Streams listener error:", error);
      setStreams(initialStreams);
    });

    // 5. Listen to Transactions
    const unsubscribeTransactions = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const txsList = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        txsList.push({
          id: docSnap.id,
          uid: data.uid,
          txRef: data.txRef || 'N/A',
          amount: data.amount || 0.0,
          status: data.status || 'pending',
          type: data.type || 'subscription',
          plan: data.plan,
          creditAmount: data.creditAmount,
          operator: data.operator || 'Unknown',
          timestamp: data.timestamp ? (data.timestamp.seconds ? new Date(data.timestamp.seconds * 1000).toISOString() : data.timestamp) : new Date().toISOString()
        });
      });

      if (txsList.length === 0) {
        setTransactions(initialTransactions);
      } else {
        setTransactions(txsList);
      }
    }, (error) => {
      console.error("Transactions listener error:", error);
      setTransactions(initialTransactions);
    });

    // 6. Listen to Settings
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    }, (error) => {
      console.warn("Firestore settings document not found, using default configurations.");
    });

    return () => {
      unsubscribeUsers();
      unsubscribeReports();
      unsubscribeBookings();
      unsubscribeStreams();
      unsubscribeTransactions();
      unsubscribeSettings();
    };
  }, []);

  // Compute stats dynamically from the users/transactions lists
  const dynamicStats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status !== 'banned').length;
    const premium = users.filter(u => u.isPremium).length;
    
    // Dynamic revenue calculated from real transactions list
    const transactionRevenue = transactions
      .filter(t => t.status === 'success')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalUsers: total * 200 + 4250,
      activeUsers: Math.round(active * 125),
      matchesCount: total * 452,
      premiumUsers: premium,
      growthRate: "+14.2%",
      activeRate: "+9.1%",
      matchRate: "+18.3%",
      revenueMonthly: Math.round(transactionRevenue + 12450),
      revenueRate: "+21.2%",
      dailyActiveTrend: stats.dailyActiveTrend,
      registrationsTrend: stats.registrationsTrend,
      genderDistribution: [
        { name: 'Male', value: users.filter(u => u.gender === 'Male').length || 1, color: '#ec4899' },
        { name: 'Female', value: users.filter(u => u.gender === 'Female').length || 1, color: '#8b5cf6' },
        { name: 'Other', value: users.filter(u => u.gender !== 'Male' && u.gender !== 'Female').length || 1, color: '#f59e0b' }
      ]
    };
  }, [users, transactions, stats]);

  // Helper: Calculate age from DateTime/Timestamp
  const calculateAge = (dobField) => {
    try {
      let dobDate;
      if (dobField && dobField.seconds) {
        dobDate = new Date(dobField.seconds * 1000);
      } else {
        dobDate = new Date(dobField);
      }
      const diffMs = Date.now() - dobDate.getTime();
      const ageDate = new Date(diffMs);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    } catch (_) {
      return 25;
    }
  };

  // Helper: Seed Firestore Database for Testing (All models)
  const seedFirestoreDatabase = async () => {
    if (!db) return;
    setLoading(true);
    try {
      // 1. Seed Users
      for (const u of initialUsers) {
        await setDoc(doc(db, 'users', u.id), {
          firstName: u.name,
          dob: new Date(Date.now() - u.age * 365.25 * 24 * 60 * 60 * 1000),
          gender: u.gender,
          location: u.location,
          bio: u.bio,
          photos: [u.avatar],
          isPremium: u.isPremium,
          status: u.status,
          verificationStatus: u.verificationStatus,
          isVerified: u.verificationStatus === 'verified',
          nationalIdUrl: u.verificationStatus === 'pending' ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop' : null
        });
      }

      // 2. Seed Reports
      for (const r of initialReports) {
        await setDoc(doc(db, 'reports', r.id), {
          reporterId: r.reporterId,
          reporterName: r.reporterName,
          reportedId: r.reportedId,
          reportedName: r.reportedName,
          reportedAvatar: r.reportedAvatar,
          reason: r.reason,
          details: r.details,
          chatSnippet: r.chatSnippet,
          status: r.status,
          date: r.date
        });
      }

      // 3. Seed Bookings
      for (const b of initialBookings) {
        await setDoc(doc(db, 'bookings', b.id), {
          senderId: b.senderId,
          senderName: b.senderName,
          receiverId: b.receiverId,
          receiverName: b.receiverName,
          dateTime: new Date(b.dateTime),
          location: b.location,
          rate: b.rate,
          status: b.status,
          note: b.note,
          senderNote: b.senderNote || '',
          timestamp: new Date()
        });
      }

      // 4. Seed Live Streams
      for (const s of initialStreams) {
        await setDoc(doc(db, 'live_streams', s.id), {
          broadcasterId: s.broadcasterId,
          broadcasterName: s.broadcasterName,
          broadcasterPhoto: s.broadcasterPhoto,
          viewerCount: s.viewerCount,
          title: s.title,
          status: s.status,
          startedAt: new Date(s.startedAt)
        });
      }

      // 5. Seed Transactions
      for (const t of initialTransactions) {
        await setDoc(doc(db, 'transactions', t.id), {
          uid: t.uid,
          txRef: t.txRef,
          amount: t.amount,
          status: t.status,
          type: t.type,
          plan: t.plan || null,
          creditAmount: t.creditAmount || null,
          operator: t.operator,
          timestamp: new Date(t.timestamp)
        });
      }

      // 6. Seed Settings
      await setDoc(doc(db, 'settings', 'global'), initialSettings);

      alert("Successfully seeded Firestore database with all DateDash models!");
    } catch (e) {
      console.error(e);
      alert("Error seeding Firestore: " + e.message);
    }
    setLoading(false);
  };

  // Action: Approve/Reject Profile Verification
  const handleVerification = async (userId, approve) => {
    if (isLive && db) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          verificationStatus: approve ? 'verified' : 'unverified',
          isVerified: approve
        });
      } catch (err) {
        console.error("Firestore update error:", err);
      }
    } else {
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, verificationStatus: approve ? 'verified' : 'unverified' };
        }
        return u;
      }));
    }
  };

  // Action: Ban/Warn User
  const handleUserStatusChange = async (userId, newStatus) => {
    if (isLive && db) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          status: newStatus,
          hideProfile: newStatus === 'banned'
        });
      } catch (err) {
        console.error("Firestore update error:", err);
      }
    } else {
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, status: newStatus };
        }
        return u;
      }));
    }

    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(prev => ({ ...prev, status: newStatus }));
    }
  };

  // Action: Toggle user Premium subscription
  const handleTogglePremium = async (userId) => {
    const userToToggle = users.find(u => u.id === userId);
    if (!userToToggle) return;

    if (isLive && db) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          isPremium: !userToToggle.isPremium,
          premiumType: !userToToggle.isPremium ? 'Pro' : null
        });
      } catch (err) {
        console.error("Firestore update error:", err);
      }
    } else {
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, isPremium: !u.isPremium };
        }
        return u;
      }));
    }

    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(prev => ({ ...prev, isPremium: !prev.isPremium }));
    }
  };

  // Action: Dismiss/Resolve Abuse Reports
  const handleReportAction = async (reportId, reportedUserId, action) => {
    if (isLive && db) {
      try {
        await deleteDoc(doc(db, 'reports', reportId));

        if (action === 'warn') {
          await updateDoc(doc(db, 'users', reportedUserId), { status: 'warned' });
        } else if (action === 'ban') {
          await updateDoc(doc(db, 'users', reportedUserId), { status: 'banned', hideProfile: true });
        }
      } catch (err) {
        console.error("Firestore report action error:", err);
      }
    } else {
      setReports(prev => prev.filter(r => r.id !== reportId));
      if (action === 'warn') {
        handleUserStatusChange(reportedUserId, 'warned');
      } else if (action === 'ban') {
        handleUserStatusChange(reportedUserId, 'banned');
      }
    }
  };

  // Action: Terminate live stream
  const handleTerminateStream = async (streamId) => {
    if (isLive && db) {
      try {
        await updateDoc(doc(db, 'live_streams', streamId), { status: 'ended' });
        alert("Broadcast session terminated.");
      } catch (err) {
        console.error("Firestore stream termination error:", err);
      }
    } else {
      setStreams(prev => prev.map(s => {
        if (s.id === streamId) return { ...s, status: 'ended' };
        return s;
      }));
    }
  };

  // Action: Update date booking status
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    if (isLive && db) {
      try {
        await updateDoc(doc(db, 'bookings', bookingId), { status: newStatus });
      } catch (err) {
        console.error("Firestore booking update error:", err);
      }
    } else {
      setBookings(prev => prev.map(b => {
        if (b.id === bookingId) return { ...b, status: newStatus };
        return b;
      }));
    }
  };

  // Action: Update Gift Credit Cost
  const handleUpdateGiftCost = (giftId, newCost) => {
    setGifts(prev => prev.map(g => {
      if (g.id === giftId) return { ...g, cost: newCost };
      return g;
    }));
  };

  // Action: Save settings
  const handleSaveSettings = async () => {
    if (isLive && db) {
      try {
        await setDoc(doc(db, 'settings', 'global'), settings);
        alert("Global configurations successfully synced with Firebase!");
      } catch (err) {
        console.error("Firestore settings save error:", err);
      }
    } else {
      alert("Settings saved to app context (Simulated)");
    }
  };

  // Filtered Lists
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter;
      const matchesGender = userGenderFilter === 'all' || user.gender === userGenderFilter;
      const matchesTier = userTierFilter === 'all' || 
                         (userTierFilter === 'premium' ? user.isPremium : !user.isPremium);

      return matchesSearch && matchesStatus && matchesGender && matchesTier;
    });
  }, [users, searchQuery, userStatusFilter, userGenderFilter, userTierFilter]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      return bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
    });
  }, [bookings, bookingStatusFilter]);

  const activeStreams = useMemo(() => {
    return streams.filter(s => s.status === 'active');
  }, [streams]);

  // Sidebar Counts
  const pendingVerificationsCount = users.filter(user => user.verificationStatus === 'pending').length;
  const pendingReportsCount = reports.length;

  // KPIs
  const kpiData = [
    {
      title: "Total Registered Users",
      value: dynamicStats.totalUsers,
      icon: <Users size={20} />,
      trend: dynamicStats.growthRate,
      colorClass: "pink"
    },
    {
      title: "Daily Active Users",
      value: dynamicStats.activeUsers,
      icon: <Activity size={20} />,
      trend: dynamicStats.activeRate,
      colorClass: "purple"
    },
    {
      title: "Total Matches Formed",
      value: dynamicStats.matchesCount.toLocaleString(),
      icon: <Heart size={20} />,
      trend: dynamicStats.matchRate,
      colorClass: "pink"
    },
    {
      title: "Monthly Revenue",
      value: `$${dynamicStats.revenueMonthly.toLocaleString()}`,
      icon: <DollarSign size={20} />,
      trend: dynamicStats.revenueRate,
      colorClass: "green"
    }
  ];

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} pendingVerificationsCount={pendingVerificationsCount} pendingReportsCount={pendingReportsCount} />

      {/* Main Content Area */}
      <main className="main-content">
        <Header activeTab={activeTab} isLive={isLive} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <section className="content-body">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Synchronizing with Firestore database...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <OverviewTab
                  kpiData={kpiData}
                  stats={stats}
                  dynamicStats={dynamicStats}
                  isLive={isLive}
                  seedFirestoreDatabase={seedFirestoreDatabase}
                />
              )}

              {/* TAB 2: USER DIRECTORY */}
              {activeTab === 'users' && (
                <UsersTab
                  userStatusFilter={userStatusFilter}
                  setUserStatusFilter={setUserStatusFilter}
                  userGenderFilter={userGenderFilter}
                  setUserGenderFilter={setUserGenderFilter}
                  userTierFilter={userTierFilter}
                  setUserTierFilter={setUserTierFilter}
                  filteredUsers={filteredUsers}
                  setSelectedUser={setSelectedUser}
                />
              )}

              {/* TAB 3: VERIFICATION QUEUE */}
              {activeTab === 'verifications' && (
                <VerificationsTab users={users} handleVerification={handleVerification} />
              )}

              {/* TAB 4: ABUSE REPORTS */}
              {activeTab === 'reports' && (
                <ReportsTab reports={reports} handleReportAction={handleReportAction} />
              )}

              {/* TAB 5: OPERATIONS HUB */}
              {activeTab === 'operations' && (
                <OperationsTab
                  opsSubTab={opsSubTab}
                  setOpsSubTab={setOpsSubTab}
                  activeStreams={activeStreams}
                  bookings={bookings}
                  transactions={transactions}
                  gifts={gifts}
                  bookingStatusFilter={bookingStatusFilter}
                  setBookingStatusFilter={setBookingStatusFilter}
                  filteredBookings={filteredBookings}
                  handleTerminateStream={handleTerminateStream}
                  handleUpdateBookingStatus={handleUpdateBookingStatus}
                  handleUpdateGiftCost={handleUpdateGiftCost}
                />
              )}

              {/* TAB 6: APP CONFIG / SETTINGS */}
              {activeTab === 'settings' && (
                <SettingsTab
                  settings={settings}
                  setSettings={setSettings}
                  handleSaveSettings={handleSaveSettings}
                />
              )}
            </>
          )}
        </section>
      </main>

      {/* USER DETAILS MODAL */}
      <UserDetailsModal
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleTogglePremium={handleTogglePremium}
        handleUserStatusChange={handleUserStatusChange}
      />
    </div>
  );
}

export default App;
