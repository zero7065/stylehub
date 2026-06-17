import React, { useState, useEffect } from "react";
import { 
  Sparkles, ShieldCheck, ShoppingBag, Radio, Shield, HelpCircle, 
  TrendingUp, CreditCard, ChevronRight, ChevronLeft, Award, Compass, Star, 
  Lock, Eye, Flame, Users, Landmark, Layers, ArrowUpRight, CheckCircle2, Globe, Heart, Quote,
  Smartphone, Wifi
} from "lucide-react";
import { User, GalleryItem, MarketplaceListing, SystemSettings } from "../types";
import AuthCard from "./AuthCard";

interface BentoHomepageProps {
  user: User | null;
  settings: SystemSettings | null;
  galleryItems: GalleryItem[];
  mktListings: MarketplaceListing[];
  packages: any[];
  selectedPackageId: string;
  setSelectedPackageId: (id: string) => void;
  isBuyingPoints: boolean;
  onSimulatePointsBuy: () => void;
  onAuthSuccess: (user: User) => void;
  onNavigate: (tab: "home" | "marketplace" | "blackroom" | "profile" | "brokers") => void;
}

export default function BentoHomepage({
  user,
  settings,
  galleryItems,
  mktListings,
  packages,
  selectedPackageId,
  setSelectedPackageId,
  isBuyingPoints,
  onSimulatePointsBuy,
  onAuthSuccess,
  onNavigate,
}: BentoHomepageProps) {
  // Demo iframe template modal
  const [demoTemplate, setDemoTemplate] = useState<GalleryItem | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Telecom state management
  const [rechargeNetwork, setRechargeNetwork] = useState<"mtn" | "airtel" | "glo" | "9mobile">("mtn");
  const [rechargeType, setRechargeType] = useState<"airtime" | "data">("airtime");
  const [rechargePhone, setRechargePhone] = useState("");
  const [customAirtime, setCustomAirtime] = useState("500");
  const [dataPackage, setDataPackage] = useState("data_1gb");
  const [isProcessingRecharge, setIsProcessingRecharge] = useState(false);
  const [rechargeMessage, setRechargeMessage] = useState<string | null>(null);
  const [rechargeErr, setRechargeErr] = useState<string | null>(null);

  const pointsCost = rechargeType === "airtime" 
    ? Math.round((parseFloat(customAirtime) || 0) / 10)
    : dataPackage === "data_1gb" ? 150
    : dataPackage === "data_2gb" ? 350
    : dataPackage === "data_5gb" ? 600
    : dataPackage === "data_10gb" ? 1100
    : 2500;

  const handleTelecomRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("🔒 Authorization Gated: Please log-in or register before completing the telecom exchange.");
      return;
    }
    if (!rechargePhone || rechargePhone.trim().length < 10) {
      alert("❌ Invalid input: Please check the phone number coordinates.");
      return;
    }
    if (user.points < pointsCost) {
      alert(`❌ Overdrawn Balance: You require ${pointsCost} PLS points, but you currently have ${user.points} PLS. Please top-up via subscription/paystack modal first.`);
      return;
    }

    setRechargeMessage(null);
    setRechargeErr(null);
    setIsProcessingRecharge(true);

    try {
      const res = await fetch("/api/telco/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          network: rechargeNetwork.toUpperCase(),
          type: rechargeType,
          phone: rechargePhone.trim(),
          payloadId: rechargeType === "data" ? dataPackage : undefined,
          amountNaira: rechargeType === "airtime" ? parseFloat(customAirtime) || 100 : undefined,
          pointsCost
        })
      });

      const data = await res.json();
      if (data.success) {
        setRechargeMessage(data.message || "🎉 Recharge completed successfully!");
        
        // Refresh session
        try {
          const uRes = await fetch("/api/auth/me", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id })
          });
          const uData = await uRes.json();
          if (uData.success) {
            onAuthSuccess(uData.user);
          }
        } catch (errSession) {
          console.error("Local session refresh error:", errSession);
        }
      } else {
        setRechargeErr(data.error || "External carrier signals dropped the packets.");
      }
    } catch (carrierErr) {
      console.error(carrierErr);
      setRechargeErr("Failed to connect to telecommunication dispatch node.");
    } finally {
      setIsProcessingRecharge(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 4);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Pre-seeded brokers to showcase trust score index
  const seededBrokers = [
    { alias: "💎 DiamondDealer", score: 100, volume: "12,480 PLS", active: true },
    { alias: "🔥 Carbon", score: 99, volume: "8,920 PLS", active: true },
    { alias: "⚡ FastTrader", score: 97, volume: "19,500 PLS", active: true },
    { alias: "🔮 Lithium", score: 98, volume: "6,300 PLS", active: false },
    { alias: "🌿 Helium", score: 95, volume: "4,120 PLS", active: true },
  ];

  const slides = [
    {
      title: "High-Fidelity Receipt Simulation",
      topic: "FINTECH MOCK SYSTEM",
      desc: "Simulate pixel-perfect transactions with customizable fees, booster logos, and authentic bank loading animations for 9 tier-1 Nigerian banks.",
      accent: "text-cyan-400",
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Shielded Escrow Digital Settlement",
      topic: "SECURE DIGITAL TRADING",
      desc: "Acquire validated foreign numbers, workspace accounts, or rent professional developers. Points lock in strict escrow covenants until fully reviewed.",
      accent: "text-emerald-400",
      image: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Double-Cipher Black Room Chamber",
      topic: "THE ANONYMOUS RING",
      desc: "Operate securely under coordinate-hidden chemical aliases. Direct email addresses and workspace traces are protected from public listings.",
      accent: "text-[#00E5FF]",
      image: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Advanced Bento UI Layout Framework",
      topic: "MODERN DASHBOARD Layout",
      desc: "Streamlined dark slate bento aesthetic grid, real-time activity tickers, automated Paystack integration simulators, and custom AML gateways.",
      accent: "text-teal-400",
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  // Simulated ratings/testimonials
  const reviews = [
    { user: "💎 DiamondTrader_77", text: "StyleHub escrow is bulletproof. Bought 3 foreign USA numbers with instant automatic deliveries.", stars: 5 },
    { user: "⚡ CryptoLord_NG", text: "The OPay and Kuda transfer flows are ridiculously polished. Replicates the real applications down to the exact loading spinners.", stars: 5 },
    { user: "🔥 NitroSales", text: "Admin processes withdrawals extremely quickly. Best platform in the ecosystem for digital brokers.", stars: 5 }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. HERO BENTO PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Brand Hero block */}
        <div className="lg:col-span-8 bg-gradient-to-br from-[#0e1424] via-[#090b11] to-[#0d0f17] border border-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl min-h-[340px]">
          {/* Accent decoration vector rings */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full border border-cyan-500/10 pointer-events-none" />
          <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full border-2 border-cyan-500/5 pointer-events-none" />
          
          <div className="space-y-4 relative z-10 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-[#00E5FF] text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
                <Sparkles className="w-3.5 h-3.5" /> Active • V2.4 Enterprise
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10.5px] font-bold shadow-sm select-none">
                <span className="text-gray-500 text-[8px] font-mono uppercase tracking-widest mr-0.5">SPONSORED BY</span>
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#4285F4]">g</span>
                <span className="text-[#34A853]">l</span>
                <span className="text-[#EA4335]">e</span>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
              Simulate, Trade, Escrow <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[#00E5FF] to-teal-400">
                Beyond Boundaries.
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Empowering digital vendors with ultra-precise fintech simulator flows, a completely coordinate-hidden Black Room trading circle, verified escrow agreements, and automatic point settlements. Fully powered by Jadai Studios.
            </p>
          </div>

          {/* Interactive animated stat badges inside Hero */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800 relative z-10">
            <div className="text-left">
              <span className="text-gray-500 text-[9px] font-mono block uppercase tracking-widest font-black">ACTIVE MEMBERS</span>
              <span className="text-xl font-black text-white block mt-0.5 font-mono">15,481 <span className="text-[#00E5FF] text-sm">+</span></span>
            </div>
            <div className="text-left">
              <span className="text-gray-500 text-[9px] font-mono block uppercase tracking-widest font-black">MOCKS SIMULATED</span>
              <span className="text-xl font-black text-[#00E5FF] block mt-0.5 font-mono">429,910</span>
            </div>
            <div className="text-left">
              <span className="text-gray-500 text-[9px] font-mono block uppercase tracking-widest font-black">SECURE VOLUMES</span>
              <span className="text-xl font-black text-emerald-400 block mt-0.5 font-mono">99.98%</span>
            </div>
            <div className="text-left">
              <span className="text-gray-500 text-[9px] font-mono block uppercase tracking-widest font-black">CREATOR EMBLEM</span>
              <span className="text-[10px] text-gray-300 block truncate mt-1">Jadai Studios®</span>
            </div>
          </div>
        </div>

        {/* Guest Login panel or Quick Account HUD */}
        <div className="lg:col-span-4 flex justify-center items-center">
          {user ? (
            <div className="w-full bg-[#0E131F] border border-slate-800 p-6 rounded-3xl flex flex-col justify-between h-full min-h-[340px] relative overflow-hidden shadow-xl">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">YOUR SESSION COORDINATES</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                
                <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl space-y-2">
                  <span className="text-[9px] text-gray-500 block font-mono">AUTHORIZED ID DIRECT INTEGRITY:</span>
                  <span className="text-xs font-bold text-white block truncate">{user.email}</span>
                  <span className="text-[9px] text-[#00E5FF] font-mono font-black uppercase tracking-widest bg-cyan-950/45 border border-cyan-500/20 px-2 py-0.5 rounded inline-block mt-2">
                    {user.role === "admin" ? "👑 PLATFORM ADMIN ACCESS" : "👥 VERIFIED MEMBER"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <button 
                    onClick={() => onNavigate("generator")} 
                    className="p-3 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl font-bold font-mono text-cyan-400 transition-all cursor-pointer"
                  >
                    🚀 RUN FLOWS
                  </button>
                  <button 
                    onClick={() => onNavigate("marketplace")} 
                    className="p-3 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl font-bold font-mono text-[#00E5FF] transition-all cursor-pointer"
                  >
                    🛍️ OPEN SHOP
                  </button>
                </div>
              </div>

              {/* Quick referral code promotion block */}
              <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-2xl text-[10px] space-y-1 mt-4">
                <span className="text-gray-500 font-mono block">YOUR REFERRAL LINK (10% BONUS):</span>
                <span className="text-slate-300 font-bold block select-all font-mono text-[11px] bg-slate-950 p-1 rounded border border-slate-900 text-center text-cyan-300">
                  {user.referral_code}
                </span>
              </div>
            </div>
          ) : (
            <AuthCard onAuthSuccess={onAuthSuccess} />
          )}
        </div>
      </div>

      {/* 2. HOW IT WORKS LANDING EXPLANATORY ROW */}
      <div className="bg-[#0B0E14]/80 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5 mb-5">
          <div>
            <h2 className="text-md font-black uppercase text-[#00E5FF] tracking-wider flex items-center gap-2">
              <Landmark className="w-5 h-5 text-cyan-400" /> StyleHub Protective Protocol Ledger
            </h2>
            <p className="text-[11px] text-gray-500 leading-normal font-mono">
              Secure bento pipeline from points packages entry to manual withdrawals safely processed at 100 PTS = $1 USDT.
            </p>
          </div>
          <span className="text-[9.5px] font-mono text-[#00C5A3] uppercase font-bold border border-emerald-500/30 bg-emerald-950/20 px-2.5 py-1 rounded inline-block">
            ● ESCROW FULL TRANSACTION SHIELD ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-2.5 p-4 border border-slate-800 rounded-2xl bg-slate-900/20">
            <span className="h-6 w-6 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 flex items-center justify-center font-black font-mono">1</span>
            <h4 className="font-bold text-white text-xs">Convert & Load Points</h4>
            <p className="text-[11.5px] text-slate-300 leading-relaxed font-normal">
              Select points packages through simulated Paystack secure sandbox credentials. Instantly credited with zero platform network fees.
            </p>
          </div>
          <div className="space-y-2.5 p-4 border border-slate-800 rounded-2xl bg-slate-900/20">
            <span className="h-6 w-6 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 flex items-center justify-center font-black font-mono">2</span>
            <h4 className="font-bold text-white text-xs">Commit & Hold Escrow</h4>
            <p className="text-[11.5px] text-slate-300 leading-relaxed font-normal">
              Choose digital items, buy templates, or enlist custom developers. Points lock automatically in escrow until you approve and sign-off.
            </p>
          </div>
          <div className="space-y-2.5 p-4 border border-slate-800 rounded-2xl bg-slate-900/20">
            <span className="h-6 w-6 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 flex items-center justify-center font-black font-mono">3</span>
            <h4 className="font-bold text-white text-xs">Satisfied Settlement Code</h4>
            <p className="text-[11.5px] text-slate-300 leading-relaxed font-normal">
              Once templates are verified or accounts are transferred, release the escrow manually. Ready to withdraw points for dollar USDT cashouts.
            </p>
          </div>
        </div>
      </div>

      {/* 3. BENTO MID GRID: CAROUSEL WIDGET & PREMIUM BROKERS DIRECTORY */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Dynamic sliding features card with dynamic sliding photos */}
        <div className="md:col-span-7 bg-[#0E131F]/90 border border-slate-800 rounded-3xl relative overflow-hidden min-h-[300px] sm:min-h-[320px] shadow-2xl flex flex-col justify-end group">
          {/* Main Background Slide Image with Crossfade */}
          <div className="absolute inset-0 z-0">
            <img 
              src={slides[activeSlide].image} 
              alt={slides[activeSlide].title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover brightness-[0.35] contrast-[1.05] transition-all duration-700 ease-out scale-105 group-hover:scale-100"
            />
            {/* Elegant vignette layout & light filters */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-[#0E131F]/60 to-[#080B10]/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080B10]/40 via-transparent to-[#080B10]/20" />
          </div>

          {/* Interactive Prev/Next Arrows overlaying on hover */}
          <button
            onClick={() => setActiveSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-9 w-9 flex items-center justify-center rounded-full bg-slate-950/80 border border-slate-800 text-gray-400 hover:text-white hover:bg-slate-900 hover:border-cyan-500/40 opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-90 cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setActiveSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0))}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-9 w-9 flex items-center justify-center rounded-full bg-slate-950/80 border border-slate-800 text-gray-400 hover:text-white hover:bg-slate-900 hover:border-cyan-500/40 opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-90 cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Slide Content positioned overlay at bottom */}
          <div className="relative z-10 p-6 sm:p-8 space-y-2.5 max-w-xl">
            <span className={`inline-block text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-slate-950/85 border border-slate-800/80 ${slides[activeSlide].accent}`}>
              {slides[activeSlide].topic}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white leading-tight flex items-center gap-2 drop-shadow-md">
              <Eye className="w-5 h-5 text-cyan-400 shrink-0" /> {slides[activeSlide].title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-normal drop-shadow-sm">
              {slides[activeSlide].desc}
            </p>

            {/* Bottom Slider Index & Bullets Row */}
            <div className="flex justify-between items-center pt-3.5 border-t border-slate-800/40 mt-3">
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeSlide === i ? "w-5 bg-[#00E5FF]" : "w-1.5 bg-slate-800 hover:bg-slate-700"
                    }`}
                    aria-label={`Go to slide ${i+1}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setActiveSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0))}
                className="text-[10px] font-bold text-cyan-400 hover:text-white flex items-center gap-1 transition-all cursor-pointer uppercase font-mono bg-slate-950/60 py-1 px-2.5 rounded-lg border border-slate-805 hover:border-cyan-500/20"
              >
                Skip Next <ChevronRight className="w-3 h-3 text-cyan-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Pre-seeded verified Room Brokers ledger previews */}
        <div className="md:col-span-5 bg-[#0e1424]/40 border border-slate-800/80 rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="text-xs font-black uppercase text-[#00E5FF] tracking-wider">Verified Room Brokers</h3>
            <span className="text-[9px] text-[#00C5A3] font-mono uppercase bg-emerald-950/20 px-2 rounded">TRUST INDEX SECURE</span>
          </div>
          
          <div className="divide-y divide-slate-800/80 space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
            {seededBrokers.map((bk, i) => (
              <div key={i} className="pt-2 flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200">{bk.alias}</span>
                  <p className="text-[10px] text-gray-500 font-mono">Assigned volume: {bk.volume}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10.5px] font-mono font-bold text-cyan-400 bg-cyan-950/30 border border-cyan-500/20 px-2 py-0.5 rounded">
                    Score: {bk.score}%
                  </span>
                  <span className="block text-[8.5px] text-gray-600 mt-0.5 font-mono">
                    {bk.active ? "● ACTIVE ROOM" : "○ OFFLINE"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex justify-end">
            <button
              onClick={() => onNavigate("brokers")}
              className="text-[10px] font-mono font-bold text-cyan-400 hover:text-white flex items-center gap-1 transition-all cursor-pointer bg-slate-950 border border-slate-800 py-1.5 px-3 rounded-lg leading-tight hover:border-cyan-500/20"
            >
              Access Autonomous Crypto Terminals ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* 4. TEMPLATE GALLERY DIRECTORY: WITH WORKING MODAL PREVIEW & PURCHASE BUTTONS */}
      <div className="bg-[#0B0E14]/80 border border-slate-800 p-6 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-md font-black uppercase text-[#00E5FF] tracking-wider flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" /> Premium Website Templates Gallery
            </h3>
            <p className="text-[11px] text-gray-500 leading-normal font-mono">
              Live design mocks built for fintech portals. Click "Run Demo Preview" to review files in sandbox frames with watermarks.
            </p>
          </div>
          <span className="text-[10px] font-mono text-gray-400">Total Available: {galleryItems.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((git) => (
            <div key={git.id} className="bg-[#0e1424] border border-slate-800 rounded-3xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden hover:border-slate-800 transition-all">
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden h-36 bg-slate-950">
                  <img
                    src={git.preview_image}
                    alt={git.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover select-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e1424] via-transparent to-transparent opacity-85" />
                  <div className="absolute top-2 right-2 bg-[#0B0E14]/90 border border-slate-800 text-[9px] font-mono text-cyan-400 px-2 py-0.5 rounded">
                    {git.price_points} PLS PTS
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white tracking-tight">{git.title}</h4>
                  <p className="text-[11px] text-gray-400 font-normal leading-relaxed">{git.description}</p>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between text-[11px] gap-2">
                <button
                  onClick={() => setDemoTemplate(git)}
                  className="flex-1 py-1 px-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg font-bold text-center transition-all cursor-pointer"
                >
                  🌐 Run Demo Preview
                </button>
                <button
                  onClick={() => {
                    if (!user) {
                      alert("Please login or create credentials above, then load points to activate instantly.");
                      return;
                    }
                    onNavigate("marketplace");
                  }}
                  className="py-1 px-3.5 bg-cyan-500 hover:brightness-110 text-gray-950 rounded-lg font-black block text-center transition-all cursor-pointer"
                >
                  Buy Code
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. NINE HIGH-FIDELITY APP SIMULATORS SPECS & AD PREVIEWS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ad highlights specs */}
        <div className="lg:col-span-2 bg-[#0E131F] border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#00E5FF]">
            ⚡ 9 APP TRANSFER FLOW SIMULATORS
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            Unlike basic landing receipt screens, StyleHub provides full-flow interactive transaction simulators for OPay, Kuda, Moniepoint, PalmPay, and 5 Traditional Nigerian banks! Move through splash loaders, recipient searches, confirmation modals, loading screens, and final transparent vector receipt states.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-[10px] font-mono font-bold text-slate-300">
            <div className="p-2.5 border border-slate-800 rounded-xl bg-slate-950">
              <span className="text-[#00C5A3] block font-black">OPAY BRAND</span>
              <span className="text-gray-500 mt-1 block">Full Flow Replicated</span>
            </div>
            <div className="p-2.5 border border-slate-800 rounded-xl bg-slate-950">
              <span className="text-[#00E5FF] block font-black">KUDA APP</span>
              <span className="text-gray-500 mt-1 block">Minimal black screens</span>
            </div>
            <div className="p-2.5 border border-slate-800 rounded-xl bg-slate-950">
              <span className="text-yellow-400 block font-black">PALMPAY</span>
              <span className="text-gray-500 mt-1 block">Double style receipt</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate("generator")}
              className="py-2 px-4 bg-[#0B0E14] border border-slate-800 text-[#00E5FF] hover:text-white font-mono font-bold rounded-xl text-[10.5px] transition-all cursor-pointer"
            >
              ▶ Run Simulator Dashboard Now
            </button>
          </div>
        </div>

        {/* SSMP panel information detailing */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[9px] font-mono font-bold text-[#00C5A3] uppercase bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/20 inline-block">
              PLATFORM BOOSTING INFO
            </span>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">SSMP Engagement Boosts</h4>
            <p className="text-[12px] text-gray-400 leading-relaxed">
              Accelerate digital proof parameters! StyleHub allows listing foreign active lines (+1 US VOIP lines), social media account creator bundles, and verified SSM boosts handled through automated developer checkouts.
            </p>
          </div>
          <button
            onClick={() => onNavigate("marketplace")}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold rounded-xl text-center text-slate-300 transition-all cursor-pointer"
          >
            Review SSMP Inventory
          </button>
        </div>
      </div>

      {/* 6. TOPUP PACKAGES & PAYSTACK SIMULATED GATEWAY */}
      <div className="bg-slate-900/60 p-6 border border-slate-800 rounded-3xl space-y-5">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="space-y-0.5">
            <h3 className="text-xs font-black tracking-wider uppercase text-[#00E5FF]">REDEEM POINTS TOP-UP SHOP SHOWCASE</h3>
            <p className="text-[10px] text-gray-500 font-mono">100 POINTS = 1 USDT (minimum cashout threshold: 1,000 PTS)</p>
          </div>
          <Award className="w-5 h-5 text-[#00E5FF] animate-pulse" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackageId(pkg.id)}
              className={`p-3.5 text-left border rounded-2xl flex flex-col justify-between transition-all cursor-pointer relative ${
                selectedPackageId === pkg.id
                  ? "border-[#00E5FF] bg-cyan-950/25 text-white shadow-lg shadow-cyan-500/10"
                  : "border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-800"
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-[10px] font-black hover:text-white block truncate">{pkg.name}</span>
                <span className="text-sm font-black font-mono text-cyan-400 mt-1 block">+{pkg.points} PTS</span>
              </div>
              <span className="text-[9.5px] text-gray-500 font-sans mt-3 block font-medium">Value: ${pkg.usd} USD</span>
            </button>
          ))}
        </div>

        <div className="flex gap-4 flex-col sm:flex-row justify-between items-center pt-2">
          <p className="text-[11px] text-gray-400 leading-relaxed font-mono text-center sm:text-left">
            Simply pick your points pack package and trigger instant automatic credentials credit via Simulated Paystack credentials below.
          </p>
          <button
            onClick={() => {
              if (!user) {
                alert("Please log in or register before completing simulated points store top-up.");
                return;
              }
              onSimulatePointsBuy();
            }}
            disabled={isBuyingPoints}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 font-black rounded-xl text-xs uppercase shadow-lg shadow-cyan-500/20 tracking-wider transition-all cursor-pointer hover:brightness-110 shrink-0"
          >
            {isBuyingPoints ? "Processing Gateway Matrix..." : "Simulate Paystack Checkout"}
          </button>
        </div>
      </div>

      {/* 6B. INSTANT MOBILE TELECOMMUNICATION & DATA EXCHANGE */}
      <div className="bg-slate-900/40 p-6 border border-slate-800 rounded-3xl space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
          <div className="space-y-0.5">
            <h3 className="text-xs font-black tracking-wider uppercase text-[#00E5FF] flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> ⚡ TELCO AIRTIME & SUPER-FAST DATA EXCHANGE
            </h3>
            <p className="text-[10px] text-gray-500 font-mono">
              DIRECT CELLULAR INJECTION CORE • NO FEES • BALANCED POINT DISTRIBUTION
            </p>
          </div>
          <span className="text-[9px] font-mono font-bold bg-cyan-950/40 border border-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded shadow-inner">
            CARRIER HOSTS LIVE
          </span>
        </div>

        <form onSubmit={handleTelecomRechargeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Network & Details */}
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider block mb-2">
                1. Select Network Carrier Provider
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "mtn", name: "MTN", color: "border-yellow-500 text-yellow-400 bg-yellow-950/20" },
                  { id: "airtel", name: "Airtel", color: "border-red-500 text-red-400 bg-red-950/20" },
                  { id: "glo", name: "Glo", color: "border-green-500 text-green-400 bg-green-950/20" },
                  { id: "9mobile", name: "9mobile", color: "border-teal-500 text-teal-400 bg-teal-950/20" }
                ].map((net) => (
                  <button
                    key={net.id}
                    type="button"
                    onClick={() => {
                      setRechargeNetwork(net.id as any);
                      setRechargeMessage(null);
                      setRechargeErr(null);
                    }}
                    className={`p-2.5 text-center border-2 rounded-xl font-bold font-mono text-xs transition-all cursor-pointer block ${
                      rechargeNetwork === net.id
                        ? `${net.color} ring-1 ring-cyan-400/50`
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {net.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider block mb-2">
                  2. Exchange Category
                </label>
                <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setRechargeType("airtime");
                      setRechargeMessage(null);
                      setRechargeErr(null);
                    }}
                    className={`py-1.5 text-[10px] font-bold font-mono tracking-wide rounded-md transition-all cursor-pointer ${
                      rechargeType === "airtime"
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Airtime
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRechargeType("data");
                      setRechargeMessage(null);
                      setRechargeErr(null);
                    }}
                    className={`py-1.5 text-[10px] font-bold font-mono tracking-wide rounded-md transition-all cursor-pointer ${
                      rechargeType === "data"
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Mobile Data
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider block mb-2">
                  3. Phone Number (SIM)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 08031234567"
                  value={rechargePhone}
                  onChange={(e) => setRechargePhone(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none focus:border-cyan-400 placeholder:text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Price Calculation & Trigger */}
          <div className="bg-slate-950/60 p-[18px] border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {rechargeType === "airtime" ? (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider block mb-1.5">
                    Select Airtime Amount (₦ Naira)
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {["200", "500", "1000", "2000", "5000", "10000"].map((pres) => (
                      <button
                        key={pres}
                        type="button"
                        onClick={() => setCustomAirtime(pres)}
                        className={`py-1.5 font-mono text-xs font-bold border rounded-lg transition-all cursor-pointer ${
                          customAirtime === pres
                            ? "border-cyan-400 text-cyan-400 bg-cyan-950/10"
                            : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                        }`}
                      >
                        ₦{parseFloat(pres).toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Custom ₦</span>
                    <input
                      type="number"
                      value={customAirtime}
                      onChange={(e) => setCustomAirtime(e.target.value)}
                      className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-xs font-mono text-cyan-400 w-32 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider block mb-1.5">
                    Select Data Package Value (High Speed)
                  </label>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {[
                      { id: "data_1gb", label: "1.0 GB Premium High-Speed (30 Days)", points: 150 },
                      { id: "data_2gb", label: "2.5 GB Super-Fast Bundle (30 Days)", points: 350 },
                      { id: "data_5gb", label: "5.0 GB Extreme Sovereign (30 Days)", points: 600 },
                      { id: "data_10gb", label: "10.0 GB Corporate High-Yield (30 Days)", points: 1100 },
                      { id: "data_25gb", label: "25.0 GB Sovereign Infinite (30 Days)", points: 2500 }
                    ].map((pack) => (
                      <button
                        key={pack.id}
                        type="button"
                        onClick={() => setDataPackage(pack.id)}
                        className={`w-full p-2 border rounded-xl flex justify-between items-center text-left transition-all text-xs font-mono cursor-pointer ${
                          dataPackage === pack.id
                            ? "border-cyan-400 text-cyan-400 bg-cyan-950/10"
                            : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span>{pack.label}</span>
                        <span className="font-bold text-cyan-400">+{pack.points} PTS</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cost ledger readout */}
              <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800/60 text-xs font-mono">
                <span className="text-gray-500">CONVERSION POINT COST</span>
                <span className="text-sm font-black text-cyan-400">{pointsCost} PLS Points</span>
              </div>
            </div>

            {/* Notifications & Submit */}
            <div className="space-y-3">
              {rechargeMessage && (
                <div className="p-2.5 bg-green-950/40 text-green-400 border border-green-500/20 rounded-xl text-[10.5px] font-mono leading-relaxed">
                  {rechargeMessage}
                </div>
              )}
              {rechargeErr && (
                <div className="p-2.5 bg-red-950/45 text-red-400 border border-red-500/25 rounded-xl text-[10.5px] font-mono leading-relaxed animate-pulse">
                  {rechargeErr}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessingRecharge}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black rounded-xl text-[11px] uppercase shadow-lg shadow-cyan-400/10 tracking-widest transition-all cursor-pointer hover:brightness-110 flex items-center justify-center gap-1.5"
              >
                {isProcessingRecharge ? (
                  <>
                    <span className="animate-spin text-sm">⚡</span> Discharging Cellular Package...
                  </>
                ) : (
                  <>
                    <Wifi className="w-3.5 h-3.5" /> ⚡ Recharge SIM with Points
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 7. CUSTOMERS SATISFACTION FEEDBACK ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rv, i) => (
          <div key={i} className="bg-slate-900/20 border border-slate-800 rounded-2xl p-[18px] space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 font-mono">{rv.user}</span>
              <div className="flex gap-0.5">
                {[...Array(rv.stars)].map((_, s) => <Star key={s} className="w-3 h-3 fill-yellow-500 text-yellow-500" />)}
              </div>
            </div>
            <p className="text-[11px] text-gray-400 italic leading-relaxed font-normal">
              "{rv.text}"
            </p>
          </div>
        ))}
      </div>

      {/* 8. BLACK ROOM PRIVATE CIRCLE TEASER HOVER */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 bg-red-950/40 text-red-400 font-mono text-[9px] border-b border-l border-slate-800 uppercase rounded-bl-xl font-bold">
          SECURE CHANNEL GATED
        </div>
        
        <div className="space-y-4 max-w-xl">
          <span className="text-[9.5px] font-mono text-[#00E5FF] font-black uppercase tracking-widest block">
            ANONYMOUS LIQUID TRADES CODENAME
          </span>
          <h3 className="text-md font-bold text-white uppercase tracking-tight">The Sleek Black Room Ring Teaser</h3>
          <p className="text-xs text-gray-400 font-normal leading-relaxed">
            Ready to trade virtual numbers, foreign Stripe/PayPal assets, or boosts completely anonymously? StyleHub randomizes your pseudonym to pre-loaded chemical elements on entrance. Complete security is granted under Jadai Studios manual auditing.
          </p>
          <div>
            <button
              onClick={() => {
                if (!user) {
                  alert("Please authorize your session above first to navigate securely into the room.");
                  return;
                }
                onNavigate("blackroom");
              }}
              className="py-1.5 px-3 bg-slate-900 border border-slate-800 text-[10px] text-cyan-400 font-bold tracking-wider uppercase rounded-lg hover:text-white transition-all cursor-pointer"
            >
              Access Chemical Chamber Ring
            </button>
          </div>
        </div>
      </div>

      {/* STYLEZ HUB COMPLIANCE & SLICK FOOTER */}
      <div className="bg-[#0E131F]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl space-y-8">
        <div className="absolute top-0 right-0 p-3 bg-cyan-950/40 text-cyan-400 font-mono text-[9px] border-b border-l border-slate-800 uppercase rounded-bl-xl font-bold tracking-widest">
          SECURITY GUARANTEED
        </div>

        {/* Brand highlights info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 pb-6 border-b border-slate-900">
          <div className="space-y-1.5">
            <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Ultra-Slick Sandbox
            </h4>
            <p className="text-[11.5px] text-gray-400 leading-relaxed font-normal">
              Fully customized transaction checkouts and mobile banking interfaces designed purely for sandbox testing and product UX evaluation.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Point Ledger Custody
            </h4>
            <p className="text-[11.5px] text-gray-400 leading-relaxed font-normal">
              Securely upgrade your profile using Paystack deposits and earn fully unlocked access to premium high-fidelity banking apps.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Developer Support
            </h4>
            <p className="text-[11.5px] text-gray-400 leading-relaxed font-normal">
              Need tailored features or integration support? Connect directly with our lead developers at <strong className="text-cyan-400 font-mono">jehuhudson@gmail.com</strong>.
            </p>
          </div>
        </div>

        {/* COMPLETE HOMEPAGE FOOTER */}
        <footer className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-8 text-xs border-t border-slate-900/60 pb-2">
          
          <div className="md:col-span-5 space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="font-mono font-black text-lg text-white tracking-tighter flex items-center gap-1.5">
                <span className="text-cyan-400">⚡</span> STYLEZ HUB
              </div>
              <span className="text-[9px] font-bold font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest leading-none">
                PRO EDITION
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              The internet's premiere digital fintech sandbox, mock-receipt generator, and high-fidelity bank viewport testbed operated under the integrity seal of Jadai Studios.
            </p>
            <div className="text-[9.5px] text-gray-500 font-mono">
              © {new Date().getFullYear()} Stylez Hub. All rights reserved globally.
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h5 className="font-mono font-bold text-gray-300 uppercase tracking-widest text-[10.5px]">
              Platform Modules
            </h5>
            <ul className="space-y-2 font-medium">
              <li>
                <button onClick={() => onNavigate("generator")} className="text-gray-400 hover:text-cyan-400 cursor-pointer transition-all">
                  → Checkout Receipt Creator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("brokers")} className="text-gray-400 hover:text-cyan-400 cursor-pointer transition-all text-left">
                  → Premium Mobile Simulators
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("marketplace")} className="text-gray-400 hover:text-cyan-400 cursor-pointer transition-all">
                  → Digital Goods Shop
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("blackroom")} className="text-gray-400 hover:text-cyan-400 cursor-pointer transition-all">
                  → Anonymized Black Room
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h5 className="font-mono font-bold text-gray-300 uppercase tracking-widest text-[10.5px]">
              Customer Support Dispatch
            </h5>
            <p className="text-gray-400 leading-relaxed text-[11px] font-normal font-sans">
              Our programmer staff is available 24/7 for custom API designs. File credentials requests directly to our head admin support.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:jehuhudson@gmail.com"
                className="w-full sm:w-auto px-4 py-2 bg-slate-900 border border-slate-800 text-center font-bold hover:border-cyan-450 text-cyan-400 rounded-xl transition-all font-mono text-[10.5px] cursor-pointer"
              >
                📧 Email: jehuhudson@gmail.com
              </a>
            </div>
          </div>

        </footer>

        {/* Integrity seal footer credits */}
        <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-500 font-mono gap-3">
          <span className="flex items-center gap-1.5 text-[#00E5FF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse"></span>
            ACTIVE INTEGRITY EMBLEM REGISTERED
          </span>
          <span>BUILD VERSION SYSTEM v2.48 • JADAI STUDIOS SIGNIA SECURITY</span>
        </div>
      </div>

      {/* 9. WORKING MODAL DEMO WATERMARKED IFRAME POPUP */}
      {demoTemplate && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fadeIn backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-[#0E131F] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
            
            {/* Header controls */}
            <div className="bg-[#0B0E14] p-4 px-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[9.5px] font-mono text-cyan-400 uppercase font-black block tracking-widest">
                  SANDBOX TEMPLATE LIVE RUN
                </span>
                <h3 className="text-xs font-bold text-white truncate max-w-md">{demoTemplate.title} - Demo Mockup</h3>
              </div>
              <button
                onClick={() => setDemoTemplate(null)}
                className="py-1 px-3.5 bg-red-600/20 border border-red-500/30 text-rose-400 font-mono text-[10.5px] rounded-lg hover:backdrop-brightness-125 cursor-pointer font-bold"
              >
                Close Demo
              </button>
            </div>

            {/* Simulated Live Workspace Iframe Simulator */}
            <div className="flex-1 relative bg-slate-950 flex flex-col justify-between p-4">
              
              {/* Fake navigation browser mockup bar */}
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3 text-xs font-mono text-gray-500 select-none">
                <div className="flex gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/50 block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50 block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/50 block" />
                </div>
                <div className="flex-1 bg-slate-950 text-[10px] py-0.5 px-3 rounded-lg border border-slate-800/60 truncate italic text-[#00E5FF]">
                  preview.stylezhub.net/demo/sandbox-item-{demoTemplate.id}
                </div>
              </div>

              {/* Central working visual mock iframe canvas */}
              <div className="flex-1 my-4 border border-slate-800 rounded-2xl relative overflow-hidden bg-slate-900 flex justify-center items-center p-8 text-center select-none">
                
                {/* Visual Diagonal Watermarks */}
                <div className="absolute inset-0 flex flex-wrap justify-around items-center opacity-10 font-mono font-black text-xs uppercase tracking-widest leading-none rotate-12 select-none pointer-events-none">
                  {[...Array(15)].map((_, w) => (
                    <span key={w} className="p-8 text-cyan-400 select-none">STYLEHUB DEMO WATERMARK • COPIED ILLEGAL</span>
                  ))}
                </div>

                <div className="space-y-4 relative z-10 max-w-md">
                  <h4 className="text-[#00E5FF] text-sm uppercase font-black tracking-wider">Simulated Working Fintech Node Portal</h4>
                  <p className="text-[11.5px] text-gray-400 leading-relaxed font-normal">
                    Interactive custom sliders and navigation blocks are accessible. In compliance with license policies, download checkout triggers and real DB queries are mock-deactivated on demo urls.
                  </p>
                  
                  {/* Interactive mock user inputs inside demo preview */}
                  <div className="bg-[#0B0E14] border border-slate-800 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between text-[11px] font-mono select-none">
                      <span className="text-cyan-400">Mock point balance:</span>
                      <span className="text-white">12,450 PLS</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-cyan-400" />
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 italic">Static checkout inputs blocked</span>
                      <span className="text-[9px] bg-red-900/30 text-rose-400 border border-red-500/20 px-2 py-0.5 rounded uppercase font-bold">watermarked</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Informative footer */}
              <div className="p-3 bg-cyan-950/20 border border-cyan-500/25 rounded-2xl text-[10.5px] text-[#00E5FF] text-center font-mono select-none leading-relaxed">
                🚀 Points check satisfied? Unlock this premium {demoTemplate.title} layout permanently. Direct transfer files ZIP includes full code & reactive css elements.
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
