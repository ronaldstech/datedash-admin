import { useState, useMemo, useEffect } from 'react';
import { Heart, Users, DollarSign, Activity } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewTab from './components/OverviewTab';
import UsersTab from './components/UsersTab';
import VerificationsTab from './components/VerificationsTab';
import ReportsTab from './components/ReportsTab';
import StreamsTab from './components/StreamsTab';
import BookingsTab from './components/BookingsTab';
import TransactionsTab from './components/TransactionsTab';
import GiftsTab from './components/GiftsTab';
import SettingsTab from './components/SettingsTab';
import UserDetailsModal from './components/UserDetailsModal';
import { initialSettings } from './data/dashboardData';
import { db, isFirebaseEnabled } from './firebase';
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  setDoc
} from 'firebase/firestore';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop';

const emptyStats = {
  dailyActiveTrend: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
    day,
    active: 0,
    matches: 0
  })),
  registrationsTrend: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => ({
    month,
    free: 0,
    premium: 0
  }))
};

const toDate = (value) => {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  if (value.seconds) return new Date(value.seconds * 1000);

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toIsoString = (value, fallback = new Date()) => {
  const date = toDate(value) || fallback;
  return date.toISOString();
};

const calculateAge = (dobField) => {
  const dobDate = toDate(dobField);
  if (!dobDate) return null;

  const diffMs = Date.now() - dobDate.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const getUserName = (data) => {
  if (data.name || data.displayName || data.fullName) {
    return data.name || data.displayName || data.fullName;
  }

  return [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Unnamed User';
};

const getFirstPhoto = (data) => {
  if (Array.isArray(data.photos) && data.photos.length > 0) return data.photos[0];
  if (Array.isArray(data.photoUrls) && data.photoUrls.length > 0) return data.photoUrls[0];
  return data.avatar || data.photoURL || data.profilePhoto || DEFAULT_AVATAR;
};

const mapUser = (docSnap) => {
  const data = docSnap.data();
  const joined = toDate(data.joinedDate || data.createdAt || data.created_at || data.lastUpdated);

  return {
    id: docSnap.id,
    name: getUserName(data),
    email: data.email || data.phoneNumber || data.phone || 'No contact',
    age: data.age ?? calculateAge(data.dob || data.birthDate || data.dateOfBirth) ?? 'N/A',
    gender: data.gender || 'Not specified',
    location: data.location?.name || data.city || data.country || data.location || 'Unknown',
    avatar: getFirstPhoto(data),
    joinedDate: joined ? joined.toISOString().split('T')[0] : '',
    isPremium: Boolean(data.isPremium || data.premium || data.premiumType),
    status: data.status || (data.hideProfile ? 'banned' : 'active'),
    verificationStatus: data.verificationStatus || (data.isVerified ? 'verified' : 'unverified'),
    bio: data.bio || data.about || '',
    reportedCount: data.reportedCount || data.reportsCount || 0,
    nationalIdUrl: data.nationalIdUrl || data.verificationPhoto || data.selfieUrl || null,
    photos: data.photos || data.photoUrls || []
  };
};

const mapReport = (docSnap) => {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    reporterId: data.reporterId || data.createdBy || data.fromUserId || '',
    reporterName: data.reporterName || data.createdByName || 'Unknown reporter',
    reportedId: data.reportedId || data.userId || data.toUserId || '',
    reportedName: data.reportedName || data.userName || 'Unknown user',
    reportedAvatar: data.reportedAvatar || data.userAvatar || DEFAULT_AVATAR,
    reason: data.reason || data.type || 'Unspecified',
    details: data.details || data.description || '',
    chatSnippet: data.chatSnippet || data.message || '',
    status: data.status || 'pending',
    date: toIsoString(data.date || data.createdAt || data.timestamp)
  };
};

const mapBooking = (docSnap) => {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    senderId: data.senderId || data.bookedById || '',
    senderName: data.senderName || data.bookedByName || 'Unknown',
    receiverId: data.receiverId || data.hostId || '',
    receiverName: data.receiverName || data.hostName || 'Unknown',
    dateTime: toIsoString(data.dateTime || data.scheduledAt || data.timestamp),
    location: data.location?.name || data.location || 'Not specified',
    rate: data.rate || data.price || data.creditRate || 'N/A',
    status: data.status || 'pending',
    note: data.note || data.senderNote || '',
    senderNote: data.senderNote || ''
  };
};

const mapStream = (docSnap) => {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    broadcasterId: data.broadcasterId || data.hostId || data.userId || '',
    broadcasterName: data.broadcasterName || data.hostName || data.userName || 'Broadcaster',
    broadcasterPhoto: data.broadcasterPhoto || data.hostPhoto || data.userPhoto || DEFAULT_AVATAR,
    viewerCount: Number(data.viewerCount || data.viewers || 0),
    title: data.title || data.description || 'Live Broadcast',
    status: data.status || (data.endedAt ? 'ended' : 'active'),
    startedAt: toIsoString(data.startedAt || data.createdAt || data.timestamp)
  };
};

