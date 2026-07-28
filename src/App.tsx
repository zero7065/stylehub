import React, { useState, useEffect, useRef } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import {
  Menu, X, Home, CreditCard, Building2, MessageSquare, Eye, Settings, Bot, LogOut, Shield,
  User, Coins, ArrowUpRight, Wallet, Clock, CheckCircle, AlertCircle, Copy, RefreshCw,
  ShoppingBag, Bell, Download
} from "lucide-react";
import OPaySimulator from "./components/OPaySimulator";
import AdminPanel from "./components/Admin/AdminPanel";
import VendorDashboard from "./components/Vendor/VendorDashboard";
import ChatRoom from "./components/Chat/ChatRoom";
import AIAssistantPage from "./components/AI/AIAssistant";
import LandingPage from "./components/LandingPage";
import SignIn from "./components/Auth/SignIn";
import SignUp from "./components/Auth/SignUp";
import Shop from "./components/Shop/Shop";
import ProfileSettings from "./components/Profile/ProfileSettings";
import PointsPurchase from "./components/Shop/PointsPurchase";
import Withdrawal from "./components/Dashboard/Withdrawal";
import "./App.css";

type Tab = 'home' | 'dashboard' | 'opay' | 'vendor' | 'chat' | 'blackroom' | 'settings' | 'ai' | 'admin' | 'signin' | 'signup' | 'shop' | 'points' | 'withdraw';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dashStats, setDashStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [kycName, setKycName] = useState('');
  const [kycAddress, setKycAddress] = useState('');
  const [kycMsg, setKycMsg] = useState('');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('sh_theme') as 'dark' | 'light') || 'dark');
  const [notifOpen, setNotifOpen] = useState(false);
  const fetchedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const cachedUser = localStorage.getItem("sh_user");
    const cachedToken = localStorage.getItem("sh_token");
    if (cachedUser && cachedToken) {
      const parsed = JSON.parse(cachedUser);
      setUser(parsed);
      if (parsed.role === "admin") setIsAdmin(true);
      setActiveTab('dashboard');
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard' && user && fetchedUserIdRef.current !== user.id) {
      fetchedUserIdRef.current = user.id;
      fetchDashboardData();
    }
  }, [activeTab, user?.id]);

  useEffect(() => {
    if (!user) return;
    const poll = async () => {
      const token = localStorage.getItem('sh_token');
      if (!token) return;
      try {
        const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
        const d = await res.json();
        if (d.notifications) setNotifications(d.notifications);
        if (d.unreadCount !== undefined) setUnreadNotifs(d.unreadCount);
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("sh_token");
    if (!token) return;
    setLoading(true);
    try {
      const [txRes, statsRes, meRes, annRes] = await Promise.all([
        fetch('/api/user/transactions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/user/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/announcements'),
      ]);
      if (txRes.ok) { const d = await txRes.json(); setTransactions(Array.isArray(d) ? d.slice(0, 10) : []); }
      if (statsRes.ok) setDashStats(await statsRes.json());
      if (meRes.ok) {
        const freshUser = await meRes.json();
        setUser(freshUser);
        localStorage.setItem("sh_user", JSON.stringify(freshUser));
        if (freshUser.role === "admin") setIsAdmin(true);
      }
      if (annRes.ok) { const d = await annRes.json(); setAnnouncements(Array.isArray(d) ? d : []); }
    } catch (e) { console.error('Dashboard fetch error:', e); }
    finally { setLoading(false); }
  };

  const handleAuthSuccess = (newUser: any, token: string) => {
    setTransactions([]);
    setDashStats(null);
    setUser(newUser);
    fetchedUserIdRef.current = newUser.id;
    if (newUser.role === "admin") setIsAdmin(true);
    localStorage.setItem("sh_user", JSON.stringify(newUser));
    localStorage.setItem("sh_token", token);
    setActiveTab('dashboard');
    setMenuOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    fetchedUserIdRef.current = null;
    setIsAdmin(false);
    setMenuOpen(false);
    setTransactions([]);
    setDashStats(null);
    localStorage.removeItem("sh_user");
    localStorage.removeItem("sh_token");
    setActiveTab('home');
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('sh_theme', next);
    document.documentElement.classList.toggle('sh-light', next === 'light');
  };

  const markNotifsRead = async () => {
    const token = localStorage.getItem('sh_token');
    if (!token) return;
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadNotifs(0);
    } catch {}
  };

  const submitKyc = async () => {
    if (!kycName || !kycAddress) { setKycMsg('Please fill in all fields'); return; }
    const token = localStorage.getItem("sh_token");
    if (!token) return;
    setKycMsg('');
    try {
      const res = await fetch('/api/profile/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, name: kycName, address: kycAddress })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("sh_user", JSON.stringify(data.user));
        setKycMsg('KYC submitted successfully! Pending review.');
        setKycName('');
        setKycAddress('');
      } else setKycMsg(data.error || 'KYC submission failed');
    } catch { setKycMsg('Network error.'); }
  };

  const copyRef = () => {
    if (user?.referral_code) navigator.clipboard.writeText(user.referral_code);
  };

  const refreshDashboard = () => {
    fetchedUserIdRef.current = null;
    fetchDashboardData();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <LandingPage onNavigate={(tab: string) => setActiveTab(tab as Tab)} />;
      case 'signin':
        return <SignIn onSuccess={handleAuthSuccess} onSwitch={() => setActiveTab('signup')} />;
      case 'signup':
        return <SignUp onSuccess={handleAuthSuccess} onSwitch={() => setActiveTab('signin')} />;
      case 'dashboard':
        return renderDashboard();
      case 'opay':
        return <OPaySimulator user={user} onExit={() => setActiveTab('dashboard')} theme={theme} onThemeToggle={toggleTheme} />;
      case 'vendor':
        return <VendorDashboard />;
      case 'chat':
        return <ChatRoom />;
      case 'ai':
        return <AIAssistantPage />;
      case 'admin':
        return isAdmin ? <AdminPanel /> : <div className="coming-soon">Access Denied</div>;
      case 'shop':
        return <Shop />;
      case 'settings':
        return <ProfileSettings user={user} onLogout={handleLogout} theme={theme} onThemeToggle={toggleTheme} />;
      case 'points':
        return user ? <PointsPurchase onClose={() => setActiveTab('dashboard')} onFundSuccess={(u) => { setUser(u); }} /> : null;
      case 'withdraw':
        return user ? <Withdrawal user={user} onClose={() => setActiveTab('dashboard')} onUpdateUser={(u) => { setUser(u); }} /> : null;
      default:
        return <LandingPage onNavigate={(tab: string) => setActiveTab(tab as Tab)} />;
    }
  };

  const renderDashboard = () => {
    if (!user) return null;
    const kycStatus = user.kyc_status || 'unsubmitted';
    const stats = dashStats || { totalPoints: 0, totalTransactions: 0, totalReceived: 0, totalSpent: 0 };

    return (
      <div className="dashboard-page">
        <div className="dash-header">
          <div className="dash-avatar">{user.email?.charAt(0).toUpperCase() || 'U'}</div>
          <div>
            <h1>{user.kyc_data?.name || user.email || 'User'}</h1>
            <p className="dash-email">{user.email}</p>
            {user.referral_code && (
              <p className="dash-ref" onClick={copyRef}>
                Ref: <strong>{user.referral_code}</strong> <Copy size={14} />
              </p>
            )}
          </div>
        </div>

        <div className="dash-stats-grid">
          <div className="dash-stat-card points-card">
            <Coins size={20} />
            <div className="dash-stat-val">{user.points?.toLocaleString() || 0}</div>
            <div className="dash-stat-lbl">Points Balance</div>
          </div>
          <div className="dash-stat-card">
            <Wallet size={20} />
            <div className="dash-stat-val">{stats.totalReceived?.toLocaleString() || 0}</div>
            <div className="dash-stat-lbl">Total Earned</div>
          </div>
          <div className="dash-stat-card">
            <ArrowUpRight size={20} />
            <div className="dash-stat-val">{stats.totalSpent?.toLocaleString() || 0}</div>
            <div className="dash-stat-lbl">Total Spent</div>
          </div>
          <div className="dash-stat-card">
            <Clock size={20} />
            <div className="dash-stat-val">{stats.totalTransactions || 0}</div>
            <div className="dash-stat-lbl">Transactions</div>
          </div>
        </div>

        <div className="dash-section">
          <h2>KYC Verification</h2>
          <div className="kyc-status-bar">
            {kycStatus === 'verified' && <span className="kyc-badge kyc-verified"><CheckCircle size={16} /> Verified</span>}
            {kycStatus === 'pending' && <span className="kyc-badge kyc-pending"><Clock size={16} /> Pending Review</span>}
            {kycStatus === 'unsubmitted' && <span className="kyc-badge kyc-unsubmitted"><AlertCircle size={16} /> Not Submitted</span>}
            {(kycStatus === 'unsubmitted' || kycStatus === 'rejected') && (
              <div className="kyc-form">
                <input placeholder="Full Name" value={kycName} onChange={e => setKycName(e.target.value)} />
                <input placeholder="Address" value={kycAddress} onChange={e => setKycAddress(e.target.value)} />
                <button onClick={submitKyc}>Submit KYC</button>
                {kycMsg && <p className="kyc-msg">{kycMsg}</p>}
              </div>
            )}
          </div>
        </div>

        {announcements.length > 0 && (
          <div className="dash-section">
            <h2>Announcements</h2>
            <div className="dash-announcements">
              {announcements.map((ann: any, i: number) => (
                <div key={ann.id || i} className={`ann-card ann-${ann.type || 'info'}`}>
                  <div className="ann-badge">{ann.type === 'alert' ? '🔴' : ann.type === 'warning' ? '🟡' : '🔵'}</div>
                  <div className="ann-body">
                    <p>{ann.message}</p>
                    <span className="ann-date">{new Date(ann.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="dash-section">
          <h2>Quick Actions</h2>
          <div className="dash-actions">
            <button className="action-card" onClick={() => setActiveTab('opay')}><CreditCard size={20} /> OPay</button>
            <button className="action-card" onClick={() => setActiveTab('points')}><Coins size={20} /> Buy Points</button>
            <button className="action-card" onClick={() => setActiveTab('withdraw')}><Download size={20} /> Withdraw</button>
            {user?.isVendor || user?.kyc_data?.isVendor ? (
              <button className="action-card" onClick={() => setActiveTab('vendor')}><Building2 size={20} /> Vendor</button>
            ) : null}
            <button className="action-card" onClick={() => setActiveTab('shop')}><ShoppingBag size={20} /> Shop</button>
            <button className="action-card" onClick={() => setActiveTab('chat')}><MessageSquare size={20} /> Chat</button>
            <button className="action-card" onClick={() => setActiveTab('ai')}><Bot size={20} /> AI</button>
            <button className="action-card" onClick={() => setActiveTab('settings')}><Settings size={20} /> Settings</button>
          </div>
        </div>

        <div className="dash-section">
          <h2>Recent Activity</h2>
          <div className="dash-txns">
            {loading && <p className="dash-loading">Loading...</p>}
            {!loading && transactions.length === 0 && <p className="dash-empty">No transactions yet. Start earning points!</p>}
            {transactions.map((tx: any, i: number) => (
              <div key={tx.id || i} className="txn-row">
                <div className="txn-info">
                  <span className="txn-type">{tx.type?.replace(/_/g, ' ') || 'Activity'}</span>
                  <span className="txn-desc">{tx.description || ''}</span>
                </div>
                <div className="txn-amt">
                  <span className={tx.amount > 0 ? 'txn-pos' : 'txn-neg'}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount?.toLocaleString() || 0}
                  </span>
                  <span className="txn-pts">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!user && activeTab !== 'signin' && activeTab !== 'signup') {
    return (
      <div className={`app-container ${theme === 'light' ? 'sh-light' : ''}`}>
        <LandingPage onNavigate={(tab: string) => setActiveTab(tab as Tab)} />
      </div>
    );
  }

  if (!user && (activeTab === 'signin' || activeTab === 'signup')) {
    return (
      <div className={`app-container ${theme === 'light' ? 'sh-light' : ''}`}>
        {renderContent()}
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<div className="p-6 text-center text-red-400"><h2>Something went wrong</h2><button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl">Reload</button></div>}>
    <div className={`app-container ${theme === 'light' ? 'sh-light' : ''}`}>
      {activeTab !== 'opay' && (
        <header className="app-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} title="Menu">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="app-title">StyleHub</span>
          </div>
          <div className="header-right">
            <span className="points-badge" style={{cursor:'pointer'}} onClick={() => { setActiveTab('points'); setMenuOpen(false); }}>🪙 {user?.points?.toLocaleString() || 0} pts</span>
            <button className="buy-btn" onClick={() => { setActiveTab('opay'); setMenuOpen(false); }}>Fund</button>
            <div className="notif-wrapper">
              <button className="notif-btn" title="Notifications" onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markNotifsRead(); }}>
                <Bell size={20} />
                {unreadNotifs > 0 && <span className="notif-badge">{unreadNotifs > 9 ? '9+' : unreadNotifs}</span>}
              </button>
              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span>Notifications</span>
                    <button className="notif-close" onClick={() => setNotifOpen(false)}>✕</button>
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 && <div className="notif-empty">No notifications</div>}
                    {notifications.map((n, i) => (
                      <div key={n.id || i} className={`notif-item ${n.type === 'transaction' ? 'tx' : 'ann'}`}>
                        <div className="notif-msg">{n.message}</div>
                        <div className="notif-date">{new Date(n.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className="avatar-btn" title="Logout" onClick={handleLogout}>👤</button>
          </div>
        </header>
      )}

      {activeTab !== 'opay' && (
        <nav className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <span className="menu-brand">StyleHub</span>
          <button className="menu-close" onClick={() => setMenuOpen(false)}>✕</button>
        </div>
        <div className="menu-user-info">
          <div className="menu-avatar">{user?.email?.charAt(0).toUpperCase() || 'U'}</div>
          <span className="menu-user-name">{user?.kyc_data?.name || user?.email || 'User'}</span>
          <span className="menu-user-points">🪙 {user?.points?.toLocaleString() || 0} pts</span>
        </div>
        <ul className="menu-list">
          <li onClick={() => { setActiveTab('dashboard'); setMenuOpen(false); }} className={activeTab === 'dashboard' ? 'active' : ''}><Home size={20} /> Dashboard</li>
          <li onClick={() => { setActiveTab('opay'); setMenuOpen(false); }} className={activeTab === 'opay' ? 'active' : ''}><CreditCard size={20} /> OPay Transfer</li>
          {user?.isVendor || user?.kyc_data?.isVendor ? (
            <li onClick={() => { setActiveTab('vendor'); setMenuOpen(false); }} className={activeTab === 'vendor' ? 'active' : ''}><Building2 size={20} /> Vendor Dashboard</li>
          ) : null}
          <li onClick={() => { setActiveTab('points'); setMenuOpen(false); }} className={activeTab === 'points' ? 'active' : ''}><Coins size={20} /> Buy Points</li>
          <li onClick={() => { setActiveTab('withdraw'); setMenuOpen(false); }} className={activeTab === 'withdraw' ? 'active' : ''}><Download size={20} /> Withdraw</li>
          <li onClick={() => { setActiveTab('chat'); setMenuOpen(false); }} className={activeTab === 'chat' ? 'active' : ''}><MessageSquare size={20} /> Chat</li>
          <li onClick={() => { setActiveTab('shop'); setMenuOpen(false); }} className={activeTab === 'shop' ? 'active' : ''}><ShoppingBag size={20} /> Shop</li>
          <li onClick={() => { setActiveTab('blackroom'); setMenuOpen(false); }}><Eye size={20} /> Black Room</li>
          <li onClick={() => { setActiveTab('ai'); setMenuOpen(false); }} className={activeTab === 'ai' ? 'active' : ''}><Bot size={20} /> AI Assistant</li>
          <li onClick={() => { setActiveTab('settings'); setMenuOpen(false); }}><Settings size={20} /> Settings</li>
          {isAdmin && (
            <li onClick={() => { setActiveTab('admin'); setMenuOpen(false); }} className="admin-link"><Shield size={20} /> Admin Panel</li>
          )}
          <li onClick={handleLogout} className="logout-link"><LogOut size={20} /> Logout</li>
        </ul>
      </nav>
      )}

      <main className={`app-main ${activeTab === 'opay' ? 'opay-active' : ''}`}>{renderContent()}</main>

      {activeTab !== 'opay' && menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />}
    </div>
    </ErrorBoundary>
  );
}
