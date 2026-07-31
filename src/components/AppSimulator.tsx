import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Eye, EyeOff, Check, X, Bell, HelpCircle, QrCode, Copy, Clock, RotateCcw, Info, Search, Star } from "lucide-react";
import { NIGERIAN_BANKS, searchBanks, getFrequentlyUsedBanks, Bank } from "../data/nigerianBanks";

const formatCurrency = (val: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2 }).format(val);
const formatAccount = (acct: string) => { const a = acct.replace(/\D/g, ''); return a.length >= 10 ? `${a.slice(0,3)} ${a.slice(3,6)} ${a.slice(6,10)}` : a; };
const formatPhone = (phone: string) => { const p = phone.replace(/\D/g, ''); return p.length >= 7 ? `${p.slice(0,3)} ${p.slice(3,6)} ${p.slice(6)}` : p; };
const generateRef = () => { let r = ''; for (let i = 0; i < 12; i++) r += Math.floor(Math.random() * 10); return r; };

interface Transaction {
  id: string;
  recipientName: string;
  recipientAccount: string;
  bankName: string;
  amount: number;
  remark: string;
  date: string;
  status: 'successful' | 'processing' | 'failed';
}

interface AppSimulatorProps {
  senderName: string;
  senderAccount: string;
  userPoints: number;
  onClose: () => void;
  onFinishSimulation: (data: any) => void;
  onBuyPoints: () => void;
  onTransactionComplete: (tx: Transaction) => void;
}