const mapTransaction = (docSnap) => {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    uid: data.uid || data.userId || '',
    txRef: data.txRef || data.reference || data.ref || docSnap.id,
    amount: Number(data.amount || data.total || 0),
    status: data.status || 'pending',
    type: data.type || data.productType || 'payment',
    plan: data.plan || data.subscriptionPlan || null,
    creditAmount: data.creditAmount || data.credits || null,
    operator: data.operator || data.provider || data.paymentMethod || 'Unknown',
    timestamp: toIsoString(data.timestamp || data.createdAt || data.paidAt)
  };
};

const mapGift = (docSnap) => {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    icon: data.icon || data.emoji || '',
    name: data.name || docSnap.id,
    cost: Number(data.cost || data.creditCost || data.price || 0),
    color: data.color || '#ec4899'
  };
};

const buildTrendStats = (users, transactions) => {
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' });
  const dailyActiveTrend = emptyStats.dailyActiveTrend.map((point) => ({ ...point }));
  const registrationsTrend = emptyStats.registrationsTrend.map((point) => ({ ...point }));

  users.forEach((user) => {
    const joined = toDate(user.joinedDate);
    if (!joined) return;

    const monthPoint = registrationsTrend.find((point) => point.month === month.format(joined));
    if (monthPoint) {
      if (user.isPremium) monthPoint.premium += 1;
      else monthPoint.free += 1;
    }
  });

  transactions.forEach((transaction) => {
    const timestamp = toDate(transaction.timestamp);
    if (!timestamp || transaction.status !== 'success') return;

    const dayPoint = dailyActiveTrend.find((point) => point.day === weekday.format(timestamp));
    if (dayPoint) dayPoint.active += 1;
  });

  return { dailyActiveTrend, registrationsTrend };
};

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLive] = useState(Boolean(isFirebaseEnabled && db));

  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [streams, setStreams] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(Boolean(isFirebaseEnabled && db));
  const [connectionError, setConnectionError] = useState(
    isFirebaseEnabled && db ? '' : 'Add Firebase environment variables to load live Firestore data.'
  );

  const [selectedUser, setSelectedUser] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userGenderFilter, setUserGenderFilter] = useState('all');
  const [userTierFilter, setUserTierFilter] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isFirebaseEnabled || !db) {
      return undefined;
    }

    let remainingInitialLoads = 6;
    const markLoaded = () => {
      remainingInitialLoads -= 1;
      if (remainingInitialLoads <= 0) setLoading(false);
    };

    const listenCollection = (collectionName, mapper, setter) =>
      onSnapshot(
        collection(db, collectionName),
        (snapshot) => {
          setter(snapshot.docs.map(mapper));
          markLoaded();
        },
        (error) => {
          console.error(`Firestore ${collectionName} listener error:`, error);
          setConnectionError(error.message);
          setter([]);
          markLoaded();
        }
      );

    const unsubscribeUsers = listenCollection('users', mapUser, setUsers);
    const unsubscribeReports = listenCollection('reports', mapReport, setReports);
    const unsubscribeBookings = listenCollection('bookings', mapBooking, setBookings);
    const unsubscribeStreams = listenCollection('live_streams', mapStream, setStreams);
    const unsubscribeTransactions = listenCollection('transactions', mapTransaction, setTransactions);
    const unsubscribeGifts = listenCollection('gifts', mapGift, setGifts);

    const unsubscribeSettings = onSnapshot(
      doc(db, 'settings', 'global'),
      (docSnap) => {
        if (docSnap.exists()) setSettings({ ...initialSettings, ...docSnap.data() });
      },
      (error) => {
        console.warn('Firestore settings listener error:', error);
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeReports();
      unsubscribeBookings();
      unsubscribeStreams();
      unsubscribeTransactions();
      unsubscribeGifts();
      unsubscribeSettings();
    };
  }, []);

  const stats = useMemo(() => buildTrendStats(users, transactions), [users, transactions]);

  const dynamicStats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((user) => user.status === 'active').length;
    const premiumUsers = users.filter((user) => user.isPremium).length;
    const matchesCount = users.reduce((sum, user) => sum + Number(user.matchesCount || user.matchCount || 0), 0);
    const revenueMonthly = transactions
      .filter((transaction) => transaction.status === 'success')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      totalUsers,
      activeUsers,
      matchesCount,
      premiumUsers,
      growthRate: `${totalUsers} users`,
      activeRate: `${activeUsers} active`,
      matchRate: `${matchesCount} matches`,
      revenueMonthly,
      revenueRate: `${transactions.length} transactions`,
      dailyActiveTrend: stats.dailyActiveTrend,
      registrationsTrend: stats.registrationsTrend,
      genderDistribution: [
        { name: 'Male', value: users.filter((user) => user.gender === 'Male').length, color: '#ec4899' },
        { name: 'Female', value: users.filter((user) => user.gender === 'Female').length, color: '#8b5cf6' },
        {
          name: 'Other',
          value: users.filter((user) => user.gender !== 'Male' && user.gender !== 'Female').length,
          color: '#f59e0b'
        }
      ]
    };
  }, [users, transactions, stats]);

  const handleVerification = async (userId, approve) => {
    if (isLive && db) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          verificationStatus: approve ? 'verified' : 'unverified',
          isVerified: approve
        });
      } catch (err) {
        console.error('Firestore update error:', err);
      }
    }
  };

  const handleUserStatusChange = async (userId, newStatus) => {
    if (isLive && db) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          status: newStatus,
          hideProfile: newStatus === 'banned'
        });
      } catch (err) {
        console.error('Firestore update error:', err);
      }
    }

    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleTogglePremium = async (userId) => {
    const userToToggle = users.find((user) => user.id === userId);
    if (!userToToggle || !isLive || !db) return;

    try {
      await updateDoc(doc(db, 'users', userId), {
        isPremium: !userToToggle.isPremium,
        premiumType: !userToToggle.isPremium ? 'Pro' : null
      });
    } catch (err) {
      console.error('Firestore update error:', err);
    }

    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser((prev) => ({ ...prev, isPremium: !prev.isPremium }));
    }
  };

  const handleReportAction = async (reportId, reportedUserId, action) => {
    if (!isLive || !db) return;

    try {
      await deleteDoc(doc(db, 'reports', reportId));

      if (action === 'warn') {
        await updateDoc(doc(db, 'users', reportedUserId), { status: 'warned' });
      } else if (action === 'ban') {
        await updateDoc(doc(db, 'users', reportedUserId), { status: 'banned', hideProfile: true });
      }
    } catch (err) {
      console.error('Firestore report action error:', err);
    }
  };

  const handleTerminateStream = async (streamId) => {
    if (!isLive || !db) return;

    try {
      await updateDoc(doc(db, 'live_streams', streamId), {
        status: 'ended',
        endedAt: new Date()
      });
      alert('Broadcast session terminated.');
    } catch (err) {
      console.error('Firestore stream termination error:', err);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    if (!isLive || !db) return;

    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: newStatus });
    } catch (err) {
      console.error('Firestore booking update error:', err);
    }
  };

  const handleUpdateGiftCost = async (giftId, newCost) => {
    setGifts((prev) => prev.map((gift) => (gift.id === giftId ? { ...gift, cost: newCost } : gift)));

    if (!isLive || !db) return;

    try {
      await updateDoc(doc(db, 'gifts', giftId), { cost: newCost });
    } catch (err) {
      console.error('Firestore gift update error:', err);
    }
  };

  const handleSaveSettings = async () => {
    if (!isLive || !db) return;

    try {
      await setDoc(doc(db, 'settings', 'global'), settings, { merge: true });
      alert('Global configurations successfully synced with Firebase.');
    } catch (err) {
      console.error('Firestore settings save error:', err);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.location.toLowerCase().includes(query);

      const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter;
      const matchesGender = userGenderFilter === 'all' || user.gender === userGenderFilter;
      const matchesTier =
        userTierFilter === 'all' || (userTierFilter === 'premium' ? user.isPremium : !user.isPremium);

      return matchesSearch && matchesStatus && matchesGender && matchesTier;
    });
  }, [users, searchQuery, userStatusFilter, userGenderFilter, userTierFilter]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => bookingStatusFilter === 'all' || booking.status === bookingStatusFilter);
  }, [bookings, bookingStatusFilter]);

  const activeStreams = useMemo(() => {
    return streams.filter((stream) => stream.status === 'active');
  }, [streams]);

  const pendingVerificationsCount = users.filter((user) => user.verificationStatus === 'pending').length;
  const pendingReportsCount = reports.length;

  const kpiData = [
    {
      title: 'Total Registered Users',
      value: dynamicStats.totalUsers,
      icon: <Users size={20} />,
      trend: dynamicStats.growthRate,
      colorClass: 'pink'
    },
    {
      title: 'Daily Active Users',
      value: dynamicStats.activeUsers,
      icon: <Activity size={20} />,
      trend: dynamicStats.activeRate,
      colorClass: 'purple'
    },
    {
      title: 'Total Matches Formed',
      value: dynamicStats.matchesCount.toLocaleString(),
      icon: <Heart size={20} />,
      trend: dynamicStats.matchRate,
      colorClass: 'pink'
    },
    {
      title: 'Monthly Revenue',
      value: `$${dynamicStats.revenueMonthly.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      icon: <DollarSign size={20} />,
      trend: dynamicStats.revenueRate,
      colorClass: 'green'
    }
  ];

  return (
    <div className={`app-container ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
        }}
        pendingVerificationsCount={pendingVerificationsCount}
        pendingReportsCount={pendingReportsCount}
        activeStreamsCount={activeStreams.length}
        bookingsCount={bookings.length}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="main-content">
        <Header
          activeTab={activeTab}
          isLive={isLive}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <section className="content-body">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Synchronizing with Firestore database...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <>
              {connectionError && (
                <div className="table-card" style={{ marginBottom: '20px', padding: '16px', color: 'var(--warning)' }}>
                  {connectionError}
                </div>
              )}

              {activeTab === 'overview' && (
                <OverviewTab
                  kpiData={kpiData}
                  stats={stats}
                  dynamicStats={dynamicStats}
                  isLive={isLive}
                  connectionError={connectionError}
                />
              )}

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

              {activeTab === 'verifications' && (
                <VerificationsTab users={users} handleVerification={handleVerification} />
              )}

              {activeTab === 'reports' && (
                <ReportsTab reports={reports} handleReportAction={handleReportAction} />
              )}

              {activeTab === 'streams' && (
                <StreamsTab activeStreams={activeStreams} handleTerminateStream={handleTerminateStream} />
              )}

              {activeTab === 'bookings' && (
                <BookingsTab
                  bookingStatusFilter={bookingStatusFilter}
                  setBookingStatusFilter={setBookingStatusFilter}
                  filteredBookings={filteredBookings}
                  handleUpdateBookingStatus={handleUpdateBookingStatus}
                />
              )}

              {activeTab === 'transactions' && <TransactionsTab transactions={transactions} />}

              {activeTab === 'gifts' && (
                <GiftsTab gifts={gifts} handleUpdateGiftCost={handleUpdateGiftCost} />
              )}

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
