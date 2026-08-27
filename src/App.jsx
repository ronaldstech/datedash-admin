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
import LoginScreen from './components/LoginScreen';
import { initialSettings, initialUsers, initialReports, initialVerifications } from './data/dashboardData';
import { db, auth, isFirebaseEnabled } from './firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
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
    date: toIsoString(data.date || data.createdAt || data.timestamp),
    timestamp: toIsoString(data.timestamp || data.createdAt || data.date)
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

  // Admin Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Theme State: user preference persisted to localStorage, fallback to system preference or dark
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('datedash_admin_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('datedash_admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Helper to check if a user record or claims signify an admin
  const verifyAdminStatus = async (user) => {
    if (!user) return false;

    // 1. Check custom user claims / token claims
    try {
      const idTokenResult = await user.getIdTokenResult(true);
      if (idTokenResult.claims.admin || idTokenResult.claims.role === 'admin') {
        return true;
      }
    } catch (e) {
      console.warn('Error checking token claims:', e);
    }

    // 2. Check Firestore "users" or "admins" collection doc
    if (db) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const uData = userSnap.data();
          const role = (uData.role || uData.accountType || uData.userType || uData.type || '').toLowerCase();
          if (role === 'admin' || role === 'administrator' || uData.isAdmin === true) {
            return true;
          }
        }

        // Also check an optional separate "admins" collection
        const adminDocRef = doc(db, 'admins', user.uid);
        const adminSnap = await getDoc(adminDocRef);
        if (adminSnap.exists()) {
          return true;
        }
      } catch (e) {
        console.warn('Error checking Firestore admin record:', e);
      }
    }

    // 3. Fallback: check if email is verified admin or contains admin domain / known admin email
    const email = (user.email || '').toLowerCase();
    if (email.startsWith('admin') || email.includes('admin@') || email.endsWith('@datedash.com')) {
      return true;
    }

    return false;
  };

  // Firebase Auth listener
  useEffect(() => {
    if (!isFirebaseEnabled || !auth) {
      // Offline/Demo mode: check if local admin session exists
      const savedOfflineAdmin = localStorage.getItem('datedash_admin_session');
      if (savedOfflineAdmin) {
        try {
          setCurrentUser(JSON.parse(savedOfflineAdmin));
        } catch {
          setCurrentUser(null);
        }
      }
      setAuthLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isAdmin = await verifyAdminStatus(user);
        if (isAdmin) {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email?.split('@')[0] || 'Admin',
            avatar: user.photoURL || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop',
            role: 'Administrator'
          });
          setLoginError('');
        } else {
          await signOut(auth);
          setCurrentUser(null);
          setLoginError('Access denied: Your account is not registered as an Administrator.');
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [isFirebaseEnabled]);

  // Login handler
  const handleLogin = async (email, password) => {
    setLoginError('');
    setIsLoggingIn(true);

    if (!isFirebaseEnabled || !auth) {
      // Offline / Demo authentication
      setTimeout(() => {
        if (email.toLowerCase().includes('admin') || password === 'admin123') {
          const demoAdmin = {
            uid: 'demo-admin-01',
            email: email,
            name: 'Sarah Jenkins (Demo)',
            avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop',
            role: 'Lead Administrator'
          };
          setCurrentUser(demoAdmin);
          localStorage.setItem('datedash_admin_session', JSON.stringify(demoAdmin));
        } else {
          setLoginError('Invalid demo credentials. Use admin@datedash.com / admin123.');
        }
        setIsLoggingIn(false);
      }, 500);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const isAdmin = await verifyAdminStatus(userCredential.user);
      if (!isAdmin) {
        await signOut(auth);
        setCurrentUser(null);
        setLoginError('Access denied: This account does not have Admin account privileges.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setLoginError('Invalid email or password. Please verify your admin credentials.');
      } else if (err.code === 'auth/too-many-requests') {
        setLoginError('Too many unsuccessful attempts. Please try again later.');
      } else {
        setLoginError(err.message || 'Authentication failed.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    if (isFirebaseEnabled && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    localStorage.removeItem('datedash_admin_session');
    setCurrentUser(null);
    setLoginError('');
  };

  const [users, setUsers] = useState(isFirebaseEnabled ? [] : initialUsers);
  const [reports, setReports] = useState(isFirebaseEnabled ? [] : initialReports);
  const [bookings, setBookings] = useState([]);
  const [streams, setStreams] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(Boolean(isFirebaseEnabled && db));
  const [connectionError, setConnectionError] = useState(
    isFirebaseEnabled && db ? '' : 'Add Firebase environment variables to load live Firestore data.'
  );

  const [selectedUser, setSelectedUser] = useState(null);
  const [settingsSubTab, setSettingsSubTab] = useState('appearance');

  const [searchQuery, setSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userGenderFilter, setUserGenderFilter] = useState('all');
  const [userTierFilter, setUserTierFilter] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!currentUser || !isFirebaseEnabled || !db) {
      if (!isFirebaseEnabled) {
        setLoading(false);
      }
      return undefined;
    }

    setLoading(true);
    let remainingInitialLoads = 7;
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
    const unsubscribeBookings = listenCollection('meetups', mapBooking, setBookings);
    const unsubscribeStreams = listenCollection('live_streams', mapStream, setStreams);
    const unsubscribeTransactions = listenCollection('transactions', mapTransaction, setTransactions);
    const unsubscribeMatches = listenCollection(
      'matches',
      (docSnap) => ({ id: docSnap.id, ...docSnap.data() }),
      setMatches
    );
    const unsubscribeGifts = listenCollection('gifts', mapGift, setGifts);

    const unsubscribeSettings = onSnapshot(
      doc(db, 'settings', 'global'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings((prev) => ({ ...initialSettings, ...prev, ...docSnap.data() }));
        }
      },
      (error) => {
        console.warn('Firestore settings listener error:', error);
      }
    );

    const unsubscribeAppSettings = onSnapshot(
      doc(db, 'app_settings', 'video_chat'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings((prev) => ({
            ...prev,
            countries: data.countries && data.countries.length > 0 ? data.countries : prev.countries || initialSettings.countries,
            languages: data.languages && data.languages.length > 0 ? data.languages : prev.languages || initialSettings.languages
          }));
        }
      },
      (error) => {
        console.warn('Firestore app_settings listener error:', error);
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeReports();
      unsubscribeBookings();
      unsubscribeStreams();
      unsubscribeTransactions();
      unsubscribeMatches();
      unsubscribeGifts();
      unsubscribeSettings();
      unsubscribeAppSettings();
    };
  }, []);

  const stats = useMemo(() => buildTrendStats(users, transactions), [users, transactions]);

  const dynamicStats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((user) => user.status === 'active').length;
    const premiumUsers = users.filter((user) => user.isPremium).length;
    const matchesCount =
      matches.length || users.reduce((sum, user) => sum + Number(user.matchesCount || user.matchCount || 0), 0);
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
  }, [users, transactions, matches, stats]);

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
      await updateDoc(doc(db, 'meetups', bookingId), { status: newStatus });
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

  const handleSaveSettings = async (customSettings) => {
    const targetSettings = customSettings || settings;

    if (!isLive || !db) {
      alert('Local preview mode: Settings updated locally. Connect Firebase to sync remotely.');
      return;
    }

    try {
      await setDoc(doc(db, 'settings', 'global'), targetSettings, { merge: true });

      // Synchronize with Flutter app video_chat config in app_settings/video_chat
      await setDoc(
        doc(db, 'app_settings', 'video_chat'),
        {
          countries: targetSettings.countries || [],
          languages: targetSettings.languages || [],
          updatedAt: new Date()
        },
        { merge: true }
      );

      alert('Global configurations and Video Chat (Countries & Languages) successfully synced with Firebase!');
    } catch (err) {
      console.error('Firestore settings save error:', err);
      alert(`Error syncing with Firebase: ${err.message}`);
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

  const userById = useMemo(() => {
    return new Map(users.map((user) => [user.id, user]));
  }, [users]);

  const reportsWithUserDetails = useMemo(() => {
    return reports.map((report) => {
      const reporter = userById.get(report.reporterId);
      const reported = userById.get(report.reportedId);

      return {
        ...report,
        reporterName: report.reporterName !== 'Unknown reporter' ? report.reporterName : reporter?.name || report.reporterId,
        reportedName: report.reportedName !== 'Unknown user' ? report.reportedName : reported?.name || report.reportedId,
        reportedAvatar: report.reportedAvatar !== DEFAULT_AVATAR ? report.reportedAvatar : reported?.avatar || DEFAULT_AVATAR
      };
    });
  }, [reports, userById]);

  const pendingVerificationsCount = users.filter((user) => user.verificationStatus === 'pending').length;
  const pendingReportsCount = reportsWithUserDetails.length;

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

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', gap: '16px' }}>
        <div style={{ width: '44px', height: '44px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Checking administrator authentication...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        error={loginError}
        loading={isLoggingIn}
        isLive={isLive}
      />
    );
  }

  return (
    <div className={`app-container ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
        }}
        activeSettingsSubTab={settingsSubTab}
        setActiveSettingsSubTab={(sub) => {
          setSettingsSubTab(sub);
          setMobileMenuOpen(false);
        }}
        pendingVerificationsCount={pendingVerificationsCount}
        pendingReportsCount={pendingReportsCount}
        activeStreamsCount={activeStreams.length}
        bookingsCount={bookings.length}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        currentAdmin={currentUser}
        onLogout={handleLogout}
      />

      <main className="main-content">
        <Header
          activeTab={activeTab}
          isLive={isLive}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setMobileMenuOpen={setMobileMenuOpen}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
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
                <ReportsTab reports={reportsWithUserDetails} handleReportAction={handleReportAction} />
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
                  theme={theme}
                  setTheme={setTheme}
                  activeSubTab={settingsSubTab}
                  setActiveSubTab={setSettingsSubTab}
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
