import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Eye, EyeOff, Check, X,
  Info, Loader2, Sparkles, Smartphone, UserCheck, AlertCircle, Share2,
  Copy, RotateCcw, HelpCircle, QrCode, Bell, ArrowUpRight, TrendingUp, 
  TrendingDown, Coins, Trophy, UserPlus, FileCode, ExternalLink, Globe, Clock
} from "lucide-react";

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(val);
};

interface AppSimulatorProps {
  bank: string;
  senderName: string;
  receiverName: string;
  receiverBank: string;
  amount: number;
  dateTime: string;
  transactionId: string;
  reference: string;
  balance: number;
  customField: string;
  onFinishSimulation: (data: any) => void;
  onClose: () => void;
  isInline?: boolean;
  emblemText?: string;
  emblemImg?: string;
  uploadedFileData?: string;
  uploadedFileName?: string;
  uploadedFileType?: string;
  customLinksList?: any[];
  userPaid?: boolean;
  senderAccount?: string;
  receiverAccount?: string;
  senderPhone?: string;
  receiverPhone?: string;
}

// Multibank brands fallback mapping
interface BankBrand {
  name: string;
  primaryColor: string;
  textColor: string;
  bgColor: string;
  darkBgColor: string;
  statusBarDark: boolean;
  accentColor: string;
  tagline: string;
}

const BANK_BRANDS: Record<string, BankBrand> = {
  opay: {
    name: "OPay",
    primaryColor: "#00C5A3",
    textColor: "#1D3A31",
    bgColor: "bg-[#00C5A3]",
    darkBgColor: "bg-[#1C1F22]",
    statusBarDark: true,
    accentColor: "#00C5A3",
    tagline: "We are Beyond Banking"
  }
};

const BrandLogo = ({ bankName, className = "w-16 h-16" }: { bankName: string; className?: string }) => {
  return (
    <div className={`relative ${className} flex items-center justify-center rounded-full bg-white shadow-md select-none`}>
      <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
        <circle cx="50" cy="50" r="32" fill="none" stroke="#00C5A3" strokeWidth="11" />
        <rect x="8" y="42" width="22" height="16" fill="white" />
        <rect x="12" y="44" width="20" height="12" fill="#1A2D54" rx="1.5" />
      </svg>
    </div>
  );
};

