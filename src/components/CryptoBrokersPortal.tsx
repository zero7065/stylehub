import React, { useState, useEffect } from "react";
import AppSimulator from "./AppSimulator";
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Coins, 
  TrendingUp, 
  ShieldAlert, 
  Play, 
  HelpCircle, 
  RefreshCw, 
  Sliders, 
  Check, 
  AlertOctagon, 
  DollarSign, 
  Timer,
  BookOpen,
  ArrowUpRight,
  TrendingDown,
  Info,
  Users,
  Award,
  Share2,
  Copy,
  PlusCircle,
  FileText,
  Video,
  Globe,
  UploadCloud,
  ChevronRight,
  Sparkles,
  Heart
} from "lucide-react";
import { User, CryptoBroker, CryptoBrokerInvestment } from "../types";

interface CryptoBrokersPortalProps {
  currentUser: User | null;
  onRefreshUser: () => void;
}

export default function CryptoBrokersPortal({ currentUser, onRefreshUser }: CryptoBrokersPortalProps) {
  const [brokers, setBrokers] = useState<CryptoBroker[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<CryptoBroker | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"terminal" | "readme" | "admin" | "users">("terminal");
  const [investAmount, setInvestAmount] = useState<string>("");
  const [unlockProcessing, setUnlockProcessing] = useState<string | null>(null);
  const [investProcessing, setInvestProcessing] = useState<string | null>(null);
  const [reclaimProcessing, setReclaimProcessing] = useState<string | null>(null);
  const [yieldProcessing, setYieldProcessing] = useState<string | null>(null);

  // Embedded Web App view parameters
  const [phoneViewMode, setPhoneViewMode] = useState<"app" | "link" | "sandbox">("app");
  const [appCurrentTab, setAppCurrentTab] = useState<"trade" | "kyc" | "spin" | "refs">("trade");

  // Admin Create/Edit forms
  const [adminName, setAdminName] = useState<string>("");
  const [adminAlias, setAdminAlias] = useState<string>("");
  const [adminDesc, setAdminDesc] = useState<string>("");
  const [adminRiskLevel, setAdminRiskLevel] = useState<'Low' | 'Medium' | 'High' | 'Very High' | 'Extreme'>("Medium");
  const [adminApy, setAdminApy] = useState<string>("");
  const [adminCost, setAdminCost] = useState<string>("");
  const [adminMinInvest, setAdminMinInvest] = useState<string>("");
  const [adminStatus, setAdminStatus] = useState<boolean>(true);
  const [adminExternalLink, setAdminExternalLink] = useState<string>("");
  const [adminUploadedHtml, setAdminUploadedHtml] = useState<string>("");

  // Create Mode toggler
  const [adminCreateMode, setAdminCreateMode] = useState(false);

  // App Simulator traditional parameters configuration
  const [simSender, setSimSender] = useState("");
  const [simReceiver, setSimReceiver] = useState("BLESSING ENE OGBONYIRO");
  const [simReceiverBank, setSimReceiverBank] = useState("Wema Bank");
  const [simAmount, setSimAmount] = useState("12500");
  const [simBalance, setSimBalance] = useState("540000");
  const [simReference, setSimReference] = useState("Repayment transfer");
  const [simCustomField, setSimCustomField] = useState("");
  const [simTransactionId, setSimTransactionId] = useState("");
  const [simDateTime, setSimDateTime] = useState("");

  // Interactive Live CoinMarketCap Price Ticker Feed
  const [coinPrices, setCoinPrices] = useState<Record<string, { price: number; change: number; sparkline: string }>>({
    BTC: { price: 67490.50, change: 2.45, sparkline: "M0,15 L10,12 L20,16 L30,8 L40,11 L50,2" },
    ETH: { price: 3582.10, change: -0.85, sparkline: "M0,2 L10,8 L20,4 L30,12 L40,9 L50,18" },
    SOL: { price: 172.40, change: 11.20, sparkline: "M0,18 L10,14 L20,10 L30,12 L40,4 L50,1" },
    BNB: { price: 589.60, change: 1.50, sparkline: "M0,15 L10,14 L20,12 L30,13 L40,5 L50,3" },
    DOGE: { price: 0.1420, change: -4.25, sparkline: "M0,5 L10,8 L20,3 L30,12 L40,15 L50,19" }
  });

  // Micro order ticks
  const [simTradePositions, setSimTradePositions] = useState<any[]>([]);
  const [simTradeSuccessCount, setSimTradeSuccessCount] = useState(0);

  // Native Simulator interactive states
  const [tradeCoin, setTradeCoin] = useState<string>("BTC");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [tradeAmount, setTradeAmount] = useState<string>("10");

  const [kycName, setKycName] = useState<string>("");
  const [kycDocType, setKycDocType] = useState<string>("National ID");
  const [kycDocFile, setKycDocFile] = useState<string | null>(null);
  const [kycSelfie, setKycSelfie] = useState<string | null>(null);
  const [kycSubmitStatus, setKycSubmitStatus] = useState<"unsubmitted" | "submitting" | "verified">("unsubmitted");

  const [referrals, setReferrals] = useState<any[]>([
    { email: "alpha_whale@gmail.com", points: 150, status: "Active" },
    { email: "sam_crypto@stylehub.net", points: 50, status: "Active" }
  ]);

  // Spin & win wheel variables
  const [spinDegree, setSpinDegree] = useState(0);
  const [spinProcessing, setSpinProcessing] = useState(false);
  const [spinFeedback, setSpinFeedback] = useState<string | null>(null);

  // Interactive User Accounts Management Table
  const [usersList, setUsersList] = useState<User[]>([]);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [editUserPoints, setEditUserPoints] = useState<string>("");
  const [editUserKyc, setEditUserKyc] = useState<string>("");
  const [adminSearchUser, setAdminSearchUser] = useState<string>("");

  // System general emblem settings
  const [systemSettings, setSystemSettings] = useState<any>(null);

  // Client-side artificial trade generator ticker
  const [dynamicTrades, setDynamicTrades] = useState<any[]>([]);

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    if (currentUser) {
      setSimSender(
        currentUser.kyc_data?.name || 
        currentUser.black_room_alias || 
        currentUser.email.split("@")[0].toUpperCase()
      );
    }
    fetchSettings();
  }, [currentUser]);

  useEffect(() => {
    setSimTransactionId("TX-" + Math.floor(100000 + Math.random() * 900000) + "-" + Date.now().toString().slice(-4));
    const now = new Date();
    setSimDateTime(now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " " + now.toLocaleTimeString("en-US", { hour12: false }));
  }, [selectedBroker]);

  // Seed dynamic fluctuation ticker for CoinMarketCap Prices
  useEffect(() => {
    const timer = setInterval(() => {
      setCoinPrices(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(coin => {
          const tick = next[coin];
          const pct = (Math.random() - 0.48) * 0.4;
          const newPrice = Math.max(0.01, tick.price * (1 + pct / 100));
          const newChange = tick.change + (Math.random() - 0.5) * 0.1;
          next[coin] = {
            ...tick,
            price: parseFloat(newPrice.toFixed(coin === "DOGE" ? 4 : 2)),
            change: parseFloat(newChange.toFixed(2))
          };
        });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Generate real-time live trading ticks for unlocked terminals
  useEffect(() => {
    const tickers = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "AVAX/USDT", "LINK/USDT", "PEPE/USDT"];
    const interval = setInterval(() => {
      if (selectedBroker && selectedBroker.unlocked) {
        const selectedTicker = tickers[Math.floor(Math.random() * tickers.length)];
        const amount = Math.floor(Math.random() * 5000) + 100;
        const profitPct = (Math.random() * 8) - (selectedBroker.risk_level === "Extreme" ? 3.5 : 1.5);
        const profitPoints = parseFloat((amount * (profitPct / 100)).toFixed(2));

        const newTrade = {
          id: "tick-" + Date.now(),
          ticker: selectedTicker,
          amount,
          profit: profitPoints,
          time: "Just now"
        };

        setDynamicTrades((prev) => [newTrade, ...prev.slice(0, 10)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedBroker]);

  useEffect(() => {
    fetchBrokers();
    if (isAdmin) {
      fetchAdminUsers();
    }
  }, [currentUser]);

  const fetchSettings = async () => {
    try {
      const s = await fetch("/api/settings");
      const d = await s.json();
      setSystemSettings(d);
    } catch(e) {
      console.error(e);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsersList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBrokers = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/crypto-brokers/list?userId=${currentUser.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setBrokers(data);
        // Default select first broker on load if none selected
        if (!selectedBroker) {
          setSelectedBroker(data[0]);
          if (data[0]) loadAdminStatesForBroker(data[0]);
        } else {
          const updatedSelected = data.find(b => b.id === selectedBroker.id);
          if (updatedSelected) {
            setSelectedBroker(updatedSelected);
          }
        }
      }
    } catch (err) {
      console.error("Error retrieving crypto brokers list:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminStatesForBroker = (broker: CryptoBroker) => {
    setAdminName(broker.name);
    setAdminAlias(broker.alias);
    setAdminDesc(broker.description);
    setAdminApy(String(broker.projected_apy));
    setAdminCost(String(broker.price_points));
    setAdminMinInvest(String(broker.minimum_investment_points));
    setAdminRiskLevel(broker.risk_level);
    setAdminStatus(broker.is_active);
    setAdminExternalLink(broker.external_link || "");
    setAdminUploadedHtml(broker.uploaded_html || "");
    setAdminCreateMode(false);
  };

  const handleSelectBroker = (broker: CryptoBroker) => {
    setSelectedBroker(broker);
    setDynamicTrades(broker.mock_trades || []);
    loadAdminStatesForBroker(broker);
    setPhoneViewMode("app");
    setActiveSubTab("terminal");
  };

  const handleUnlockBroker = async (broker: CryptoBroker) => {
    if (!currentUser) return;
    setUnlockProcessing(broker.id);
    try {
      const res = await fetch("/api/crypto-brokers/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          brokerId: broker.id
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`🎉 Node Chartered Successfully! ${broker.name} has signed terms of autonomy. Welcome to active terminal trading.`);
        onRefreshUser();
        await fetchBrokers();
      } else {
        alert(data.error || "Failed lock confirmation protocol.");
      }
    } catch (err) {
      console.error(err);
      alert("Error confirming deposit levels.");
    } finally {
      setUnlockProcessing(null);
    }
  };

  const handleInvestPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedBroker) return;

    const pointsToInvest = parseInt(investAmount);
    if (isNaN(pointsToInvest) || pointsToInvest <= 0) {
      alert("Invalid capital points input.");
      return;
    }

    if (pointsToInvest < selectedBroker.minimum_investment_points) {
      alert(`Minimum capital index for this broker block is ${selectedBroker.minimum_investment_points} PLS points.`);
      return;
    }

    if (currentUser.points < pointsToInvest) {
      alert(`Insufficient balance. You currently hold ${currentUser.points} PLS points.`);
      return;
    }

    setInvestProcessing(selectedBroker.id);
    try {
      const res = await fetch("/api/crypto-brokers/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          brokerId: selectedBroker.id,
          amountPoints: pointsToInvest
        })
      });
      const data = await res.json();
      if (data.success) {
        setInvestAmount("");
        onRefreshUser();
        await fetchBrokers();
      } else {
        alert(data.error || "DeFi allocation error.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInvestProcessing(null);
    }
  };

  const handleReclaimInvestment = async (investmentId: string) => {
    if (!currentUser) return;
    if (!window.confirm("Confirm liquidation of active portfolio capital and accrued yield compounding indices back into your primary StyleHub wallet?")) return;

    setReclaimProcessing(investmentId);
    try {
      const res = await fetch("/api/crypto-brokers/reclaim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          investmentId
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`🌟 Portfolio Liquidated! Returned ${data.payoutPoints} PLS points successfully.`);
        onRefreshUser();
        await fetchBrokers();
      } else {
        alert(data.error || "Liquidation failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReclaimProcessing(null);
    }
  };

  const handleSimulateYield = async (investmentId: string) => {
    if (!currentUser) return;
    setYieldProcessing(investmentId);
    try {
      const res = await fetch("/api/crypto-brokers/simulate-yield", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          investmentId
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchBrokers();
      } else {
        alert(data.error || "Failed simulation step.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setYieldProcessing(null);
    }
  };

  const handleAdminUpdateBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedBroker) return;
    try {
      const res = await fetch("/api/admin/crypto-brokers/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentAdminId: currentUser.id,
          brokerId: selectedBroker.id,
          name: adminName,
          alias: adminAlias,
          description: adminDesc,
          risk_level: adminRiskLevel,
          price_points: parseInt(adminCost),
          projected_apy: parseFloat(adminApy),
          minimum_investment_points: parseInt(adminMinInvest),
          is_active: adminStatus,
          external_link: adminExternalLink,
          uploaded_html: adminUploadedHtml
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`👑 Overlord Update applied securely to blockchain parameter configurations for ${adminName || selectedBroker.name}!`);
        await fetchBrokers();
      } else {
        alert(data.error || "Failed sovereign configuration.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminCreateBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const res = await fetch("/api/admin/crypto-brokers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentAdminId: currentUser.id,
          name: adminName,
          alias: adminAlias,
          description: adminDesc,
          risk_level: adminRiskLevel,
          price_points: parseInt(adminCost) || 150,
          projected_apy: parseFloat(adminApy) || 45,
          minimum_investment_points: parseInt(adminMinInvest) || 0,
          external_link: adminExternalLink,
          uploaded_html: adminUploadedHtml
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`👑 Elite Sovereign Node "${adminName}" crafted and seeded to live directory matrix!`);
        setAdminCreateMode(false);
        await fetchBrokers();
      } else {
        alert(data.error || "Failed creating node.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Drag and Drop text file reader for HTML/Zip code templates
  const handleBrokerCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAdminUploadedHtml(content);
      alert(`📄 Read code bundle "${file.name}" completed! (${content.length} characters of HTML/JS extracted). Ensure to click "Sovereign Update" below to save!`);
    };
    reader.readAsText(file);
  };

  // User management updates
  const handleSelectUserForEdit = (u: User) => {
    setSelectedUserForEdit(u);
    setEditUserPoints(String(u.points));
    setEditUserKyc(u.kyc_status);
  };

  const handleUpdateUsersRoleOrPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedUserForEdit) return;

    try {
      const res = await fetch("/api/admin/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentAdminId: currentUser.id,
          userId: selectedUserForEdit.id,
          points: parseInt(editUserPoints),
          kycStatus: editUserKyc
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`👑 Account for ${selectedUserForEdit.email} modified on ledger! Points set to ${editUserPoints} and KYC status marked "${editUserKyc}".`);
        setSelectedUserForEdit(null);
        onRefreshUser();
        await fetchAdminUsers();
      } else {
        alert(data.error || "Failed user adjustment.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Interactive Spin Game Spin Wheel Trigger
  const startSpinWheel = () => {
    if (spinProcessing) return;
    if (!currentUser) return;

    if (currentUser.points < 20) {
      alert("⚠️ Spin Deficit: Spinning the wheel costs 20 PLS points from your central StyleHub account balance. Top up on standard package checkout first!");
      return;
    }

    setSpinProcessing(true);
    setSpinFeedback(null);

    // Calculate a degree to stop on a specific prize (split into 8 slices of 45deg)
    // Adding 1440deg for visual speed loops
    const baseDegrees = 1440;
    const prizeIndex = Math.floor(Math.random() * 8); 
    const targetDegree = prizeIndex * 45 + 22.5; // stop in exact center of segment
    const finalDegree = spinDegree + baseDegrees + targetDegree;
    
    setSpinDegree(finalDegree);

    setTimeout(async () => {
      setSpinProcessing(false);
      let pointsWon = 0;
      let rewardText = "";

      // Index mapping description
      // Index 0: +1,000 PLS Jackpot
      // Index 1: +15 PLS
      // Index 2: +50 PLS
      // Index 3: Double Status Bonus
      // Index 4: Try Again
      // Index 5: +30 PLS
      // Index 6: Hard luck
      // Index 7: +100 PLS Premium
      switch (prizeIndex) {
        case 0:
          pointsWon = 1000;
          rewardText = "🎰 THE SOVEREIGN +1,000 PLS JACKPOT! 🎰";
          break;
        case 1:
          pointsWon = 15;
          rewardText = "⚡ Staking Bonus: +15 PLS points!";
          break;
        case 2:
          pointsWon = 50;
          rewardText = "🔥 Yield Crop Bonus: +50 PLS points!";
          break;
        case 3:
          pointsWon = 200;
          rewardText = "🎁 Double Margin Bonus: +200 PLS points!";
          break;
        case 4:
          pointsWon = 0;
          rewardText = "❌ Zero Yield Frame: Try Again!";
          break;
        case 5:
          pointsWon = 30;
          rewardText = "💎 Spot Mini Ticket: +30 PLS points!";
          break;
        case 6:
          pointsWon = 0;
          rewardText = "🐳 Whales Dumped: Hard Luck!";
          break;
        case 7:
          pointsWon = 100;
          rewardText = "👑 Elite Stretcher Bonus: +100 PLS points!";
          break;
        default:
          pointsWon = 20;
          rewardText = "Refunded! +20 PLS points.";
      }

      setSpinFeedback(rewardText);

      // Perform a real balance deduction and credit on stylehub central server
      try {
        const netDelta = pointsWon - 20; // 20 cost to play, pointsWon returned
        await fetch("/api/admin/add-points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentAdminId: "system",
            targetUserId: currentUser.id,
            bonusPoints: netDelta
          })
        });
        onRefreshUser();
      } catch (err) {
        console.error("Error writing points won during spin:", err);
      }

    }, 3000);
  };

  // Instant simulator trades inside phone frame
  const handleClientSideSimTrade = (coin: string, orderType: "buy" | "sell", amount: number) => {
    if (!currentUser) return;

    // Check payment restriction
    const hasCompletedDeposit = (currentUser.purchased_points && currentUser.purchased_points > 0) || 
                                 (currentUser.subscription_tier && currentUser.subscription_tier !== "basic") || 
                                 currentUser.role === "admin";
    
    if (!hasCompletedDeposit) {
      alert("🔒 Depositor Validation Locked!\n\nStandard simulator mode restriction: Real-time orders, dynamic compounding contracts, and high yield index allocations require a paid/funded profile balance.\n\nPlease purchase a point package tier via Paystack in your Dashboard Hub Wallet first to run fully approved live trade entries.");
      return;
    }

    if (currentUser.points < amount) {
      alert(`Trade Entry Denied: Your StyleHub points balance is ${currentUser.points} PLS, which is less than the trade size of ${amount} PLS.`);
      return;
    }

    // Deduct points
    fetch("/api/admin/add-points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentAdminId: "system",
        targetUserId: currentUser.id,
        bonusPoints: -amount
      })
    }).then(() => {
      onRefreshUser();
      const currentPrice = coinPrices[coin]?.price || 100;
      const profitRandom = (Math.random() > 0.43); // 57% simulated success probability
      const profitAmt = profitRandom ? parseFloat((amount * (0.05 + Math.random() * 0.15)).toFixed(1)) : -parseFloat((amount * (0.03 + Math.random() * 0.08)).toFixed(1));

      const newPos = {
        id: "pos-" + Date.now().toString().slice(-6),
        coin,
        orderType,
        sizePoints: amount,
        entryPrice: currentPrice,
        profitPoints: profitAmt,
        timestamp: new Date().toLocaleTimeString()
      };

      setSimTradePositions(prev => [newPos, ...prev]);
      setSimTradeSuccessCount(c => c + (profitRandom ? 1 : 0));

      // Play alert
      if (profitRandom) {
        alert(`📈 SECURE TRADE SUCCESSFUL!\n\nExecution Ref: ${newPos.id}\nAction: ${orderType.toUpperCase()} ${coin} Size: ${amount} PLS\nNet Profit Delta: +${profitAmt} PLS points (Auto compounded)`);
        // Refund capital + profit
        fetch("/api/admin/add-points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentAdminId: "system",
            targetUserId: currentUser.id,
            bonusPoints: Math.round(amount + profitAmt)
          })
        }).then(() => onRefreshUser());
      } else {
        alert(`📉 POSITION LIQUIDATED AT HARD-STOP!\n\nExecution Ref: ${newPos.id}\nAction: ${orderType.toUpperCase()} ${coin}\nNet Margin Lost: -${Math.abs(profitAmt)} PLS points.`);
        // Refund remaining margin
        const refundRemaining = amount + profitAmt;
        if (refundRemaining > 0) {
          fetch("/api/admin/add-points", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              currentAdminId: "system",
              targetUserId: currentUser.id,
              bonusPoints: Math.round(refundRemaining)
            })
          }).then(() => onRefreshUser());
        }
      }
    });
  };

  const simulateReferralSignup = async () => {
    if (!currentUser) return;
    const names = ["Gabriel_Invests", "Sarah_Hodl", "Naira_King_01", "Crypto_Nerd_99", "Premium_Arbitragist"];
    const chosen = names[Math.floor(Math.random() * names.length)] + "_" + Math.floor(10 + Math.random() * 90);
    const newRefEmail = `${chosen.toLowerCase()}@stylehub.net`;

    // Credit referral points
    try {
      await fetch("/api/admin/add-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentAdminId: "system",
          targetUserId: currentUser.id,
          bonusPoints: 50 // Standard affiliate bonus points
        })
      });
      alert(`👥 Virtual Partner Enrolled!\n\nAccount: ${newRefEmail}\nUsed Promo Code: HUB-REF-${currentUser.id.substring(0, 5).toUpperCase()}\n\nCongratulations! You have received a +50 PLS affiliate bonus directly in your StyleHub central wallet.`);
      setReferrals(prev => [
        { email: newRefEmail, points: 50, status: "Active Staker" },
        ...prev
      ]);
      onRefreshUser();
    } catch(e) {
      console.error(e);
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "Low": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
      case "Medium": return "bg-cyan-500/10 text-sky-400 border border-cyan-500/30";
      case "High": return "bg-orange-500/10 text-amber-400 border border-orange-500/30";
      case "Very High": return "bg-rose-500/10 text-rose-400 border border-rose-500/30";
      default: return "bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse";
    }
  };

  // Verify deposit levels
  const verifiedDeposit = (currentUser?.purchased_points && currentUser?.purchased_points > 0) || 
                          (currentUser?.subscription_tier && currentUser?.subscription_tier !== "basic") || 
                          currentUser?.role === "admin";

  return (
    <div className="w-full space-y-6 pb-20 animate-fadeIn">
      
      {/* Upper Navigation Indicator Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#0A0D14]/90 border border-slate-800 rounded-3xl backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/10 text-cyan-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">Decentralized Brokers Core</h1>
            <p className="text-[10px] text-gray-500 font-mono">Secure micro-stake terminals linked with central wallet ledger</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3.5 py-1.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Hub Balance</span>
            <span className="text-cyan-400 font-black text-xs">{currentUser?.points || 0} PLS</span>
          </div>

          {systemSettings?.custom_emblem_html && (
            <div 
              className="hidden sm:block" 
              dangerouslySetInnerHTML={{ __html: systemSettings.custom_emblem_html }} 
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left column: Grid directory and node select */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          <div className="bg-[#0B0E14] border border-slate-800 p-5 rounded-3xl space-y-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Node Directory Matrix</h3>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setAdminCreateMode(true);
                      setAdminName("New Core Global");
                      setAdminAlias("new_core");
                      setAdminDesc("Enter beautiful crypto-related description here...");
                      setAdminApy("75");
                      setAdminCost("250");
                      setAdminMinInvest("20");
                      setAdminRiskLevel("Medium");
                      setAdminExternalLink("");
                      setAdminUploadedHtml("");
                      setActiveSubTab("admin");
                    }}
                    className="flex items-center gap-1.5 px-2 px-1.5 py-1 text-[10px] font-bold text-cyan-400 bg-cyan-950/20 border border-cyan-500/20 rounded-lg hover:bg-cyan-950/40"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Craft Node
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1 scrollbar-none">
                {loading ? (
                  <div className="py-12 text-center text-xs text-gray-500 italic font-mono flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                    Connecting to central ledger...
                  </div>
                ) : brokers.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-500 italic font-mono">
                    No active cryptobrokers deployed in database.
                  </div>
                ) : (
                  brokers.map((b) => {
                    const isSelected = selectedBroker && selectedBroker.id === b.id;
                    const hasActiveInv = b.activeInvestment !== null;

                    return (
                      <button
                        key={b.id}
                        id={b.id}
                        onClick={() => handleSelectBroker(b)}
                        className={`w-full p-4 rounded-2xl text-left border transition-all duration-200 outline-none flex flex-col justify-between hover:scale-[1.01] ${
                          isSelected 
                            ? "bg-slate-950 border-[#00E5FF] shadow-lg shadow-[#00E5FF]/5" 
                            : b.is_active 
                              ? "bg-[#07090F] border-slate-900 hover:border-slate-800" 
                              : "bg-[#07090F]/40 border-slate-900/50 opacity-60"
                        }`}
                      >
                        <div className="w-full flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-white tracking-wide truncate max-w-[160px]">
                              {b.name}
                            </h4>
                            <span className="text-[10px] font-mono font-bold text-gray-400">
                              /{b.alias}
                            </span>
                          </div>

                          <span className={`text-[9px] font-bold uppercase rounded-lg px-2 py-0.5 ${getRiskBadgeColor(b.risk_level)}`}>
                            {b.risk_level}
                          </span>
                        </div>

                        <div className="mt-3 flex justify-between items-center border-t border-slate-900/60 pt-2.5 text-[9px] text-gray-400 font-mono">
                          <span className="flex items-center gap-1">
                            {b.unlocked ? (
                              <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                                <Unlock className="w-2.5 h-2.5" /> Licensed
                              </span>
                            ) : (
                              <span className="text-yellow-600 flex items-center gap-0.5 font-bold">
                                <Lock className="w-2.5 h-2.5" /> Locked
                              </span>
                            )}
                          </span>
                          {hasActiveInv && (
                            <span className="text-cyan-400 font-bold bg-cyan-950/20 px-1.5 py-0.5 rounded border border-cyan-500/10">
                              🛡️ {b.activeInvestment?.amountPoints} PLS Tied
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick instructions widget */}
            <div className="bg-[#0B0E14]/80 border border-slate-800/80 rounded-2xl p-4 text-xs space-y-2 mt-4">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" /> Decentralized Disclosures
              </h4>
              <p className="text-gray-400 text-[10.5px] leading-relaxed font-normal">
                Rent verified autonomous digital broker templates programmed by StyleHub. View transparent strategies inside of the <strong>Strategy Readme</strong>. Free accounts can run terminal demos. Paying/deposited balance is required to bind active compounding.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Broker Workspace Terminals */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {selectedBroker ? (
            <div className="bg-[#0B0E14] border border-slate-800 rounded-3xl p-6 shadow-xl relative flex-1 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-[#00E5FF]/3 rounded-full blur-3xl pointer-events-none"></div>

              {/* Header Title Info */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-5 mb-5 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#00E5FF]/10 text-[#00E5FF] px-2 py-0.5 rounded-lg font-mono font-bold uppercase tracking-wider">
                      AUTONOMOUS CRYPTO COMPONENT
                    </span>
                    <span className={`text-[9px] uppercase font-bold py-0.5 rounded px-1.5 ${getRiskBadgeColor(selectedBroker.risk_level)}`}>
                      {selectedBroker.risk_level} Risk Core
                    </span>
                  </div>
                  <h2 className="text-base font-black text-white mt-1.5 tracking-tight flex items-center gap-2">
                    {selectedBroker.name} 
                    <span className="text-[10px] font-mono text-gray-500 font-normal">
                      ({selectedBroker.alias})
                    </span>
                  </h2>
                </div>

                <div className="flex border border-slate-800 bg-slate-950 p-1 rounded-xl text-[10px] font-bold">
                  <button
                    onClick={() => setActiveSubTab("terminal")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeSubTab === "terminal" ? "bg-slate-800 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Control Panel
                  </button>
                  <button
                    onClick={() => setActiveSubTab("readme")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeSubTab === "readme" ? "bg-slate-800 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Strategy Readme
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => {
                          setAdminCreateMode(false);
                          setActiveSubTab("admin");
                        }}
                        className={`px-3 py-1.5 rounded-lg text-rose-400 transition-all cursor-pointer flex items-center gap-1 ${
                          activeSubTab === "admin" ? "bg-rose-950/20 text-rose-300 border border-rose-900/20" : "hover:text-rose-200"
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5" /> Node Config
                      </button>
                      <button
                        onClick={() => setActiveSubTab("users")}
                        className={`px-3 py-1.5 rounded-lg text-purple-400 transition-all cursor-pointer flex items-center gap-1 ${
                          activeSubTab === "users" ? "bg-purple-950/20 text-purple-300 border border-purple-900/20" : "hover:text-purple-200"
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" /> User Ledger
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* SUB TAB 1: FRONTEND TRADING TERMINAL PANEL */}
              {activeSubTab === "terminal" && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  
                  {/* Summary row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Projected APY</span>
                      <span className="text-sm font-black text-emerald-400 mt-1 block font-mono">
                        +{selectedBroker.projected_apy}%
                      </span>
                    </div>
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Minimum Allocation</span>
                      <span className="text-sm font-black text-[#00E5FF] mt-1 block font-mono">
                        {selectedBroker.minimum_investment_points} PLS
                      </span>
                    </div>
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl col-span-2">
                      <span className="text-[9px] text-gray-555 font-bold uppercase tracking-wider block">Brief Node Mandate</span>
                      <p className="text-[11px] text-gray-400 mt-1 leading-normal truncate">
                        {selectedBroker.description}
                      </p>
                    </div>
                  </div>

                  {/* Lock Screen Cover Mask */}
                  {!selectedBroker.unlocked && !isAdmin ? (
                    <div className="relative border border-amber-500/20 bg-[#07090D] rounded-3xl p-6 overflow-hidden flex flex-col justify-center items-center text-center space-y-4 shadow-inner py-16 select-none flex-1">
                      <div className="absolute inset-0 bg-[#05070A]/95 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 space-y-4">
                        <div className="h-12 w-12 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center justify-center shadow shadow-yellow-500/10 animate-pulse">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div className="space-y-1 max-w-sm">
                          <h4 className="text-xs font-black text-white tracking-widest uppercase">Premium Sovereign Node Chartered Lockout</h4>
                          <p className="text-[10.5px] text-gray-500 leading-relaxed max-w-xs">
                            Rent license credentials for active trading order tickers, dynamic compound yields, KYC clearance verification simulation, and referral wheels.
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleUnlockBroker(selectedBroker)}
                          disabled={unlockProcessing !== null}
                          className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 font-black text-xs text-gray-950 rounded-xl shadow-lg border border-yellow-500/20 active:scale-95 transition-all text-center flex items-center gap-2 cursor-pointer"
                        >
                          {unlockProcessing === selectedBroker.id ? (
                            "Allocating Ledger..."
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5 text-gray-900" /> Unlock Node Charter for {selectedBroker.price_points} PLS
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* UNLOCKED TERMINAL ENGINE */
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch flex-1">
                      
                      {/* Left Side: Parameters Customizer console */}
                      <div className="xl:col-span-5 space-y-4 flex flex-col justify-between">
                        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-slate-900 pb-2.5">
                              <Sliders className="w-4 h-4 text-cyan-400" /> Allocation Compounder
                            </h3>

                            {selectedBroker.activeInvestment ? (
                              <div className="space-y-4 bg-slate-900/50 p-3.5 border border-slate-800 rounded-2xl">
                                <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider font-mono block">Active Points Locked</span>
                                <div className="flex justify-between items-baseline">
                                  <span className="text-base font-black text-cyan-400 font-mono">{selectedBroker.activeInvestment.amountPoints} PLS</span>
                                  <span className="text-xs font-bold text-emerald-400 font-mono animate-pulse">Simulated APY Yield: +{selectedBroker.activeInvestment.yieldPoints || 0} PLS</span>
                                </div>

                                <div className="flex gap-2 pt-2">
                                  <button
                                    onClick={() => handleSimulateYield(selectedBroker.activeInvestment!.id)}
                                    disabled={yieldProcessing === selectedBroker.activeInvestment.id}
                                    className="flex-1 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/20 text-[10px] text-cyan-400 rounded-lg cursor-pointer flex items-center justify-center gap-1 font-mono"
                                  >
                                    <Timer className="w-3 h-3 animate-spin" /> Run Compounding Cycle
                                  </button>
                                  <button
                                    onClick={() => handleReclaimInvestment(selectedBroker.activeInvestment!.id)}
                                    disabled={reclaimProcessing === selectedBroker.activeInvestment.id}
                                    className="flex-1 py-1.5 bg-rose-950/20 border border-rose-900/20 text-[10px] text-rose-400 rounded-lg hover:bg-rose-950/40 cursor-pointer"
                                  >
                                    Liquidate Positions
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <form onSubmit={handleInvestPoints} className="space-y-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono font-bold text-gray-500 uppercase block">
                                    Compounding Capital Size (PLS)
                                  </label>
                                  <input
                                    type="number"
                                    value={investAmount}
                                    onChange={(e) => setInvestAmount(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                                    placeholder={`Min: ${selectedBroker.minimum_investment_points} PLS`}
                                    min={selectedBroker.minimum_investment_points}
                                  />
                                </div>

                                <button
                                  type="submit"
                                  disabled={investProcessing === selectedBroker.id}
                                  className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white font-bold text-xs rounded-xl cursor-pointer"
                                >
                                  {investProcessing === selectedBroker.id ? "Locking allocations..." : "Allocate Compound Yield Capital"}
                                </button>
                              </form>
                            )}

                            {/* Live tickers stats panel */}
                            <div className="mt-4 pt-4 border-t border-slate-900 space-y-2">
                              <span className="text-[9px] text-gray-500 font-black tracking-widest uppercase block">Live Node Output Stream</span>
                              <div className="space-y-1.5 text-[9.5px] font-mono h-24 overflow-y-auto scrollbar-none">
                                {dynamicTrades.length === 0 ? (
                                  <div className="text-gray-600 italic">Awakening microsecond predictive algorithms...</div>
                                ) : (
                                  dynamicTrades.map((t, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-slate-900/30 px-2 py-1 rounded border border-slate-800/25">
                                      <span className="text-slate-300">{t.ticker}</span>
                                      <span className="text-gray-500">{t.amount} PLS</span>
                                      <span className={t.profit > 0 ? "text-emerald-400 font-bold" : "text-rose-400"}>
                                        {t.profit > 0 ? "+" : ""}{t.profit} PLS
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-900 space-y-2 shrink-0">
                            <span className="text-[9px] font-mono font-bold text-gray-500 block">SUPPORT ROUTE</span>
                            <a
                              href={`mailto:jehuhudson@gmail.com?subject=StyleHub%20Broker%20Interlink%2520Verification&body=Hello%2c%20I'am%20using%20StyleHub%20Premium%20Autonomous%20Broker%20${selectedBroker.name}.%20Link%20with%20me%20at%20support.`}
                              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-center text-[10px] uppercase font-bold text-gray-300 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all active:scale-95 text-center block"
                            >
                              📧 Support Desk Contact
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Smartphone Device Screen with full Sandbox selections */}
                      <div className="xl:col-span-7 flex flex-col justify-between">
                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-3xl flex-1 flex flex-col h-[670px] relative overflow-hidden justify-between">
                          
                          {/* Top interactive device selector */}
                          <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3 shrink-0 z-10 w-full">
                            <div className="flex gap-1 bg-[#05070B] p-0.5 rounded-lg border border-slate-800 text-[9px] font-bold">
                              <button
                                onClick={() => setPhoneViewMode("app")}
                                className={`px-2 py-1 rounded transition-all ${phoneViewMode === "app" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-400 hover:text-white"}`}
                              >
                                📱 App Sim
                              </button>
                              
                              {selectedBroker.external_link && (
                                <button
                                  onClick={() => setPhoneViewMode("link")}
                                  className={`px-2 py-1 rounded transition-all flex items-center gap-0.5 ${phoneViewMode === "link" ? "bg-emerald-500/20 text-emerald-400" : "text-gray-400 hover:text-white"}`}
                                >
                                  <Globe className="w-2.5 h-2.5" /> Web Link
                                </button>
                              )}

                              {selectedBroker.uploaded_html && (
                                <button
                                  onClick={() => setPhoneViewMode("sandbox")}
                                  className={`px-2 py-1 rounded transition-all flex items-center gap-0.5 ${phoneViewMode === "sandbox" ? "bg-purple-500/20 text-purple-400" : "text-gray-400 hover:text-white"}`}
                                >
                                  <FileText className="w-2.5 h-2.5" /> Live Sandbox
                                </button>
                              )}
                            </div>

                            <span className="text-[9px] text-gray-500 font-mono">Mobile Sandbox Frame</span>
                          </div>

                          {/* Interactive Smartphone Viewport Body Mockup */}
                          <div className="flex-1 overflow-hidden relative flex flex-col justify-center items-center w-full">
                            <div className="w-full max-w-[340px] mx-auto bg-black rounded-[36px] p-2.5 border-4 border-slate-800 shadow-2xl relative h-[560px] overflow-hidden flex flex-col bg-[#05070a]">
                              
                              {/* Dynamic Camera Sensor Notch */}
                              <div className="absolute top-[8px] left-1/2 transform -translate-x-1/2 w-24 h-4 bg-black rounded-full z-40 flex items-center justify-center gap-2 border border-slate-900">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
                                <span className="w-1 h-1.5 rounded-full bg-slate-900 pointer-events-none"></span>
                              </div>

                              {/* CONDITIONAL RENDER PER TAB VIEW MODE */}
                              {phoneViewMode === "link" && selectedBroker.external_link ? (
                                <div className="w-full h-full rounded-[24px] overflow-hidden bg-white relative flex flex-col">
                                  <div className="bg-slate-900 px-3 py-1.5 flex justify-between items-center text-[10px] font-mono shrink-0">
                                    <span className="text-gray-400 truncate max-w-[150px]">{selectedBroker.external_link}</span>
                                    <a
                                      href={selectedBroker.external_link}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-emerald-400 font-bold hover:underline flex items-center gap-0.5"
                                    >
                                      Launch Tab <ArrowUpRight className="w-3 h-3" />
                                    </a>
                                  </div>
                                  <div className="flex-1 relative">
                                    <iframe 
                                      src={selectedBroker.external_link} 
                                      className="absolute inset-0 w-full h-full border-none"
                                      sandbox="allow-scripts allow-same-origin allow-popups"
                                      title="Broker Preview"
                                      referrerPolicy="no-referrer"
                                    />
                                    {/* Glass alert warning fallback */}
                                    <div className="absolute bottom-2 left-2 right-2 bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl text-[9px] text-gray-300 leading-normal z-10 font-sans shadow-lg">
                                      ⚠️ Frame sandbox loading. If blocked by secure CORS policies of your online broker domain, use the <strong>Launch Tab</strong> top-right redirection link.
                                    </div>
                                  </div>
                                </div>
                              ) : phoneViewMode === "sandbox" && selectedBroker.uploaded_html ? (
                                <div className="w-full h-full rounded-[24px] overflow-hidden bg-slate-950 relative flex flex-col">
                                  <div className="bg-slate-900 px-3 py-1 flex justify-between items-center text-[8.5px] font-mono shrink-0 text-purple-400">
                                    <span>⚙️ CUSTOM EXTRACTED HTML Previewer</span>
                                    <span className="text-gray-500">{selectedBroker.uploaded_html.length} Bytes</span>
                                  </div>
                                  <iframe
                                    srcDoc={selectedBroker.uploaded_html}
                                    title="Custom extracted code view"
                                    className="flex-1 w-full border-none bg-slate-900"
                                    sandbox="allow-scripts allow-modals"
                                  />
                                </div>
                              ) : (
                                /* PREMIUM CRYPTO BROKER SMARTPHONE TERMINAL APP (Simulated Native App with full custom features) */
                                <div className="w-full h-full rounded-[24px] overflow-hidden bg-[#090D16] text-white flex flex-col relative select-none font-sans">
                                  
                                  {/* App Header */}
                                  <div className="bg-[#0D1220] p-3 pt-6 border-b border-slate-800 shrink-0 flex flex-col space-y-1 text-center items-center justify-center relative">
                                    
                                    {/* Insignia / Emblem watermark logo overlay */}
                                    {systemSettings?.custom_emblem_html && (
                                      <div 
                                        className="scale-75 origin-center transform" 
                                        dangerouslySetInnerHTML={{ __html: systemSettings.custom_emblem_html }} 
                                      />
                                    )}

                                    <div className="flex justify-between items-center w-full px-2 mt-1">
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono">
                                          {selectedBroker.alias.slice(0, 10).toUpperCase()} TERM
                                        </span>
                                      </div>
                                      
                                      <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 border border-indigo-900/30 rounded-full font-mono">
                                        ₦{(currentUser?.points || 0) * 150} Simulated
                                      </span>
                                    </div>
                                  </div>

                                  {/* App Body Area (Scrollable space) */}
                                  <div className="flex-1 overflow-y-auto p-3 text-xs space-y-3 scrollbar-none pb-12">
                                    
                                    {/* App tab 1: CoinMarketCap trading board */}
                                    {appCurrentTab === "trade" && (
                                      <div className="space-y-3">
                                        <div className="bg-[#0B0F19] rounded-xl p-2.5 border border-slate-800 flex justify-between items-center flex-wrap shrink-0 gap-1">
                                          <div className="text-[9.5px]">
                                            <span className="text-gray-500 uppercase tracking-widest block font-mono text-[8px]">ESTIMATED TOTAL BALANCE</span>
                                            <span className="text-sm font-black text-white font-mono mt-0.5 block">{currentUser?.points || 0} PLS</span>
                                          </div>
                                          <div className="text-right">
                                            <span className="text-[8.5px] font-bold text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded-lg border border-emerald-500/10">
                                              ✔ Stablecoin Live Ready
                                            </span>
                                          </div>
                                        </div>

                                        {/* CoinMarketCap price list */}
                                        <div className="space-y-1 outline-none">
                                          <span className="text-[8.5px] text-gray-500 font-black tracking-widest uppercase block font-mono mb-1">CoinMarketCap Hot Trackers</span>
                                          
                                          {Object.keys(coinPrices).map((coin) => {
                                            const token = coinPrices[coin];
                                            const isUp = token.change >= 0;
                                            return (
                                              <button
                                                key={coin}
                                                onClick={() => setTradeCoin(coin)}
                                                className={`w-full p-2 rounded-xl flex items-center justify-between border select-none transition-all ${
                                                  tradeCoin === coin 
                                                    ? "bg-[#0E1526] border-cyan-500/40 text-cyan-400" 
                                                    : "bg-[#0B0F19]/50 border-slate-800/60 hover:bg-[#0E1526]/50"
                                                }`}
                                              >
                                                <div className="flex items-center gap-1.5 text-left">
                                                  <div className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-gray-300">
                                                    {coin}
                                                  </div>
                                                  <div>
                                                    <span className="font-extrabold text-[10px] block text-white">{coin}/USDT</span>
                                                    <span className={`text-[8px] font-black ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                                                      {isUp ? "▲ +" : "▼ "}{token.change}%
                                                    </span>
                                                  </div>
                                                </div>

                                                {/* Mini Sparkline Chart */}
                                                <div className="w-12 h-6">
                                                  <svg width="48" height="24" className="overflow-visible">
                                                    <path
                                                      d={token.sparkline}
                                                      fill="none"
                                                      stroke={isUp ? "#10B981" : "#EF4444"}
                                                      strokeWidth="1.5"
                                                    />
                                                  </svg>
                                                </div>

                                                <div className="text-right font-mono text-[10.5px]">
                                                  <span className="font-black text-slate-100 block">
                                                    ${token.price.toLocaleString(undefined, { minimumFractionDigits: coin === "DOGE" ? 4 : 2 })}
                                                  </span>
                                                  <span className="text-[7.5px] text-gray-500">Live API tick</span>
                                                </div>
                                              </button>
                                            );
                                          })}
                                        </div>

                                        {/* Dynamic Instant Trades Dispatch Form widget */}
                                        <div className="bg-[#0B0F19] rounded-xl p-3 border border-slate-800 space-y-2.5">
                                          <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                                            <span className="text-[9px] font-black tracking-widest text-[#00E5FF] uppercase font-mono">Instant Trading Desk ({tradeCoin})</span>
                                            <span className="text-[8px] text-gray-500 font-mono">1 PLS = $150</span>
                                          </div>

                                          <div className="grid grid-cols-2 gap-2">
                                            <button
                                              type="button"
                                              onClick={() => setTradeType("buy")}
                                              className={`py-1.5 rounded-lg text-[10px] font-black border transition-all ${
                                                tradeType === "buy" 
                                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                                                  : "bg-[#05080E] border-slate-800 hover:bg-slate-900"
                                              }`}
                                            >
                                              🟢 Spot BUY Long
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setTradeType("sell")}
                                              className={`py-1.5 rounded-lg text-[10px] font-black border transition-all ${
                                                tradeType === "sell" 
                                                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40" 
                                                  : "bg-[#05080E] border-slate-800 hover:bg-slate-900"
                                              }`}
                                            >
                                              🔴 Margin SELL Short
                                            </button>
                                          </div>

                                          <div className="space-y-1">
                                            <div className="flex justify-between text-[8px] font-mono text-gray-500">
                                              <span>TRADE SIZE (PLS POINTS)</span>
                                              <span>YOUR WALLET: {currentUser?.points || 0} PLS</span>
                                            </div>
                                            <div className="flex gap-1.5 items-center">
                                              <input
                                                type="number"
                                                value={tradeAmount}
                                                onChange={(e) => setTradeAmount(e.target.value)}
                                                className="flex-1 bg-[#05080E] border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-mono font-bold text-white focus:outline-none"
                                              />
                                              <span className="text-[10px] font-bold text-slate-400 font-mono">PLS</span>
                                            </div>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => handleClientSideSimTrade(tradeCoin, tradeType, parseFloat(tradeAmount) || 10)}
                                            className={`w-full py-2 bg-[#00E5FF] hover:brightness-110 text-gray-950 font-black tracking-widest text-[10px] rounded-lg cursor-pointer transform active:scale-[0.98] transition-all uppercase leading-none`}
                                          >
                                            🚀 Execute Instant Trade Order
                                          </button>
                                        </div>

                                        {/* Simulator Active Positions History */}
                                        {simTradePositions.length > 0 && (
                                          <div className="space-y-1">
                                            <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest block font-mono">Current Position Index List</span>
                                            <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-none text-[9px] font-mono">
                                              {simTradePositions.map((pos, idx) => (
                                                <div key={idx} className="bg-[#0B0F19]/80 border border-slate-800 p-2 rounded-lg flex justify-between items-center">
                                                  <div>
                                                    <span className={pos.orderType === "buy" ? "text-emerald-400 font-bold" : "text-rose-450 font-bold"}>
                                                      {pos.orderType.toUpperCase()} {pos.coin}
                                                    </span>
                                                    <span className="text-[8px] text-gray-600 block">Entry: ${pos.entryPrice} @ {pos.timestamp}</span>
                                                  </div>
                                                  <div className="text-right">
                                                    <span className="text-white font-extrabold">{pos.sizePoints} PLS</span>
                                                    <span className={`block text-[8px] font-bold ${pos.profitPoints > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                                      {pos.profitPoints > 0 ? "+" : ""}{pos.profitPoints} PLS
                                                    </span>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* App tab 2: KYC clearance uploader */}
                                    {appCurrentTab === "kyc" && (
                                      <div className="space-y-3">
                                        <div className="bg-[#0B0F19] p-3 border border-slate-800 rounded-xl space-y-2 text-center">
                                          <ShieldCheck className="w-8 h-8 text-[#00E5FF] mx-auto animate-pulse" />
                                          <h4 className="text-[11px] font-black uppercase tracking-widest">Sovereign identity database</h4>
                                          <p className="text-[10px] text-gray-400 leading-relaxed font-normal">
                                            Compliance demands fully linked KYC credentials under decentralized regulatory protocol. Input your registration dossiers to authorize complete payout transactions.
                                          </p>
                                        </div>

                                        {kycSubmitStatus === "unsubmitted" ? (
                                          <form onSubmit={(e) => {
                                            e.preventDefault();
                                            if (!kycName) {
                                              alert("Input full legal name");
                                              return;
                                            }
                                            setKycSubmitStatus("submitting");
                                            setTimeout(() => {
                                              setKycSubmitStatus("verified");
                                              alert("🎉 Secure KYC cleared perfectly! Your profile is verified.");
                                            }, 2000);
                                          }} className="space-y-3 bg-[#0B0F19] p-3 border border-slate-800 rounded-xl text-left">
                                            
                                            <div className="space-y-1">
                                              <label className="text-[8.5px] font-bold uppercase text-gray-500 block font-mono">Legal Account Full Name</label>
                                              <input
                                                type="text"
                                                required
                                                value={kycName}
                                                onChange={(e) => setKycName(e.target.value)}
                                                placeholder="E.g. Gabriel Hudson"
                                                className="w-full bg-[#05080E] border border-slate-800 rounded-lg px-2 text-white text-[10.5px] py-1.5 focus:outline-none"
                                              />
                                            </div>

                                            <div className="space-y-1">
                                              <label className="text-[8.5px] font-bold uppercase text-gray-500 block font-mono">Verify Document Type</label>
                                              <select
                                                value={kycDocType}
                                                onChange={(e) => setKycDocType(e.target.value)}
                                                className="w-full bg-[#05080E] border border-[#1e293b] rounded-lg px-2 text-white text-[10.5px] py-1.5 focus:outline-none outline-none"
                                              >
                                                <option value="National ID">NIN / National Identification Card</option>
                                                <option value="International Passport">International Passport Document</option>
                                                <option value="BVN Credentials">Bank Verification Number (BVN)</option>
                                                <option value="Drivers License">Sovereign Driver's License Code</option>
                                              </select>
                                            </div>

                                            <div className="space-y-1">
                                              <label className="text-[8.5px] font-bold uppercase text-gray-500 block font-mono">Drag ID Card Image / Document</label>
                                              <div 
                                                onClick={() => {
                                                  setKycDocFile("card-scan.jpg");
                                                }}
                                                className="border border-dashed border-slate-800 bg-[#05080E] p-3 rounded-lg text-center cursor-pointer hover:bg-[#0E1526]/40"
                                              >
                                                {kycDocFile ? (
                                                  <span className="text-emerald-400 font-mono text-[9px] flex items-center justify-center gap-1">
                                                    ✔ ID-CARD-FRONT.JPG uploaded ({kycDocFile})
                                                  </span>
                                                ) : (
                                                  <span className="text-gray-500 font-mono text-[8.5px] block">
                                                    📁 Pick or Drop ID card photo image
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            <div className="space-y-1">
                                              <label className="text-[8.5px] font-bold uppercase text-gray-500 block font-mono">Real-time Selfie Capture</label>
                                              <div 
                                                onClick={() => {
                                                  setKycSelfie("selfie-shot.jpg");
                                                }}
                                                className="border border-dashed border-slate-800 bg-[#05080E] p-3 rounded-lg text-center cursor-pointer hover:bg-[#0E1526]/40"
                                              >
                                                {kycSelfie ? (
                                                  <span className="text-emerald-400 font-mono text-[9px] flex items-center justify-center gap-1">
                                                    ✔ BIOMETRIC_SELFIE.JPG captured ({kycSelfie})
                                                  </span>
                                                ) : (
                                                  <span className="text-gray-500 font-mono text-[8.5px] block">
                                                    📸 Drop Biometric Selfie photo
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            <button
                                              type="submit"
                                              className="w-full py-1.5 bg-cyan-400 text-gray-950 font-black tracking-wider rounded-lg text-[9.5px] uppercase cursor-pointer"
                                            >
                                              🔒 Submit Identity dossier for KYC check
                                            </button>

                                          </form>
                                        ) : kycSubmitStatus === "submitting" ? (
                                          <div className="p-8 text-center space-y-2 bg-[#0B0F19] rounded-xl border border-slate-800">
                                            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                                            <span className="text-xs font-mono font-bold text-cyan-400 block animate-pulse">HASHING PROTOCOLS ON BLOCKCHAIN...</span>
                                            <span className="text-[10px] text-gray-500 block">Encrypting document files on distributed network</span>
                                          </div>
                                        ) : (
                                          <div className="p-6 text-center space-y-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
                                            <Award className="w-10 h-10 text-emerald-400 mx-auto" />
                                            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">PASSPORT INDENTITY CLEARANCE SUCCESS</h4>
                                            <div className="p-2.5 rounded-xl bg-slate-950/80 text-[10px] text-gray-300 font-mono border border-slate-800 text-left space-y-1">
                                              <div><strong>HOLDER:</strong> {kycName.toUpperCase()}</div>
                                              <div><strong>DOCUMENT:</strong> {kycDocType.toUpperCase()}</div>
                                              <div><strong>STAMP:</strong> SECURE LAYER-KYC VERIFIED</div>
                                            </div>
                                            <p className="text-[9.5px] text-slate-400">Your profile KYC is approved on this broker database node.</p>
                                            <button
                                              onClick={() => {
                                                setKycDocFile(null);
                                                setKycSelfie(null);
                                                setKycSubmitStatus("unsubmitted");
                                              }}
                                              className="text-[9px] font-bold text-gray-500 hover:text-white underline cursor-pointer"
                                            >
                                              Reset identity dossier
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* App tab 3: Spin & Win game wheel */}
                                    {appCurrentTab === "spin" && (
                                      <div className="space-y-4 text-center flex flex-col items-center">
                                        <div className="bg-[#0B0F19] p-2.5 border border-slate-800 rounded-xl tracking-wide w-full flex justify-between items-center text-left">
                                          <div>
                                            <span className="text-[8px] text-gray-500 font-mono block">SPIN COST</span>
                                            <span className="text-[10.5px] font-black text-white font-mono">20 PLS points</span>
                                          </div>
                                          <div>
                                            <span className="text-[8px] text-gray-500 font-mono block text-right">PLS BALANCE</span>
                                            <span className="text-[10.5px] font-black text-cyan-400 font-mono">{currentUser?.points || 0} PLS</span>
                                          </div>
                                        </div>

                                        {/* CSS Interactive Wheel vector element */}
                                        <div className="relative w-44 h-44 rounded-full flex items-center justify-center shrink-0">
                                          {/* Static Pointer arrow outside rotating frame */}
                                          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-red-500 clip-path-triangle z-30 shadow border border-white"></div>
                                          
                                          <div 
                                            className="w-40 h-40 rounded-full border-4 border-slate-800 shadow-2xl relative overflow-hidden transition-transform duration-[3000ms] ease-[cubic-bezier(0.15,0.85,0.3,1)]"
                                            style={{ 
                                              transform: `rotate(${spinDegree}deg)`,
                                              backgroundImage: "conic-gradient(#10B981 0deg 45deg, #4B5563 45deg 90deg, #06B6D4 90deg 135deg, #F97316 135deg 180deg, #A855F7 180deg 225deg, #64748B 225deg 270deg, #EAB308 270deg 315deg, #14B8A6 315deg 360deg)" 
                                            }}
                                          >
                                            {/* Beautiful vector sector label overlay indicators */}
                                            <div className="absolute inset-0 flex items-center justify-center relative pointer-events-none">
                                              <span className="absolute transform rotate-22.5 -translate-y-12 text-[8px] font-black text-white">JACKPOT</span>
                                              <span className="absolute transform rotate-67.5 -translate-y-12 text-[8px] font-black text-white">+15 PLS</span>
                                              <span className="absolute transform rotate-112.5 -translate-y-12 text-[8px] font-black text-white">+50 PLS</span>
                                              <span className="absolute transform rotate-157.5 -translate-y-12 text-[8px] font-black text-white">DOUBLE</span>
                                              <span className="absolute transform rotate-202.5 -translate-y-12 text-[8px] font-black text-white">TRY AGAIN</span>
                                              <span className="absolute transform rotate-247.5 -translate-y-12 text-[8px] font-black text-white">+30 PLS</span>
                                              <span className="absolute transform rotate-292.5 -translate-y-12 text-[8px] font-black text-white">DUMP</span>
                                              <span className="absolute transform rotate-337.5 -translate-y-12 text-[8px] font-black text-white">+100 PLS</span>
                                            </div>
                                            
                                            {/* Wheel Pin Center */}
                                            <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow">
                                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                            </div>

                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          disabled={spinProcessing}
                                          onClick={startSpinWheel}
                                          className={`px-6 py-2 rounded-xl font-mono text-xs font-black tracking-widest uppercase transition-all shadow ${
                                            spinProcessing 
                                              ? "bg-slate-800 text-gray-500 cursor-not-allowed animate-pulse" 
                                              : "bg-gradient-to-r from-yellow-500 to-amber-500 hover:brightness-110 active:scale-95 text-gray-950 cursor-pointer"
                                          }`}
                                        >
                                          {spinProcessing ? "⚡ SPINNING MATRIX..." : "🎡 SPIN WHEEL (-20 PLS)"}
                                        </button>

                                        {spinFeedback && (
                                          <div className="bg-[#0D1220] border border-cyan-500/20 px-3 py-2 rounded-xl text-center text-slate-100 animate-bounce font-mono text-[10px]">
                                            🎉 {spinFeedback} 🎉
                                          </div>
                                        )}

                                      </div>
                                    )}

                                    {/* App tab 4: Referrals and affiliate lists */}
                                    {appCurrentTab === "refs" && (
                                      <div className="space-y-3">
                                        <div className="bg-[#0B0F19] p-3 border border-slate-800 rounded-xl space-y-1 shadow-inner">
                                          <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Passive Affiliate commissions</span>
                                          <p className="text-[9.5px] text-gray-400 leading-normal font-normal">
                                            Earn a 10% cash reward immediately on every referral checkout, top-up, and yield staking cycle. Perfect points distribution matrix.
                                          </p>
                                        </div>

                                        {/* Promotional items copy widgets */}
                                        <div className="space-y-2 text-left">
                                          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-[10px] font-mono">
                                            <span className="text-[8px] text-gray-500 font-bold block uppercase font-mono">Affiliate promo code</span>
                                            <div className="flex justify-between items-center bg-[#07090D] p-1.5 rounded border border-slate-800">
                                              <span className="text-cyan-400 font-extrabold font-mono">HUB-REF-{currentUser?.id.substring(0, 5).toUpperCase()}</span>
                                              <button 
                                                onClick={() => {
                                                  navigator.clipboard.writeText(`HUB-REF-${currentUser?.id.substring(0, 5).toUpperCase()}`);
                                                  alert(" Affilation Code copied to clipboard!");
                                                }}
                                                className="text-gray-400 hover:text-white cursor-pointer"
                                              >
                                                <Copy className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>

                                          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-[10px] font-mono">
                                            <span className="text-[8px] text-gray-500 font-bold block uppercase font-mono">Unique signup Link</span>
                                            <div className="flex justify-between items-center bg-[#07090D] p-1.5 rounded border border-slate-800">
                                              <span className="text-cyan-400 font-bold truncate tracking-tighter text-[9px]">https://stylehub.net/join?ref={currentUser?.email.split('@')[0]}</span>
                                              <button 
                                                onClick={() => {
                                                  navigator.clipboard.writeText(`https://stylehub.net/join?ref=${currentUser?.email.split('@')[0]}`);
                                                  alert(" Referral Link copied to clipboard!");
                                                }}
                                                className="text-gray-400 hover:text-white cursor-pointer"
                                              >
                                                <Copy className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={simulateReferralSignup}
                                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg text-[9.5px] uppercase cursor-pointer"
                                        >
                                          👥 Simulate a new partner signup (+50 PLS)
                                        </button>

                                        {/* My Referred list */}
                                        <div className="space-y-1">
                                          <span className="text-[8.5px] text-gray-500 font-black uppercase tracking-widest block font-mono">Invited accounts ledger</span>
                                          <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-none text-[8.5px] font-mono select-none">
                                            {referrals.map((ref, idx) => (
                                              <div key={idx} className="bg-[#0B0F19] border border-slate-800 p-1.5 rounded flex justify-between text-left items-center">
                                                <div>
                                                  <span className="text-gray-300 block">{ref.email}</span>
                                                  <span className="text-[7px] text-gray-500">Status: {ref.status || "Ready"}</span>
                                                </div>
                                                <span className="text-emerald-400">+{ref.points} PLS commission</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                  </div>

                                  {/* App Bottom Navigation Drawer Bar */}
                                  <div className="absolute bottom-0 right-0 left-0 bg-[#0D1220] border-t border-slate-800 p-1 flex justify-around items-center shrink-0 text-[8.5px] font-black tracking-wide uppercase font-mono z-20">
                                    <button 
                                      onClick={() => setAppCurrentTab("trade")}
                                      className={`flex flex-col items-center py-1 flex-1 rounded-xl cursor-pointer ${appCurrentTab === "trade" ? "text-cyan-400 bg-slate-900/40" : "text-gray-400 hover:text-white"}`}
                                    >
                                      <TrendingUp className="w-3.5 h-3.5" />
                                      <span className="text-[7.5px] mt-0.5">CMC Trade</span>
                                    </button>
                                    <button 
                                      onClick={() => setAppCurrentTab("kyc")}
                                      className={`flex flex-col items-center py-1 flex-1 rounded-xl cursor-pointer ${appCurrentTab === "kyc" ? "text-cyan-400 bg-slate-900/40" : "text-gray-400 hover:text-white"}`}
                                    >
                                      <ShieldCheck className="w-3.5 h-3.5" />
                                      <span className="text-[7.5px] mt-0.5">KYC ID</span>
                                    </button>
                                    <button 
                                      onClick={() => setAppCurrentTab("spin")}
                                      className={`flex flex-col items-center py-1 flex-1 rounded-xl cursor-pointer ${appCurrentTab === "spin" ? "text-cyan-400 bg-slate-900/40" : "text-gray-400 hover:text-white"}`}
                                    >
                                      <Award className="w-3.5 h-3.5" />
                                      <span className="text-[7.5px] mt-0.5">Spin Win</span>
                                    </button>
                                    <button 
                                      onClick={() => setAppCurrentTab("refs")}
                                      className={`flex flex-col items-center py-1 flex-1 rounded-xl cursor-pointer ${appCurrentTab === "refs" ? "text-cyan-400 bg-slate-900/40" : "text-gray-400 hover:text-white"}`}
                                    >
                                      <Users className="w-3.5 h-3.5" />
                                      <span className="text-[7.5px] mt-0.5">Invite</span>
                                    </button>
                                  </div>

                                </div>
                              )}

                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* SUB TAB 2: DETAILED STRATEGY STRUCUTRED READING */}
              {activeSubTab === "readme" && (
                <div className="space-y-4">
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-slate-300 leading-relaxed max-h-[380px] overflow-y-auto space-y-4 whitespace-pre-wrap">
                    <h3 className="text-sm font-black text-[#00E5FF] tracking-wider border-b border-slate-900 pb-2 mb-4 flex items-center gap-1.5 font-sans font-black">
                      <BookOpen className="w-4 h-4 text-cyan-400" /> Operational Protocol & Custody terms
                    </h3>
                    
                    {/* Parse manual strategies custom styling */}
                    <div className="font-sans text-xs text-gray-300 space-y-4 font-normal">
                      <p>
                        Our specialized digital contracts govern allocation custody. Review strategy disclosures before deploying active core points capital.
                      </p>
                      
                      <div className="p-4 rounded-xl border border-slate-900 bg-slate-950">
                        <h4 className="font-bold text-white uppercase text-[10.5px] tracking-wide mb-2 flex items-center gap-1.5 text-[#00E5FF]">
                          📋 Strategy Parameters Sheet
                        </h4>
                        <ul className="space-y-2 text-[11px] list-disc pl-5">
                          <li><strong>DEX Multi-Routing Scanning:</strong> Programmed cross DEX integrations. Checks and routes liquid pools automatically twice every hour block.</li>
                          <li><strong>Leverage Capital Risk limits:</strong> Margin metrics strictly secured underneath automatic trailing Stops which sell allocation locks on crash.</li>
                          <li><strong>Direct Compound:</strong> Built-in simulated yield generators reinvest capital blocks with 1-click execution.</li>
                        </ul>
                      </div>

                      <div className="p-4 border border-rose-900/20 bg-rose-950/5 rounded-xl">
                        <h4 className="font-black text-rose-500 uppercase text-[10.5px] tracking-wide mb-1.5 flex items-center gap-1.5 leading-none">
                          <ShieldAlert className="w-4 h-4 text-rose-500" /> General Risk Limit Disclosures
                        </h4>
                        <p className="text-[10.5px] text-gray-400 leading-normal">
                          Crypto trading simulations carry extreme directional and delta risks. Liquidations are fully simulated on extreme market shocks. StyleHub & Jadai Studios bear zero coverage for points lost inside High/Extreme volatility allocation pools.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB 3: ADMIN CONFIGURATION HUB / CREATION */}
              {activeSubTab === "admin" && isAdmin && (
                <div className="space-y-5">
                  <div className="p-4 bg-red-955/5 border border-red-500/20 rounded-2xl flex items-center gap-2.5">
                    <AlertOctagon className="w-5 h-5 text-red-500" />
                    <div>
                      <span className="text-[9px] font-black text-red-500 uppercase tracking-widest block font-mono">
                        SOVEREIGN OVERRULING ACTIVE
                      </span>
                      <p className="text-[11px] text-slate-300 leading-tight">
                        Modifying parameters writes configuration records to central database. Set custom URLs or upload standalone HTML/JS bundles.
                      </p>
                    </div>
                  </div>

                  <div className="flex bg-[#05070A] p-1 border border-slate-800 rounded-xl max-w-xs text-[10.5px] font-bold mb-2">
                    <button 
                      onClick={() => {
                        setAdminCreateMode(false);
                        loadAdminStatesForBroker(selectedBroker);
                      }} 
                      className={`flex-1 py-1 rounded-lg ${!adminCreateMode ? "bg-slate-800 text-white" : "text-gray-400"}`}
                    >
                      ⚙️ Edit Current
                    </button>
                    <button 
                      onClick={() => {
                        setAdminCreateMode(true);
                        setAdminName("");
                        setAdminAlias("");
                        setAdminDesc("");
                        setAdminApy("");
                        setAdminCost("");
                        setAdminMinInvest("");
                        setAdminExternalLink("");
                        setAdminUploadedHtml("");
                      }} 
                      className={`flex-1 py-1 rounded-lg ${adminCreateMode ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" : "text-gray-400"}`}
                    >
                      ➕ Craft Custom Node
                    </button>
                  </div>

                  <form onSubmit={adminCreateMode ? handleAdminCreateBroker : handleAdminUpdateBroker} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Broker/Node Name</label>
                        <input
                          type="text"
                          required
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                          placeholder="e.g. InvestSafe Pro"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">System Alias</label>
                        <input
                          type="text"
                          required
                          value={adminAlias}
                          onChange={(e) => setAdminAlias(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white"
                          placeholder="e.g. investsafe"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Risk Rating</label>
                        <select
                          value={adminRiskLevel}
                          onChange={(e: any) => setAdminRiskLevel(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="Low">Low Risk</option>
                          <option value="Medium">Medium Risk</option>
                          <option value="High">High Risk</option>
                          <option value="Very High">Very High Risk</option>
                          <option value="Extreme">Extreme Volatility</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">APY Rate %</label>
                        <input
                          type="number"
                          value={adminApy}
                          onChange={(e) => setAdminApy(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white text-emerald-400"
                          placeholder="Projected APY value"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Unlock Cost (PLS)</label>
                        <input
                          type="number"
                          value={adminCost}
                          onChange={(e) => setAdminCost(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white text-yellow-500"
                          placeholder="Unlock cost PLS"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Min Invest Allocation</label>
                        <input
                          type="number"
                          value={adminMinInvest}
                          onChange={(e) => setAdminMinInvest(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white"
                          placeholder="Min points"
                        />
                      </div>

                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase block">Short Slogan / Description</label>
                      <textarea
                        value={adminDesc}
                        onChange={(e) => setAdminDesc(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                        placeholder="Explain the custom broker highlights..."
                      />
                    </div>

                    <div className="border-t border-slate-900 pt-3 space-y-3">
                      <span className="text-[9.5px] font-black text-cyan-400 block tracking-widest uppercase font-mono">External Broker Previews & HTML/JS Uploads</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div className="space-y-1 text-left">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">Online Web Broker link URL</label>
                          <input
                            type="url"
                            value={adminExternalLink}
                            onChange={(e) => setAdminExternalLink(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                            placeholder="e.g. https://investsafe.example.com"
                          />
                          <span className="text-[8.5px] text-gray-500 block">Links their live online broker! Embeds in mobile preview or redirects.</span>
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">Extract Custom File Code (.HTML, .JS, .TXT, .ZIP)</label>
                          <div className="flex gap-2">
                            <label className="flex-1 bg-slate-950 border border-dashed border-slate-800 hover:bg-slate-900/40 p-2.5 rounded-xl cursor-pointer text-center text-xs font-mono text-slate-300">
                              ☁ Choose File to Extract Code
                              <input
                                type="file"
                                accept=".html,.js,.txt,.css"
                                onChange={handleBrokerCodeUpload}
                                className="hidden"
                              />
                            </label>
                            
                            {adminUploadedHtml && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm("Purge extracted code buffer?")) {
                                    setAdminUploadedHtml("");
                                  }
                                }}
                                className="px-3 bg-rose-950/20 text-rose-400 border border-rose-900/30 rounded-xl text-xs hover:bg-rose-950/40"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <span className="text-[8.5px] text-gray-500 block">Reads custom file scripts text automatically to execute in live sandboxed iframe!</span>
                        </div>

                      </div>

                      {adminUploadedHtml && (
                        <div className="space-y-1 font-mono text-[9px]">
                          <span className="text-gray-400 font-bold">Extracted Native Code Buffer Preview:</span>
                          <textarea
                            readOnly
                            value={adminUploadedHtml.slice(0, 500) + (adminUploadedHtml.length > 500 ? "\n... (truncated for preview)" : "")}
                            rows={3}
                            className="w-full bg-[#05070B] border border-slate-800 rounded-xl p-2.5 text-gray-500 whitespace-pre scrollbar-none"
                          />
                        </div>
                      )}

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase block">Node Deployment Status</label>
                        <select
                          value={String(adminStatus)}
                          onChange={(e) => setAdminStatus(e.target.value === "true")}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        >
                          <option value="true">Active & Open</option>
                          <option value="false">Maintenance Lock</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-gray-950 font-black text-xs uppercase rounded-xl tracking-wider hover:brightness-110 shadow cursor-pointer active:scale-95 transition-all text-center"
                        >
                          {adminCreateMode 
                            ? "🚀 Deploy Custom Smart Node Deeper" 
                            : "🌟 SECURELY TRANSMIT SOVEREIGN RE-CONFIG"
                          }
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* SUB TAB 4: ADMIN USERS CONTROLLER TABLE */}
              {activeSubTab === "users" && isAdmin && (
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center bg-[#07090D] p-3 border border-slate-800 rounded-2xl">
                    <div>
                      <h4 className="text-xs font-black uppercase text-purple-400 tracking-wider">Account Ledger Auditor</h4>
                      <p className="text-[10px] text-gray-400">View user stats, modify point records, and override KYC statuses.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={adminSearchUser}
                        onChange={(e) => setAdminSearchUser(e.target.value)}
                        placeholder="Search email..."
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {selectedUserForEdit ? (
                    <form onSubmit={handleUpdateUsersRoleOrPoints} className="bg-slate-950 p-4 border border-slate-800 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <span className="text-xs font-bold text-[#00E5FF] font-mono">EDITING ACCOUNT: {selectedUserForEdit.email}</span>
                        <button 
                          type="button" 
                          onClick={() => setSelectedUserForEdit(null)}
                          className="text-[10px] text-gray-500 hover:text-white"
                        >
                          ✕ Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Set Point Balance</label>
                          <input
                            type="number"
                            required
                            value={editUserPoints}
                            onChange={(e) => setEditUserPoints(e.target.value)}
                            className="w-full bg-[#05070a] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">Override KYC Status</label>
                          <select
                            value={editUserKyc}
                            onChange={(e) => setEditUserKyc(e.target.value)}
                            className="w-full bg-[#05070a] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white text-cyan-400 font-black outline-none border"
                          >
                            <option value="unsubmitted">Unsubmitted (Standard)</option>
                            <option value="pending">Pending Document Approval</option>
                            <option value="verified">Verified (Clearance Signed)</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-purple-650 to-indigo-500 text-white font-mono font-black text-[10.5px] uppercase tracking-wider rounded-xl cursor-pointer"
                      >
                        ⚡ Save Account Audit Changes
                      </button>

                    </form>
                  ) : (
                    <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/80">
                      <table className="w-full text-left border-collapse text-xs select-none">
                        <thead>
                          <tr className="bg-slate-950 border-b border-slate-800 font-mono text-gray-500 text-[9.5px]">
                            <th className="p-3">User Account</th>
                            <th className="p-3 text-right">Points Registry</th>
                            <th className="p-3 text-center">Subscription Tier</th>
                            <th className="p-3 text-center">KYC Clearance</th>
                            <th className="p-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900 font-mono text-[10.5px]">
                          {usersList
                            .filter(u => !adminSearchUser || u.email.toLowerCase().includes(adminSearchUser.toLowerCase()))
                            .map((u) => {
                              const isSelf = currentUser && u.id === currentUser.id;
                              return (
                                <tr key={u.id} className="hover:bg-slate-900/30">
                                  <td className="p-3">
                                    <span className="font-extrabold text-slate-200 block truncate max-w-[170px]">{u.email}</span>
                                    <span className="text-[8px] text-gray-500">Joined: {new Date(u.created_at).toLocaleDateString()} {isSelf ? "(YOU)" : ""}</span>
                                  </td>
                                  <td className="p-3 text-right font-black text-cyan-400">{u.points} PLS</td>
                                  <td className="p-3 text-center">
                                    <span className="px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 font-bold text-[8.5px] border border-indigo-900/30 uppercase">
                                      {u.subscription_tier || "basic"}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-black ${
                                      u.kyc_status === "verified" 
                                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/30" 
                                        : u.kyc_status === "pending"
                                          ? "bg-yellow-950/60 text-yellow-500 border border-yellow-900/30"
                                          : "bg-slate-900 text-gray-500"
                                    }`}>
                                      {u.kyc_status.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => handleSelectUserForEdit(u)}
                                      className="px-2 py-1 bg-purple-950/30 border border-purple-900/30 text-purple-300 rounded hover:bg-purple-950/60 text-[9px] font-black"
                                    >
                                      🖊 Audit
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              )}

            </div>
          ) : (
            <div className="bg-[#0B0E14] border border-slate-800 rounded-3xl p-12 text-center text-xs text-slate-500 italic font-mono flex items-center justify-center h-full">
              Select an active autonomous crypto node from the list directory to start.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
