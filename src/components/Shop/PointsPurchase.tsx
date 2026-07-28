import React, { useState } from 'react';
import { Coins, Check, X, Loader, ArrowLeft } from 'lucide-react';
import PaystackFundModal from '../PaystackFundModal';

const PACKAGES = [
  { pts: 300,  price: 3000,  label: 'Starter',  desc: '~10 receipts', color: '#6c5ce7' },
  { pts: 500,  price: 5000,  label: 'Popular',  desc: '~16 receipts', color: '#00b894' },
  { pts: 1000, price: 10000, label: 'Pro',      desc: '~33 receipts', color: '#f59e0b' },
  { pts: 2000, price: 20000, label: 'Elite',     desc: '~66 receipts', color: '#ef4444' },
];

export default function PointsPurchase({ onClose, onFundSuccess }: { onClose: () => void; onFundSuccess?: (user: any) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState(0);
  const [msg, setMsg] = useState('');

  const buy = (pkg: typeof PACKAGES[0]) => {
    const token = localStorage.getItem('sh_token');
    if (!token) { setMsg('Please sign in first'); return; }
    setFundAmount(pkg.price);
    setFundModalOpen(true);
  };

  return (
    <div className="pp-page">
      <button className="pp-back" onClick={onClose}><ArrowLeft size={20} /> Back</button>
      <h2 className="pp-title">Buy Points</h2>
      <p className="pp-sub">Choose a package — ₦10 per point</p>

      {msg && (
        <div className={`pp-msg ${msg.includes('success') || msg.includes('Purchased') ? '' : 'err'}`}>
          {msg.includes('success') || msg.includes('Purchased') ? <Check size={16} /> : <X size={16} />} {msg}
        </div>
      )}

      <div className="pp-grid">
        {PACKAGES.map((pkg, i) => (
          <div
            key={i}
            className={`pp-card ${selected === i ? 'sel' : ''}`}
            style={{ '--accent': pkg.color } as React.CSSProperties}
            onClick={() => setSelected(i)}
          >
            <div className="pp-card-bg" style={{ background: `linear-gradient(135deg, ${pkg.color}22, ${pkg.color}44)` }} />
            <Coins size={28} style={{ color: pkg.color }} />
            <div className="pp-pts">{pkg.pts.toLocaleString()}</div>
            <div className="pp-lbl">{pkg.label}</div>
            <div className="pp-price">₦{pkg.price.toLocaleString()}</div>
            <div className="pp-per-pt">{pkg.desc}</div>
          </div>
        ))}
      </div>

      <button
        className="pp-buy"
        disabled={selected === null}
        onClick={() => selected !== null ? buy(PACKAGES[selected]) : null}
      >
        {selected !== null ? `Buy ₦${PACKAGES[selected].price.toLocaleString()}` : 'Select a Package'}
      </button>

      {fundModalOpen && (
        <PaystackFundModal
          amount={fundAmount}
          onClose={() => { setFundModalOpen(false); setSelected(null); }}
          onSuccess={(user) => {
            setFundModalOpen(false);
            setSelected(null);
            setMsg(`Purchased ${fundAmount / 10} points!`);
            onFundSuccess?.(user);
            setTimeout(onClose, 2000);
          }}
        />
      )}
    </div>
  );
}