// High fidelity phone status bar
const DeviceStatusBar = ({ dark = false, emblemText }: { dark?: boolean; emblemText?: string }) => {
  return (
    <div className={`flex justify-between items-center px-4 py-1.5 text-[9px] font-bold select-none z-50 ${dark ? 'text-white bg-slate-950/80' : 'text-gray-901 bg-white border-b border-gray-100'}`}>
      <div className="flex items-center gap-1 font-sans">
        <span className="text-[9px]">04:20</span>
        {emblemText ? (
          <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500/15 text-amber-500 border border-amber-500/20 text-[7px] rounded-full font-mono uppercase tracking-widest font-black leading-none">
            🛡️ {emblemText}
          </span>
        ) : (
          <span className="ml-1 px-1.5 py-0.2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[7px] rounded-full font-mono font-bold leading-none">
            PRO EMBLEM
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 font-sans">
        <span className="text-[7.5px] scale-90">1.8K/S</span>
        <span className="text-[7px] font-extrabold border border-current px-0.5 py-px rounded leading-none scale-85">VoLTE</span>
        <span className="text-[8px] font-black">5G</span>
        <div className="flex items-center">
          <div className="border border-current px-0.5 py-px rounded flex items-center h-3 w-5.5 relative">
            <div className="h-full bg-current rounded-sm w-[88%]" />
            <span className="absolute inset-0 text-[6.5px] text-center font-black leading-none pt-px">88</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AppSimulator({
  bank,
  senderName,
  receiverName,
  receiverBank,
  amount,
  dateTime,
  transactionId,
  reference,
  balance,
  customField,
  onFinishSimulation,
  onClose,
  isInline = true,
  emblemText = "STYLZ HUB PRO",
  emblemImg = "",
  uploadedFileData,
  uploadedFileName,
  uploadedFileType,
  customLinksList = [],
  userPaid = false,
  senderAccount = '',
  receiverAccount = '',
  senderPhone = '',
  receiverPhone = '',
}: AppSimulatorProps) {
  
  // Checking if this is one of our premium crypto templates or an external asset preview
  const isCryptoBroker = ["investsafe", "cryptominer", "apexglobal", "zenithwealth", "calmcrypto"].includes(bank.toLowerCase()) || uploadedFileData || bank.startsWith("http");
  
  // Steps for Crypto Apps: 'splash' -> 'mainscreen'
  const [cryptoScreen, setCryptoScreen] = useState<"splash" | "home" | "kyc" | "spin" | "trade" | "referral">("splash");
  
  // Steps for legacy banks: 'splash' -> 'home' -> 'transfer' -> 'confirm' -> 'loading' -> 'done'
  const [bankingStep, setBankingStep] = useState<"splash" | "home" | "transfer" | "confirm" | "loading" | "done">("splash");

  const [maskBalance, setMaskBalance] = useState(false);
  const [typedAccount, setTypedAccount] = useState("");
  const [typedAmount, setTypedAmount] = useState(amount.toString());
  const [typedRemark, setTypedRemark] = useState(reference);

  // Simulated KYC State
  const [kycVerified, setKycVerified] = useState(false);
  const [kycScanning, setKycScanning] = useState(false);
  const [kycName, setKycName] = useState(senderName);
  const [kycIdType, setKycIdType] = useState("National NIN");
  const [kycFormSubmitted, setKycFormSubmitted] = useState(false);

  // Spin & Win State
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinWinner, setSpinWinner] = useState<string | null>(null);
  const [spinCount, setSpinCount] = useState(3);

  // Spot Market CoinMarketCap Trading State
  const [tradePair, setTradePair] = useState("BTC/USDT");
  const [tradePrice, setTradePrice] = useState(67450.00);
  const [cryptoAmt, setCryptoAmt] = useState("0.05");
  const [walletUSDT, setWalletUSDT] = useState(1250);
  const [positions, setPositions] = useState<any[]>([
    { id: "p1", symbol: "BTC/USDT", type: "BUY", amt: 0.12, entry: 66800.00, cost: 8016, time: "1 hour ago" }
  ]);
  
  // Referrals system State
  const [sponsorCode, setSponsorCode] = useState("");
  const [referrals, setReferrals] = useState([
    { user: "InvestPro_901", date: "June 3", payout: "+120 PLS" },
    { user: "CalmNode_441", date: "June 4", payout: "+120 PLS" }
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto progression for splash screen
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      if (isCryptoBroker) {
        setCryptoScreen("home");
      } else {
        setBankingStep("home");
      }
    }, 2000);
    return () => clearTimeout(splashTimer);
  }, [bank, isCryptoBroker]);

  // Live Chart Ticker Canvas Feed for CoinMarketCap Terminal
  useEffect(() => {
    if (cryptoScreen !== "trade" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let points: number[] = [];
    // Initialize starting points
    for (let i = 0; i < 40; i++) {
      points.push(100 + Math.sin(i / 3) * 30 + Math.random() * 20);
    }

    let scale = 1.0;
    let animationId: number;

    const renderChart = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update dynamic price tick
      const lastPrice = points[points.length - 1];
      const delta = (Math.random() - 0.49) * 2;
      const nextPrice = Math.max(20, lastPrice + delta);
      points.push(nextPrice);
      if (points.length > 50) points.shift();

      // Live exchange rate update
      setTradePrice((prev) => {
        const pDelta = (Math.random() - 0.49) * 150;
        return parseFloat(Math.max(1000, prev + pDelta).toFixed(2));
      });

      // Drawing Grid lines
      ctx.strokeStyle = "rgba(51, 65, 85, 0.2)";
      ctx.lineWidth = 1;
      for (let y = 30; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Drawing Candlesticks
      for (let i = 0; i < points.length; i++) {
        const x = (canvas.width / points.length) * i;
        const open = points[i - 1] || points[i];
        const close = points[i];
        const low = Math.min(open, close) - Math.random() * 5;
        const high = Math.max(open, close) + Math.random() * 5;

        const isBullish = close >= open;
        ctx.strokeStyle = isBullish ? "#10B981" : "#EF4444";
        ctx.fillStyle = isBullish ? "#10B981" : "#EF4444";
        ctx.lineWidth = 2;

        // Draw shadow line wick
        ctx.beginPath();
        ctx.moveTo(x + 4, canvas.height - low);
        ctx.lineTo(x + 4, canvas.height - high);
        ctx.stroke();

        // Draw real candle body
        const rectHeight = Math.max(2, Math.abs(canvas.height - close - (canvas.height - open)));
        ctx.fillRect(x + 1, canvas.height - Math.max(open, close), 6, rectHeight);
      }

      animationId = requestAnimationFrame(renderChart);
    };

    renderChart();
    return () => cancelAnimationFrame(animationId);
  }, [cryptoScreen]);

  // Execute Lucky Spin Wheeler
  const runLuckySpin = () => {
    if (isSpinning || spinCount <= 0) return;
    setIsSpinning(true);
    setSpinWinner(null);
    const newAddition = 720 + Math.floor(Math.random() * 1440); // Spin multiple times
    const nextRot = wheelRotation + newAddition;
    setWheelRotation(nextRot);

    // Calculate prize based on degree segments
    const finalSector = (nextRot % 360);
    const prizes = [
      "🎁 Better APY Contract (+15%)", 
      "💰 +250 PLS Points Stack!", 
      "⚡ Free Cloud Hash Miner (1TH/s)", 
      "🍀 Premium Double Referrals Badge", 
      "🌟 Immediate VIP Support Route", 
      "🎁 Premium Staking Unlock Voucher", 
      "💥 Loss Risk Reduction Block", 
      "🍀 Super Win Multiplier (3x)"
    ];
    // Offset sectors
    const sectorIndex = Math.floor(((360 - (finalSector % 360)) / 45) % 8);
    const wonPrize = prizes[sectorIndex];

    setTimeout(() => {
      setIsSpinning(false);
      setSpinWinner(wonPrize);
      setSpinCount(prev => prev - 1);
      alert(`🎉 Spin Landed: ${wonPrize}! Points balance automatically credited under simulated escrow.`);
    }, 4500);
  };

  // Simulated KYC facial detection matching
  const triggerFacialScan = () => {
    setKycFormSubmitted(true);
    setKycScanning(true);
    setTimeout(() => {
      setKycScanning(false);
      setKycVerified(true);
      alert("✅ Facial authentication match: 100%! Identity credentials validated securely.");
    }, 4000);
  };

  // Add mock trade order position
  const placeDemoTrade = (type: "BUY" | "SELL") => {
    const qty = parseFloat(cryptoAmt);
    if (isNaN(qty) || qty <= 0) {
      alert("Please specify a valid trade size!");
      return;
    }
    const cost = qty * tradePrice;
    if (type === "BUY" && cost > walletUSDT) {
      alert("⚠️ Margin Failed: Insufficient demo wallet capital index to authorize buyout.");
      return;
    }

    const newPos = {
      id: "p-" + Date.now(),
      symbol: tradePair,
      type,
      amt: qty,
      entry: tradePrice,
      cost: parseFloat(cost.toFixed(2)),
      time: "Just now"
    };

    if (type === "BUY") {
      setWalletUSDT(prev => parseFloat((prev - cost).toFixed(2)));
    } else {
      setWalletUSDT(prev => parseFloat((prev + cost).toFixed(2)));
    }

    setPositions(prev => [newPos, ...prev]);
    alert(`⚡ Spot Position Executed! Simulated ${type} order for ${qty} ${tradePair.split("/")[0]} filled cleanly.`);
  };

  // Submit dynamic referral code
  const handleRedeemReferer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorCode.trim()) return;
    alert(`⭐ Success! Applied referrer node "${sponsorCode.toUpperCase()}". Unlocked +200 PLS points sign-up bonus distribution!`);
    setSponsorCode("");
  };

  // ----------------------------------------------------
  // PAYMENT AUTHORIZATION GATE OVERLAY ENFORCEMENT
  // ----------------------------------------------------
  // Ensure that if the user hasn't completed a Paystack deposit, we show a gorgeous high-fidelity lock screen overlay block!
  const renderPaymentGateLock = () => {
    return (
      <div className="absolute inset-0 bg-[#070b13] text-white p-6 z-50 flex flex-col justify-center items-center text-center space-y-6 select-none animate-fadeIn">
        <div className="w-14 h-14 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full flex items-center justify-center shadow shadow-amber-500/10 animate-pulse">
          <ShieldCheck className="w-7 h-7" />
        </div>
        
        <div className="space-y-2.5 max-w-sm">
          <small className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest block">
            🔒 PREMIUM LICENSE VERIFICATION FAILED
          </small>
          <h2 className="text-md font-black tracking-tight font-sans text-white uppercase">
            SIMULATOR DEVICE BLOCKED
          </h2>
          <p className="text-[11.5px] text-gray-400 leading-relaxed font-sans font-normal">
            To prevent fraud and enforce strict sandbox governance, access to premium crypto simulators, dynamic HTML integrations, and live trading terminals is strictly reserved.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 w-full text-left space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#00E5FF] font-mono border-b border-gray-901 pb-1">
            Required Activation Step
          </h4>
          <p className="text-[11px] text-gray-300 leading-normal">
            Complete at least one Paystack wallet token purchase on the <strong>Dashboard Hub</strong> first to secure a verified depositor license. 
          </p>
          <div className="text-[9.5px] font-mono font-bold leading-relaxed text-yellow-500 bg-yellow-950/25 border border-yellow-800/15 p-2 rounded-lg">
            ⚠️ Basic Promotion Package sets of ₦150.00 bypasses this security check immediately.
          </div>
        </div>

        <div className="text-[10px] text-gray-500 font-mono">
          JADAI STUDIOS SYSTEM INTEGRITY SECURITY SECURITY
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // RENDER PREMIUM INDUSTRIAL CRYPTO-BROKER CORE LAYOUT
  // ----------------------------------------------------
  const renderCryptoBrokerApp = () => {
    const isSplash = cryptoScreen === "splash";
    
    // Check payment authorization gates
    if (!userPaid) {
      return renderPaymentGateLock();
    }

    if (isSplash) {
      return (
        <div className="h-full bg-[#070A13] flex flex-col justify-between p-6 text-white animate-fadeIn select-none">
          <DeviceStatusBar dark={true} emblemText={emblemText} />
          
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-400 animate-spin flex items-center justify-center p-2">
                <Coins className="w-9 h-9 text-[#00E5FF]" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-black tracking-tight text-white uppercase">{bank.replace("App", "")}</h1>
              <p className="text-[9px] font-mono tracking-widest text-[#00E5FF] uppercase">Autonomous Crypto Terminal</p>
            </div>
          </div>

          <div className="text-center pb-4 text-[9.5px] text-slate-500 font-mono tracking-wide">
            POWERED BY JADAI SECURITY SIGNIA • v2.48
          </div>
        </div>
      );
    }

    // Checking if they chose to inline render direct custom uploaded html/link!
    if (uploadedFileData || bank.startsWith("http")) {
      return (
        <div className="h-full bg-slate-950 flex flex-col text-white animate-fadeIn select-none">
          <DeviceStatusBar dark={true} emblemText={emblemText} />
          
          {/* Action indicator tab */}
          <div className="px-3.5 py-2.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-[10px]">
            <span className="font-mono text-cyan-400 font-black flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5" /> Previewing: Uploaded Template
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dynamic sandbox iframe to execute/run uploaded HTML frame! */}
          <div className="flex-grow bg-white min-h-[480px]">
            {bank.startsWith("http") ? (
              <iframe 
                src={bank} 
                className="w-full h-full border-0" 
                title="Online Broker Website"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <iframe 
                srcDoc={uploadedFileData} 
                className="w-full h-full border-0" 
                title="Client Side App Renderer"
                sandbox="allow-scripts"
              />
            )}
          </div>

          <div className="text-center p-2.5 bg-slate-900 border-t border-slate-800 text-[8.5px] font-mono text-slate-400">
            Secure client iframe sandbox active. Direct assets extraction success.
          </div>
        </div>
      );
    }

    return (
      <div className="h-full bg-[#080d1a] flex flex-col text-white font-sans overflow-hidden select-none relative pb-14">
        <DeviceStatusBar dark={true} emblemText={emblemText} />

        {/* Dashboard inner viewport head */}
        <div className="bg-[#0B1224] p-4 border-b border-slate-800 flex justify-between items-center whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-cyan-700/10 border border-cyan-500/20 text-[#00E5FF] rounded-xl flex items-center justify-center font-black text-sm">
              🔑
            </div>
            <div>
              <span className="text-[8px] font-mono font-medium text-gray-500 block">CONNECTED NODE</span>
              <h2 className="text-xs font-black tracking-tight uppercase">
                {bank.replace("App", "").replace("Protocol", "").replace("Console", "").replace("Hub", "")}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[10px] bg-slate-950/60 border border-slate-800 px-2 py-1 rounded-xl">
            <Coins className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-yellow-400 font-bold">12,500 PLS</span>
          </div>
        </div>

        {/* Primary Interactive Sections scrollable inside bezel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 scrollbar-none">
          
          {/* DYNAMIC VIEW ROUTING BASED ON SUB SESSIONS */}
          
          {/* A. HOME VIEWPORT OR OVERVIEW LIST */}
          {cryptoScreen === "home" && (
            <div className="space-y-4 animate-fadeIn text-[11px] leading-relaxed select-none">
              
              {/* Account Balance visual report */}
              <div className="p-4 bg-gradient-to-br from-[#121B35] to-[#0A0D15] rounded-3xl border border-cyan-500/15 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-2 bg-cyan-950/30 text-cyan-400 font-mono text-[7px] border-b border-l border-slate-800 uppercase rounded-bl-lg font-black tracking-widest scale-90">
                  REAL-TIME Compound SECURED
                </div>
                
                <span className="text-[10px] text-slate-400 font-medium block">Total Simulated Equity Balance</span>
                <h1 className="text-xl font-mono font-black text-white mt-1">
                  {maskBalance ? "$ * * * * *" : `$${(walletUSDT + 1420.00).toFixed(2)} USDT`}
                </h1>

                <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-[9.5px]">
                  <span className="font-mono text-[#00E5FF] font-semibold flex items-center gap-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Verified Escrow Account
                  </span>
                  <span className="text-gray-500 font-mono uppercase text-[8px]">ACTIVE MULTICHAIN</span>
                </div>
              </div>

              {/* Grid Touch Action Items */}
              <div className="grid grid-cols-2 gap-3.5">
                <button 
                  onClick={() => setCryptoScreen("kyc")}
                  className="bg-[#0c1326] border border-slate-800 p-3.5 rounded-2xl flex flex-col items-center text-center space-y-1.5 select-none hover:bg-slate-900 cursor-pointer active:scale-95 transition-all"
                >
                  <UserCheck className={`w-5 h-5 ${kycVerified ? "text-emerald-400" : "text-yellow-500"}`} />
                  <span className="font-black text-xs block text-slate-300">1. KYC Validator</span>
                  <small className="text-[8.5px] text-gray-500 font-mono">
                    {kycVerified ? "VERIFIED CODE ✅" : "INCOMPLETE STATUS"}
                  </small>
                </button>

                <button 
                  onClick={() => setCryptoScreen("spin")}
                  className="bg-[#0c1326] border border-slate-800 p-3.5 rounded-2xl flex flex-col items-center text-center space-y-1.5 select-none hover:bg-slate-900 cursor-pointer active:scale-95 transition-all"
                >
                  <Trophy className="w-5 h-5 text-purple-400 animate-bounce" />
                  <span className="font-black text-xs block text-slate-300">2. Lucky Spin & Win</span>
                  <small className="text-[8.5px] text-gray-400 font-mono">3 Daily spins active</small>
                </button>

                <button 
                  onClick={() => setCryptoScreen("trade")}
                  className="bg-[#0c1326] border border-slate-800 p-3.5 rounded-2xl flex flex-col items-center text-center space-y-1.5 select-none hover:bg-slate-900 cursor-pointer active:scale-95 transition-all"
                >
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span className="font-black text-xs block text-slate-300">3. CoinMarketCap Ex</span>
                  <small className="text-[8.5px] text-gray-500 font-mono">Live Candle Charts</small>
                </button>

                <button 
                  onClick={() => setCryptoScreen("referral")}
                  className="bg-[#0c1326] border border-slate-800 p-3.5 rounded-2xl flex flex-col items-center text-center space-y-1.5 select-none hover:bg-slate-900 cursor-pointer active:scale-95 transition-all"
                >
                  <UserPlus className="w-5 h-5 text-cyan-400" />
                  <span className="font-black text-xs block text-slate-300">4. Referral Suite</span>
                  <small className="text-[8.5px] text-gray-400 font-mono">Generate sharing link</small>
                </button>
              </div>

              {/* Internal simulated asset distribution ratios */}
              <div className="bg-[#0b101f] border border-slate-800 rounded-2xl p-4 font-normal text-slate-300 space-y-2">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1 border-b border-slate-800 pb-1.5">
                  📈 Portfolio Growth Indices
                </h4>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between">
                    <span>Bitcoin Holding</span>
                    <span className="font-mono text-white text-right">0.05 BTC ($3,372.50)</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: "65%" }}></div>
                  </div>

                  <div className="flex justify-between">
                    <span>Compounding Stake Staking</span>
                    <span className="font-mono text-white text-right">24.50 SOL ($3,675.00)</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: "35%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B. INTERACTIVE KYC STATUS MODULE */}
          {cryptoScreen === "kyc" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button onClick={() => setCryptoScreen("home")} className="p-1 hover:bg-slate-800 rounded-lg">
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <h3 className="text-xs font-black uppercase text-slate-100 flex items-center gap-1">
                  <UserCheck className="w-4 h-4 text-[#00E5FF]" /> Simulated KYC Identity Audit
                </h3>
              </div>

              {kycVerified ? (
                <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-3xl text-center space-y-3.5 animate-slideUp py-8">
                  <div className="w-12 h-12 rounded-full border border-emerald-400 bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto shadow shadow-emerald-500/20 animate-bounce">
                    <Check className="w-6 h-6 stroke-[3px]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wide">SECURE IDENTITY VERIFIED</h4>
                    <p className="text-[10.5px] text-gray-400 leading-normal">
                      Full access unlocked! Compounding staking and cloud mining telemetry is authorized. 
                    </p>
                  </div>
                  <div className="text-[9.5px] font-mono text-gray-500">
                    Status: LEVEL 3 AUDIT COMPLETED • SH-6c39a
                  </div>
                </div>
              ) : kycScanning ? (
                <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-3xl text-center space-y-4 py-12">
                  <div className="relative w-20 h-20 mx-auto">
                    {/* Glowing scanning radar */}
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-400/10 animate-ping"></div>
                    <div className="absolute inset-2 rounded-full border-2 border-dashed border-[#00E5FF] animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">
                      👤
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest block animate-pulse">
                      Analyzing live facial geometry...
                    </span>
                    <p className="text-[10px] text-gray-500 max-w-xs mx-auto leading-relaxed font-sans">
                      Align face in clean light. Verifying biometric mesh codes against decentralized databases.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0b101f] border border-slate-800 rounded-2xl p-[18px] space-y-4">
                  <p className="text-[10.5px] text-gray-400 leading-normal font-sans text-center">
                    Simulate a level-3 facial mesh verification. To protect allocations and compound farming, enter credentials.
                  </p>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-gray-400 uppercase block">Full Legal Name</label>
                      <input 
                        type="text" 
                        value={kycName}
                        onChange={(e) => setKycName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-gray-400 uppercase block">Credentials ID Document Type</label>
                      <select 
                        value={kycIdType}
                        onChange={(e) => setKycIdType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-500"
                      >
                        <option>National NIN Slip</option>
                        <option>International Travel Passport</option>
                        <option>Biometric Driver License</option>
                        <option>Sovereign Signia Voucher Card</option>
                      </select>
                    </div>

                    <button 
                      onClick={triggerFacialScan}
                      className="w-full py-2.5 mt-2 bg-gradient-to-r from-cyan-600 to-blue-500 hover:brightness-115 text-white text-xs uppercase tracking-wider font-extrabold rounded-xl active:scale-95 transition-all cursor-pointer text-center"
                    >
                      📷 Trigger simulated Facial identification Scan
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* C. SPIN & WIN WHEEL GAME MODULE */}
          {cryptoScreen === "spin" && (
            <div className="space-y-4 text-center animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-left">
                <button onClick={() => setCryptoScreen("home")} className="p-1 hover:bg-slate-800 rounded-lg">
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <h3 className="text-xs font-black uppercase text-slate-100 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-purple-400" /> Lucky Spin & Win Console
                </h3>
              </div>

              <div className="py-2.5">
                {/* Visual Spinning Wheel representation */}
                <div className="relative w-44 h-44 mx-auto my-3 flex items-center justify-center">
                  
                  {/* Outer Bezel */}
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800 bg-[#0E1529] shadow-inner"></div>
                  
                  {/* Outer glowing lights */}
                  <div className="absolute inset-1.5 rounded-full border border-[#00E5FF]/20 animate-pulse"></div>

                  {/* Pointer arrow on top */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-[22px] bg-red-500 rotate-180 rounded-b shadow z-30" style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }}></div>

                  {/* Rotating Wheel Circle Container */}
                  <div 
                    className="absolute w-36 h-36 rounded-full border-2 border-[#00E5FF]/45 transition-transform duration-[4000ms] ease-out z-20 flex items-center justify-center bg-slate-950 overflow-hidden"
                    style={{ transform: `rotate(${wheelRotation}deg)` }}
                  >
                    {/* Wheel segment lines */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                      <div 
                        key={deg} 
                        className="absolute h-[140px] w-0.5 bg-slate-800/80" 
                        style={{ transform: `rotate(${deg}deg)` }}
                      />
                    ))}

                    {/* Quick text overlays inside wheel */}
                    <div className="absolute font-mono text-[6.5px] font-black text-cyan-400 rotate-0 translate-y-[-50px]">APY +15%</div>
                    <div className="absolute font-mono text-[6.5px] font-black text-rose-400 rotate-45 translate-x-[35px] translate-y-[-35px]">+250 PLS</div>
                    <div className="absolute font-mono text-[6.5px] font-black text-emerald-400 rotate-90 translate-x-[50px]">1 TH/s</div>
                    <div className="absolute font-mono text-[6.5px] font-black text-yellow-400 rotate-135 translate-x-[35px] translate-y-[35px]">BADGE</div>
                    <div className="absolute font-mono text-[6.5px] font-black text-indigo-400 rotate-180 translate-y-[50px]">VIP CH</div>
                    <div className="absolute font-mono text-[6.5px] font-black text-teal-400 rotate-225 translate-x-[-35px] translate-y-[35px]">VOUCH</div>
                    <div className="absolute font-mono text-[6.5px] font-black text-purple-400 rotate-270 translate-x-[-50px]">REDUC</div>
                    <div className="absolute font-mono text-[6.5px] font-black text-[#00E5FF] rotate-315 translate-x-[-35px] translate-y-[-35px]">MULTIP</div>
                  </div>

                  {/* Central Axis pin */}
                  <div className="absolute h-8 w-8 rounded-full bg-slate-900 border-2 border-cyan-400 z-30 flex items-center justify-center font-bold text-[9px] text-[#00E5FF] select-none">
                    🎯
                  </div>
                </div>

                <div className="p-3.5 max-w-xs mx-auto space-y-3.5 bg-slate-950/80 border border-slate-900 rounded-2xl">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-semibold text-gray-400">Available Spins Left</span>
                    <span className="font-bold text-cyan-400 font-mono">{spinCount} / 3 Daily</span>
                  </div>

                  <button 
                    onClick={runLuckySpin}
                    disabled={isSpinning || spinCount <= 0}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:brightness-110 disabled:grayscale text-white text-xs uppercase tracking-widest font-black rounded-xl cursor-pointer"
                  >
                    {isSpinning ? "🎪 Spinning..." : "🎰 Spin Now!"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* D. COINMARKETCAP EX TRADING PANEL */}
          {cryptoScreen === "trade" && (
            <div className="space-y-4 animate-fadeIn select-none">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button onClick={() => setCryptoScreen("home")} className="p-1 hover:bg-slate-800 rounded-lg">
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <div className="flex-1 flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-slate-100 flex items-center gap-1.5 leading-none">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> CoinMarketCap spot Ex
                  </h3>
                  <select 
                    value={tradePair} 
                    onChange={(e) => setTradePair(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[8.5px] font-black font-mono text-[#00E5FF]"
                  >
                    <option>BTC/USDT</option>
                    <option>ETH/USDT</option>
                    <option>SOL/USDT</option>
                    <option>BNB/USDT</option>
                    <option>DOGE/USDT</option>
                  </select>
                </div>
              </div>

              {/* Real-time canvas line chart ticker */}
              <div className="bg-[#040710] p-2 border border-slate-900 rounded-2xl relative">
                <div className="flex justify-between items-start px-2 py-1">
                  <div>
                    <span className="text-[7.5px] font-mono text-gray-500 block">MARKET PRICE INDEX</span>
                    <h2 className="text-sm font-mono font-black text-emerald-400">${tradePrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h2>
                  </div>
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 rounded font-mono font-bold font-bold leading-normal">+3.48% (Live)</span>
                </div>
                
                <canvas 
                  ref={canvasRef} 
                  width={310} 
                  height={130} 
                  className="w-full bg-[#040710] border-t border-slate-900/40 rounded-b-xl my-1"
                />
              </div>

              {/* Order form desk */}
              <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400">Trading Capital</span>
                  <span className="text-white font-mono font-bold">${walletUSDT.toLocaleString()} USDT</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-gray-500 block uppercase">Trade Size Size ({tradePair.split("/")[0]})</label>
                  <input 
                    type="number" 
                    value={cryptoAmt}
                    onChange={(e) => setCryptoAmt(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-white"
                    placeholder="0.05"
                  />
                  <span className="text-[8.5px] text-slate-500 block text-right">Estimated cost: ${(parseFloat(cryptoAmt) * tradePrice).toFixed(2)} USDT</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button 
                    onClick={() => placeDemoTrade("BUY")}
                    className="py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] uppercase rounded-xl transition-all shadow"
                  >
                    💚 BUY SPOT
                  </button>
                  <button 
                    onClick={() => placeDemoTrade("SELL")}
                    className="py-2 bg-rose-500 hover:bg-rose-600 text-white font-black text-[11px] uppercase rounded-xl transition-all shadow"
                  >
                    ❤️ SELL SPOT
                  </button>
                </div>
              </div>

              {/* Positions Panel */}
              <div className="bg-slate-950 p-4 rounded-2xl space-y-2 text-[10px]">
                <h4 className="font-bold border-b border-slate-900 pb-1.5">Open Position Indexes ({positions.length})</h4>
                <div className="space-y-2.5 max-h-[140px] overflow-y-auto">
                  {positions.map((p) => (
                    <div key={p.id} className="flex justify-between items-center border-b border-slate-900/45 pb-2">
                      <div>
                        <span className="font-black tracking-tight">{p.symbol}</span>
                        <span className={`ml-1 text-[8px] font-mono font-bold border px-1 rounded ${p.type === "BUY" ? "text-emerald-400 border-emerald-500/20" : "text-rose-500 border-rose-500/20"}`}>{p.type}</span>
                        <p className="text-[8.5px] text-gray-400">{p.amt} Units @ {p.entry}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-mono font-bold block">+ ${(Math.random() * 25).toFixed(2)} USD</span>
                        <span className="text-[8px] text-gray-500 font-mono">{p.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* E. DEEP REFERRALS & SPONSOR PROGRAM MODULE */}
          {cryptoScreen === "referral" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button onClick={() => setCryptoScreen("home")} className="p-1 hover:bg-slate-800 rounded-lg">
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <h3 className="text-xs font-black uppercase text-slate-100 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-[#00E5FF]" /> Host referral Network
                </h3>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-900 rounded-3xl text-center space-y-3 shadow shadow-cyan-500/5">
                <div className="text-yellow-400 text-3xl">🏆</div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase">Earn +120 PLS Points Stack</h4>
                  <p className="text-[10.5px] text-gray-400 leading-normal">
                    Get paid whenever your referrals make complete sandbox uploads or test the multi-app phone.
                  </p>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400 text-[10px]">Your Code:</span>
                  <span className="text-[#00E5FF] font-black tracking-wider uppercase">{senderName.substring(0, 4).toUpperCase()}-NODE</span>
                  <button onClick={() => alert("Copied referral link successfully!")} className="p-1 rounded bg-slate-800 hover:bg-slate-750">
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>
              </div>

              {/* Redeem referrer code */}
              <form onSubmit={handleRedeemReferer} className="bg-slate-950 p-4 border border-slate-900 rounded-2xl space-y-2">
                <label className="text-[9px] font-mono font-black text-gray-400 uppercase">Input Referrer Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={sponsorCode}
                    onChange={(e) => setSponsorCode(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs uppercase font-mono tracking-wider outline-none text-white focus:border-cyan-500"
                    placeholder="E.g. JADAI"
                  />
                  <button type="submit" className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold leading-normal">Redeem</button>
                </div>
              </form>

              {/* Referrals summary */}
              <div className="bg-slate-950 p-4 rounded-2xl space-y-2 text-[10px]">
                <h4 className="font-bold border-b border-slate-900 pb-1">Simulated Direct Referrals</h4>
                <div className="space-y-2">
                  {referrals.map((r, idx) => (
                    <div key={idx} className="flex justify-between border-b border-slate-900/30 pb-2 bg-slate-950">
                      <span>{r.user}</span>
                      <div className="text-right">
                        <span className="font-mono text-cyan-400 font-bold block">{r.payout}</span>
                        <span className="text-slate-500 font-mono text-[8px]">{r.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Dynamic customized Emblem banner bottom strip overlay */}
        {emblemImg && (
          <div className="absolute bottom-16 inset-x-4 bg-slate-950/90 border border-amber-500/20 rounded-xl p-2.5 flex items-center justify-between text-[10px] animate-slideUp">
            <span className="font-mono text-amber-500 font-bold">INSIGNIA VERIFICATION</span>
            <img src={emblemImg} referrerPolicy="no-referrer" alt="Custom Emblem" className="h-6 w-auto max-w-[50px] object-contain rounded" />
          </div>
        )}

        {/* Fixed Mini Phone Footer menu inside device frame layout for premium brokers */}
        <div className="absolute bottom-0 inset-x-0 bg-[#070b13] border-t border-slate-800 p-2.5 flex justify-around text-center text-gray-500 text-[9px] font-bold z-30">
          <button 
            type="button"
            onClick={() => setCryptoScreen("home")}
            className={`flex flex-col items-center gap-0.5 cursor-pointer ${cryptoScreen === "home" ? "text-[#00E5FF]" : ""}`}
          >
            <span>🏠</span>
            <span>Portfolio</span>
          </button>
          <button 
            type="button"
            onClick={() => setCryptoScreen("kyc")}
            className={`flex flex-col items-center gap-0.5 cursor-pointer ${cryptoScreen === "kyc" ? "text-cyan-400" : ""}`}
          >
            <span>👤</span>
            <span>KYC Audit</span>
          </button>
          <button 
            type="button"
            onClick={() => setCryptoScreen("trade")}
            className={`flex flex-col items-center gap-0.5 cursor-pointer ${cryptoScreen === "trade" ? "text-emerald-400" : ""}`}
          >
            <span>📈</span>
            <span>CMC Ex</span>
          </button>
          <button 
            type="button" 
            onClick={onClose} 
            className="flex flex-col items-center gap-0.5 cursor-pointer text-rose-500"
          >
            <span>🚪</span>
            <span>Exit Sim</span>
          </button>
        </div>

      </div>
    );
  };

  // ----------------------------------------------------
  // PIXEL-PERfect FINHUB BANK SIMULATION — OPay + others
  // ----------------------------------------------------
  const [transferStep, setTransferStep] = useState<'recipient' | 'amount'>('recipient');
  const [showVoucher, setShowVoucher] = useState(true);
  const [showReminder, setShowReminder] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [remarkText, setRemarkText] = useState('');
  const [remarkCategory, setRemarkCategory] = useState<'Purchase' | 'Personal' | null>(null);
  const [selectedAmount, setSelectedAmount] = useState('');
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [savingsGoal] = useState(202600);
  const [savingsProgress] = useState(45600);

  const opayTeal = '#00C5A3';
  const opayDark = '#00A389';
  const opayBg = '#F5F5F5';

  // OPay Splash Screen
  const renderOPaySplash = () => (
    <div style={{ background: opayTeal }} className="h-full flex flex-col items-center justify-between p-10 select-none">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 mb-6">
          {/* White outer ring */}
          <div className="absolute inset-0 rounded-full bg-white" />
          {/* Teal inner ring */}
          <div className="absolute inset-[5px] rounded-full" style={{ background: opayTeal }} />
          {/* White inner circle with diamond */}
          <div className="absolute inset-[10px] rounded-full bg-white flex items-center justify-center">
            <div className="w-7 h-7" style={{ background: opayTeal, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
          </div>
          {/* Small white dot at center */}
          <div className="absolute inset-[18px] rounded-full bg-white" />
        </div>
        <span style={{ color: '#0A2E2A', fontWeight: 700, fontSize: 20 }}>We are Beyond Banking</span>
      </div>
      <div className="text-center text-[10px]" style={{ color: '#0A2E2A' }}>
        🛡️ Licensed by the <strong>CBN</strong> and insured by the <strong>NDIC</strong>
      </div>
    </div>
  );

  // OPay Home Dashboard — pixel-perfect replica
  const renderOPayHome = () => (
    <div style={{ background: opayBg, fontFamily: "'Segoe UI', Arial, sans-serif" }} className="h-full flex flex-col overflow-y-auto select-none">
      <DeviceStatusBar dark={false} emblemText={emblemText} />
      {/* Header Bar */}
      <div className="bg-white px-4 py-2.5 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">
            {senderName.charAt(0)}
          </div>
          <span className="text-sm font-bold text-gray-900">Hi, {senderName} 🎮🔰💰</span>
        </div>
        <div className="flex items-center gap-2.5">
          <HelpCircle className="w-5 h-5 text-gray-500" />
          <QrCode className="w-5 h-5 text-gray-500" />
          <div className="relative">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">44</span>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-4 pt-4 pb-2">
        <div className="rounded-2xl p-4 text-white shadow-lg relative overflow-hidden" style={{ background: opayTeal }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-white" />
              <span className="text-[10px] font-semibold text-white/90">Available Balance</span>
              <button onClick={() => setIsBalanceVisible(!isBalanceVisible)} className="cursor-pointer">
                {isBalanceVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
            <span className="text-[9px] text-white/80 font-medium">Transaction History &gt;</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black tracking-tight">
                {isBalanceVisible ? formatCurrency(balance) : '****'}
              </span>
              <ChevronRight className="w-4 h-4 text-white/70" />
            </div>
            <button
              onClick={() => { setBankingStep('transfer'); setTransferStep('recipient'); }}
              className="bg-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm"
              style={{ color: opayTeal }}
            >
              + Add Money
            </button>
          </div>
        </div>
        {/* Business Service bar */}
        <div className="bg-white rounded-b-xl px-4 py-2 flex items-center gap-1 border-x border-b border-gray-100 shadow-sm">
          <span className="text-[10px]">🏪</span>
          <span className="text-[9px] text-gray-500 font-medium">Business Service - Today's Sales: ₦0.00 &gt;</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white mx-4 rounded-xl px-4 py-4 mb-2 shadow-sm">
        {/* Row 1 — To OPay, To Bank, Withdraw */}
        <div className="flex justify-around mb-5">
          {['To OPay', 'To Bank', 'Withdraw'].map((label) => (
            <button key={label} onClick={() => { setBankingStep('transfer'); setTransferStep('recipient'); }}
              className="flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: '#E8FAF5' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: opayTeal }}>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-700">{label}</span>
            </button>
          ))}
        </div>
        {/* Row 2 — Airtime, Data, Betting, TV */}
        <div className="flex justify-around mb-5">
          {['Airtime', 'Data', 'Betting', 'TV'].map((label) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#F0F0F0' }}>
                <span className="text-base">{label === 'Airtime' ? '📞' : label === 'Data' ? '📶' : label === 'Betting' ? '🎰' : '📺'}</span>
              </div>
              <span className="text-[9px] font-semibold text-gray-600">{label}</span>
            </div>
          ))}
        </div>
        {/* Row 3 — SafeBox, Loan, Invitation, More */}
        <div className="flex justify-around">
          {[{ n: 'SafeBox', emoji: '🔒' }, { n: 'Loan', emoji: '💵', hot: true }, { n: 'Invitation', emoji: '📨' }, { n: 'More', emoji: '•••' }].map((item) => (
            <div key={item.n} className="flex flex-col items-center gap-1.5 relative">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#F0F0F0' }}>
                <span className="text-base">{item.emoji}</span>
              </div>
              <span className="text-[9px] font-semibold text-gray-600">{item.n}</span>
              {item.hot && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[6px] font-bold px-1 rounded-full">🔥HOT</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Savings Section */}
      <div className="mx-4 mb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-800">Saving Challenge 2026</span>
          <span className="text-base">🎁</span>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-500 block">🎯 Special Target</span>
              <span className="text-[11px] font-bold text-gray-800">Start small daily, finish big in 2026</span>
              <div className="mt-2 bg-gray-200 rounded-full h-2 w-36">
                <div className="h-2 rounded-full" style={{ background: opayTeal, width: `${Math.min(100, (savingsProgress / savingsGoal) * 100)}%` }} />
              </div>
              <span className="text-[9px] text-gray-400 mt-1 block">{formatCurrency(savingsProgress)} / {formatCurrency(savingsGoal)}</span>
            </div>
            <button className="px-4 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: opayTeal }}>
              Go
            </button>
          </div>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="mx-4 mb-2">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <span className="text-[10px] font-bold text-gray-800">Up to ₦70 Off? Yes, Please! 🎉</span>
          <span className="text-[9px] text-gray-500 block mt-0.5">Deposit ₦300–₦1,000 and get up to ₦70 Off🌟</span>
          <div className="flex gap-1 mt-2 justify-center">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: opayTeal }} />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          </div>
        </div>
      </div>

      {/* Voucher Pop-up Modal */}
      {showVoucher && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 px-6" onClick={() => setShowVoucher(false)}>
          <div className="bg-white rounded-[20px] w-full max-w-[300px] p-6 relative" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🎟️</div>
              <div className="text-lg font-black text-gray-800">530</div>
              <div className="text-[10px] text-gray-500">Claim 15 Discounts with</div>
              <div className="text-xl font-black" style={{ color: opayTeal }}>₦99</div>
              <div className="text-[10px] text-gray-500">on any Bill</div>
            </div>
            <button className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: opayTeal }}>
              Claim 15 Discounts
            </button>
            <button onClick={() => setShowVoucher(false)} className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="mt-auto bg-white border-t border-gray-200 flex justify-around py-2.5 text-[9px] font-bold text-gray-400">
        {[
          { label: 'Home', icon: '🏠', active: true },
          { label: 'Rewards', icon: '❤️' },
          { label: 'Finance', icon: '📊' },
          { label: 'Cards', icon: '💳' },
          { label: 'Me', icon: '👤' },
        ].map((tab) => (
          <div key={tab.label} className={`flex flex-col items-center gap-0.5 ${tab.active ? 'text-emerald-500' : ''}`}>
            <span className="text-base">{tab.icon}</span>
            <span className={tab.active ? '' : ''}>{tab.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // OPay Transfer — Recipient Search
  const renderOPayTransferRecipient = () => (
    <div style={{ background: opayBg, fontFamily: "'Segoe UI', Arial, sans-serif" }} className="h-full flex flex-col overflow-y-auto select-none">
      <DeviceStatusBar dark={false} emblemText={emblemText} />
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button onClick={() => setBankingStep('home')} className="cursor-pointer"><ChevronLeft className="w-5 h-5 text-gray-700" /></button>
          <span className="text-sm font-bold text-gray-900">Transfer to OPay Account</span>
        </div>
        <span className="text-xs font-semibold" style={{ color: opayTeal }}>History</span>
      </div>

      {/* Banner Ad */}
      <div className="mx-4 mt-3 bg-gradient-to-r from-green-900 to-green-700 rounded-xl p-3 flex items-center justify-between">
        <span className="text-white text-[10px] font-bold">iLOTBET × OPay<br/>QUICK PREDICT NOW</span>
        <span className="text-yellow-400 text-[18px]">⚡</span>
      </div>

      {/* Info Strip */}
      <div className="mx-4 mt-2 flex items-center gap-1.5 px-2 py-1.5 rounded-lg" style={{ background: '#E8FAF5' }}>
        <span className="text-xs">⚡</span>
        <span className="text-[10px] font-semibold" style={{ color: opayTeal }}>Instant, Zero Issues, Free</span>
      </div>

      {/* Input */}
      <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-2">
        <input
          type="text"
          value={typedAccount}
          onChange={(e) => setTypedAccount(e.target.value)}
          placeholder="Phone No./OPay Account No./Name"
          className="flex-1 text-xs outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
          style={{ borderColor: typedAccount.length > 3 ? opayTeal : undefined }}
        />
        <QrCode className="w-5 h-5 text-gray-400" />
      </div>

      {/* Recents/Favourites Tabs */}
      <div className="mx-4 mt-4 flex items-center gap-6 border-b border-gray-200">
        <span className="text-xs font-bold pb-2 border-b-2" style={{ color: opayTeal, borderColor: opayTeal }}>Recents</span>
        <span className="text-xs text-gray-400 font-medium pb-2">Favourites</span>
      </div>

      {/* Recent Recipients */}
      <div className="mx-4 mt-3 space-y-3">
        {[
          { name: 'MAREN MANDONG MANGAI', phone: '806 969 0468', merchant: false },
          { name: 'NANBAM LILY LUKE', phone: '808 169 4422', merchant: true },
          { name: 'CHIKA UCHENNA NWODIGWE', phone: '803 456 7890', merchant: false },
        ].map((r, i) => (
          <div key={i}
            onClick={() => { setBankingStep('transfer'); setTransferStep('amount'); }}
            className="flex items-center gap-3 py-2 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              {r.name.charAt(0)}
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold text-gray-900 block">{r.name}</span>
              <span className="text-[10px] text-gray-500">{r.phone}</span>
            </div>
            {r.merchant && (
              <span className="text-[8px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#E8FAF5', color: opayTeal }}>Merchant</span>
            )}
          </div>
        ))}
      </div>

      <div className="mx-4 mt-2">
        <span className="text-xs font-semibold" style={{ color: opayTeal }}>View All &gt;</span>
      </div>

      {/* CTA Card */}
      <div className="mx-4 mt-4 p-3 rounded-xl flex items-center gap-3" style={{ background: '#E8FAF5' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: opayTeal }}>
          <UserPlus className="w-4 h-4 text-white" />
        </div>
        <span className="text-[10px] font-medium text-gray-700">See who else is using OPay — Send money to your contacts for free &gt;</span>
      </div>

      {/* More Events */}
      <div className="mx-4 mt-3 mb-4 p-3 bg-white rounded-xl border border-gray-100">
        <span className="text-xs font-bold text-gray-800">Super Voucher Package</span>
        <span className="text-[10px] text-gray-500 block">Claim 15 Discounts with ₦99 on any Bill</span>
      </div>
    </div>
  );

  // OPay Transfer — Amount Entry
  const renderOPayTransferAmount = () => {
    const quickAmounts = [500, 1000, 2000, 5000, 9999, 10000];
    return (
      <div style={{ background: opayBg, fontFamily: "'Segoe UI', Arial, sans-serif" }} className="h-full flex flex-col overflow-y-auto select-none">
        <DeviceStatusBar dark={false} emblemText={emblemText} />
        {/* Header */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={() => setTransferStep('recipient')} className="cursor-pointer"><ChevronLeft className="w-5 h-5 text-gray-700" /></button>
            <span className="text-sm font-bold text-gray-900">Transfer to OPay Account</span>
          </div>
          <span className="text-xs font-semibold" style={{ color: opayTeal }}>Records</span>
        </div>

        {/* Recipient Chip */}
        <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
            {receiverName.charAt(0)}
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900 block">{receiverName}</span>
            <span className="text-[10px] text-gray-500">{receiverPhone ? `${receiverPhone.slice(0,3)} ${receiverPhone.slice(3,6)} ${receiverPhone.slice(6)}` : '806 969 0468'}</span>
          </div>
        </div>

        {/* No Transaction Fees */}
        <div className="px-4 mt-3">
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: opayTeal }}>No Transaction Fees</span>
        </div>

        {/* Amount Section */}
        <div className="px-4 mt-4">
          <span className="text-[10px] font-bold text-gray-500 block mb-1">Amount</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-gray-900">₦</span>
            <input
              type="text"
              value={selectedAmount}
              onChange={(e) => setSelectedAmount(e.target.value.replace(/\D/g, ''))}
              placeholder="10.00 - 5,000,000.00"
              className="flex-1 text-2xl font-black text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
            />
            {selectedAmount && (
              <button onClick={() => setSelectedAmount('')} className="text-gray-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {parseInt(selectedAmount) >= 1000 && (
            <span className="text-[9px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Thousands</span>
          )}
        </div>

        {/* Quick Amount Chips */}
        <div className="px-4 mt-4">
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setSelectedAmount(String(amt))}
                className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  selectedAmount === String(amt)
                    ? 'text-white border-transparent' 
                    : 'text-gray-600 border-gray-200 bg-white'
                }`}
                style={selectedAmount === String(amt) ? { background: opayTeal, borderColor: opayTeal } : {}}
              >
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Remark */}
        <div className="px-4 mt-5">
          <span className="text-xs font-bold text-gray-800 block mb-1.5">Remark</span>
          <input
            type="text"
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            placeholder="What's this for?(Optional)"
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none text-gray-700 placeholder:text-gray-400"
          />
          <div className="flex gap-2 mt-2">
            {['Purchase', 'Personal'].map((cat) => (
              <button
                key={cat}
                onClick={() => setRemarkCategory(cat as any)}
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

        {/* Confirm Button */}
        <div className="px-4 mt-6 mb-4">
          <button
            onClick={() => setShowReminder(true)}
            className="w-full py-3 rounded-full text-sm font-bold text-white"
            style={{ background: opayTeal, opacity: !selectedAmount || parseInt(selectedAmount) < 10 ? 0.5 : 1 }}
            disabled={!selectedAmount || parseInt(selectedAmount) < 10}
          >
            Confirm
          </button>
        </div>

        {/* Reminder Modal */}
        {showReminder && (
          <div className="absolute inset-0 bg-black/50 flex items-end z-50" onClick={() => setShowReminder(false)}>
            <div className="bg-white rounded-t-[20px] w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-center text-sm font-bold text-gray-900 mb-3">Reminder</h3>
              <p className="text-[11px] text-gray-500 text-center mb-4">Double check the transfer details before you proceed. Please note that successful transfers cannot be reversed.</p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs mb-4">
                <div className="flex justify-between"><span className="text-gray-400">Name</span><span className="font-bold text-gray-900">{receiverName}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Account No.</span><span className="font-bold text-gray-900">{receiverAccount || '8081694422'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Bank</span><span className="font-bold text-gray-900">OPay</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount</span>
                  <span className="font-bold text-gray-900">₦{parseInt(selectedAmount || '0').toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowReminder(false)} className="flex-1 py-2.5 rounded-full border-2 text-xs font-bold" style={{ borderColor: opayTeal, color: opayTeal }}>
                  Recheck
                </button>
                <button
                  onClick={() => { setShowReminder(false); setShowPaymentSheet(true); }}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold text-white" style={{ background: opayTeal }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Sheet */}
        {showPaymentSheet && (
          <div className="absolute inset-0 bg-black/50 flex items-end z-50" onClick={() => setShowPaymentSheet(false)}>
            <div className="bg-white rounded-t-[20px] w-full p-6 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <div />
                <span className="text-sm font-black text-gray-900">₦{parseInt(selectedAmount || '0').toLocaleString()}.00</span>
                <button onClick={() => setShowPaymentSheet(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <hr className="border-t border-gray-100 mb-3" />
              <div className="space-y-2 text-xs mb-4">
                <div className="flex justify-between"><span className="text-gray-400">Account Number</span><span className="text-gray-900 font-semibold">808 169 4422</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Name</span><span className="text-gray-900 font-bold">{receiverName}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount</span>
                  <span className="flex items-center gap-1"><span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Thousands</span><span className="font-bold text-gray-900">₦{parseInt(selectedAmount || '0').toLocaleString()}.00</span></span>
                </div>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-gray-700">Payment Method</span>
                <span className="text-xs font-semibold" style={{ color: opayTeal }}>All &gt;</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs mb-4">
                <div className="flex items-center gap-1.5">
                  <Info className="w-3 h-3 text-gray-400" />
                  <span className="font-semibold text-gray-700">Available Balance</span>
                  <span className="font-bold" style={{ color: opayTeal }}>{formatCurrency(balance)}</span>
                </div>
                {parseInt(selectedAmount || '0') > balance && (
                  <span className="text-red-500 text-[10px] font-semibold block">Insufficient balance</span>
                )}
                <hr className="border-t border-dashed border-gray-300 my-2" />
                <div className="flex justify-between"><span className="text-gray-500">Wallet</span><span className="font-semibold text-gray-700">{formatCurrency(Math.max(0, balance - 30570))}</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">OWealth</span>
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700">{formatCurrency(30570)}</span>
                    <span className="text-xs font-semibold" style={{ color: opayTeal }}>Add Money &gt;</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => { setShowPaymentSheet(false); setBankingStep('loading'); setTimeout(() => setBankingStep('done'), 2500); }}
                className="w-full py-3 rounded-full text-sm font-bold text-white"
                style={{ background: opayTeal, opacity: parseInt(selectedAmount || '0') > balance ? 0.4 : 1 }}
                disabled={parseInt(selectedAmount || '0') > balance}
              >
                {parseInt(selectedAmount || '0') > balance ? 'Insufficient Balance' : 'Pay'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // OPay Loading Screen
  const renderOPayLoading = () => (
    <div style={{ background: opayBg }} className="h-full flex flex-col items-center justify-center select-none">
      <DeviceStatusBar dark={false} emblemText={emblemText} />
      <div className="flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-gray-300 border-t-[#00C5A3] animate-spin flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-b-[#00C5A3] animate-spin" />
        </div>
      </div>
      <span className="text-xs text-gray-400 mt-4 font-medium">Processing transfer...</span>
    </div>
  );

  // OPay Done / Receipt
  const renderOPayDone = () => (
    <div style={{ background: opayBg, fontFamily: "'Segoe UI', Arial, sans-serif" }} className="h-full flex flex-col overflow-y-auto select-none">
      <DeviceStatusBar dark={false} emblemText={emblemText} />
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button onClick={() => { setBankingStep('home'); setTransferStep('recipient'); setSelectedAmount(''); setShowPaymentSheet(false); setShowReminder(false); }} className="cursor-pointer">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <span className="text-sm font-bold text-gray-900">Transaction Details</span>
        </div>
        <div className="w-7 h-7 rounded-full flex items-center justify-center border border-gray-200">
          <svg className="w-3.5 h-3.5" style={{ color: opayTeal }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
        </div>
      </div>

      {/* Receipt Content */}
      <div className="px-4 pt-6 pb-4">
        {/* Logo - OPay concentric circles */}
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
          <span className="text-sm font-bold text-gray-900">{receiverName}</span>
        </div>
        <div className="text-center mb-1">
          <span className="text-3xl font-black text-gray-900">₦{parseInt(selectedAmount || amount.toString()).toLocaleString()}.00</span>
        </div>
        <div className="flex items-center justify-center gap-1 mb-5">
          <Check className="w-4 h-4" style={{ color: opayTeal }} />
          <span className="text-sm font-semibold" style={{ color: opayTeal }}>Successful</span>
        </div>

        {/* Transaction Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-3">
          <div className="px-4 py-2.5 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-800">Transaction Details</span>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="px-4 py-2.5">
              <span className="text-[10px] text-gray-400 block">Recipient Details</span>
              <span className="text-xs font-bold text-gray-900 block">{receiverName}</span>
              <span className="text-[10px] text-gray-500">OPay | {receiverPhone ? `${receiverPhone.slice(0,3)} ${receiverPhone.slice(3,6)} ${receiverPhone.slice(6)}` : '806 969 0468'}</span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block">Transaction No.</span>
                <span className="text-[10px] font-mono text-gray-700">{transactionId || '260602010100978953180555'}</span>
              </div>
              <button onClick={() => navigator.clipboard.writeText(transactionId)} className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: opayTeal }}>
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Payment Method</span>
              <span className="text-[10px] font-semibold text-gray-700 flex items-center gap-1">
                OWealth <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Transaction Date</span>
              <span className="text-[10px] text-gray-700 font-medium">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* More Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="px-4 py-2.5 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-800">More Actions</span>
          </div>
          <div className="flex divide-x divide-gray-100">
            <button className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-bold" style={{ color: opayTeal }}>
              <RotateCcw className="w-3.5 h-3.5" /> Transfer Again
            </button>
            <button className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-bold" style={{ color: opayTeal }}>
              <Clock className="w-3.5 h-3.5" /> View Records
            </button>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="flex gap-3 mb-4">
          <button className="flex-1 py-2.5 rounded-full border-2 text-xs font-bold" style={{ borderColor: opayTeal, color: opayTeal }}>
            Report Issue
          </button>
          <button className="flex-1 py-2.5 rounded-full text-xs font-bold text-white" style={{ background: opayTeal }}
            onClick={() => {
              onFinishSimulation({
                bank, senderName, receiverName, receiverBank,
                amount: parseFloat(selectedAmount || amount.toString()),
                dateTime: new Date().toLocaleString(),
                transactionId: transactionId || '260602010100978953180555',
                reference: remarkText || reference,
                balance,
                customField: '',
              });
            }}
          >
            Share Receipt
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-[9px] uppercase tracking-widest text-gray-400">
          Licensed by the CBN and insured by the NDIC
        </div>
      </div>
    </div>
  );

  // Bank simulation router — OPay gets full pixel-perfect, others use fallback
  const renderOPaySimulation = () => {
    switch (bankingStep) {
      case 'splash': return renderOPaySplash();
      case 'home': return renderOPayHome();
      case 'transfer': return transferStep === 'recipient' ? renderOPayTransferRecipient() : renderOPayTransferAmount();
      case 'confirm': return renderOPayHome(); // fallback
      case 'loading': return renderOPayLoading();
      case 'done': return renderOPayDone();
      default: return renderOPayHome();
    }
  };

  // ----------------------------------------------------------------------------------
  // CORE COMPONENT SHELL WRAPPER
  // ----------------------------------------------------------------------------------
  const renderInteractiveBezelAndViewport = () => {
    return (
      <div className="w-full h-full max-w-[420px] md:max-w-[350px] md:h-[max(620px,85vh)] md:border-[10px] md:border-slate-900 md:rounded-[3rem] bg-[#F5F6FA] md:shadow-2xl relative overflow-hidden flex flex-col select-none border-b border-transparent mx-auto">
        {/* Physical Camera Notch Bezel on desktop only */}
        <div className="hidden md:flex absolute top-0 inset-x-0 h-5 bg-black z-50 justify-center items-center gap-1 rounded-b-2xl">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          <span className="w-10 h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Content Viewports with active routing */}
        <div className="flex-1 md:pt-3.5 overflow-hidden relative bg-[#FAF9F6] h-full">
          {isCryptoBroker ? renderCryptoBrokerApp() : renderOPaySimulation()}
        </div>

        {/* Physical Home Indicator bar pill on bottom of desktop bezel */}
        <div className="hidden md:flex bg-black h-4 justify-center items-center rounded-t-lg">
          <span className="w-16 h-0.5 bg-slate-800 rounded-full" />
        </div>
      </div>
    );
  };

  // If isInline is true, we skip the fixed backdrop overlay, rendering inline directly. Extremely helpful for dashboards!
  if (isInline) {
    return renderInteractiveBezelAndViewport();
  }

  return (
    <div className="fixed inset-0 z-[9999] backdrop-blur-md flex flex-col items-center justify-center p-4" style={{ background: bank.toLowerCase() === 'opay' ? '#00C5A3' : '#070b13' }}>
      {/* Absolute closer outside design */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 bg-black/20 text-white rounded-full p-2 hover:bg-black/30 shadow"
      >
        <X className="w-5 h-5" />
      </button>

      {renderInteractiveBezelAndViewport()}
    </div>
  );
}
