import React, { useState, useEffect, useRef } from 'react';
import { Check, Eye, EyeOff, ArrowLeft, Search, ArrowUp, Phone, Wifi, Monitor, Zap, Clock, Copy, Moon, Sun, Download } from 'lucide-react';
import PaystackFundModal from './PaystackFundModal';

interface OPayTx {
  id: string; recipient: string; bank: string; amount: number;
  date: string; reference: string; status: 'success' | 'pending' | 'failed';
  note?: string; senderName: string; type: string;
  accountNumber?: string; fee?: number;
}

const STORAGE_KEY = 'sh_opay_txs';
const LAST_TX_KEY = 'sh_opay_last_tx';

function loadTxs(): OPayTx[] {
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : []; }
  catch { return []; }
}
function saveTxs(txs: OPayTx[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
}
function loadLastTx(): OPayTx | null {
  try { const d = localStorage.getItem(LAST_TX_KEY); return d ? JSON.parse(d) : null; }
  catch { return null; }
}
function saveLastTx(tx: OPayTx | null) {
  if (tx) localStorage.setItem(LAST_TX_KEY, JSON.stringify(tx));
  else localStorage.removeItem(LAST_TX_KEY);
}

const BANKS_FALLBACK = [
  { code: '001', name: 'Access Bank' }, { code: '002', name: 'GTBank' },
  { code: '003', name: 'First Bank' }, { code: '004', name: 'OPay' },
  { code: '005', name: 'Zenith Bank' }, { code: '006', name: 'UBA' },
  { code: '007', name: 'Fidelity Bank' }, { code: '008', name: 'Union Bank' },
  { code: '009', name: 'Stanbic IBTC' }, { code: '010', name: 'Polaris Bank' },
  { code: '011', name: 'Wema Bank' }, { code: '012', name: 'Sterling Bank' },
  { code: '013', name: 'FCMB' }, { code: '014', name: 'Ecobank' },
  { code: '015', name: 'Providus Bank' }, { code: '016', name: 'Suntrust Bank' },
  { code: '017', name: 'Keystone Bank' }, { code: '018', name: 'Unity Bank' },
  { code: '019', name: 'Heritage Bank' }, { code: '020', name: 'Taj Bank' },
];

const QUICK_ACTIONS = [
  { icon: 'send', label: 'Send' },
  { icon: 'airtime', label: 'Airtime' },
  { icon: 'data', label: 'Data' },
  { icon: 'tv', label: 'Cable TV' },
  { icon: 'zap', label: 'Electricity' },
  { icon: 'dice', label: 'Betting' },
  { icon: 'bills', label: 'Bills' },
  { icon: 'more', label: 'More' },
];

function formatDateTime(d: Date) {
  const opts: Intl.DateTimeFormatOptions = {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  };
  return d.toLocaleDateString('en-US', opts);
}

function formatTimeShort() {
  const d = new Date();
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function genRef() {
  return `OPAY-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export default function OPaySimulator({ user, onExit, theme, onThemeToggle }: { user: any; onExit?: () => void; theme?: string; onThemeToggle?: () => void }) {
  const [balance, setBalance] = useState(user?.points || 0);
  const [showBalance, setShowBalance] = useState(true);
  const [screen, setScreen] = useState<'home' | 'send' | 'airtime' | 'data' | 'bills' | 'profile' | 'success' | 'history'>('home');
  const [transactions, setTransactions] = useState<OPayTx[]>(loadTxs);
  const [banks, setBanks] = useState<any[]>(BANKS_FALLBACK);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [recipient, setRecipient] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [senderName, setSenderName] = useState(user?.kyc_data?.name || user?.email?.split('@')[0] || 'Customer');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTx, setLastTx] = useState<OPayTx | null>(loadLastTx);
  const [viewingTx, setViewingTx] = useState<OPayTx | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [airtimeAmount, setAirtimeAmount] = useState('');
  const [error, setError] = useState('');
  const [dataNetwork, setDataNetwork] = useState('');
  const [billsCategory, setBillsCategory] = useState('');
  const [billsAmount, setBillsAmount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('sh_opay_dark') === 'true'; } catch { return false; }
  });
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [statusTime, setStatusTime] = useState(formatTimeShort());
  const [pinScreen, setPinScreen] = useState<'none' | 'create' | 'verify'>('none');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [pinAction, setPinAction] = useState<(() => void) | null>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  const toggleDark = () => {
    if (onThemeToggle) {
      onThemeToggle();
    } else {
      setDarkMode(prev => {
        const next = !prev;
        try { localStorage.setItem('sh_opay_dark', String(next)); } catch {}
        return next;
      });
    }
  };

  useEffect(() => {
    fetch('/api/banks').then(r => r.json()).then(d => { if (Array.isArray(d) && d.length) setBanks(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setStatusTime(formatTimeShort()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    checkPin();
  }, []);

  const checkPin = async () => {
    const token = localStorage.getItem('sh_token');
    if (!token) { setHasPin(false); return; }
    try {
      const res = await fetch('/api/opay/pin-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setHasPin(d.hasPin);
        return;
      }
    } catch {}
    const userData = JSON.parse(localStorage.getItem('sh_user') || '{}');
    setHasPin(!!userData.opay_pin);
  };

  const requirePin = (action: () => void) => {
    if (!hasPin) {
      setPinScreen('create');
      setPinAction(() => { setPinScreen('verify'); setPinAction(action); });
    } else {
      setPinScreen('verify');
      setPinAction(() => { setPinScreen('none'); action(); });
    }
  };

  useEffect(() => {
    if (accountNumber.length === 10 && !accountName && !lookupLoading) {
      setLookupLoading(true);
      fetch('/api/opay/lookup-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber }),
      })
        .then(r => r.json())
        .then(data => { if (data.accountName) setAccountName(data.accountName); })
        .catch(() => {})
        .finally(() => setLookupLoading(false));
    }
    if (accountNumber.length !== 10) setAccountName('');
  }, [accountNumber]);

  const filteredBanks = banks.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const cost = 30;

  const addTx = (tx: OPayTx) => {
    const updated = [tx, ...transactions];
    setTransactions(updated);
    saveTxs(updated);
    setLastTx(tx);
    saveLastTx(tx);
  };

  const handleSend = async () => {
    setError('');
    if (!accountNumber || !selectedBank || !amount || !recipient) { setError('Please fill all fields'); return; }
    if (hasPin === null) { setError('Checking PIN status...'); await checkPin(); return; }
    if (hasPin === false) { requirePin(() => proceedSend()); return; }
    if (hasPin === true) { requirePin(() => proceedSend()); return; }
  };

  const proceedSend = async () => {
    const token = localStorage.getItem('sh_token') || '';
    const userData = JSON.parse(localStorage.getItem('sh_user') || '{}');
    if ((userData.points || 0) < cost) { setError(`Insufficient points — need ${cost}, have ${userData.points}`); return; }
    setIsLoading(true);
    const ref = genRef();
    try {
      const res = await fetch('/api/opay/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: parseFloat(amount), recipient, recipientAccount: accountNumber, bank: selectedBank, senderName, reference: ref }),
      });
      const data = await res.json();
      if (data.success) {
        const now = new Date();
        const tx: OPayTx = {
          id: `TX-${Date.now()}`, recipient, bank: banks.find(b => b.code === selectedBank)?.name || 'Unknown',
          amount: parseFloat(amount), date: formatDateTime(now), reference: ref,
          status: 'success', note: note || undefined, senderName, type: 'Transfer',
          accountNumber, fee: cost,
        };
        addTx(tx);
        setLastTx(tx);
        setBalance(data.newBalance);
        localStorage.setItem('sh_user', JSON.stringify({ ...userData, points: data.newBalance }));
        setScreen('success');
      } else setError(data.error || 'Transfer failed');
    } catch { setError('Network error. Please try again.'); }
    finally { setIsLoading(false); }
  };

  const handleAirtime = async () => {
    setError('');
    if (!phoneNumber || !airtimeAmount) { setError('Enter phone number and amount'); return; }
    if (hasPin === null) { await checkPin(); return; }
    if (hasPin === false) { requirePin(() => proceedAirtime()); return; }
    if (hasPin === true) { requirePin(() => proceedAirtime()); return; }
  };

  const proceedAirtime = async () => {
    const token = localStorage.getItem('sh_token') || '';
    const userData = JSON.parse(localStorage.getItem('sh_user') || '{}');
    if ((userData.points || 0) < 5) { setError('Need at least 5 points'); return; }
    setIsLoading(true);
    const ref = genRef();
    try {
      const res = await fetch('/api/opay/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: parseFloat(airtimeAmount), recipient: phoneNumber, bank: 'Airtime', senderName, reference: ref }),
      });
      const data = await res.json();
      if (data.success) {
        const now = new Date();
        const tx: OPayTx = {
          id: `TX-${Date.now()}`, recipient: phoneNumber, bank: 'OPay - Airtime', amount: parseFloat(airtimeAmount),
          date: formatDateTime(now), reference: ref, status: 'success', senderName, type: 'Airtime', fee: 5,
        };
        addTx(tx); setLastTx(tx);
        setBalance(data.newBalance);
        localStorage.setItem('sh_user', JSON.stringify({ ...userData, points: data.newBalance }));
        setScreen('success');
      } else setError(data.error || 'Airtime purchase failed');
    } catch { setError('Network error.'); }
    finally { setIsLoading(false); }
  };

  const lastFive = transactions.slice(0, 5);

  const deductPoints = async (pts: number, description: string) => {
    const token = localStorage.getItem('sh_token') || '';
    try {
      const res = await fetch('/api/opay/withdraw-deduction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: pts }),
      });
      const data = await res.json();
      if (data.success) {
        const userData = JSON.parse(localStorage.getItem('sh_user') || '{}');
        userData.points = data.newBalance;
        localStorage.setItem('sh_user', JSON.stringify(userData));
        setBalance(data.newBalance);
        return true;
      }
      // Handle minimum deduction error
      if (data.error && data.error.includes('Min')) {
        // Do local deduction for costs below server minimum
        const userData = JSON.parse(localStorage.getItem('sh_user') || '{}');
        if ((userData.points || 0) >= pts) {
          userData.points -= pts;
          localStorage.setItem('sh_user', JSON.stringify(userData));
          setBalance(prev => prev - pts);
          return true;
        }
      }
      return false;
    } catch { return false; }
  };

  const openHistory = async () => {
    const token = localStorage.getItem('sh_token') || '';
    const userData = JSON.parse(localStorage.getItem('sh_user') || '{}');
    if ((userData.points || 0) < 10) { setError('Not enough points to view history (10 pts required)'); return; }
    const ok = await deductPoints(10, 'Viewed transaction history');
    if (ok) {
      setError('');
      setScreen('history');
    } else {
      setError('Failed to deduct points for history view');
    }
  };

  const iconFor = (icon: string, size = 22) => {
    switch (icon) {
      case 'send': return <ArrowUp size={size} />;
      case 'airtime': return <Phone size={size} />;
      case 'data': return <Wifi size={size} />;
      case 'tv': return <Monitor size={size} />;
      case 'zap': return <Zap size={size} />;
      case 'dice': return <span style={{fontSize: size}}>🎲</span>;
      case 'bills': return <Clock size={size} />;
      default: return <span style={{fontSize: size}}>⋯</span>;
    }
  };

  const actionStyle = (label: string) => {
    switch (label) {
      case 'Send': return { bg: '#00b894', fg: '#fff' };
      case 'Airtime': case 'Data': return { bg: '#dbeafe', fg: '#2563eb' };
      case 'Cable TV': return { bg: '#f3e8ff', fg: '#7c3aed' };
      case 'Electricity': return { bg: '#fff7ed', fg: '#ea580c' };
      case 'Betting': return { bg: '#fef2f2', fg: '#dc2626' };
      case 'Bills': return { bg: '#e8f5e9', fg: '#00b894' };
      default: return { bg: '#f1f5f9', fg: '#64748b' };
    }
  };

  return (
    <div className={`opay-root ${(theme === 'dark' || darkMode) ? 'dark' : ''}`}>
      <style>{`
        .opay-root {
          --green: #00b894; --green-dark: #009a7a; --bg: #f0fdf4;
          background: var(--bg); min-height: 100vh; min-height: 100dvh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 480px; margin: 0 auto; position: relative;
          color: #0f172a; overflow-y: auto; overflow-x: hidden;
        }

        /* Status Bar */
        .op-status { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px 6px; font-size: 12px; font-weight: 600; color: #1e293b; background: #fff; }
        .op-status-right { display: flex; align-items: center; gap: 4px; font-size: 11px; }
        .op-status-right svg { opacity: 0.6; }

        /* Header */
        .op-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 20px 12px; background: #fff; }
        .op-logo { display: flex; align-items: center; gap: 6px; }
        .op-logo-circle { width: 30px; height: 30px; border-radius: 50%; background: var(--green); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 15px; font-weight: 800; }
        .op-logo-text { font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px; }
        .op-actions { display: flex; gap: 16px; }
        .op-actions button { background: none; border: none; padding: 2px; cursor: pointer; font-size: 20px; line-height: 1; color: #475569; }

        /* Balance Card */
        .op-balance { background: linear-gradient(135deg, #00b894 0%, #009a7a 100%); margin: 0 16px; border-radius: 20px; padding: 24px; color: #fff; box-shadow: 0 8px 32px rgba(0,184,148,0.3); }
        .op-bal-label { font-size: 13px; font-weight: 500; opacity: 0.8; margin-bottom: 4px; }
        .op-bal-row { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
        .op-bal-row h1 { font-size: 30px; font-weight: 900; margin: 0; letter-spacing: -0.5px; }
        .op-bal-row button { background: none; border: none; color: #fff; cursor: pointer; opacity: 0.7; padding: 2px; }
        .op-bal-btns { display: flex; gap: 10px; }
        .op-bal-fund, .op-bal-wd { flex: 1; padding: 12px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit; }
        .op-bal-fund { background: #fff; color: var(--green); border: none; }
        .op-bal-wd { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.3); }

        /* Quick Actions */
        .op-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin: 12px 16px; background: #fff; border-radius: 20px; padding: 16px 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
        .op-gitem { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 10px 4px; border-radius: 14px; cursor: pointer; border: none; background: none; font-family: inherit; transition: background 0.1s; }
        .op-gitem:hover { background: #f0fdf4; }
        .op-gicon { width: 48px; height: 48px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
        .op-gitem span { font-size: 11px; font-weight: 600; color: #334155; }

        /* Recent */
        .op-recent { margin: 4px 16px 0; padding-bottom: 4px; }
        .op-recent-h { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .op-recent-h h3 { font-size: 15px; font-weight: 700; color: #0f172a; }
        .op-recent-h button { background: none; border: none; color: var(--green); font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .op-empty { padding: 24px 0; text-align: center; color: #94a3b8; font-size: 14px; }
        .op-profile { padding: 24px 16px; text-align: center; }
        .op-avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--green); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; margin: 0 auto 12px; }
        .op-profile-name { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .op-profile-email { font-size: 13px; color: #94a3b8; margin-bottom: 20px; }
        .op-profile-field { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .op-profile-field span:last-child { font-weight: 600; color: #0f172a; }
        .op-ritem { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .op-ritem:last-child { border-bottom: none; }
        .op-ricon { width: 40px; height: 40px; border-radius: 50%; background: #e8f5e9; display: flex; align-items: center; justify-content: center; color: var(--green); font-size: 16px; font-weight: 700; flex-shrink: 0; }
        .op-rinfo { flex: 1; }
        .op-rname { font-size: 14px; font-weight: 600; color: #0f172a; }
        .op-rmeta { font-size: 11px; color: #94a3b8; margin-top: 2px; }
        .op-ramount { font-size: 15px; font-weight: 700; color: #0f172a; }

        /* Bottom Nav */
        .op-nav { position: sticky; bottom: 0; background: #fff; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-around; padding: 6px 0 16px; margin-top: 6px; }
        .op-nitem { display: flex; flex-direction: column; align-items: center; gap: 2px; background: none; border: none; cursor: pointer; font-family: inherit; padding: 0; min-width: 56px; }
        .op-nitem span { font-size: 10px; color: #94a3b8; font-weight: 500; }
        .op-nitem .ni-icon { font-size: 20px; line-height: 1; color: #94a3b8; }
        .op-nitem.active span { color: var(--green); }
        .op-nitem.active .ni-icon { color: var(--green); }
        .op-nitem.transfer { position: relative; margin-top: -12px; }
        .op-nitem.transfer .ni-icon { width: 44px; height: 44px; background: var(--green); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; box-shadow: 0 4px 16px rgba(0,184,148,0.35); }

        /* Form Screen */
        .op-form { background: #fff; min-height: 100vh; padding: 20px; }
        .op-back { background: none; border: none; cursor: pointer; color: #475569; padding: 2px 0; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; font-size: 15px; font-family: inherit; font-weight: 500; }
        .op-form h2 { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 20px; }
        .op-fg { margin-bottom: 16px; }
        .op-fg label { display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px; }
        .op-fg input, .op-fg select { width: 100%; padding: 14px 16px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 15px; font-family: inherit; outline: none; box-sizing: border-box; background: #f8fafc; transition: border-color 0.15s; }
        .op-fg input:focus, .op-fg select:focus { border-color: var(--green); background: #fff; }
        .op-fg input::placeholder { color: #cbd5e1; }
        .op-sel { margin-top: 6px; }
        .op-hint { font-size: 11px; color: #94a3b8; margin-top: 6px; }
        .op-acct-name { font-size: 13px; color: var(--green); font-weight: 600; margin-top: 4px; padding: 6px 12px; background: #e8f5e9; border-radius: 8px; display: inline-block; }
        .op-submit { width: 100%; padding: 16px; background: var(--green); border: none; border-radius: 14px; color: #fff; font-weight: 700; font-size: 16px; cursor: pointer; font-family: inherit; margin-top: 4px; transition: background 0.15s; }
        .op-submit:hover { background: var(--green-dark); }
        .op-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .op-err { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 500; margin-bottom: 16px; }

        /* Quick amounts */
        .op-qamt { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
        .op-qb { padding: 10px 24px; border-radius: 24px; border: 1px solid #e2e8f0; background: #fff; color: #475569; cursor: pointer; font-weight: 600; font-size: 14px; font-family: inherit; transition: all 0.15s; }
        .op-qb:hover { border-color: var(--green); }
        .op-qb.sel { background: var(--green); color: #fff; border-color: var(--green); }

        /* Data networks */
        .op-dnets { display: flex; flex-direction: column; gap: 10px; }
        .op-dn { display: flex; align-items: center; gap: 14px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 14px; cursor: pointer; background: #fff; transition: all 0.15s; }
        .op-dn:hover { border-color: var(--green); }
        .op-dn.sel { border-color: var(--green); background: #e8f5e9; }
        .op-dn span:nth-child(2) { font-weight: 600; font-size: 15px; color: #0f172a; flex: 1; }
        .op-arrow { color: #94a3b8; font-size: 14px; }

        /* Success */
        .op-success { display: flex; flex-direction: column; align-items: center; padding: 32px 20px; background: #f8fafc; min-height: 100vh; text-align: center; }
        .op-scheck { width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, var(--green), var(--green-dark)); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 8px 32px rgba(0,184,148,0.35); }
        .op-scheck svg { color: #fff; }
        .op-success h2 { font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 4px; }
        .op-ssub { color: #64748b; font-size: 15px; margin-bottom: 24px; }

        .op-receipt { width: 100%; max-width: 380px; background: #fff; border-radius: 20px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); text-align: left; }
        .op-rec-hdr { text-align: center; font-size: 11px; font-weight: 800; color: var(--green); letter-spacing: 2px; margin-bottom: 20px; text-transform: uppercase; }
        .op-rec-row { display: flex; justify-content: space-between; padding: 10px 0; align-items: center; }
        .op-rl { font-size: 13px; color: #94a3b8; font-weight: 500; }
        .op-rv { font-size: 14px; color: #0f172a; font-weight: 600; text-align: right; max-width: 60%; word-break: break-all; }
        .op-rv.green { color: var(--green); font-size: 18px; font-weight: 800; }
        .op-rv.ref { font-size: 11px; font-weight: 500; color: #64748b; font-family: 'Courier New', monospace; letter-spacing: 0.3px; }
        .op-rv.bold { font-weight: 700; font-size: 14px; }
        .op-rec-div { height: 1px; background: #e2e8f0; margin: 6px 0; }
        .op-rec-ftr { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 16px; padding-top: 12px; border-top: 1px dashed #e2e8f0; }

        .op-done-row { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 380px; }
        .op-done { width: 100%; padding: 16px; background: var(--green); border: none; border-radius: 14px; color: #fff; font-weight: 700; font-size: 16px; cursor: pointer; font-family: inherit; }
        .op-done:hover { background: var(--green-dark); }
        .op-copy { width: 100%; padding: 14px; background: none; border: 1px solid #e2e8f0; border-radius: 14px; color: var(--green); font-weight: 600; font-size: 14px; cursor: pointer; font-family: inherit; }
        .op-copy:hover { background: #f1f5f9; }

        /* History */
        .op-his-empty { text-align: center; color: #94a3b8; padding: 48px 0; font-size: 14px; }
        .op-hitem { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid #f1f5f9; }
        .op-hicon { width: 40px; height: 40px; border-radius: 50%; background: #e8f5e9; display: flex; align-items: center; justify-content: center; color: var(--green); font-size: 16px; font-weight: 700; flex-shrink: 0; }
        .op-hinfo { flex: 1; }
        .op-hname { font-size: 14px; font-weight: 600; color: #0f172a; }
        .op-hmeta { font-size: 11px; color: #94a3b8; margin-top: 2px; }
        .op-hright { text-align: right; }
        .op-hamt { font-size: 15px; font-weight: 700; color: #0f172a; }
        .op-hstatus { font-size: 10px; color: var(--green); font-weight: 700; margin-top: 2px; }

        /* Dark Mode */
        .opay-root.dark {
          --bg: #0a0a0f; --surface: #12121a; --card: #1a1a2e;
          --text: #e2e8f0; --text2: #94a3b8; --border: rgba(255,255,255,0.06);
          background: var(--bg);
        }
        .opay-root.dark .op-status { background: var(--surface); color: var(--text); }
        .opay-root.dark .op-header { background: var(--surface); }
        .opay-root.dark .op-logo-text { color: var(--text); }
        .opay-root.dark .op-actions button { color: var(--text2); }
        .opay-root.dark .op-grid { background: var(--card); }
        .opay-root.dark .op-gitem span { color: var(--text); }
        .opay-root.dark .op-gitem:hover { background: rgba(255,255,255,0.04); }
        .opay-root.dark .op-recent-h h3 { color: var(--text); }
        .opay-root.dark .op-ritem { border-color: var(--border); }
        .opay-root.dark .op-rname { color: var(--text); }
        .opay-root.dark .op-ramount { color: var(--text); }
        .opay-root.dark .op-nav { background: var(--surface); border-color: var(--border); }
        .opay-root.dark .op-nitem span { color: var(--text2); }
        .opay-root.dark .op-nitem .ni-icon { color: var(--text2); }
        .opay-root.dark .op-form { background: var(--surface); }
        .opay-root.dark .op-form h2 { color: var(--text); }
        .opay-root.dark .op-back { color: var(--text2); }
        .opay-root.dark .op-fg label { color: var(--text2); }
        .opay-root.dark .op-fg input, .opay-root.dark .op-fg select { background: var(--card); border-color: var(--border); color: var(--text); }
        .opay-root.dark .op-fg input:focus, .opay-root.dark .op-fg select:focus { border-color: var(--green); background: var(--card); }
        .opay-root.dark .op-success { background: var(--bg); }
        .opay-root.dark .op-success h2 { color: var(--text); }
        .opay-root.dark .op-ssub { color: var(--text2); }
        .opay-root.dark .op-receipt { background: var(--card); }
        .opay-root.dark .op-rv { color: var(--text); }
        .opay-root.dark .op-rv.ref { color: var(--text2); }
        .opay-root.dark .op-rl { color: var(--text2); }
        .opay-root.dark .op-rec-div { background: var(--border); }
        .opay-root.dark .op-rec-ftr { color: var(--text2); border-color: var(--border); }
        .opay-root.dark .op-copy { border-color: var(--border); color: var(--text); }
        .opay-root.dark .op-copy:hover { background: rgba(255,255,255,0.04); }
        .opay-root.dark .op-his-empty { color: var(--text2); }
        .opay-root.dark .op-hitem { border-color: var(--border); }
        .opay-root.dark .op-hname { color: var(--text); }
        .opay-root.dark .op-hmeta { color: var(--text2); }
        .opay-root.dark .op-hamt { color: var(--text); }
        .opay-root.dark .op-qb { background: var(--card); border-color: var(--border); color: var(--text); }
        .opay-root.dark .op-qb:hover { border-color: var(--green); }
        .opay-root.dark .op-dn { background: var(--card); border-color: var(--border); }
        .opay-root.dark .op-dn span:nth-child(2) { color: var(--text); }
        .opay-root.dark .op-err { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.2); }
      `}</style>

      {/* HOME */}
      {screen === 'home' && (
        <>
          <div className="op-status"><span>{statusTime}</span><div className="op-status-right"><Search size={11} /> 📶 🔋</div></div>
          <div className="op-header">
            <div className="op-logo"><div className="op-logo-circle">O</div><span className="op-logo-text">Pay</span></div>
            <div className="op-actions">
              <button onClick={toggleDark} title={darkMode ? 'Light Mode' : 'Dark Mode'}>{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
              <button>🔔</button>
              <button>❓</button>
            </div>
          </div>

          <div className="op-balance">
            <div className="op-bal-label">Total Balance</div>
            <div className="op-bal-row">
              <h1>{showBalance ? `₦${(balance * 100).toLocaleString()}.00` : '****'}</h1>
              <button onClick={() => setShowBalance(!showBalance)}>{showBalance ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>
            <div className="op-bal-btns">
              <button className="op-bal-fund" onClick={() => setFundModalOpen(true)}>Fund Wallet</button>
              <button className="op-bal-wd">Withdraw</button>
            </div>
          </div>

          {hasPin === false && (
            <div className="op-pin-banner" onClick={() => { setPinScreen('create'); setPinAction(() => { setPinScreen('none'); }); }} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:12,marginBottom:16,cursor:'pointer',fontSize:13,fontWeight:600,color:'#f59e0b'}}>
              <span style={{fontSize:20}}>🔒</span>
              <div><div>Set Transaction PIN</div><div style={{fontSize:11,fontWeight:400,color:'rgba(245,158,11,0.7)',marginTop:2}}>Required for transfers & airtime</div></div>
            </div>
          )}

          <div className="op-grid">
            {QUICK_ACTIONS.map((a, i) => {
              const s = actionStyle(a.label);
              return (
                <button key={i} className="op-gitem" onClick={() => {
                  if (a.label === 'Send') setScreen('send');
                  else if (a.label === 'Airtime') setScreen('airtime');
                  else if (a.label === 'Data') setScreen('data');
                  else if (a.label === 'Data') setScreen('data');
                  else if (a.label === 'Cable TV') setScreen('bills');
                  else if (a.label === 'Electricity') setScreen('bills');
                  else if (a.label === 'Betting') setScreen('bills');
                  else if (a.label === 'Bills') setScreen('bills');
                  else if (a.label === 'More') setScreen('bills');
                }}>
                  <div className="op-gicon" style={{background: s.bg, color: s.fg}}>{iconFor(a.icon)}</div>
                  <span>{a.label}</span>
                </button>
              );
            })}
          </div>

          <div className="op-recent">
            <div className="op-recent-h">
              <h3>Recent Transactions</h3>
              <button onClick={openHistory}>See All</button>
            </div>
            {lastFive.length === 0 ? (
              <div className="op-empty">No transactions yet. Send money to get started!</div>
            ) : (
              lastFive.map((tx, i) => (
                <div key={tx.id || i} className="op-ritem">
                  <div className="op-ricon">{tx.type === 'Airtime' ? '📱' : '↑'}</div>
                  <div className="op-rinfo">
                    <div className="op-rname">{tx.type === 'Airtime' ? `Airtime - ${tx.recipient}` : tx.recipient}</div>
                    <div className="op-rmeta">{tx.bank} · {tx.date}</div>
                  </div>
                  <div className="op-ramount">-₦{tx.amount.toLocaleString()}</div>
                </div>
              ))
            )}
          </div>

          <nav className="op-nav">
            {[{icon:'🏠',label:'Home',key:'home'},{icon:'💳',label:'Pay',key:'pay'},{icon:'📤',label:'Transfer',key:'send',transfer:true},{icon:'📋',label:'History',key:'history'},{icon:'👤',label:'Profile',key:'profile'}].map((item,i) => (
              <button key={i} className={`op-nitem ${item.key === 'home' ? 'active' : ''} ${item.transfer ? 'transfer' : ''}`} onClick={() => { if (item.key === 'history') openHistory(); else if (item.key === 'send') setScreen('send'); else if (item.key === 'home') setScreen('home'); else if (item.key === 'pay') setScreen('bills'); else if (item.key === 'profile') setScreen('profile'); }}>
                {item.transfer ? (
                  <div className="ni-icon">📤</div>
                ) : (
                  <span className="ni-icon">{item.icon}</span>
                )}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </>
      )}

      {/* SEND */}
      {screen === 'send' && (
        <div className="op-form">
          <button className="op-back" onClick={() => setScreen('home')}><ArrowLeft size={20} /> Back</button>
          <h2>Transfer</h2>
          {error && <div className="op-err">{error}</div>}
          <div className="op-fg"><label>Sender Name</label><input value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Your name" /></div>
          <div className="op-fg"><label>Recipient Name</label><input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Full name" /></div>
          <div className="op-fg">
            <label>Account Number</label>
            <input value={accountNumber} onChange={e => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="0123456789" maxLength={10} />
            {lookupLoading && <div className="op-hint">Looking up account...</div>}
            {accountName && <div className="op-acct-name">{accountName}</div>}
          </div>
          <div className="op-fg">
            <label>Bank</label>
            <input placeholder="Search bank..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <select className="op-sel" value={selectedBank} onChange={e => setSelectedBank(e.target.value)}>
              <option value="">Select bank</option>
              {filteredBanks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>
          </div>
          <div className="op-fg">
            <label>Amount (₦)</label>
            <input ref={amountRef} type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
            <div className="op-hint">Points used: {cost}</div>
          </div>
          <div className="op-fg"><label>Note (optional)</label><input value={note} onChange={e => setNote(e.target.value)} placeholder="What's this for?" /></div>
          <button className="op-submit" onClick={handleSend} disabled={isLoading}>{isLoading ? 'Processing...' : `Send ₦${parseFloat(amount || '0').toLocaleString()}`}</button>
        </div>
      )}

      {/* AIRTIME */}
      {screen === 'airtime' && (
        <div className="op-form">
          <button className="op-back" onClick={() => setScreen('home')}><ArrowLeft size={20} /> Back</button>
          <h2>Buy Airtime</h2>
          {error && <div className="op-err">{error}</div>}
          <div className="op-fg"><label>Phone Number</label><input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="08012345678" maxLength={11} /></div>
          <div className="op-fg"><label>Amount (₦)</label><input type="number" value={airtimeAmount} onChange={e => setAirtimeAmount(e.target.value)} placeholder="100" /></div>
          <div className="op-qamt">{['100','200','500','1000'].map(v => (
            <button key={v} className={`op-qb ${airtimeAmount === v ? 'sel' : ''}`} onClick={() => setAirtimeAmount(v)}>₦{v}</button>
          ))}</div>
          <button className="op-submit" onClick={handleAirtime} disabled={isLoading}>{isLoading ? 'Processing...' : `Buy ₦${parseFloat(airtimeAmount || '0').toLocaleString()} Airtime`}</button>
        </div>
      )}

      {/* DATA */}
      {screen === 'data' && (
        <div className="op-form">
          <button className="op-back" onClick={() => setScreen('home')}><ArrowLeft size={20} /> Back</button>
          <h2>Buy Data</h2>
          {error && <div className="op-err">{error}</div>}
          <div className="op-dnets">
            {['MTN','Glo','Airtel','9mobile'].map(n => (
              <div key={n} className={`op-dn ${dataNetwork === n ? 'sel' : ''}`} onClick={() => setDataNetwork(n)}>
                <span>📶</span><span>{n}</span><span className="op-arrow">→</span>
              </div>
            ))}
          </div>
          <button className="op-submit" style={{marginTop:'16px'}} onClick={() => {
            if (!dataNetwork) { setError('Select a network'); return; }
            const dataAmounts = { 'MTN': 50, 'Glo': 50, 'Airtel': 50, '9mobile': 50 };
            const cost = dataAmounts[dataNetwork as keyof typeof dataAmounts] || 50;
            const token = localStorage.getItem('sh_token') || '';
            const userData = JSON.parse(localStorage.getItem('sh_user') || '{}');
            if ((userData.points || 0) < cost) { setError(`Insufficient points — need ${cost}, have ${userData.points}`); return; }
            setIsLoading(true);
            const ref = genRef();
            fetch('/api/opay/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ amount: cost, recipient: dataNetwork, bank: 'Data', senderName, reference: ref }),
            }).then(res => res.json()).then(data => {
              if (data.success) {
                const now = new Date();
                const tx: OPayTx = {
                  id: `TX-${Date.now()}`, recipient: dataNetwork, bank: 'OPay - Data', amount: cost,
                  date: formatDateTime(now), reference: ref, status: 'success', senderName, type: 'Data', fee: cost,
                };
                addTx(tx); setLastTx(tx);
                setBalance(data.newBalance);
                localStorage.setItem('sh_user', JSON.stringify({ ...userData, points: data.newBalance }));
                setScreen('success');
              } else setError(data.error || 'Data purchase failed');
              setIsLoading(false);
            }).catch(() => { setError('Network error'); setIsLoading(false); });
          }} disabled={isLoading || !dataNetwork}>{isLoading ? 'Processing...' : `Buy Data (${dataNetwork || 'Select network'})`}</button>
</div>
       )}

       {/* BILLS */}
       {screen === 'bills' && (
         <div className="op-form">
           <button className="op-back" onClick={() => setScreen('home')}><ArrowLeft size={20} /> Back</button>
           <h2>Pay Bills</h2>
           {error && <div className="op-err">{error}</div>}
           <div className="op-fg">
             <label>Category</label>
             <select className="op-sel" value={billsCategory} onChange={e => setBillsCategory(e.target.value)}>
               <option value="">Select category</option>
               <option value="Cable TV">Cable TV (GOtv/DStv)</option>
               <option value="Electricity">Electricity (PHCN/IKEDC)</option>
               <option value="Betting">Betting (Bet9ja)</option>
               <option value="Water">Water Bill</option>
               <option value="Gas">Gas Bill</option>
             </select>
           </div>
           {billsCategory && (
             <>
               <div className="op-fg">
                 <label>Account/Service Number</label>
                 <input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Enter account number" />
               </div>
               <div className="op-fg">
                 <label>Amount (₦)</label>
                 <input type="number" value={billsAmount} onChange={e => setBillsAmount(e.target.value)} placeholder="0.00" />
               </div>
               <button className="op-submit" onClick={() => {
                 if (!accountName || !billsAmount) { setError('Fill all fields'); return; }
                 const cost = Math.ceil(parseFloat(billsAmount) * 0.01);
                 const token = localStorage.getItem('sh_token') || '';
                 const userData = JSON.parse(localStorage.getItem('sh_user') || '{}');
                 if ((userData.points || 0) < cost) { setError(`Insufficient points — need ${cost}, have ${userData.points}`); return; }
                 setIsLoading(true);
                 const ref = genRef();
                 fetch('/api/opay/generate', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                   body: JSON.stringify({ amount: parseFloat(billsAmount), recipient: accountName, bank: billsCategory, senderName, reference: ref }),
                 }).then(res => res.json()).then(data => {
                   if (data.success) {
                     const now = new Date();
                     const tx: OPayTx = {
                       id: `TX-${Date.now()}`, recipient: accountName, bank: `OPay - ${billsCategory}`, amount: parseFloat(billsAmount),
                       date: formatDateTime(now), reference: ref, status: 'success', senderName, type: 'Bills', fee: cost,
                     };
                     addTx(tx); setLastTx(tx);
                     setBalance(data.newBalance);
                     localStorage.setItem('sh_user', JSON.stringify({ ...userData, points: data.newBalance }));
                     setScreen('success');
                   } else setError(data.error || 'Bill payment failed');
                   setIsLoading(false);
                 }).catch(() => { setError('Network error'); setIsLoading(false); });
               }} disabled={isLoading}>{isLoading ? 'Processing...' : `Pay ₦${parseFloat(billsAmount || '0').toLocaleString()}`}</button>
             </>
           )}
         </div>
       )}

       {/* PROFILE */}
       {screen === 'profile' && (
         <div className="op-form">
           <button className="op-back" onClick={() => setScreen('home')}><ArrowLeft size={20} /> Back</button>
           <h2>Profile</h2>
           <div className="op-profile">
             <div className="op-avatar">{user?.kyc_data?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}</div>
             <div className="op-profile-name">{user?.kyc_data?.name || user?.email || 'User'}</div>
             <div className="op-profile-email">{user?.email || ''}</div>
             <div className="op-profile-field"><span>Phone</span><span>{user?.phone || 'Not set'}</span></div>
             <div className="op-profile-field"><span>Points Balance</span><span>{balance} pts (₦{(balance * 100).toLocaleString()})</span></div>
             <div className="op-profile-field"><span>OPay PIN</span><span>{hasPin ? 'Set ✓' : 'Not set'}</span></div>
           </div>
         </div>
       )}

       {/* PIN CREATE */}
      {pinScreen === 'create' && (
        <div className="op-form">
          <h2>Set Transaction PIN</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Create a 4-digit PIN to secure your transactions</p>
          {pinError && <div className="op-err">{pinError}</div>}
          <div className="op-fg">
            <label>New PIN</label>
            <input type="password" value={pinInput} onChange={e => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="• • • •" maxLength={4} style={{ fontSize: 24, letterSpacing: 8, textAlign: 'center' }} autoFocus />
          </div>
          <button className="op-submit" disabled={pinInput.length !== 4} onClick={async () => {
            setPinError('');
            const token = localStorage.getItem('sh_token');
            try {
              const res = await fetch('/api/opay/set-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ pin: pinInput })
              });
              const d = await res.json();
              if (d.success) {
                setHasPin(true);
                setPinInput('');
                const userData = JSON.parse(localStorage.getItem('sh_user') || '{}');
                userData.opay_pin = pinInput;
                localStorage.setItem('sh_user', JSON.stringify(userData));
                const nextAction = pinAction;
                if (nextAction) nextAction();
              } else setPinError(d.error);
            } catch { setPinError('Error setting PIN'); }
          }}>Set PIN</button>
        </div>
      )}

      {/* PIN VERIFY */}
      {pinScreen === 'verify' && (
        <div className="op-form">
          <button className="op-back" onClick={() => { setPinScreen('none'); setPinInput(''); setPinError(''); }}><ArrowLeft size={20} /> Cancel</button>
          <h2>Enter PIN</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Enter your 4-digit transaction PIN to continue</p>
          {pinError && <div className="op-err">{pinError}</div>}
          <div className="op-fg">
            <label>Transaction PIN</label>
            <input type="password" value={pinInput} onChange={e => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="• • • •" maxLength={4} style={{ fontSize: 24, letterSpacing: 8, textAlign: 'center' }} autoFocus />
          </div>
          <button className="op-submit" disabled={pinInput.length !== 4} onClick={async () => {
            setPinError('');
            const token = localStorage.getItem('sh_token');
            try {
              const res = await fetch('/api/opay/verify-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ pin: pinInput })
              });
              const d = await res.json();
              if (d.success) {
                setPinInput('');
                setPinError('');
                const currentAction = pinAction;
                setPinScreen('none');
                if (currentAction) currentAction();
              } else setPinError(d.error);
            } catch { setPinError('Error verifying PIN'); }
          }}>Verify PIN</button>
        </div>
      )}

      {/* SUCCESS */}
      {screen === 'success' && lastTx && (
        <div className="op-success">
          <div className="op-scheck"><Check size={48} /></div>
          <h2>Transfer Successful</h2>
          <p className="op-ssub">Your transaction has been completed</p>

          <div className="op-receipt">
            <div className="op-rec-hdr">Transaction Receipt</div>
            <div className="op-rec-row"><span className="op-rl">Amount</span><span className="op-rv green">₦{lastTx.amount.toLocaleString()}.00</span></div>
            <div className="op-rec-div" />
            <div className="op-rec-row"><span className="op-rl">Recipient</span><span className="op-rv">{lastTx.recipient}</span></div>
            {lastTx.accountNumber && <div className="op-rec-row"><span className="op-rl">Account</span><span className="op-rv">{lastTx.accountNumber}</span></div>}
            <div className="op-rec-row"><span className="op-rl">Bank</span><span className="op-rv">{lastTx.bank}</span></div>
            <div className="op-rec-row"><span className="op-rl">Sender</span><span className="op-rv">{lastTx.senderName}</span></div>
            <div className="op-rec-div" />
            <div className="op-rec-row"><span className="op-rl">Reference</span><span className="op-rv ref">{lastTx.reference}</span></div>
            <div className="op-rec-row"><span className="op-rl">Date &amp; Time</span><span className="op-rv bold">{lastTx.date}</span></div>
            <div className="op-rec-row"><span className="op-rl">Status</span><span className="op-rv green">Successful</span></div>
            <div className="op-rec-row"><span className="op-rl">Fee</span><span className="op-rv">{lastTx.fee} pts</span></div>
            {lastTx.note && <div className="op-rec-row"><span className="op-rl">Note</span><span className="op-rv">{lastTx.note}</span></div>}
            <div className="op-rec-ftr">Powered by OPay</div>
          </div>

          <div className="op-done-row">
            <button className="op-done" onClick={() => setScreen('home')}>Back to Home</button>
            <button className="op-copy" onClick={() => openHistory()}>View in History (10 pts)</button>
            <button className="op-copy" onClick={() => { navigator.clipboard.writeText(lastTx.reference); alert('Reference copied!'); }}>
              <Copy size={14} style={{display:'inline',verticalAlign:'middle',marginRight:'4px'}} /> Copy Reference
            </button>
            <button className="op-copy" onClick={() => {
              const c = document.createElement('canvas'); c.width = 400; c.height = 600;
              const ctx = c.getContext('2d')!;
              ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 400, 600);
              ctx.fillStyle = '#00b894'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
              ctx.fillText('TRANSACTION RECEIPT', 200, 40);
              ctx.fillStyle = '#0f172a'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
              const rows = [
                ['Amount', `₦${lastTx.amount.toLocaleString()}.00`],
                ['Recipient', lastTx.recipient],
                ...(lastTx.accountNumber ? [['Account', lastTx.accountNumber]] : []),
                ['Bank', lastTx.bank],
                ['Sender', lastTx.senderName],
                ['Reference', lastTx.reference],
                ['Date & Time', lastTx.date],
                ['Status', 'Successful'],
                ['Fee', `${lastTx.fee} pts`],
                ...(lastTx.note ? [['Note', lastTx.note]] : []),
              ];
              rows.forEach(([l, v], i) => {
                const y = 80 + i * 32;
                ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
                ctx.fillText(l, 30, y);
                ctx.fillStyle = '#0f172a'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'right';
                ctx.fillText(v, 370, y); ctx.textAlign = 'left';
                if (i < rows.length - 1) { ctx.strokeStyle = '#e2e8f0'; ctx.beginPath(); ctx.moveTo(30, y + 18); ctx.lineTo(370, y + 18); ctx.stroke(); }
              });
              ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
              ctx.fillText('Powered by OPay', 200, 560);
              const a = document.createElement('a'); a.download = `receipt-${lastTx.reference}.png`; a.href = c.toDataURL(); a.click();
            }}><Download size={14} style={{display:'inline',verticalAlign:'middle',marginRight:'4px'}} /> Download Receipt</button>
          </div>
        </div>
      )}

      {/* HISTORY */}
      {screen === 'history' && !viewingTx && (
        <div className="op-form">
          <button className="op-back" onClick={() => setScreen('home')}><ArrowLeft size={20} /> Back</button>
          <h2>Transaction History</h2>
          {transactions.length === 0 ? (
            <div className="op-his-empty">No transactions yet.</div>
          ) : (
            transactions.map((tx, i) => (
              <div key={tx.id || i} className="op-hitem" onClick={() => setViewingTx(tx)} style={{cursor: 'pointer'}}>
                <div className="op-hicon">{tx.type === 'Airtime' ? '📱' : '↑'}</div>
                <div className="op-hinfo">
                  <div className="op-hname">{tx.type === 'Airtime' ? `Airtime - ${tx.recipient}` : tx.recipient}</div>
                  <div className="op-hmeta">{tx.bank} · {tx.date}</div>
                </div>
                <div className="op-hright">
                  <div className="op-hamt">-₦{tx.amount.toLocaleString()}</div>
                  <div className="op-hstatus">{tx.status.toUpperCase()}</div>
                </div>
              </div>
            ))
          )}
          <nav className="op-nav" style={{marginTop:'20px'}}>
            {[{icon:'🏠',label:'Home',key:'home'},{icon:'💳',label:'Pay',key:'pay'},{icon:'📤',label:'Transfer',key:'send',transfer:true},{icon:'📋',label:'History',key:'history'},{icon:'👤',label:'Profile',key:'profile'}].map((item,i) => (
              <button key={i} className={`op-nitem ${item.key==='history'?'active':''} ${item.transfer?'transfer':''}`} onClick={() => { if(item.key==='home')setScreen('home'); else if(item.key==='send')setScreen('send'); }}>
                {item.transfer ? <div className="ni-icon">📤</div> : <span className="ni-icon">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* HISTORY RECEIPT VIEW */}
      {viewingTx && (
        <div className="op-success">
          <div className="op-scheck"><Check size={48} /></div>
          <h2 style={{fontSize: 20, fontWeight: 800, marginBottom: 4}}>Transaction Receipt</h2>
          <p className="op-ssub">Reference: {viewingTx.reference}</p>
          <div className="op-receipt">
            <div className="op-rec-hdr">Transaction Receipt</div>
            <div className="op-rec-row"><span className="op-rl">Amount</span><span className="op-rv green">₦{viewingTx.amount.toLocaleString()}.00</span></div>
            <div className="op-rec-div" />
            <div className="op-rec-row"><span className="op-rl">Recipient</span><span className="op-rv">{viewingTx.recipient}</span></div>
            {viewingTx.accountNumber && <div className="op-rec-row"><span className="op-rl">Account</span><span className="op-rv">{viewingTx.accountNumber}</span></div>}
            <div className="op-rec-row"><span className="op-rl">Bank</span><span className="op-rv">{viewingTx.bank}</span></div>
            <div className="op-rec-row"><span className="op-rl">Sender</span><span className="op-rv">{viewingTx.senderName}</span></div>
            <div className="op-rec-div" />
            <div className="op-rec-row"><span className="op-rl">Reference</span><span className="op-rv ref">{viewingTx.reference}</span></div>
            <div className="op-rec-row"><span className="op-rl">Date &amp; Time</span><span className="op-rv bold">{viewingTx.date}</span></div>
            <div className="op-rec-row"><span className="op-rl">Status</span><span className="op-rv green">{viewingTx.status.charAt(0).toUpperCase() + viewingTx.status.slice(1)}</span></div>
            {viewingTx.fee !== undefined && <div className="op-rec-row"><span className="op-rl">Fee</span><span className="op-rv">{viewingTx.fee} pts</span></div>}
            {viewingTx.note && <div className="op-rec-row"><span className="op-rl">Note</span><span className="op-rv">{viewingTx.note}</span></div>}
            <div className="op-rec-ftr">Powered by OPay</div>
          </div>
          <div className="op-done-row">
            <button className="op-done" onClick={() => setViewingTx(null)}>Back to History</button>
            <button className="op-copy" onClick={() => { navigator.clipboard.writeText(viewingTx.reference); alert('Reference copied!'); }}><Copy size={14} style={{display:'inline',verticalAlign:'middle',marginRight:'4px'}} /> Copy Reference</button>
            <button className="op-copy" onClick={() => {
              const c = document.createElement('canvas'); c.width = 400; c.height = 600;
              const ctx = c.getContext('2d')!;
              ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 400, 600);
              ctx.fillStyle = '#00b894'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
              ctx.fillText('TRANSACTION RECEIPT', 200, 40);
              ctx.fillStyle = '#0f172a'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
              const rows = [
                ['Amount', `₦${viewingTx.amount.toLocaleString()}.00`],
                ['Recipient', viewingTx.recipient],
                ...(viewingTx.accountNumber ? [['Account', viewingTx.accountNumber]] : []),
                ['Bank', viewingTx.bank],
                ['Sender', viewingTx.senderName],
                ['Reference', viewingTx.reference],
                ['Date & Time', viewingTx.date],
                ['Status', viewingTx.status.charAt(0).toUpperCase() + viewingTx.status.slice(1)],
                ...(viewingTx.fee !== undefined ? [['Fee', `${viewingTx.fee} pts`]] : []),
              ];
              rows.forEach(([l, v], i) => {
                const y = 80 + i * 32;
                ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif'; ctx.fillText(l, 30, y);
                ctx.fillStyle = '#0f172a'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'right';
                ctx.fillText(v, 370, y); ctx.textAlign = 'left';
                if (i < rows.length - 1) { ctx.strokeStyle = '#e2e8f0'; ctx.beginPath(); ctx.moveTo(30, y + 18); ctx.lineTo(370, y + 18); ctx.stroke(); }
              });
              ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
              ctx.fillText('Powered by OPay', 200, 560);
              const a = document.createElement('a'); a.download = `receipt-${viewingTx.reference}.png`; a.href = c.toDataURL(); a.click();
            }}><Download size={14} style={{display:'inline',verticalAlign:'middle',marginRight:'4px'}} /> Download Receipt</button>
          </div>
        </div>
      )}
      {fundModalOpen && (
        <PaystackFundModal
          onClose={() => setFundModalOpen(false)}
          onSuccess={(updatedUser) => {
            setBalance(updatedUser.points || 0);
            setFundModalOpen(false);
          }}
        />
      )}
    </div>
  );
}