export default function AppSimulator({
  senderName,
  senderAccount,
  userPoints,
  onClose,
  onFinishSimulation,
  onBuyPoints,
  onTransactionComplete,
}: AppSimulatorProps) {
  const opayTeal = '#00C5A3';
  const opayBg = '#F5F5F5';
  const palmpayTeal = '#FF6B6B';
  const palmpayBg = '#FFE8E8';

  // Screen routing
  const [screen, setScreen] = useState<'splash' | 'home' | 'transfer' | 'amount' | 'confirm' | 'loading' | 'done' | 'history' | 'bills' | 'profile'>('splash');
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [balance, setBalance] = useState(userPoints);
  const [hasPin, setHasPin] = useState(false);
  const [showVoucher, setShowVoucher] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Transfer form state
  const [recipientAccount, setRecipientAccount] = useState('');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [showBankSearch, setShowBankSearch] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [nameLookupStatus, setNameLookupStatus] = useState<'idle' | 'loading' | 'found' | 'notfound'>('idle');
  const [transferAmount, setTransferAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [remarkCategory, setRemarkCategory] = useState<'Purchase' | 'Personal' | null>(null);
  const [activeTab, setActiveTab] = useState<'recents' | 'favourites'>('recents');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'incoming' | 'outgoing'>('outgoing');
  const [editableSenderName, setEditableSenderName] = useState(senderName);
  const [billsCat, setBillsCat] = useState('');
  const [billsAcc, setBillsAcc] = useState('');
  const [billsAmt, setBillsAmt] = useState('');

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 20000];
  const freeTransfersLeft = 3;
  const pointsPerNaira = 0.01; // 1 point = ₦100 value
  const neededPoints = parseInt(transferAmount || '0') * pointsPerNaira;

  useEffect(() => {
    if (screen === 'splash') {
      const t = setTimeout(() => setScreen('home'), 2000);
      return () => clearTimeout(t);
    }
  }, [screen]);

  const handleLookupAccount = () => {
    if (!recipientAccount || recipientAccount.length < 10 || !selectedBank) return;
    setNameLookupStatus('loading');
    // Simulate API lookup
    setTimeout(async () => {
      try {
        const res = await fetch('/api/opay/lookup-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountNumber: recipientAccount, bankCode: selectedBank.code }),
        });
        const data = await res.json();
        if (data.success && data.accountName) {
          setRecipientName(data.accountName);
          setNameLookupStatus('found');
        } else {
          setRecipientName('CHUKWUMA EMMANUEL');
          setNameLookupStatus('found');
        }
      } catch {
        setRecipientName('OKONKWO PETER');
        setNameLookupStatus('found');
      }
    }, 800);
  };

  useEffect(() => {
    if (recipientAccount.length >= 10 && selectedBank) {
      handleLookupAccount();
    } else {
      setNameLookupStatus('idle');
      setRecipientName('');
    }
  }, [recipientAccount, selectedBank]);

  const handleConfirmTransfer = () => {
    const amt = parseInt(transferAmount || '0');
    if (amt <= 0 || neededPoints > userPoints) return;
    setScreen('loading');
    setTimeout(() => {
      const tx: Transaction = {
        id: 'TXN' + generateRef(),
        recipientName,
        recipientAccount,
        bankName: selectedBank?.name || 'OPay',
        amount: amt,
        remark: remark || 'Transfer',
        date: new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
        status: 'successful',
      };
      setTransactions(prev => [tx, ...prev]);
      setBalance(prev => prev - neededPoints);
      setScreen('done');
      onTransactionComplete(tx);
    }, 2500);
  };

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setShowBankSearch(false);
    setBankSearchQuery('');
  };

  const filteredBanks = searchBanks(bankSearchQuery);
  const frequentBanks = getFrequentlyUsedBanks();

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // === SPLASH ===
  if (screen === 'splash') {
    return (
      <div style={{ background: opayTeal }} className="h-full flex flex-col items-center justify-between p-10 select-none">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full bg-white" />
            <div className="absolute inset-[5px] rounded-full" style={{ background: opayTeal }} />
            <div className="absolute inset-[10px] rounded-full bg-white flex items-center justify-center">
              <div className="w-7 h-7" style={{ background: opayTeal, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
            </div>
          </div>
          <span style={{ color: '#0A2E2A', fontWeight: 700, fontSize: 20 }}>We are Beyond Banking</span>
        </div>
        <div className="text-center text-[10px]" style={{ color: '#0A2E2A' }}>
          Licensed by the <strong>CBN</strong> and insured by the <strong>NDIC</strong>
        </div>
      </div>
    );
  }

  // === HOME ===
  if (screen === 'home') {
    return (
      <div style={{ background: opayBg, fontFamily: "'Segoe UI', Arial, sans-serif" }} className="h-full flex flex-col overflow-y-auto select-none relative w-full max-w-[420px] mx-auto bg-white shadow-lg border border-gray-200">
      {/* Phone frame for mobile simulation */}
      <div className="relative w-full h-full flex flex-col items-center">
        <div className="absolute top-0 left-0 right-0 h-12 bg-opayTeal text-white flex items-center justify-center text-sm font-bold">
          OPay Mobile App
        </div>
        <div className="absolute top-1 right-2 flex gap-2 text-white text-xs">
          <span>9:41</span>
          <div className="flex gap-1">
            <div className="w-5 h-3 bg-white rounded-sm"></div>
            <div className="w-8 h-3 bg-white rounded-sm opacity-70"></div>
            <div className="w-5 h-3 bg-white rounded-sm"></div>
          </div>
        </div>
      </div>
        <div className="bg-white px-4 py-2.5 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">
              {senderName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-bold text-gray-900">Hi, {senderName}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-gray-500" />
            <QrCode className="w-5 h-5 text-gray-500" />
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4 pb-2">
          <div className="rounded-2xl p-4 text-white shadow-lg relative overflow-hidden" style={{ background: opayTeal }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px] font-semibold text-white/90">Available Balance</span>
                <button onClick={() => setBalanceVisible(!balanceVisible)}><EyeOff className="w-3 h-3 text-white/70" /></button>
              </div>
              <span className="text-[9px] text-white/80 font-medium">Transaction History &gt;</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-black tracking-tight">{balanceVisible ? formatCurrency(balance * 100) : '****'}</span>
                <ChevronRight className="w-4 h-4 text-white/70" />
              </div>
              <button onClick={() => onBuyPoints()} className="bg-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm" style={{ color: opayTeal }}>
                + Fund
              </button>
            </div>
          </div>
          <div className="bg-white rounded-b-xl px-4 py-2 flex items-center gap-1 border-x border-b border-gray-100 shadow-sm">
            <span className="text-[10px]">&#x1F3EA;</span>
            <span className="text-[9px] text-gray-500 font-medium">Business Service - Today's Sales: ₦0.00 &gt;</span>
          </div>
        </div>

        <div className="bg-white mx-4 rounded-xl px-4 py-4 mb-2 shadow-sm">
          <div className="flex justify-around mb-5">
                {[
                  { label: 'To OPay', action: () => { setSelectedBank(NIGERIAN_BANKS.find(b => b.slug === 'opay') || NIGERIAN_BANKS[0]); setScreen('transfer'); }, color: opayTeal, bg: '#E8FAF5' },
                  { label: 'To PalmPay', action: () => { setSelectedBank(NIGERIAN_BANKS.find(b => b.slug === 'palmpay') || NIGERIAN_BANKS.find(b => b.slug === 'opay')); setScreen('transfer'); }, color: palmpayTeal, bg: '#FFEBEE' },
                  { label: 'To Bank', action: () => { setSelectedBank(NIGERIAN_BANKS.find(b => b.slug === 'guaranty-trust-bank') || NIGERIAN_BANKS[0]); setScreen('transfer'); }, color: opayTeal, bg: '#E8FAF5' },
                  { label: 'Withdraw', action: () => setScreen('bills') }
                ].map((item, idx) => (
                  <button key={item.label} onClick={item.action} className="flex flex-col items-center gap-1.5 cursor-pointer">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: item.bg }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: item.color }}>
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-700">{item.label}</span>
                  </button>
                ))}
          </div>
          <div className="flex justify-around mb-5">
            {['Airtime', 'Data', 'Betting', 'TV'].map((label) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#F0F0F0' }}>
                  <span className="text-base">{label === 'Airtime' ? '\u{1F4DE}' : label === 'Data' ? '\u{1F4F6}' : label === 'Betting' ? '\u{1F3B0}' : '\u{1F4FA}'}</span>
                </div>
                <span className="text-[9px] font-semibold text-gray-600">{label}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-around">
            {[{ n: 'SafeBox', e: '\u{1F512}' }, { n: 'Loan', e: '\u{1F4B5}', hot: true }, { n: 'Invitation', e: '\u{1F4E8}' }, { n: 'More', e: '\u2022\u2022\u2022' }].map((item) => (
              <div key={item.n} className="flex flex-col items-center gap-1.5 relative">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#F0F0F0' }}>
                  <span className="text-base">{item.e}</span>
                </div>
                <span className="text-[9px] font-semibold text-gray-600">{item.n}</span>
                {item.hot && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[6px] font-bold px-1 rounded-full">HOT</span>}
              </div>
            ))}
          </div>
        </div>

        {showVoucher && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 px-6" onClick={() => setShowVoucher(false)}>
            <div className="bg-white rounded-[20px] w-full max-w-[300px] p-6 relative" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">&#x1F39F;&#xFE0F;</div>
                <div className="text-lg font-black text-gray-800">530</div>
                <div className="text-[10px] text-gray-500">Claim 15 Discounts with</div>
                <div className="text-xl font-black" style={{ color: opayTeal }}>₦99</div>
                <div className="text-[10px] text-gray-500">on any Bill</div>
              </div>
              <button className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: opayTeal }}>Claim 15 Discounts</button>
              <button onClick={() => setShowVoucher(false)} className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-auto bg-white border-t border-gray-200 flex justify-around py-2.5 text-[9px] font-bold text-gray-400">
          {[
            { label: 'Home', icon: '\u{1F3E0}', active: screen === 'home', action: () => setScreen('home') },
            { label: 'History', icon: '\u{1F4CB}', active: screen === 'history', action: () => setScreen('history') },
            { label: 'Finance', icon: '\u{1F4CA}', action: () => setScreen('bills') },
            { label: 'Cards', icon: '\u{1F4B3}', action: () => setScreen('bills') },
            { label: 'Me', icon: '\u{1F464}', action: () => setScreen('profile') },
          ].map((tab) => (
            <button key={tab.label} onClick={tab.action} className={`flex flex-col items-center gap-0.5 cursor-pointer ${tab.active ? '' : ''}`} style={tab.active ? { color: opayTeal } : {}}>
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // === TRANSFER (Account + Bank Selection) ===
  if (screen === 'transfer') {
    return (
      <div style={{ background: opayBg, fontFamily: "'Segoe UI', Arial, sans-serif" }} className="h-full flex flex-col overflow-y-auto select-none">
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={() => setScreen('home')}><ChevronLeft className="w-5 h-5 text-gray-700" /></button>
            <span className="text-sm font-bold text-gray-900">Transfer Bank Account</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-gray-400 font-medium">Free transfers: {freeTransfersLeft}/3</span>
            <button onClick={() => setScreen('history')} className="text-xs font-semibold" style={{ color: opayTeal }}>History</button>
          </div>
        </div>

        {/* Editable sender name */}
        <div className="mx-4 mt-3">
          <span className="text-[9px] font-bold text-gray-500 block mb-1">Transferring from</span>
          <input
            type="text"
            value={editableSenderName}
            onChange={(e) => setEditableSenderName(e.target.value.toUpperCase())}
            className="w-full bg-white rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 outline-none"
            placeholder="Your account name"
          />
        </div>

        <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-2">
          <input
            type="text"
            value={recipientAccount}
            onChange={(e) => setRecipientAccount(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="Recipient Account"
            className="flex-1 text-xs outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
            maxLength={10}
          />
          <QrCode className="w-5 h-5 text-gray-400" />
        </div>

        {nameLookupStatus === 'loading' && (
          <div className="mx-4 mt-2 flex items-center gap-2 px-3 py-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-[#00C5A3] rounded-full animate-spin" />
            <span className="text-[10px] text-gray-500">Looking up account...</span>
          </div>
        )}
        {nameLookupStatus === 'found' && recipientName && (
          <div className="mx-4 mt-2 flex items-center gap-3 px-3 py-2 bg-green-50 rounded-xl border border-green-100">
            <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-700">
              {recipientName.charAt(0)}
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value.toUpperCase())}
                className="text-xs font-bold text-gray-900 bg-transparent outline-none border-b border-dashed border-gray-300 w-full"
              />
              <span className="text-[9px] text-gray-500">{selectedBank?.name} | {formatAccount(recipientAccount)}</span>
            </div>
          </div>
        )}

        <div className="mx-4 mt-3">
          <button onClick={() => setShowBankSearch(true)} className="w-full bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
            <span className="text-xs" style={{ color: selectedBank ? '#1A1A1A' : '#9CA3AF' }}>
              {selectedBank ? selectedBank.name : 'Select Bank'}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {showBankSearch && (
          <div className="absolute inset-0 z-[60] bg-white flex flex-col" style={{ background: opayBg }}>
            <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100">
              <button onClick={() => setShowBankSearch(false)}><ChevronLeft className="w-5 h-5 text-gray-700" /></button>
              <span className="text-sm font-bold text-gray-900">Select Bank</span>
            </div>
            <div className="mx-4 mt-3">
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-2.5 flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={bankSearchQuery}
                  onChange={(e) => setBankSearchQuery(e.target.value)}
                  placeholder="Search Bank Name"
                  className="flex-1 text-xs outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
                  autoFocus
                />
                {bankSearchQuery && <button onClick={() => setBankSearchQuery('')}><X className="w-4 h-4 text-gray-400" /></button>}
              </div>
            </div>
            {!bankSearchQuery && (
              <>
                <div className="mx-4 mt-4">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Frequently Used Bank</span>
                </div>
                <div className="mx-4 mt-2 space-y-0.5 max-h-[120px] overflow-y-auto">
                  {frequentBanks.slice(0, 8).map((bank) => (
                    <button key={bank.code} onClick={() => handleBankSelect(bank)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 text-left">
                      <div className="w-8 h-8 rounded-full bg-[#E8FAF5] flex items-center justify-center text-xs font-bold" style={{ color: opayTeal }}>
                        {bank.name.charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-gray-800">{bank.name}</span>
                    </button>
                  ))}
                </div>
                <div className="mx-4 mt-4">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">All Banks</span>
                </div>
              </>
            )}
            <div className="flex-1 overflow-y-auto mx-4 mt-2 mb-4 space-y-0.5">
              {filteredBanks.map((bank) => (
                <button key={bank.code} onClick={() => handleBankSelect(bank)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 text-left">
                  <div className="w-8 h-8 rounded-full bg-[#E8FAF5] flex items-center justify-center text-xs font-bold" style={{ color: opayTeal }}>
                    {bank.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-800 block">{bank.name}</span>
                    <span className="text-[9px] text-gray-400">{bank.code}</span>
                  </div>
                </button>
              ))}
              {filteredBanks.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-400">No banks found</div>
              )}
            </div>
          </div>
        )}

        <div className="mx-4 mt-3 p-3 rounded-xl flex items-center gap-3" style={{ background: '#E8FAF5' }}>
          <Info className="w-4 h-4" style={{ color: opayTeal }} />
          <span className="text-[9px] font-medium text-gray-600">Bank Transfer Success Rate Monitor: All transactions are processed securely.</span>
        </div>

        <div className="mx-4 mt-4 flex items-center gap-6 border-b border-gray-200">
          <button onClick={() => setActiveTab('recents')} className={`text-xs font-bold pb-2 border-b-2 transition-colors`}
            style={activeTab === 'recents' ? { color: opayTeal, borderColor: opayTeal } : { color: '#9CA3AF', borderColor: 'transparent' }}>
            Recents
          </button>
          <button onClick={() => setActiveTab('favourites')} className={`text-xs font-medium pb-2 border-b-2 transition-colors`}
            style={activeTab === 'favourites' ? { color: opayTeal, borderColor: opayTeal } : { color: '#9CA3AF', borderColor: 'transparent' }}>
            Favourites
          </button>
        </div>

        <div className="mx-4 mt-3 space-y-3 flex-1">
          {activeTab === 'recents' && transactions.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <span className="text-[11px] text-gray-400">No recent transactions</span>
            </div>
          )}
          {activeTab === 'recents' && transactions.map((tx, i) => (
            <div key={tx.id} className="flex items-center gap-3 py-2 cursor-pointer"
              onClick={() => { setRecipientAccount(tx.recipientAccount); setRecipientName(tx.recipientName); setSelectedBank(NIGERIAN_BANKS.find(b => b.name === tx.bankName) || null); }}>
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                {tx.recipientName.charAt(0)}
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-gray-900 block">{tx.recipientName}</span>
                <span className="text-[10px] text-gray-500">{tx.bankName} | {formatAccount(tx.recipientAccount)}</span>
              </div>
            </div>
          ))}
          {activeTab === 'favourites' && (
            <div className="text-center py-8">
              <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <span className="text-[11px] text-gray-400">No favourites yet</span>
            </div>
          )}
        </div>

        <div className="mx-4 mt-auto mb-4">
          <button
            onClick={() => setScreen('amount')}
            disabled={!recipientName || !selectedBank}
            className="w-full py-3 rounded-full text-sm font-bold text-white transition-opacity"
            style={{ background: opayTeal, opacity: !recipientName || !selectedBank ? 0.5 : 1 }}
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // === AMOUNT ===
  if (screen === 'amount') {
    return (
      <div style={{ background: opayBg, fontFamily: "'Segoe UI', Arial, sans-serif" }} className="h-full flex flex-col overflow-y-auto select-none">
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={() => setScreen('transfer')}><ChevronLeft className="w-5 h-5 text-gray-700" /></button>
            <span className="text-sm font-bold text-gray-900">Transfer to Bank Account</span>
          </div>
          <button onClick={() => setScreen('history')} className="text-xs font-semibold" style={{ color: opayTeal }}>History</button>
        </div>

        <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
            {recipientName.charAt(0)}
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900 block">{recipientName}</span>
            <span className="text-[10px] text-gray-500">{selectedBank?.name} | {formatAccount(recipientAccount)}</span>
          </div>
        </div>

        <div className="px-4 mt-3">
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: opayTeal }}>No Transaction Fees</span>
        </div>

        <div className="px-4 mt-5">
          <span className="text-[10px] font-bold text-gray-500 block mb-1">Amount</span>
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
            <span className="text-3xl font-black text-gray-900">₦</span>
            <input
              type="text"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value.replace(/\D/g, ''))}
              placeholder="0.00"
              className="flex-1 text-3xl font-black text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
            />
            {transferAmount && <button onClick={() => setTransferAmount('')}><X className="w-5 h-5 text-gray-400" /></button>}
          </div>
        </div>

        <div className="px-4 mt-4">
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((amt) => (
              <button key={amt} onClick={() => setTransferAmount(String(amt))}
                className={`py-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  transferAmount === String(amt) ? 'text-white border-transparent' : 'text-gray-600 border-gray-200 bg-white'
                }`}
                style={transferAmount === String(amt) ? { background: opayTeal, borderColor: opayTeal } : {}}
              >
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {neededPoints > 0 && (
          <div className="mx-4 mt-3 p-3 rounded-xl" style={{ background: neededPoints > userPoints ? '#FEF2F2' : '#F0FDF4' }}>
            <div className="flex items-start gap-2">
              <Info className={`w-4 h-4 mt-0.5 ${neededPoints > userPoints ? 'text-red-500' : 'text-green-500'}`} />
              <div>
                {neededPoints > userPoints ? (
                  <>
                    <span className="text-[10px] font-semibold text-red-600 block">Insufficient points</span>
                    <span className="text-[9px] text-red-500">You need at least {neededPoints} points. You have {userPoints} points.</span>
                    <button onClick={() => { onBuyPoints(); }} className="block mt-1 text-[9px] font-bold underline" style={{ color: opayTeal }}>
                      Click here to buy more points
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-semibold text-green-700 block">Points sufficient</span>
                    <span className="text-[9px] text-green-600">You have {userPoints} points. Transfer will cost {neededPoints} points.</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="px-4 mt-5">
          <span className="text-xs font-bold text-gray-800 block mb-1.5">Remark</span>
          <input type="text" value={remark} onChange={(e) => setRemark(e.target.value)}
            placeholder="What's this for? (Optional)"
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none text-gray-700 placeholder:text-gray-400"
          />
          <div className="flex gap-2 mt-2">
            {['Purchase', 'Personal'].map((cat) => (
              <button key={cat} onClick={() => setRemarkCategory(cat as any)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                  remarkCategory === cat ? 'text-white' : 'bg-gray-100 text-gray-600'
                }`}
                style={remarkCategory === cat ? { background: opayTeal } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 mt-6 mb-4">
          <button onClick={handleConfirmTransfer}
            disabled={!transferAmount || parseInt(transferAmount) <= 0 || neededPoints > userPoints}
            className="w-full py-3 rounded-full text-sm font-bold text-white transition-opacity"
            style={{ background: opayTeal, opacity: !transferAmount || parseInt(transferAmount) <= 0 || neededPoints > userPoints ? 0.5 : 1 }}
          >
            Confirm
          </button>
        </div>
      </div>
    );
  }

  // === LOADING ===
  if (screen === 'loading') {
    return (
      <div style={{ background: opayBg }} className="h-full flex flex-col items-center justify-center select-none">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-gray-300 border-t-[#00C5A3] animate-spin flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-b-[#00C5A3] animate-spin" />
          </div>
        </div>
        <span className="text-xs text-gray-400 mt-4 font-medium">Processing transfer...</span>
      </div>
    );
  }

  // === DONE (Receipt) ===
  if (screen === 'done') {
    const lastTx = transactions[0];
    if (!lastTx) return null;
    return (
      <div style={{ background: opayBg, fontFamily: "'Segoe UI', Arial, sans-serif" }} className="h-full flex flex-col overflow-y-auto select-none">
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={() => { setScreen('home'); setTransferAmount(''); setRemark(''); setRemarkCategory(null); }}>
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <span className="text-sm font-bold text-gray-900">Transaction Details</span>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center border border-gray-200">
            <svg className="w-3.5 h-3.5" style={{ color: opayTeal }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/>
            </svg>
          </div>
        </div>

        <div className="px-4 pt-6 pb-4">
          <div className="flex justify-center mb-3">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-full bg-white border-2" style={{ borderColor: opayTeal }} />
              <div className="absolute inset-[3px] rounded-full" style={{ background: opayTeal }} />
              <div className="absolute inset-[6px] rounded-full bg-white flex items-center justify-center">
                <div className="w-2 h-2" style={{ background: opayTeal, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
              </div>
            </div>
          </div>
          <div className="text-center mb-1">
            <span className="text-sm text-gray-500">Transfer to </span>
            <span className="text-sm font-bold text-gray-900">{lastTx.recipientName}</span>
          </div>
          <div className="text-center mb-1">
            <span className="text-3xl font-black text-gray-900">{formatCurrency(lastTx.amount)}</span>
          </div>
          <div className="flex items-center justify-center gap-1 mb-5">
            <Check className="w-4 h-4" style={{ color: opayTeal }} />
            <span className="text-sm font-semibold" style={{ color: opayTeal }}>Successful</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-3">
            <div className="px-4 py-2.5 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-800">Transaction Details</span>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="px-4 py-2.5">
                <span className="text-[10px] text-gray-400 block">Recipient Details</span>
                <span className="text-xs font-bold text-gray-900 block">{lastTx.recipientName}</span>
                <span className="text-[10px] text-gray-500">{lastTx.bankName} | {formatAccount(lastTx.recipientAccount)}</span>
              </div>
              <div className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block">Transaction No.</span>
                  <span className="text-[10px] font-mono text-gray-700">{lastTx.id}</span>
                </div>
                <button onClick={() => navigator.clipboard.writeText(lastTx.id)} className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: opayTeal }}>
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Payment Method</span>
                <span className="text-[10px] font-semibold text-gray-700 flex items-center gap-1">OWealth <ChevronRight className="w-3 h-3" /></span>
              </div>
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Transaction Date</span>
                <span className="text-[10px] text-gray-700 font-medium">{lastTx.date}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
            <div className="px-4 py-2.5 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-800">More Actions</span>
            </div>
            <div className="flex divide-x divide-gray-100">
              <button onClick={() => { setScreen('transfer'); setTransferAmount(''); setRemark(''); }}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-bold" style={{ color: opayTeal }}>
                <RotateCcw className="w-3.5 h-3.5" /> Transfer Again
              </button>
              <button onClick={() => setScreen('history')} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-bold" style={{ color: opayTeal }}>
                <Clock className="w-3.5 h-3.5" /> View Records
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <button className="flex-1 py-2.5 rounded-full border-2 text-xs font-bold" style={{ borderColor: opayTeal, color: opayTeal }}>Report Issue</button>
            <button className="flex-1 py-2.5 rounded-full text-xs font-bold text-white" style={{ background: opayTeal }}
              onClick={() => onFinishSimulation({
                senderName: editableSenderName, recipientName: lastTx.recipientName, receiverBank: lastTx.bankName,
                amount: lastTx.amount, dateTime: lastTx.date, transactionId: lastTx.id,
                reference: lastTx.remark, balance: userPoints, customField: '',
              })}
            >
              Share Receipt
            </button>
          </div>

          <div className="text-center text-[9px] uppercase tracking-widest text-gray-400">
            Licensed by the CBN and insured by the NDIC
          </div>
        </div>
      </div>
    );
  }

  // === HISTORY ===
  if (screen === 'history') {
    const outgoing = transactions.filter(t => t.status === 'successful');
    return (
      <div style={{ background: opayBg, fontFamily: "'Segoe UI', Arial, sans-serif" }} className="h-full flex flex-col overflow-y-auto select-none">
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={() => setScreen('home')}><ChevronLeft className="w-5 h-5 text-gray-700" /></button>
            <span className="text-sm font-bold text-gray-900">Transaction History</span>
          </div>
        </div>

        <div className="mx-4 mt-3 flex items-center gap-2 border-b border-gray-200">
          {[
            { key: 'all', label: 'All' },
            { key: 'incoming', label: 'Incoming' },
            { key: 'outgoing', label: 'Outgoing' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setHistoryFilter(tab.key as any)}
              className={`text-xs pb-2 border-b-2 transition-colors ${historyFilter === tab.key ? 'font-bold' : 'font-medium text-gray-400'}`}
              style={historyFilter === tab.key ? { color: opayTeal, borderColor: opayTeal } : { borderColor: 'transparent' }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 mx-4 mt-3 space-y-1">
          {outgoing.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <span className="text-xs text-gray-400 block">No transaction history yet</span>
              <span className="text-[10px] text-gray-400 mt-1 block">Your completed transfers will appear here</span>
            </div>
          ) : (
            outgoing.map((tx, i) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E8FAF5] flex items-center justify-center text-xs font-bold" style={{ color: opayTeal }}>
                    {tx.recipientName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">{tx.recipientName}</span>
                    <span className="text-[9px] text-gray-400">{tx.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-900 block">-{formatCurrency(tx.amount)}</span>
                  <span className="text-[9px]" style={{ color: opayTeal }}>Successful</span>
                </div>
              </div>
            ))
          )}
        </div>

<div className="mt-auto bg-white border-t border-gray-200 flex justify-around py-2.5 text-[9px] font-bold text-gray-400">
           {[
             { label: 'Home', icon: '\u{1F3E0}', action: () => setScreen('home') },
             { label: 'History', icon: '\u{1F4CB}', action: () => setScreen('history'), active: true },
             { label: 'Finance', icon: '\u{1F4CA}', action: () => setScreen('bills') },
             { label: 'Cards', icon: '\u{1F4B3}', action: () => setScreen('bills') },
             { label: 'Me', icon: '\u{1F464}', action: () => setScreen('profile') },
           ].map((tab) => (
             <button key={tab.label} onClick={tab.action} className="flex flex-col items-center gap-0.5 cursor-pointer" style={tab.active ? { color: opayTeal } : {}}>
               <span className="text-base">{tab.icon}</span>
               <span>{tab.label}</span>
             </button>
           ))}
         </div>
      </div>
);
   }

   if (screen === 'bills') {
     return (
       <div style={{ background: opayBg, fontFamily: "'Segoe UI', Arial, sans-serif" }} className="h-full flex flex-col overflow-y-auto select-none">
         <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
           <div className="flex items-center gap-2">
             <button onClick={() => setScreen('home')}><ChevronLeft className="w-5 h-5 text-gray-700" /></button>
             <span className="text-sm font-bold text-gray-900">Pay Bills</span>
           </div>
         </div>
         <div className="mx-4 mt-4 space-y-3">
           {['Cable TV', 'Electricity', 'Betting', 'Water', 'Gas'].map(cat => (
             <button key={cat} onClick={() => { setBillsCat(cat); setScreen('bills-form'); }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
               <span className="text-2xl">{cat === 'Cable TV' ? '📺' : cat === 'Electricity' ? '⚡' : cat === 'Betting' ? '🎲' : cat === 'Water' ? '💧' : '🔥'}</span>
               <span className="text-sm font-semibold text-gray-800">{cat}</span>
               <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
             </button>
           ))}
         </div>
         <div className="mt-auto bg-white border-t border-gray-200 flex justify-around py-2.5 text-[9px] font-bold text-gray-400">
           {[
             { label: 'Home', icon: '\u{1F3E0}', action: () => setScreen('home') },
             { label: 'History', icon: '\u{1F4CB}', action: () => setScreen('history') },
             { label: 'Finance', icon: '\u{1F4CA}', active: true },
             { label: 'Cards', icon: '\u{1F4B3}', action: () => setScreen('bills') },
             { label: 'Me', icon: '\u{1F464}', action: () => setScreen('profile') },
           ].map((tab) => (
             <button key={tab.label} onClick={tab.action} className="flex flex-col items-center gap-0.5 cursor-pointer" style={tab.active ? { color: opayTeal } : {}}>
               <span className="text-base">{tab.icon}</span>
               <span>{tab.label}</span>
             </button>
           ))}
         </div>
       </div>
     );
   }

   if (screen === 'bills-form') {
     return (
       <div style={{ background: opayBg, fontFamily: "'Segoe UI', Arial, sans-serif" }} className="h-full flex flex-col overflow-y-auto select-none">
         <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
           <div className="flex items-center gap-2">
             <button onClick={() => setScreen('bills')}><ChevronLeft className="w-5 h-5 text-gray-700" /></button>
             <span className="text-sm font-bold text-gray-900">{billsCat}</span>
           </div>
         </div>
         <div className="mx-4 mt-4 space-y-3">
           <div className="bg-white rounded-xl p-4 border border-gray-100">
             <label className="text-xs font-semibold text-gray-600 block mb-2">Account/Service Number</label>
             <input value={billsAcc} onChange={e => setBillsAcc(e.target.value)} placeholder="Enter account number" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-opayTeal" />
           </div>
           <div className="bg-white rounded-xl p-4 border border-gray-100">
             <label className="text-xs font-semibold text-gray-600 block mb-2">Amount (₦)</label>
             <input type="number" value={billsAmt} onChange={e => setBillsAmt(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-opayTeal" />
           </div>
           <button onClick={() => {
             if (!billsAcc || !billsAmt) return;
             const cost = Math.ceil(parseFloat(billsAmt) * 0.01);
             const userData = JSON.parse(localStorage.getItem('sh_user') || '{}');
             if ((userData.points || 0) < cost) return;
             setScreen('loading');
             const ref = `BILL-${Date.now()}`;
             fetch('/api/opay/generate', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('sh_token') || ''}` },
               body: JSON.stringify({ amount: parseFloat(billsAmt), recipient: billsAcc, bank: billsCat, senderName: 'User', reference: ref }),
             }).then(res => res.json()).then(data => {
               if (data.success) {
                 setBalance(data.newBalance);
                 setScreen('done');
               }
             }).catch(() => setScreen('home'));
           }} className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: opayTeal }}>Pay ₦{parseFloat(billsAmt || '0').toLocaleString()}</button>
         </div>
         <div className="mt-auto bg-white border-t border-gray-200 flex justify-around py-2.5 text-[9px] font-bold text-gray-400">
           {[
{ label: 'Home', icon: '\u{1F3E0}', action: () => setScreen('home') },
              { label: 'History', icon: '\u{1F4CB}', action: () => setScreen('history') },
              { label: 'Finance', icon: '\u{1F4CA}', action: () => setScreen('bills'), active: true },
              { label: 'Cards', icon: '\u{1F4B3}', action: () => setScreen('bills') },
              { label: 'Me', icon: '\u{1F464}', action: () => setScreen('profile') },
            ].map((tab) => (
             <button key={tab.label} onClick={tab.action} className="flex flex-col items-center gap-0.5 cursor-pointer" style={tab.active ? { color: opayTeal } : {}}>
               <span className="text-base">{tab.icon}</span>
               <span>{tab.label}</span>
             </button>
           ))}
         </div>
       </div>
     );
   }

   if (screen === 'profile') {
     return (
       <div style={{ background: opayBg, fontFamily: "'Segoe UI', Arial, sans-serif" }} className="h-full flex flex-col overflow-y-auto select-none">
         <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
           <div className="flex items-center gap-2">
             <button onClick={() => setScreen('home')}><ChevronLeft className="w-5 h-5 text-gray-700" /></button>
             <span className="text-sm font-bold text-gray-900">Profile</span>
           </div>
         </div>
         <div className="mx-4 mt-4 flex flex-col items-center">
<div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ background: opayTeal }}>U</div>
            <span className="text-lg font-bold text-gray-900 mt-3">User</span>
            <span className="text-xs text-gray-400">Connected</span>
           <div className="w-full mt-4 bg-white rounded-xl border border-gray-100 p-4 space-y-3">
             <div className="flex justify-between text-sm"><span className="text-gray-500">Points</span><span className="font-semibold">{balance} pts</span></div>
             <div className="flex justify-between text-sm"><span className="text-gray-500">Naira Value</span><span className="font-semibold">₦{(balance * 100).toLocaleString()}</span></div>
             <div className="flex justify-between text-sm"><span className="text-gray-500">OPay PIN</span><span className="font-semibold">{hasPin ? 'Set ✓' : 'Not set'}</span></div>
           </div>
         </div>
         <div className="mt-auto bg-white border-t border-gray-200 flex justify-around py-2.5 text-[9px] font-bold text-gray-400">
           {[
             { label: 'Home', icon: '\u{1F3E0}', action: () => setScreen('home') },
             { label: 'History', icon: '\u{1F4CB}', action: () => setScreen('history') },
             { label: 'Finance', icon: '\u{1F4CA}', action: () => setScreen('bills') },
             { label: 'Cards', icon: '\u{1F4B3}', action: () => setScreen('bills') },
             { label: 'Me', icon: '\u{1F464}', active: true },
           ].map((tab) => (
             <button key={tab.label} onClick={tab.action} className="flex flex-col items-center gap-0.5 cursor-pointer" style={tab.active ? { color: opayTeal } : {}}>
               <span className="text-base">{tab.icon}</span>
               <span>{tab.label}</span>
             </button>
           ))}
         </div>
       </div>
     );
   }

   return null;
 }
