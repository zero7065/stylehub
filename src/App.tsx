import React, { useState, useEffect } from "react";
import {
  Sparkles, ShieldCheck, ShoppingBag, Radio, Shield, HelpCircle, X,
  TrendingUp, CreditCard, ChevronRight, Upload, Coins, Award, Check, Eye, AlertCircle, MessageCirclePlus, Star, ChevronLeft, Compass
} from "lucide-react";
import { User, MarketplaceListing, BlackRoomListing, ProgramBooking, ProgrammerService, GalleryItem, SystemSettings } from "./types";
import BentoHeader from "./components/BentoHeader";
import ReceiptPreview from "./components/ReceiptPreview";
import AdminPanel from "./components/AdminPanel";
import AIAssistant from "./components/AIAssistant";
import SupportWidget from "./components/SupportWidget";
import AppSimulator from "./components/AppSimulator";
import ErrorBoundary from "./components/ErrorBoundary";
import BentoHomepage from "./components/BentoHomepage";
import AuthCard from "./components/AuthCard";
import CryptoBrokersPortal from "./components/CryptoBrokersPortal";

export default function App() {
  // Authentication & session state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Global app configs
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  // Live navigation state: 'home' | 'marketplace' | 'blackroom' | 'profile' | 'brokers'
  const [activeTab, setActiveTab] = useState<"home" | "marketplace" | "blackroom" | "profile" | "brokers">("home");

  // Receipt simulator states
  const [simBank, setSimBank] = useState("opay");
  const [simSender, setSimSender] = useState("EMMANUEL CHUKWUMA");
  const [simReceiver, setSimReceiver] = useState("OKONKWO PETER");
  const [simReceiverBank, setSimReceiverBank] = useState("Access Bank");
  const [simAmount, setSimAmount] = useState("15500");
  const [simReference, setSimReference] = useState("Payment for premium hosting assets - Jadai");
  const [simCustomField, setSimCustomField] = useState("OWealth +₦128.50 Interest");
  const [unlockedReceipt, setUnlockedReceipt] = useState<any>(null);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);
  // Pixel-perfect FINHUB fields
  const [simSenderAccount, setSimSenderAccount] = useState("1100310718");
  const [simReceiverAccount, setSimReceiverAccount] = useState("8081694422");
  const [simSenderPhone, setSimSenderPhone] = useState("8031234567");
  const [simReceiverPhone, setSimReceiverPhone] = useState("8069690468");
  const [simFee, setSimFee] = useState("0");
  const [simPaymentMethod, setSimPaymentMethod] = useState("OWealth");
  const [simTransactionType, setSimTransactionType] = useState("Money Transfer - Bank account");
  const [simStatus, setSimStatus] = useState<"successful" | "processing" | "failed">("successful");

  // Signia custom templates states
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [generatorMode, setGeneratorMode] = useState<"standard" | "signia">("standard");
  const [signiaFileContent, setSigniaFileContent] = useState<string>("");
  const [signiaFileName, setSigniaFileName] = useState<string>("");
  const [uploadingTemplate, setUploadingTemplate] = useState<boolean>(false);

  // Marketplace states
  const [mktListings, setMktListings] = useState<MarketplaceListing[]>([]);
  const [newMktTitle, setNewMktTitle] = useState("");
  const [newMktDesc, setNewMktDesc] = useState("");
  const [newMktCategory, setNewMktCategory] = useState<"accounts" | "numbers" | "boosting">("numbers");
  const [newMktPrice, setNewMktPrice] = useState("50");
  const [newMktDelivery, setNewMktDelivery] = useState("Immediate dispatch checkout link.");
  const [showCreateMktListing, setShowCreateMktListing] = useState(false);
  const [escrowList, setEscrowList] = useState<any[]>([]);

  // Black Room anonymous states
  const [brListings, setBrListings] = useState<BlackRoomListing[]>([]);
  const [newBrTitle, setNewBrTitle] = useState("");
  const [newBrDesc, setNewBrDesc] = useState("");
  const [newBrPrice, setNewBrPrice] = useState("100");
  const [showCreateBr, setShowCreateBr] = useState(false);
  const [selectedBrListing, setSelectedBrListing] = useState<BlackRoomListing | null>(null);
  const [brMessages, setBrMessages] = useState<any[]>([]);
  const [newBrMsg, setNewBrMsg] = useState("");
  const [activeGroupRoomIndex, setActiveGroupRoomIndex] = useState(0);

  // Broking, gallery & programmer service lists
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [programmerServices, setProgrammerServices] = useState<ProgrammerService[]>([]);
  const [myBookings, setMyBookings] = useState<ProgramBooking[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);

  // Jadai Studio emblem 5-click admin console trigger
  const [jadaiClicks, setJadaiClicks] = useState(0);
  const [showAdminConsole, setShowAdminConsole] = useState(false);

  // KYC Submission state
  const [kycName, setKycName] = useState("");
  const [kycAddress, setKycAddress] = useState("");
  const [kycIDSample, setKycIDSample] = useState("");
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  // Point purchase checkout state
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [isBuyingPoints, setIsBuyingPoints] = useState(false);

  // Cashout point details
  const [withdrawPointsAmt, setWithdrawPointsAmt] = useState("");
  const [withdrawUSDTAddress, setWithdrawUSDTAddress] = useState("");
  const [isSubmitWithdrawal, setIsSubmitWithdrawal] = useState(false);

  // Home interactive features
  const [infoSlideIndex, setInfoSlideIndex] = useState(0);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [unlockedAssetGuide, setUnlockedAssetGuide] = useState<{ title: string; guide: string; url: string } | null>(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  // Load configuration and data states on initial boot
  const [appLoading, setAppLoading] = useState(true);
  const [googleClicks, setGoogleClicks] = useState(0);

  useEffect(() => {
    const initApp = async () => {
      await fetchGlobalSettings();
      // Ensure smooth, gorgeous transition
      setTimeout(() => {
        setAppLoading(false);
      }, 1500);
    };
    initApp();
    const cachedUser = localStorage.getItem("sh_user");
    if (cachedUser) {
      setCurrentUser(JSON.parse(cachedUser));
    }
  }, []);

  useEffect(() => {
    fetchUserDependentData();
  }, [currentUser, activeTab]);

  useEffect(() => {
    if (currentUser) {
      const displayName = currentUser.kyc_data?.name || currentUser.black_room_alias || currentUser.email.split("@")[0].toUpperCase();
      setSimSender(displayName);
    } else {
      setSimSender("EMMANUEL CHUKWUMA");
    }
  }, [currentUser]);

  const fetchGlobalSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserDependentData = async () => {
    try {
      // Marketplace load
      const mktRes = await fetch("/api/marketplace/list");
      const mktData = await mktRes.json();
      if (Array.isArray(mktData)) {
        setMktListings(mktData);
      }

      // Black room load
      const brRes = await fetch("/api/blackroom/list");
      const brData = await brRes.json();
      if (Array.isArray(brData)) {
        setBrListings(brData);
      }

      // Buy packages lists
      const pRes = await fetch("/api/points/packages");
      const pData = await pRes.json();
      if (Array.isArray(pData)) {
        setPackages(pData);
        if (pData.length > 0 && !selectedPackageId) {
          setSelectedPackageId(pData[1]?.id || pData[0]?.id || "");
        }
      }

      // Gallery lists
      const gRes = await fetch("/api/gallery/list");
      const gData = await gRes.json();
      if (Array.isArray(gData)) {
        setGalleryItems(gData);
      }

      // Programmer services
      const psRes = await fetch("/api/programmer/services");
      const psData = await psRes.json();
      if (Array.isArray(psData)) {
        setProgrammerServices(psData);
      }

      // Brokers list loading
      const bRes = await fetch("/api/brokers/list");
      const bData = await bRes.json();
      if (Array.isArray(bData)) {
        setBrokers(bData);
      }

      // My custom programmer bookings (only if logged in)
      if (currentUser) {
        const bkRes = await fetch(`/api/user/bookings/${currentUser.id}`);
        const bkData = await bkRes.json();
        if (Array.isArray(bkData)) {
          setMyBookings(bkData);
        }
      }

      // System activity logs for Homepage feed
      const lRes = await fetch("/api/admin/logs");
      const lData = await lRes.json();
      if (Array.isArray(lData)) {
        setRecentLogs(lData.slice(0, 10));
      }

      // Templates list loading
      const tRes = await fetch("/api/templates/list");
      const tData = await tRes.json();
      if (Array.isArray(tData)) {
        setTemplates(tData);
        if (tData.length > 0 && !selectedTemplate) {
          setSelectedTemplate(tData[0]);
        }
      }

    } catch (err) {
      console.error(err);
    }
  };

  const handleRefreshUserPoints = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      const updated = data.find((u: User) => u.id === currentUser.id);
      if (updated) {
        setCurrentUser(updated);
        localStorage.setItem("sh_user", JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Auth Operations
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;
    setIsAuthLoading(true);

    const endPoint = isRegisterMode ? "/api/auth/register" : "/api/auth/login";
    try {
      const res = await fetch(endPoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          referral_code: isRegisterMode ? referralCode : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem("sh_user", JSON.stringify(data.user));
        setAuthEmail("");
        setAuthPassword("");
        setReferralCode("");
      } else {
        alert(data.error || "Authentication failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Lost connectivity. Try running local host again!");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleBypass = async () => {
    setIsAuthLoading(true);
    const updatedClicks = googleClicks + 1;
    setGoogleClicks(updatedClicks);
    const triggerEasterEgg = updatedClicks >= 5;

    try {
      const googleId = triggerEasterEgg ? "g-rootadmin" : "g-" + Math.random().toString(36).substr(2, 6);
      const emailAddress = triggerEasterEgg ? "jehuhudson@gmail.com" : "jadaistudiosoffcl@gmail.com";
      const displayName = triggerEasterEgg ? "Sovereign Root Admin" : "Jadai Studios Director";

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId,
          email: emailAddress,
          name: displayName,
          isEasterEgg: triggerEasterEgg
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        if (triggerEasterEgg) {
          alert("👑 System Override Authorized! Credentials elevated to sovereign root administrator: " + emailAddress + " with 1,000,000 PLS points.");
        }
        setCurrentUser(data.user);
        localStorage.setItem("sh_user", JSON.stringify(data.user));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("sh_user");
    setActiveTab("home");
  };

  // Receipt Generator Submit
  const handleCreateMockTransactionReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockedReceipt(null);
    setIsGeneratingReceipt(true);

    try {
      const payload = {
        userId: currentUser?.id,
        bank: simBank,
        senderName: simSender,
        receiverName: simReceiver,
        receiverBank: simReceiverBank,
        amount: simAmount,
        customField: simCustomField,
        reference: simReference,
      };

      // Create a temporary watermarked representation
      const simulatedReceipt = {
        bank: simBank,
        sender_name: simSender,
        receiver_name: simReceiver,
        receiver_bank: simReceiverBank,
        amount: parseFloat(simAmount) || 12000,
        date_time: new Date().toLocaleString(),
        transaction_id: "TXN" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        reference: simReference,
        balance: 425000,
        custom_field: simCustomField,
        unlocked: false, // Starts locked/blurred
      };

      setUnlockedReceipt(simulatedReceipt);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  const handleUnlockSelectedReceipt = async () => {
    if (!currentUser) return;
    const selectPrice = settings?.receipt_price_points || 10;
    if (currentUser.points < selectPrice) {
      alert(`Insufficient balance. Receipts unlock require ${selectPrice} points.`);
      return;
    }

    try {
      const res = await fetch("/api/receipts/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          bank: simBank,
          senderName: simSender,
          receiverName: simReceiver,
          receiverBank: simReceiverBank,
          amount: simAmount,
          customField: simCustomField,
          reference: simReference,
        }),
      });

      const data = await res.json();
      if (data.success && data.receipt) {
        setUnlockedReceipt({
          ...data.receipt,
          unlocked: true,
        });
        handleRefreshUserPoints();
        fetchUserSavedReceipts();
      } else {
        alert(data.error || "Point unlock failed. Try checking points.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [savedReceipts, setSavedReceipts] = useState<any[]>([]);

  const fetchUserSavedReceipts = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/user/receipts/${currentUser.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSavedReceipts(data);
      }
    } catch (err) {
      console.error("fetch saved receipts error:", err);
    }
  };

  useEffect(() => {
    fetchUserSavedReceipts();
  }, [currentUser]);

  const handleDeleteSavedReceipt = async (receiptId: string) => {
    if (!currentUser || !window.confirm("Are you sure you want to delete this receipt record from your transaction history?")) return;
    try {
      const res = await fetch("/api/user/receipts/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          receiptId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUserSavedReceipts();
      } else {
        alert(data.error || "Could not delete receipt record");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearReceiptHistory = async () => {
    if (!currentUser || !window.confirm("🔴 DANGER! This will permanently delete ALL saved transaction receipts from your personal dossier ledger history. Proceed?")) return;
    try {
      const res = await fetch("/api/user/receipts/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUserSavedReceipts();
      } else {
        alert(data.error || "Could not clear receipt history");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Real Paystack Checkout Integration
  const handleSimulatePointsBuy = async () => {
    if (!currentUser || !selectedPackageId) return;
    setIsBuyingPoints(true);

    const checkouts = [
      { id: "pkg1", usd: 5, points: 50 },
      { id: "pkg2", usd: 10, points: 110 },
      { id: "pkg3", usd: 25, points: 280 },
      { id: "pkg4", usd: 50, points: 600 }
    ];

    const chosenPkg = checkouts.find(c => c.id === selectedPackageId) || checkouts[0];
    const nairaAmount = Math.round(chosenPkg.usd * 1600); // 1 USD = 1600 NGN conversion rate

    // Function to load the external Paystack JavaScript SDK dynamically
    const loadPaystackSDK = () => {
      return new Promise<boolean>((resolve) => {
        if ((window as any).PaystackPop) {
          resolve(true);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://js.paystack.co/v1/inline.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const isSdkLoaded = await loadPaystackSDK();
    if (!isSdkLoaded) {
      console.warn("Failed to retrieve Paystack payment gateway bridge. Reverting to automated simulation...");
      proceedPointsBuy(selectedPackageId);
      return;
    }

    try {
      // Initialize real Paystack inline Pop-up Checkout Modal
      const handler = (window as any).PaystackPop.setup({
        key: (import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_48154e14f6b21589c32bfda6f8510cf2e268ba7a",
        email: currentUser.email,
        amount: nairaAmount * 100, // Paystack expects amount in Kobo (Naira * 100)
        currency: "NGN",
        ref: "SH_PAY_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
        callback: async (response: any) => {
          proceedPointsBuy(selectedPackageId, response.reference);
        },
        onClose: () => {
          alert("⚡ Payment interface dismissed. Points ledger remains unchanged.");
          setIsBuyingPoints(false);
        }
      });
      handler.openIframe();
    } catch (e) {
      console.error(e);
      // Failover safely
      proceedPointsBuy(selectedPackageId);
    }
  };

  const proceedPointsBuy = async (pkgId: string, reference?: string) => {
    try {
      const res = await fetch("/api/points/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          packageId: pkgId,
          reference: reference || "SIMULATED_BY_JADAI"
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`🎉 Paystack Payment Approved! Successfully credited +${data.addedPoints} points to your ledger!`);
        handleRefreshUserPoints();
      } else {
        alert(data.error || "Points ledger adjustment rejected by the server.");
      }
    } catch (err) {
      console.error(err);
      alert("Lost database connection bridge. Try again in a few seconds.");
    } finally {
      setIsBuyingPoints(false);
    }
  };

  // Submit profile identity KYC
  const handleSubmitIdentityKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycName || !kycAddress) return;
    setIsSubmittingKyc(true);

    try {
      const res = await fetch("/api/profile/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          name: kycName,
          address: kycAddress,
          idCardBase64: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=400&q=80",
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("KYC identity dossier submitted successfully! System administrators will review and approve momentarily.");
        handleRefreshUserPoints();
        setKycName("");
        setKycAddress("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  // USDT cashout points withdraw submit
  const handlePointsUSDTWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawPointsAmt || !withdrawUSDTAddress) return;

    if (currentUser?.kyc_status !== "verified") {
      alert("Access Denied: You must submit KYC and be approved by the administrator before point token cashout.");
      return;
    }

    setIsSubmitWithdrawal(true);
    try {
      const res = await fetch("/api/points/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          amountPoints: withdrawPointsAmt,
          usdtAddress: withdrawUSDTAddress,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const estUsdt = (parseInt(withdrawPointsAmt) / 250).toFixed(2);
        alert(`SUCCESS! Registered withdrawal request for ${withdrawPointsAmt} points (converting to ${estUsdt} USDT clean crypto coordinates under 60% high-loss penalty). Pending admin manual processing.`);
        handleRefreshUserPoints();
        setWithdrawPointsAmt("");
        setWithdrawUSDTAddress("");
      } else {
        alert(data.error || "Withdrawal failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitWithdrawal(false);
    }
  };

  // Marketplace Create Listing
  const handleCreateMarketplaceListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMktTitle || !newMktDesc || !newMktPrice) return;

    try {
      const res = await fetch("/api/marketplace/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          title: newMktTitle,
          description: newMktDesc,
          category: newMktCategory,
          pricePoints: newMktPrice,
          deliveryInfo: newMktDelivery,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Listed successfully with platform escrow safeguard.");
        setNewMktTitle("");
        setNewMktDesc("");
        setNewMktPrice("50");
        setShowCreateMktListing(false);
        fetchUserDependentData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Buy marketplace listing
  const handleBuyMarketplaceItem = async (listingId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/marketplace/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: currentUser.id,
          listingId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Order completed! Your points are held in safe escrow. Review developer files or numbers in active records.");
        handleRefreshUserPoints();
        fetchUserDependentData();
      } else {
        alert(data.error || "Order failed. Check points budget.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEscrowConfirm = async (listingId: string) => {
    try {
      const res = await fetch("/api/marketplace/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: currentUser?.id,
          listingId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Transaction satisfaction approved. Points released to vendor!");
        fetchUserDependentData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEscrowDispute = async (listingId: string) => {
    try {
      const res = await fetch("/api/marketplace/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          listingId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Dispute registered. Points frozen. Admin will investigate logs.");
        fetchUserDependentData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Black Room Lists creation
  const handleCreateBlackListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrTitle || !newBrDesc || !newBrPrice) return;

    try {
      const res = await fetch("/api/blackroom/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          title: newBrTitle,
          description: newBrDesc,
          pricePoints: newBrPrice,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Anonymous listing mounted. Monitored inside Chemical Symbol network.");
        setNewBrTitle("");
        setNewBrDesc("");
        setShowCreateBr(false);
        fetchUserDependentData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Buy Black listing
  const handleBuyBlackItem = async (listingId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/blackroom/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: currentUser.id,
          listingId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Black Room Escrow registered! Communication channel unlocked. Coordinates holding points safely.");
        handleRefreshUserPoints();
        fetchUserDependentData();
      } else {
        alert(data.error || "Purchase error.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Black room messaging system
  const fetchBrMessages = async (listingId: string) => {
    try {
      const res = await fetch(`/api/blackroom/messages/${listingId}`);
      const data = await res.json();
      setBrMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendBrMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrListing || !newBrMsg.trim()) return;

    try {
      const res = await fetch("/api/blackroom/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: selectedBrListing.id,
          userId: currentUser?.id,
          message: newBrMsg,
        }),
      });

      const data = await res.json();
      setBrMessages((prev) => [...prev, data]);
      setNewBrMsg("");
    } catch (err) {
      console.error(err);
    }
  };

  // Hire a programmer booking
  const handleBookProgrammer = async (serviceId: string) => {
    try {
      const res = await fetch("/api/programmer/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          serviceId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Booking active. Code milestones held securely. Admin in contact.");
        handleRefreshUserPoints();
        fetchUserDependentData();
      } else {
        alert(data.error || "Insufficient points");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Vouch and score pre-seeded anonymous brokers
  const handleVouchBroker = async (brokerId: string) => {
    if (!currentUser) {
      alert("Please log in or register a credentials session above first to complete broker vouches.");
      return;
    }
    try {
      const res = await fetch("/api/brokers/vouch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brokerId, userId: currentUser.id }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "💖 Vouch recorded successfully! Trust level recalibrated.");
        // Refresh broker list
        const bRes = await fetch("/api/brokers/list");
        const bData = await bRes.json();
        setBrokers(bData);
      } else {
        alert(data.error || "Could not process vouch request");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Buy gallery HTML web templates
  const handleBuyGalleryTemplate = async (itemId: string, itemTitle: string) => {
    if (!currentUser) {
      alert("🔒 Please log in or sign up first to purchase assets.");
      return;
    }
    if (currentUser.kyc_status !== "verified") {
      alert("🔒 KYC Verification Restricted: You must link your email and complete KYC identity verification first in the Security profile tab before purchasing premium templates!");
      setActiveTab("profile");
      return;
    }
    if (!window.confirm(`Unlock full site source archive [${itemTitle}] for ${galleryItems.find(g => g.id === itemId)?.price_points || 150} points?`)) return;
    try {
      const res = await fetch("/api/gallery/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          templateId: itemId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUnlockedAssetGuide({
          title: itemTitle,
          guide: data.guide,
          url: data.downloadUrl
        });
        handleRefreshUserPoints();
      } else {
        alert(data.error || "Verification issue or point balance low");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Visual Carousel Slider helpers
  const securityInsights = [
    { title: "Escrow Protection Safeguard", desc: "Digital assets transactions freeze balance points. Release happens when you confirm visual and functional satisfaction." },
    { title: "Chemical Code Anonymity Ring", desc: "Trade collector goods securely inside the Black Room. User email coordinates are hidden from profiles of third-party vendors." },
    { title: "No Tech-Larping Guarantee", desc: "No useless mock terminal screens. StyleHub provides humic, direct fintech access indicators matching premium web vibes." }
  ];

  if (!currentUser) {
    // We let users browse the bento homepage or explore sections as guest!
  }

  // RENDER DOCK SCREEN
  if (appLoading) {
    return (
      <div className="fixed inset-0 z-[100000] bg-[#080B10] flex flex-col items-center justify-center space-y-6 select-none">
        {/* Animated Custom stylish Logo */}
        <div className="relative flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            {/* Spinning pulse glow rings */}
            <div className="absolute w-24 h-24 border-2 border-dashed border-cyan-500/20 rounded-full animate-spin duration-[3500ms]" />
            <div className="absolute w-20 h-20 border border-cyan-500/30 rounded-full animate-ping duration-[1500ms]" />
            <div className="absolute w-16 h-16 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-2xl rotate-45 animate-pulse" />
            <div className="z-10 text-white font-black text-xs uppercase tracking-widest font-mono">S</div>
          </div>
          <div className="mt-8 text-center space-y-2">
            <h1 className="text-xl font-black text-white tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
              STYLEZ HUB
            </h1>
            <div className="flex justify-center">
              <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse flex items-center gap-1.5 bg-[#121620] px-3.5 py-1 rounded-full border border-zinc-800">
                <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-ping" /> Loading Prestige Sandbox Core...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-[#080B10] text-[#E2E8F0] font-sans pb-24 relative overflow-x-hidden">
      {" "}
      {/* Footer navigation adds padding */}
      {/* Floating dynamic backdrop */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-[#00E5FF]/2 to-transparent pointer-events-none" />

      {/* Main Core View Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 space-y-6 relative z-10">
        <BentoHeader user={currentUser} settings={settings} onLogout={handleLogout} activeNav={activeTab} />

        {/* Tab Content Routing */}
        {activeTab === "home" && (
          <BentoHomepage
            user={currentUser}
            settings={settings}
            galleryItems={galleryItems}
            mktListings={mktListings}
            packages={packages}
            selectedPackageId={selectedPackageId}
            setSelectedPackageId={setSelectedPackageId}
            isBuyingPoints={isBuyingPoints}
            onSimulatePointsBuy={handleSimulatePointsBuy}
            onAuthSuccess={(user) => {
              setCurrentUser(user);
              localStorage.setItem("sh_user", JSON.stringify(user));
            }}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {/* Tab Content: GENERATOR (fintech simulator) */}
        {activeTab === "generator" && (
          !currentUser ? (
            <div className="flex flex-col items-center justify-center py-10 w-full animate-fadeIn">
              <AuthCard
                onAuthSuccess={(u) => {
                  setCurrentUser(u);
                  localStorage.setItem("sh_user", JSON.stringify(u));
                }}
              />
            </div>
          ) : (
            <div className="space-y-6 w-full animate-fadeIn">
              {/* Outer mode controllers - selector buttons */}
              <div className="flex bg-[#121620] border border-zinc-800 p-1.5 rounded-2xl max-w-md">
                <button
                  type="button"
                  onClick={() => setGeneratorMode("standard")}
                  className={`flex-1 py-2.5 px-4 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    generatorMode === "standard"
                      ? "bg-emerald-500 text-zinc-950 shadow-md"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  📱 Mobile Simulators
                </button>
                <button
                  type="button"
                  onClick={() => setGeneratorMode("signia")}
                  className={`flex-1 py-2.5 px-4 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    generatorMode === "signia"
                      ? "bg-emerald-500 text-zinc-950 shadow-md"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  👑 Sovereign Signia
                </button>
              </div>

              {generatorMode === "standard" ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-fadeIn">
                  {/* Variables Customizer form */}
                  <form onSubmit={handleCreateMockTransactionReceipt} className="md:col-span-12 lg:col-span-5 bg-[#121620] p-6 border border-zinc-800 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                      <h3 className="text-xs font-black uppercase text-emerald-400 tracking-widest">Receipt custom variables</h3>
                      <span className="text-[9px] text-zinc-500 font-mono">Sim Price: 150 PLS</span>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="generator-bank-select" className="text-[10.5px] text-zinc-300 font-bold uppercase tracking-wider block">Fintech Brand</label>
                      <select
                        id="generator-bank-select"
                        value={simBank}
                        onChange={(e) => setSimBank(e.target.value)}
                        className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-emerald-500"
                      >
                        <option value="opay">OPay Wallet</option>
                        <option value="kuda">Kuda Microfinance</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label htmlFor="generator-sender-input" className="text-[10px] text-zinc-400 font-bold uppercase block">Sender Name</label>
                        <input
                          type="text"
                          id="generator-sender-input"
                          value={simSender}
                          onChange={(e) => setSimSender(e.target.value.toUpperCase())}
                          className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-4 py-2 text-xs font-mono uppercase focus:outline-none focus:border-emerald-500 text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="generator-recipient-input" className="text-[10px] text-zinc-400 font-bold uppercase block">Recipient Name</label>
                        <input
                          type="text"
                          id="generator-recipient-input"
                          value={simReceiver}
                          onChange={(e) => setSimReceiver(e.target.value.toUpperCase())}
                          className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-4 py-2 text-xs font-mono uppercase focus:outline-none focus:border-emerald-500 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label htmlFor="generator-recipient-bank-input" className="text-[10px] text-zinc-400 font-bold uppercase block">Recipient Bank</label>
                        <input
                          type="text"
                          id="generator-recipient-bank-input"
                          value={simReceiverBank}
                          onChange={(e) => setSimReceiverBank(e.target.value)}
                          className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="generator-amount-input" className="text-[10px] text-zinc-400 font-bold uppercase block">Amount Transferred (₦)</label>
                        <input
                          type="number"
                          id="generator-amount-input"
                          value={simAmount}
                          onChange={(e) => setSimAmount(e.target.value)}
                          className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-4 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="generator-reference-input" className="text-[10px] text-zinc-400 font-bold uppercase block">Reference Transaction Description</label>
                      <input
                        type="text"
                        id="generator-reference-input"
                        value={simReference}
                        onChange={(e) => setSimReference(e.target.value)}
                        className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 text-white"
                      />
                    </div>

                    {/* Pixel-perfect FINHUB fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label htmlFor="gen-sender-acct" className="text-[10px] text-zinc-400 font-bold uppercase block">Sender Acct (10-digit)</label>
                        <input id="gen-sender-acct" type="text" maxLength={10} value={simSenderAccount}
                          onChange={(e) => setSimSenderAccount(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500 text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="gen-receiver-acct" className="text-[10px] text-zinc-400 font-bold uppercase block">Receiver Acct</label>
                        <input id="gen-receiver-acct" type="text" maxLength={10} value={simReceiverAccount}
                          onChange={(e) => setSimReceiverAccount(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500 text-white" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label htmlFor="gen-sender-phone" className="text-[10px] text-zinc-400 font-bold uppercase block">Sender Phone</label>
                        <input id="gen-sender-phone" type="text" maxLength={11} value={simSenderPhone}
                          onChange={(e) => setSimSenderPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                          className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500 text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="gen-receiver-phone" className="text-[10px] text-zinc-400 font-bold uppercase block">Receiver Phone</label>
                        <input id="gen-receiver-phone" type="text" maxLength={11} value={simReceiverPhone}
                          onChange={(e) => setSimReceiverPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                          className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500 text-white" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label htmlFor="gen-fee" className="text-[10px] text-zinc-400 font-bold uppercase block">Fee (₦)</label>
                        <input id="gen-fee" type="number" min="0" value={simFee}
                          onChange={(e) => setSimFee(e.target.value)}
                          className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-rose-400 focus:outline-none focus:border-emerald-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="gen-payment-method" className="text-[10px] text-zinc-400 font-bold uppercase block">Payment Method</label>
                        <select id="gen-payment-method" value={simPaymentMethod}
                          onChange={(e) => setSimPaymentMethod(e.target.value)}
                          className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500">
                          <option value="OWealth">OWealth</option>
                          <option value="Wallet">Wallet</option>
                          <option value="Card">Card</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label htmlFor="gen-tx-type" className="text-[10px] text-zinc-400 font-bold uppercase block">Tx Type</label>
                        <select id="gen-tx-type" value={simTransactionType}
                          onChange={(e) => setSimTransactionType(e.target.value)}
                          className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500">
                          <option value="Money Transfer - Bank account">Money Transfer</option>
                          <option value="Electricity">Electricity</option>
                          <option value="Airtime">Airtime</option>
                          <option value="Data">Data</option>
                          <option value="Outward Transfer">Outward Transfer</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="gen-status" className="text-[10px] text-zinc-400 font-bold uppercase block">Status</label>
                        <select id="gen-status" value={simStatus}
                          onChange={(e) => setSimStatus(e.target.value as any)}
                          className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500">
                          <option value="successful">✅ Successful</option>
                          <option value="processing">⏳ Processing</option>
                          <option value="failed">❌ Failed</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="generator-custom-booster-input" className="text-[10px] text-zinc-400 font-bold uppercase block">Custom Booster Badge (e.g. interest / PalmPoints)</label>
                      <input
                        type="text"
                        id="generator-custom-booster-input"
                        value={simCustomField}
                        onChange={(e) => setSimCustomField(e.target.value)}
                        className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-rose-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        type="submit"
                        id="generator-render-btn"
                        className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer text-center"
                      >
                        {isGeneratingReceipt ? "Syncing Mock Data..." : "Render Raw Preview Mockup"}
                      </button>
                      <button
                        type="button"
                        id="generator-simulate-btn"
                        onClick={() => {
                          setUnlockedReceipt(null);
                          setSimulationActive(true);
                        }}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        ▶ Run Interactive Flow Sim
                      </button>
                    </div>
                  </form>

                  {/* Simulated Live Canvas view */}
                  <div className="md:col-span-12 lg:col-span-7 flex flex-col items-center justify-center">
                    {simulationActive ? (
                      <ErrorBoundary>
                      <AppSimulator
                        bank={simBank}
                        senderName={simSender}
                        receiverName={simReceiver}
                        receiverBank={simReceiverBank}
                        amount={parseFloat(simAmount) || 15500}
                        dateTime={new Date().toLocaleString()}
                        transactionId={"TXN" + Math.random().toString(36).substr(2, 9).toUpperCase()}
                        reference={simReference}
                        balance={425000}
                        customField={simCustomField}
                        senderAccount={simSenderAccount}
                        receiverAccount={simReceiverAccount}
                        senderPhone={simSenderPhone}
                        receiverPhone={simReceiverPhone}
                        onClose={() => setSimulationActive(false)}
                        onFinishSimulation={(simData) => {
                          setUnlockedReceipt({
                            bank: simData.bank,
                            sender_name: simData.senderName,
                            receiver_name: simData.receiverName,
                            receiver_bank: simData.receiverBank,
                            amount: simData.amount,
                            date_time: simData.dateTime,
                            transaction_id: simData.transactionId,
                            reference: simData.reference,
                            balance: simData.balance,
                            custom_field: simData.customField,
                            unlocked: false,
                          });
                          setSimulationActive(false);
                        }}
                      />
                      </ErrorBoundary>
                    ) : unlockedReceipt ? (
                      <ReceiptPreview
                        bank={unlockedReceipt.bank}
                        senderName={unlockedReceipt.sender_name}
                        receiverName={unlockedReceipt.receiver_name}
                        receiverBank={unlockedReceipt.receiver_bank}
                        amount={unlockedReceipt.amount}
                        dateTime={unlockedReceipt.date_time}
                        transactionId={unlockedReceipt.transaction_id}
                        reference={unlockedReceipt.reference}
                        balance={unlockedReceipt.balance}
                        customField={unlockedReceipt.custom_field}
                        unlocked={unlockedReceipt.unlocked}
                        onUnlock={handleUnlockSelectedReceipt}
                        senderAccount={simSenderAccount}
                        receiverAccount={simReceiverAccount}
                        senderPhone={simSenderPhone}
                        receiverPhone={simReceiverPhone}
                        fee={parseFloat(simFee) || 0}
                        paymentMethod={simPaymentMethod}
                        transactionType={simTransactionType}
                        status={simStatus}
                      />
                    ) : (
                      <div className="p-16 border-2 border-dashed border-zinc-800 rounded-3xl text-center text-zinc-500 max-w-[400px] mx-auto flex flex-col items-center gap-3">
                        <Sparkles className="w-8 h-8 opacity-30 animate-pulse text-emerald-400" />
                        <p className="text-xs font-mono uppercase tracking-wide">
                          Enter custom values on the left, then click "Render Raw Preview Mockup" or run "Interactive Flow Sim".
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Sovereign Signia Custom Upload Template Manager */
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-fadeIn">
                  <div className="md:col-span-12 lg:col-span-5 bg-[#121620] p-6 border border-zinc-800 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                      <h3 className="text-xs font-black uppercase text-emerald-400 tracking-widest">Signia custom templates</h3>
                      <span className="text-[9px] text-[#10B981] font-mono font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/10">150 points / lock</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10.5px] text-zinc-300 font-bold uppercase tracking-wider block">Templates Array</label>
                      <select
                        id="generator-template-select"
                        value={selectedTemplate?.id || ""}
                        onChange={(e) => {
                          const found = templates.find((t) => t.id === e.target.value);
                          if (found) setSelectedTemplate(found);
                        }}
                        className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 animate-fadeIn"
                      >
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.uploaded_by === "system" ? "Official" : "My Custom"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 animate-fadeIn">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase block">Sender Name Tag</label>
                        <input
                          type="text"
                          value={simSender}
                          onChange={(e) => setSimSender(e.target.value.toUpperCase())}
                          className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-emerald-500 text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase block">Recipient Name Tag</label>
                        <input
                          type="text"
                          value={simReceiver}
                          onChange={(e) => setSimReceiver(e.target.value.toUpperCase())}
                          className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-emerald-500 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 animate-fadeIn">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase block">Recipient Bank Tag</label>
                        <input
                          type="text"
                          value={simReceiverBank}
                          onChange={(e) => setSimReceiverBank(e.target.value)}
                          className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase block">Simulation Amount (₦)</label>
                        <input
                          type="number"
                          value={simAmount}
                          onChange={(e) => setSimAmount(e.target.value)}
                          className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 animate-fadeIn">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase block">Statement Memo / Reference Reference</label>
                      <input
                        type="text"
                        value={simReference}
                        onChange={(e) => setSimReference(e.target.value)}
                        className="w-full bg-[#0d0e12] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500 text-white"
                      />
                    </div>

                    {/* Executive & Elite File Upload Zone */}
                    <div className="p-4 bg-zinc-900/60 border border-dashed border-zinc-800 rounded-2xl relative space-y-2 animate-fadeIn">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-zinc-300 uppercase tracking-wider">Upload Custom HTML Receipt</span>
                        <span className="font-mono text-[9px] text-[#10B981] font-black bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 shadow">SOVEREIGN EXCLUSIVE</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-normal">
                        Drap/Drop or select raw HTML receipt layouts containing replacements placeholders (e.g. <code className="text-emerald-400 text-[9.5px]">{"{{SENDER_NAME}}"}</code>) to preview.
                      </p>
                      
                      <label className="w-full text-center py-2.5 bg-zinc-800 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-[10.5px] font-bold rounded-lg cursor-pointer transition-all block max-w-full truncate px-3">
                        {uploadingTemplate ? "Processing file ledger..." : "📂 Click to Choose HTML Template File"}
                        <input
                          type="file"
                          accept=".html,.txt"
                          onChange={async (e) => {
                            if (!currentUser) return;
                            const file = e.target.files?.[0];
                            if (!file) return;

                            if (currentUser.subscription_tier !== "executive" && currentUser.subscription_tier !== "elite") {
                              alert("❌ Subscription Gated: Standard HTML receipt uploads ('Signia files') require Executive Sovereign ($20) or Elite Custom Ledger ($30) active subscriptions. Please buy/update packages on homepage to upgrade!");
                              return;
                            }

                            setUploadingTemplate(true);
                            const reader = new FileReader();
                            reader.onload = async (evt) => {
                              const content = evt.target?.result as string;
                              try {
                                const res = await fetch("/api/templates/upload", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    userId: currentUser.id,
                                    name: file.name.replace(".html", "").replace(".txt", ""),
                                    htmlContent: content
                                  })
                                });
                                const data = await res.json();
                                if (data.success) {
                                  alert(`🎉 Template "${data.template.name}" successfully integrated!`);
                                  // Reload template collections
                                  const tRes = await fetch("/api/templates/list");
                                  const tData = await tRes.json();
                                  setTemplates(tData);
                                  const matched = tData.find((tm: any) => tm.name === file.name.replace(".html", "").replace(".txt", ""));
                                  if (matched) setSelectedTemplate(matched);
                                } else {
                                  alert(data.error || "Failed to compile custom signia.");
                                }
                              } catch (err) {
                                console.error(err);
                                alert("Transmission ledger error.");
                              } finally {
                                setUploadingTemplate(false);
                              }
                            };
                            reader.readAsText(file);
                          }}
                          className="hidden"
                          disabled={uploadingTemplate}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Sandboxed Live Render Frame output panel on the right */}
                  <div className="md:col-span-12 lg:col-span-7 flex flex-col items-center animate-fadeIn">
                    {selectedTemplate ? (
                      <div className="w-full space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs gap-3">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-zinc-400 block font-bold uppercase">Dynamic Sandboxed Frame</span>
                            <span className="text-[10px] text-emerald-400 font-bold block">Template ID: {selectedTemplate.id}</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={async () => {
                              const selectPrice = settings?.receipt_price_points || 150;
                              if (currentUser.points < selectPrice) {
                                alert(`❌ Insufficient balance: Full high-resolution clean extraction requires ${selectPrice} PLS points.`);
                                return;
                              }

                              const confirmation = window.confirm(`Spend ${selectPrice} points to generate, certify and download high-resolution transaction PDF document for "${selectedTemplate.name}"?`);
                              if (!confirmation) return;

                              try {
                                const res = await fetch("/api/receipts/buy", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    userId: currentUser.id,
                                    bank: selectedTemplate.name,
                                    senderName: simSender,
                                    receiverName: simReceiver,
                                    receiverBank: simReceiverBank,
                                    amount: simAmount,
                                    customField: "Signia Template Lock Code",
                                    reference: simReference,
                                  })
                                });

                                const data = await res.json();
                                if (data.success) {
                                  alert(`🎉 Signia certified! Points subtracted successfully.`);
                                  handleRefreshUserPoints();

                                  // Extract compiled string doc
                                  let docContent = selectedTemplate.html_content || "No template content.";
                                  docContent = docContent.replace(/\{\{SENDER_NAME\}\}/g, simSender);
                                  docContent = docContent.replace(/\{\{RECEIVER_NAME\}\}/g, simReceiver);
                                  docContent = docContent.replace(/\{\{RECEIVER_BANK\}\}/g, simReceiverBank);
                                  docContent = docContent.replace(/\{\{AMOUNT\}\}/g, parseFloat(simAmount || "0").toLocaleString());
                                  docContent = docContent.replace(/\{\{REFERENCE\}\}/g, simReference);
                                  docContent = docContent.replace(/\{\{TRANSACTION_ID\}\}/g, "TXN" + Math.random().toString(36).substr(2, 9).toUpperCase());
                                  docContent = docContent.replace(/\{\{DATE_TIME\}\}/g, new Date().toLocaleString());

                                  // Save content file download physically
                                  const blob = new Blob([docContent], { type: "text/html" });
                                  const url = URL.createObjectURL(blob);
                                  const link = document.createElement("a");
                                  link.href = url;
                                  link.download = `StyleHub_Signia_${selectedTemplate.name.replace(/\s+/g, "_")}.html`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  URL.revokeObjectURL(url);
                                } else {
                                  alert(data.error || "Gated verification block.");
                                }
                              } catch (err) {
                                console.error(err);
                                alert("Could not complete points debit handshake.");
                              }
                            }}
                            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl transition-all text-[11px] uppercase tracking-wider cursor-pointer font-sans"
                          >
                            🔒 Deduct 150 PTS & Download Signed Document
                          </button>
                        </div>

                        {/* Interactive dynamic iframe sandbox */}
                        <div className="w-full bg-[#171a24] p-5 rounded-3xl border border-zinc-800 shadow-xl max-w-lg mx-auto relative overflow-hidden flex flex-col justify-center items-center">
                          {/* Diagonal watermark overlaid on raw preview mode strictly */}
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none rotate-12 z-40 opacity-[0.06] whitespace-nowrap">
                            <span className="text-red-500 font-sans font-black uppercase text-2xl border-4 border-red-500 p-3 rounded-xl tracking-widest leading-none block">
                              RAW PREVIEW WATERMARK • READ-ONLY PREVIEW
                            </span>
                          </div>

                          <iframe
                            id="signia-sandboxed-preview-frame"
                            title="Signia Sovereign Sandbox"
                            srcDoc={`
                              <!DOCTYPE html>
                              <html>
                                <head>
                                  <meta charset="utf-8">
                                  <style>
                                    body {
                                      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                                      color: #1a1a24;
                                      background: #fafafa;
                                      padding: 24px;
                                      margin: 0;
                                      font-size: 14px;
                                      line-height: 1.5;
                                    }
                                    .certified-badge {
                                      display: inline-block;
                                      margin-bottom: 20px;
                                      font-size: 11px;
                                      font-weight: bold;
                                      color: #D4AF37;
                                      border: 1px solid #D4AF37;
                                      padding: 4px 8px;
                                      border-radius: 4px;
                                      text-transform: uppercase;
                                    }
                                  </style>
                                </head>
                                <body>
                                  \${(() => {
                                    let content = selectedTemplate.html_content || "<p>Blank Template</p>";
                                    content = content.replace(/\\{\\{SENDER_NAME\\}\\}/g, simSender);
                                    content = content.replace(/\\{\\{RECEIVER_NAME\\}\\}/g, simReceiver);
                                    content = content.replace(/\\{\\{RECEIVER_BANK\\}\\}/g, simReceiverBank);
                                    content = content.replace(/\\{\\{AMOUNT\\}\\}/g, parseFloat(simAmount || "0").toLocaleString());
                                    content = content.replace(/\\{\\{REFERENCE\\}\\}/g, simReference);
                                    content = content.replace(/\\{\\{TRANSACTION_ID\\}\\}/g, "TXN_WATERMARKED_DRAFT");
                                    content = content.replace(/\\{\\{DATE_TIME\\}\\}/g, new Date().toLocaleString());
                                    return content;
                                  })()}
                                </body>
                              </html>
                            `}
                            className="w-full min-h-[460px] bg-white rounded-2xl border border-zinc-200 z-10"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="py-24 text-center text-zinc-500 font-mono text-xs max-w-md mx-auto">
                        <Sparkles className="w-8 h-8 opacity-30 animate-pulse text-emerald-400 mx-auto mb-3" />
                        No template selected yet. Upload or select official systems layouts.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SAVED RECEIPTS / TRANSACTION HISTORY DRAWER UNIT */}
              <div className="mt-8 border-t border-zinc-900 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-md text-[10px] font-mono">FILES</span>
                    <h3 className="text-xs font-black uppercase text-zinc-300 tracking-wider">My Saved Transaction Receipts Dossier</h3>
                  </div>
                  {savedReceipts.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearReceiptHistory}
                      className="py-1 px-3 bg-red-950/20 hover:bg-red-900 border border-rose-500/20 rounded-lg text-[10px] font-mono font-bold text-rose-400 hover:text-white transition-all cursor-pointer"
                    >
                      Clear All History Logs
                    </button>
                  )}
                </div>

                {savedReceipts.length === 0 ? (
                  <div className="py-8 bg-[#121620]/40 border border-zinc-800/60 rounded-2xl text-center text-zinc-500 text-xs font-mono">
                    No fully unlocked receipts logs in your ledger dossier. Run an interactive flow simulation or render a raw preview and select UNLOCK to save items.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedReceipts.map((rcpt) => (
                      <div key={rcpt.id} className="p-4 bg-[#121620] border border-zinc-800 rounded-2xl relative space-y-3 flex flex-col justify-between group hover:border-[#10B981]/30 transition-all">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-mono font-black">
                              💰 {rcpt.bank?.toUpperCase()} SUCCESS
                            </span>
                            <span className="text-[9px] text-zinc-500 font-mono">
                              {rcpt.date_time ? new Date(rcpt.date_time).toLocaleDateString() : ""}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white block">
                            ₦{rcpt.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                          <p className="text-[10.5px] text-zinc-400 font-mono leading-none truncate">
                            To: {rcpt.receiver_name}
                          </p>
                          <p className="text-[9px] text-zinc-500 leading-none truncate block">
                            From: {rcpt.sender_name}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800/80">
                          <button
                            type="button"
                            onClick={() => {
                              setUnlockedReceipt({
                                bank: rcpt.bank,
                                sender_name: rcpt.sender_name,
                                receiver_name: rcpt.receiver_name,
                                receiver_bank: rcpt.receiver_bank,
                                amount: rcpt.amount,
                                date_time: rcpt.date_time,
                                transaction_id: rcpt.transaction_id,
                                reference: rcpt.reference,
                                balance: rcpt.balance,
                                custom_field: rcpt.custom_field,
                                unlocked: true,
                              });
                              window.scrollTo({ top: 300, behavior: "smooth" });
                            }}
                            className="py-1.5 bg-zinc-800/80 hover:bg-zinc-800 rounded-lg text-[10px] font-sans font-bold text-zinc-100 hover:text-white transition-all cursor-pointer text-center"
                          >
                            Load Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSavedReceipt(rcpt.id)}
                            className="py-1.5 bg-rose-950/20 hover:bg-rose-900/45 text-rose-400 hover:text-white rounded-lg text-[10px] font-sans font-bold transition-all cursor-pointer text-center"
                          >
                            Delete Log
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
      )}

        {/* Tab Content: MARKETPLACE & ESCROW */}
        {activeTab === "marketplace" && (
          !currentUser ? (
            <div className="flex flex-col items-center justify-center py-10 w-full animate-fadeIn">
              <AuthCard
                onAuthSuccess={(u) => {
                  setCurrentUser(u);
                  localStorage.setItem("sh_user", JSON.stringify(u));
                }}
              />
            </div>
          ) : (
            <div className="space-y-8">
            {/* Visual categories bar & Create listing button */}
            <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] font-mono uppercase text-gray-400 tracking-widest font-bold">digital marketplace</span>
              <button
                id="expand-seller-listing-btn"
                onClick={() => setShowCreateMktListing(!showCreateMktListing)}
                className="py-1.5 px-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl text-[10px] text-gray-950 font-black flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all"
              >
                <MessageCirclePlus className="w-3.5 h-3.5" /> SELL ON MARKETPLACE
              </button>
            </div>

            {/* List custom product panel */}
            {showCreateMktListing && (
              <form onSubmit={handleCreateMarketplaceListing} className="p-6 bg-[#0E131F] border border-slate-800 rounded-3xl max-w-xl space-y-4 animate-fadeIn">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#00E5FF]">List modern digital item</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 font-bold uppercase">Listing Title</label>
                    <input
                      type="text"
                      id="mkt-listing-title"
                      required
                      placeholder="e.g. USA Verified Stripe"
                      value={newMktTitle}
                      onChange={(e) => setNewMktTitle(e.target.value)}
                      className="w-full bg-[#05070A] border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 font-bold uppercase">Category</label>
                    <select
                      id="mkt-listing-category"
                      value={newMktCategory}
                      onChange={(e: any) => setNewMktCategory(e.target.value)}
                      className="w-full bg-[#05070A] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white uppercase focus:outline-none"
                    >
                      <option value="numbers">Virtual Numbers</option>
                      <option value="accounts">Accounts Niche</option>
                      <option value="boosting">SSMP Engagement</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 font-bold uppercase">Price points</label>
                    <input
                      type="number"
                      id="mkt-listing-price"
                      required
                      value={newMktPrice}
                      onChange={(e) => setNewMktPrice(e.target.value)}
                      className="w-full bg-[#05070A] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-cyan-400 font-mono focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 font-bold uppercase">Auto file deliver note</label>
                    <input
                      type="text"
                      id="mkt-listing-delivery"
                      value={newMktDelivery}
                      onChange={(e) => setNewMktDelivery(e.target.value)}
                      className="w-full bg-[#05070A] border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold uppercase">Listing Description Details</label>
                  <textarea
                    id="mkt-listing-desc"
                    required
                    rows={3}
                    placeholder="Provide full description. Escrow is applied automated to all checkouts."
                    value={newMktDesc}
                    onChange={(e) => setNewMktDesc(e.target.value)}
                    className="w-full bg-[#05070A] border border-slate-800 rounded-2xl p-4 text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  id="mkt-listing-submit"
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 font-black rounded-xl text-xs uppercase"
                >
                  Confirm and launch listing
                </button>
              </form>
            )}

            {/* Active digital goods listings */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider">Active digital packages</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mktListings.map((item) => (
                  <div key={item.id} className="bg-[#0E131F]/90 border border-slate-800/80 rounded-3xl p-5 flex flex-col justify-between shadow relative overflow-hidden">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-mono text-[#00E5FF] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/20">
                          {item.category}
                        </span>
                        <span className="text-xs font-black font-mono text-cyan-400">{item.price_points} PTS</span>
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug">{item.title}</h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed max-w-[280px]">{item.description}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-[10px]">
                      <div>
                        <span className="text-gray-500 font-mono text-[9px] block">Listed by:</span>
                        <span className="text-slate-300 font-medium truncate max-w-[120px] block">{item.user_email}</span>
                      </div>

                      {item.status === "open" ? (
                        item.user_id === currentUser?.id ? (
                          <span className="text-gray-500 text-[10px] font-bold uppercase font-mono italic">listed by you</span>
                        ) : (
                          <button
                            id={`buy-mkt-${item.id}`}
                            onClick={() => handleBuyMarketplaceItem(item.id)}
                            className="bg-slate-900 hover:bg-[#00E5FF] hover:text-[#0B0E14] border border-slate-800 text-white p-2 px-4 rounded-xl font-bold transition-all text-[11px]"
                          >
                            Buy package
                          </button>
                        )
                      ) : item.status === "sold" && item.buyer_id === currentUser?.id ? (
                        <div className="space-y-2 w-full pt-1">
                          <span className="text-[10px] text-amber-500 font-mono font-bold block">🔒 HELD IN PROTECTIVE ESCROW</span>
                          <div className="flex gap-1">
                            <button
                              id={`confirm-escrow-${item.id}`}
                              onClick={() => handleEscrowConfirm(item.id)}
                              className="px-2.5 py-1 bg-emerald-500 text-gray-950 font-bold rounded-lg text-[9px] hover:brightness-110"
                            >
                              Satisfied & Release
                            </button>
                            <button
                              id={`dispute-escrow-${item.id}`}
                              onClick={() => handleEscrowDispute(item.id)}
                              className="px-2.5 py-1 bg-rose-500 text-white font-bold rounded-lg text-[9px] hover:brightness-110"
                            >
                              Dispute
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">SOLDOUT</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Split section: HIRE A PROGRAMMER & GALLERY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Programmer hires Column */}
              <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-black tracking-wider text-[#00E5FF] uppercase">Book verified workspace programmers</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                  Hire Jadai Studios coders for fintech backend integrations. Funds held securely in pending milestones.
                </p>

                <div className="divide-y divide-slate-800 space-y-3">
                  {programmerServices.map((srv) => (
                    <div key={srv.id} className="pt-3 flex justify-between items-start gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-white">{srv.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{srv.description}</p>
                        <span className="text-[9px] text-gray-500 block font-mono mt-1">Milestone delivery: {srv.delivery_days} days</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold font-mono text-cyan-400 block">{srv.price_points} pts</span>
                        <button
                          id={`book-srv-${srv.id}`}
                          onClick={() => handleBookProgrammer(srv.id)}
                          className="mt-2 py-1 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white rounded-lg text-[10px] font-bold"
                        >
                          Book Coder
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery HTML Templates */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Premium website templates</h3>
                <div className="grid grid-cols-1 gap-4">
                  {galleryItems.map((git) => (
                    <div key={git.id} className="bg-slate-950/80 border border-slate-900 rounded-2xl p-4 flex gap-4 items-center">
                      <img
                        src={git.preview_image}
                        alt={git.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover bg-slate-900"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{git.title}</h4>
                        <p className="text-[10px] text-gray-400 truncate mt-1">{git.description}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            id={`buy-gal-${git.id}`}
                            onClick={() => handleBuyGalleryTemplate(git.id, git.title)}
                            className="py-1 px-3 bg-cyan-500 text-gray-950 text-[10px] font-black rounded-lg hover:brightness-110 active:scale-95 transition-all"
                          >
                            Buy ({git.price_points} PTS)
                          </button>
                          <span className="text-[9px] text-gray-500 font-mono">Or ${git.price_money} USD</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          )
        )}

        {/* Tab Content: BLACK ROOM (anonymous trading ring) */}
        {activeTab === "blackroom" && (
          !currentUser ? (
            <div className="flex flex-col items-center justify-center py-10 w-full animate-fadeIn">
              <AuthCard
                onAuthSuccess={(u) => {
                  setCurrentUser(u);
                  localStorage.setItem("sh_user", JSON.stringify(u));
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Sidebar: pseudonym summary, brokers directory and create listings triggers */}
            <div className="md:col-span-4 space-y-6">
              {/* Local Alias code card */}
              <div className="bg-[#0E131F] border border-slate-800 rounded-3xl p-5 text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-2 right-2 text-[9px] text-[#00E5FF] font-mono border border-cyan-500/20 px-2 py-0.5 rounded bg-cyan-950/20 uppercase animate-pulse">
                  BLACK ROOM ONLY
                </div>
                <span className="text-[8px] font-mono text-gray-500 block uppercase tracking-widest font-bold">anonymous symbol</span>
                <span className="text-xl font-black text-white mt-1.5 block select-all">{currentUser?.black_room_alias || "🔮 Lithium"}</span>
                <p className="text-[10px] text-gray-400 mt-2 font-mono">
                  All listings, sales, and messaging are routed securely under your chemical symbol alias.
                </p>
                <button
                  id="br-create-listing-toggle-btn"
                  onClick={() => setShowCreateBr(!showCreateBr)}
                  className="mt-4 w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[#00E5FF] font-bold text-xs rounded-xl transition-all"
                >
                  Create Anonymous Listing
                </button>
              </div>

              {/* Verified broker directory lists */}
              <div className="bg-slate-900/60 p-5 border border-slate-800 rounded-3xl space-y-3">
                <div className="flex justify-between items-center pb-1 border-b border-slate-800">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Verified Room Brokers</h3>
                  <span className="text-[9px] text-[#00E5FF] font-mono uppercase bg-[#00E5FF]/10 px-1.5 py-0.5 rounded">Pre-Seeded</span>
                </div>
                <div className="divide-y divide-slate-800 space-y-2.5">
                  {brokers && brokers.map((b) => (
                    <div key={b.id} className="pt-2 flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200 flex items-center gap-1.5">
                          🛡️ {b.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/20 px-1.5 py-0.5 rounded font-bold">
                            Trust {100 - (b.disputes_count || 0)}%
                          </span>
                          <span className="text-[9px] text-gray-400 font-mono font-medium">
                            ({b.vouches_count || 0} ♥)
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                        <span>Escrow Fee: {b.escrow_fee_percent}%</span>
                        <button
                          id={`vouch-btn-${b.id}`}
                          onClick={() => handleVouchBroker(b.id)}
                          className="px-2 py-0.5 bg-cyan-950/45 hover:bg-cyan-900/50 border border-cyan-800/40 text-[#00E5FF] text-[9px] font-black rounded uppercase transition-all"
                        >
                          ♥ Vouch Broker
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Core center: Create listings or marketplace feeds list */}
            <div className="md:col-span-8 space-y-6">
              {showCreateBr && (
                <form onSubmit={handleCreateBlackListing} className="p-6 bg-[#0E131F] border border-slate-800 rounded-3xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#00E5FF]">Create chemical listings</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 font-bold uppercase">Collectable Item Title</label>
                      <input
                        type="text"
                        id="br-listing-title"
                        required
                        value={newBrTitle}
                        onChange={(e) => setNewBrTitle(e.target.value)}
                        className="w-full bg-[#05070A] border border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 font-bold uppercase">Price points</label>
                      <input
                        type="number"
                        id="br-listing-price"
                        required
                        value={newBrPrice}
                        onChange={(e) => setNewBrPrice(e.target.value)}
                        className="w-full bg-[#05070A] border border-slate-800 rounded-xl px-4 py-2 text-xs text-cyan-400 font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 font-bold uppercase">Collectable Specifications Details</label>
                    <textarea
                      id="br-listing-desc"
                      required
                      placeholder="Input physical/digital coordinate specifications. Do NOT write your real email or contacts."
                      value={newBrDesc}
                      onChange={(e) => setNewBrDesc(e.target.value)}
                      className="w-full bg-[#05070A] border border-slate-800 rounded-2xl p-4 text-xs focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    id="br-listing-submit"
                    className="w-full py-2 px-4 bg-[#00E5FF] text-gray-950 font-black rounded-xl text-xs uppercase"
                  >
                    Confirm mounting
                  </button>
                </form>
              )}

              {/* Feed lists */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider">Group Market anonymous trade feed</h3>
                <div className="grid grid-cols-1 gap-4">
                  {brListings.map((listing) => (
                    <div key={listing.id} className="bg-slate-900/60 p-5 border border-slate-800 rounded-3xl flex justify-between items-start gap-4 shadow">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-cyan-400 font-bold">{listing.alias}</span>
                          <span className="text-[8px] text-gray-500 font-mono">• {new Date(listing.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate">{listing.title}</h4>
                        <p className="text-[11px] text-slate-300 leading-normal font-normal max-w-lg">{listing.description}</p>
                        {selectedBrListing?.id === listing.id && (
                          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                            <h5 className="text-[10px] font-bold text-cyan-400 font-mono uppercase">Private Channel communication</h5>
                            <div className="bg-slate-950 p-3 rounded-xl max-h-[150px] overflow-y-auto space-y-2 text-[10px] font-mono">
                              {brMessages.map((msg) => (
                                <div key={msg.id} className="border-b border-slate-900/40 pb-1.5">
                                  <span className="text-cyan-400 font-bold">[{msg.from_alias}]</span>: {msg.message}
                                </div>
                              ))}
                            </div>
                            <form onSubmit={handleSendBrMsg} className="flex gap-2">
                              <input
                                type="text"
                                id="br-msg-input"
                                placeholder="Type anonymous dispatch..."
                                value={newBrMsg}
                                onChange={(e) => setNewBrMsg(e.target.value)}
                                className="bg-slate-950 text-white rounded-lg px-3 py-1.5 text-xs flex-1 focus:outline-none border border-slate-800"
                              />
                              <button
                                type="submit"
                                id="br-msg-send-btn"
                                className="px-3 py-1 bg-[#00E5FF] text-gray-950 font-bold rounded-lg text-xs"
                              >
                                Send
                              </button>
                            </form>
                          </div>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                        <span className="text-xs font-bold font-mono text-cyan-400">{listing.price_points} pts</span>
                        {listing.status === "open" ? (
                          listing.user_id === currentUser.id ? (
                            <span className="text-gray-500 text-[9px] font-bold italic font-mono block">YOUR LISTING</span>
                          ) : (
                            <button
                              id={`buy-br-${listing.id}`}
                              onClick={() => handleBuyBlackItem(listing.id)}
                              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-[10.5px] transition-all"
                            >
                              Unlock & Buy
                            </button>
                          )
                        ) : (
                          <div className="flex flex-col gap-1.5 items-end">
                            <span className="text-[10px] text-amber-500 font-mono font-bold block">🔒 SOLD & IN FLIGHT</span>
                            <button
                              id={`chat-br-${listing.id}`}
                              onClick={() => {
                                setSelectedBrListing(listing);
                                fetchBrMessages(listing.id);
                              }}
                              className="px-2.5 py-1 bg-slate-800 text-gray-300 font-bold rounded-lg text-[9px] hover:text-white"
                            >
                              Open private Chat
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}

        {/* Tab Content: PROFILE / KYC & ADMIN CORES */}
        {activeTab === "profile" && (
          !currentUser ? (
            <div className="flex flex-col items-center justify-center py-10 w-full animate-fadeIn">
              <AuthCard
                onAuthSuccess={(u) => {
                  setCurrentUser(u);
                  localStorage.setItem("sh_user", JSON.stringify(u));
                }}
              />
            </div>
          ) : (
            <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Profile details & KYC submission form */}
              <div className="bg-[#0E131F]/95 p-6 border border-slate-800 rounded-3xl space-y-5">
                <div className="flex justify-between items-center border-b border-indigo-900/30 pb-3">
                  <h3 className="text-xs font-black uppercase text-cyan-400 tracking-widest">KYC identity dossier</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${
                    currentUser?.kyc_status === "verified" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    currentUser?.kyc_status === "pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse" :
                    "bg-gray-800 text-gray-400"
                  }`}>
                    {currentUser?.kyc_status?.toUpperCase() || "UNSUBMITTED"}
                  </span>
                </div>

                {currentUser?.kyc_status !== "verified" ? (
                  <form onSubmit={handleSubmitIdentityKyc} className="space-y-4">
                    <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
                      Identity dossier completion is standard to trigger points token cashouts. Complete correct credentials:
                    </p>
                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-bold text-gray-500 uppercase">Real Legal Name</label>
                      <input
                        type="text"
                        id="kyc-name-input"
                        required
                        placeholder="John Doe"
                        value={kycName}
                        onChange={(e) => setKycName(e.target.value)}
                        className="w-full bg-[#05070A] border border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-cyan-500/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-bold text-gray-500 uppercase">AML Verification Address</label>
                      <input
                        type="text"
                        id="kyc-address-input"
                        required
                        placeholder="Suite 1B, Lagos"
                        value={kycAddress}
                        onChange={(e) => setKycAddress(e.target.value)}
                        className="w-full bg-[#05070A] border border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-cyan-500/40"
                      />
                    </div>
                    <button
                      type="submit"
                      id="kyc-submit-btn"
                      disabled={isSubmittingKyc}
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 font-black rounded-xl text-xs uppercase"
                    >
                      {isSubmittingKyc ? "Registering files..." : "Confirm identity register dossiers"}
                    </button>
                  </form>
                ) : (
                  <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Your details have been globally verified!</h4>
                      <p className="text-[10px] text-gray-400 mt-1">Point withdrawal cashouts limits are unlocked to USDT coordinates.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cashout withdraw to USDT */}
              <div className="bg-slate-900/60 p-6 border border-slate-800 rounded-3xl space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest pb-3 border-b border-slate-800">Withdraw points to USDT</h3>
                
                {/* Points ledger composition split */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-950/60 p-3.5 border border-slate-800 rounded-xl space-y-0.5">
                  <div className="col-span-2 border-b border-slate-800/60 pb-1.5 flex justify-between items-center">
                    <span className="text-slate-500">TOTAL ACCOUNT BALANCE</span>
                    <span className="font-extrabold text-white text-xs">{currentUser?.points || 0} PLS</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-green-500">Withdrawable (Purchased):</span>
                    <span className="font-semibold text-green-400">{currentUser?.purchased_points || 0} PLS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-amber-500">Promotional (Bonus):</span>
                    <span className="font-semibold text-amber-500">
                      {Math.max(0, (currentUser?.points || 0) - (currentUser?.purchased_points || 0))} PLS
                    </span>
                  </div>
                  <span className="col-span-2 text-[8px] text-gray-500 italic block pt-1.5 leading-normal">
                    * Promotional balances (from signup, referrers, and system commissions) are locked to in-app services and cannot be cashed out.
                  </span>
                </div>

                <div className="p-3 bg-red-950/20 border border-red-500/10 rounded-xl space-y-1">
                  <h4 className="text-[10px] font-black uppercase text-amber-400 font-mono">⚠️ Exchange Penalty Loss warning</h4>
                  <p className="text-[9px] text-gray-400 leading-normal font-sans">
                    <strong>Value Reduction Clause:</strong> While points are purchased at 100 PTS = $1.00 USD, converting points back to USDT cashout is penalized at a high conversion rate of <strong>250 PTS = 1.00 USDT</strong> (a high-loss 60% fee penalty). To maximize value, we strongly advise spending your points inside the platform.
                  </p>
                </div>

                <form onSubmit={handlePointsUSDTWithdrawal} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] text-gray-500 font-bold uppercase block">Points quantity to cash out</label>
                    <input
                      type="number"
                      id="withdraw-points-input"
                      required
                      placeholder="Min 1000"
                      value={withdrawPointsAmt}
                      onChange={(e) => setWithdrawPointsAmt(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-cyan-400 font-mono focus:outline-none"
                    />
                    {withdrawPointsAmt && !isNaN(parseInt(withdrawPointsAmt)) && (
                      <span className="text-[9px] font-mono text-cyan-500 block">
                        Estimated Yield (under premium loss penalty): ${ (parseInt(withdrawPointsAmt) / 250).toFixed(2) } USDT
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] text-gray-500 font-bold uppercase block">USDT Wallet network (TRC-20)</label>
                    <input
                      type="text"
                      id="withdraw-wallet-input"
                      required
                      placeholder="TYZg48283..."
                      value={withdrawUSDTAddress}
                      onChange={(e) => setWithdrawUSDTAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>

                  <div className="text-[9.5px] text-gray-400 font-mono leading-normal space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={currentUser?.kyc_status === "verified" ? "text-green-500 font-bold" : "text-gray-600"}>
                        {currentUser?.kyc_status === "verified" ? "[✓] KYC Verified" : "[ ] KYC Verification Required"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={currentUser?.subscription_tier ? "text-green-500 font-bold" : "text-gray-600"}>
                        {currentUser?.subscription_tier ? "[✓] Depositor Subscription License Unlocked" : "[ ] Depositor Subscription License Required"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="withdraw-submit-btn"
                    disabled={isSubmitWithdrawal}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 font-black rounded-xl text-xs uppercase"
                  >
                    {isSubmitWithdrawal ? "Syncing coordinates..." : "Request points cashout"}
                  </button>
                </form>
              </div>
            </div>

            {/* DANGER ACCOUNT ZONE */}
            <div className="bg-[#1C1215] border border-red-500/25 rounded-3xl p-6 mt-6 space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-red-500/20 pb-3">
                <span className="text-red-500 text-xs font-black uppercase tracking-widest font-mono flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" /> 🚨 Danger Zone: Account Deletion
                </span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white uppercase font-mono">Irreversible Account Settle & Destroy</h4>
                  <p className="text-[10px] text-gray-400 max-w-xl font-sans leading-relaxed">
                    Once you execute account deletion, your profile record, points balance registry, active escrow trades, loaded document templates, and broker nodes will be permanently purged from StyleHub's database. This action is irreversible.
                  </p>
                </div>
                <button
                  type="button"
                  id="trigger-account-delete"
                  onClick={async () => {
                    if (!currentUser) return;
                    if (!confirm("⚠️ WARNING: This operation is permanent! Your remaining points and profile will be deleted forever. Do you wish to continue?")) {
                      return;
                    }
                    try {
                      const res = await fetch("/api/user/delete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: currentUser.id })
                      });
                      const data = await res.json();
                      if (data.success) {
                        alert("Account successfully deleted. Returning to homepage Gateway.");
                        // perform logout
                        setCurrentUser(null);
                        localStorage.removeItem("sh_user");
                        setActiveTab("home");
                      } else {
                        alert("Error: " + (data.error || "Could not delete profile."));
                      }
                    } catch (e) {
                      console.error(e);
                      alert("Network connection error. Failed to delete profile.");
                    }
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase font-mono rounded-xl tracking-wider hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex-shrink-0"
                >
                  Permanently Delete Account
                </button>
              </div>
            </div>

            {/* APP LICENSE & REGISTER PROTOCOL SECTION */}
            <div className="bg-[#121620] border border-zinc-800 rounded-3xl p-6 mt-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <span className="text-[#10B981] text-xs font-black uppercase tracking-widest font-mono">
                  📜 StyleHub End-User App License Agreement
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] text-zinc-400 font-sans leading-relaxed">
                <div className="space-y-3">
                  <p>
                    <strong>1. Scope of Grant:</strong> Under the StyleHub Sovereign Ledger terms, you are granted a non-exclusive, personal, non-transferable, revocable license to operate transaction simulators, trade signals telemetry, and custom Signia mockup engines strictly for private diagnostic, educational, or ledger modeling scenarios. Under no conditions may printed receipts be represented as live active monetary instruments.
                  </p>
                  <p>
                    <strong>2. System Currency (PLS Points):</strong> PLS points are virtual simulation tokens representing computation priorities on StyleHub nodes. They are consumed on-the-fly for real-time document signatures, sandboxed rendering, and live signal polling. PLS holds zero direct liability outside registered user cashouts verified under the AML/KYC identity registration dossier.
                  </p>
                </div>
                <div className="space-y-3">
                  <p>
                    <strong>3. User Integrity & Compliance:</strong> By uploading bespoke HTML "Signia Files" or accessing broker indices, you swear and represent that all user content conforms to national cyber-safety mandates and complies fully with standard financial simulator norms. StyleHub reserves the right to terminate accounts, void balances, or revoke administrative access upon detection of abnormal system telemetry.
                  </p>
                  <p>
                    <strong>4. Google Service Association:</strong> Sign-ins and platform credentials utilize secure federated single sign-on technology. All associated logos, branding emblems, and metadata remain the exclusive intellectual properties of Google Inc. and are represented solely to reinforce third-party federation trust vectors.
                  </p>
                </div>
              </div>
            </div>

            {/* IF USER ADMIN CORE: Renders full overwrite console dynamically */}
            {currentUser?.role === "admin" && (
              <div className="mt-8 animate-fadeIn">
                <AdminPanel
                  currentUserId={currentUser.id}
                  onSettingsUpdate={(newSettings) => setSettings(newSettings)}
                  onRefreshUserPoints={handleRefreshUserPoints}
                />
              </div>
            )}
          </div>
        )
      )}

      {activeTab === "brokers" && (
        !currentUser ? (
          <div className="flex flex-col items-center justify-center py-10 w-full animate-fadeIn">
            <AuthCard
              onAuthSuccess={(u) => {
                setCurrentUser(u);
                localStorage.setItem("sh_user", JSON.stringify(u));
              }}
            />
          </div>
        ) : (
          <CryptoBrokersPortal
            currentUser={currentUser}
            onRefreshUser={handleRefreshUserPoints}
          />
        )
      )}
      </div>

      {unlockedAssetGuide && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0E131F] border border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col justify-between shadow-2xl relative">
            <button
              onClick={() => setUnlockedAssetGuide(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
              <div className="flex items-center gap-3 pb-3 border-b border-indigo-900/40">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Award className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-emerald-400 tracking-wider">Asset Code Delivered</h3>
                  <p className="text-[11px] font-mono text-gray-400">Product Template: {unlockedAssetGuide.title}</p>
                </div>
              </div>

              {/* Guide Content Display */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-[45vh] overflow-y-auto">
                {unlockedAssetGuide.guide}
              </div>

              <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[10.5px] text-emerald-300 leading-normal font-sans">
                  The developer guide has been securely provisioned to your profile. Please download the source package ZIP files below to begin deployment.
                </p>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex gap-3 pt-5 mt-4 border-t border-slate-800 justify-end">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(unlockedAssetGuide.guide);
                  alert("📋 Guide copied to clipboard! You can paste this in your IDE.");
                }}
                className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white font-bold rounded-xl transition-all cursor-pointer"
              >
                Copy Guide
              </button>
              <a
                href={unlockedAssetGuide.url}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-gray-950 text-xs font-black rounded-xl hover:brightness-110 active:scale-95 flex items-center gap-2 transition-all cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Source ZIP
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Google Gemini chatbot copilot widget */}
      <AIAssistant />
      <SupportWidget settings={settings} />

      {/* Modern Dense Navigation bottom bar (meets X + Telegram mobile) */}
      <div className="fixed bottom-0 inset-x-0 bg-[#0E131F]/90 border-t border-slate-800/80 py-3.5 z-40 backdrop-blur-md shadow-2xl flex justify-around">
        <button
          id="nav-tab-home animate-pulse"
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "home" ? "text-cyan-400 font-black" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wider uppercase">HUB</span>
        </button>
        <button
          id="nav-tab-profile"
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "profile" ? "text-cyan-400 font-black" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wider uppercase">SECURITY</span>
        </button>
        <button
          id="nav-tab-marketplace"
          onClick={() => setActiveTab("marketplace")}
          className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "marketplace" ? "text-cyan-400 font-black" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wider uppercase">DIGITAL</span>
        </button>
        <button
          id="nav-tab-blackroom"
          onClick={() => setActiveTab("blackroom")}
          className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "blackroom" ? "text-[#00E5FF] font-black" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Radio className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wider uppercase">BLACK ROOM</span>
        </button>
        <button
          id="nav-tab-brokers"
          onClick={() => setActiveTab("brokers")}
          className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "brokers" ? "text-[#00E5FF] font-black" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wider uppercase">BROKERS</span>
        </button>
      </div>

      {/* Footer License Link & Subtle Watermark with integrated active Google sign-in emblem */}
      <div className="text-center text-[10px] font-mono mt-12 mb-6 pb-12 flex flex-col items-center justify-center gap-3.5 select-none">
        <button
          onClick={() => setShowLicenseModal(true)}
          className="text-[#00E5FF] hover:text-white transition-all underline decoration-[#00E5FF]/40 hover:decoration-white font-bold tracking-wider uppercase text-[9px] cursor-pointer"
        >
          📄 View StyleHub Application License Agreement (T&C)
        </button>

        {/* Integrated active Google sign-in emblem blended with Jadai Studios hand & yin details */}
        <div 
          onClick={() => {
            const c = jadaiClicks + 1;
            setJadaiClicks(c);
            if (c >= 5) {
              setShowAdminConsole(true);
              setJadaiClicks(0);
            }
          }}
          className="flex flex-col sm:flex-row items-center justify-center gap-2.5 py-3 px-5 rounded-2xl border border-zinc-800 text-gray-300 hover:text-white hover:border-[#00E5FF]/40 transition-all cursor-pointer active:scale-95 select-none"
          title={currentUser ? "Authenticated" : "Tap 5 times for admin console"}
        >
          <div className="flex items-center gap-1.5 font-sans font-bold">
            <Sparkles className="w-4 h-4 text-[#00E5FF]" />
            <span className="tracking-tight text-xs">Jadai Studios</span>
          </div>
          <span className="hidden sm:inline text-zinc-700">|</span>
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="text-[#00E5FF] animate-pulse">☯</span>
            <span className="text-zinc-400 font-extrabold tracking-widest uppercase">STYLEHUB CORE</span>
            <span className="text-zinc-600 text-[10px] lowercase font-normal">v3.0</span>
          </div>
        </div>

        <span className="text-zinc-600 uppercase tracking-widest block mt-1.5 text-[8.5px]">
          StyleHub Platform Core • Copyright © Jadai Studios • Powered by Google Cloud API Services
        </span>
      </div>

      {/* Admin Console: 5-click Jadai emblem trigger */}
      {showAdminConsole && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0E131F] border border-[#00C5A3]/30 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowAdminConsole(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#00C5A3]/10 border border-[#00C5A3]/30 flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6 text-[#00C5A3]" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Admin Console</h3>
              <p className="text-[10px] text-gray-400 mt-1">Authenticate with admin credentials</p>
            </div>
            <AuthCard
              onAuthSuccess={(u) => {
                setCurrentUser(u);
                localStorage.setItem("sh_user", JSON.stringify(u));
                setShowAdminConsole(false);
              }}
            />
          </div>
        </div>
      )}

      {showLicenseModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0E131F] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[85vh] flex flex-col justify-between shadow-2xl relative">
            <button
              onClick={() => setShowLicenseModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
              aria-label="Close License Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
              <div className="flex items-center gap-3 pb-3 border-b border-indigo-900/40">
                <div className="w-10 h-10 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF]">
                  <ShieldCheck className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-wider">StyleHub System License</h3>
                  <p className="text-[10px] font-mono text-cyan-400">Compliance Directives, Escrow Terms & Safeguards</p>
                </div>
              </div>

              {/* Terms Content */}
              <div className="space-y-4 text-slate-300 font-sans text-xs leading-relaxed">
                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] mb-1 flex items-center gap-1">
                    <span className="text-cyan-400">1.</span> Simulation & Educational Boundaries
                  </h4>
                  <p className="text-slate-400 text-[11.5px]">
                    All fintech transaction generators, OPay/Kuda checkout mimics, and financial ledger transfer simulators supplied by StyleHub are strictly for design evaluation, UX demonstration, and sandbox validation. Utilizing mock financial receipt representations to deceive individuals is strictly prohibited.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] mb-1 flex items-center gap-1">
                    <span className="text-cyan-400">2.</span> Point Holding Escrow System
                  </h4>
                  <p className="text-slate-400 text-[11.5px]">
                    All points traded inside the marketplace, anonymous lists, or rented developer slots (Jadai PLS Points) hold automatically in secure programmatic custody escrows. Release triggers occur exclusively when transaction validity or code dispatch satisfies both trading nodes.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] mb-1 flex items-center gap-1">
                    <span className="text-cyan-400">3.</span> Double-Cipher Pseudonyms
                  </h4>
                  <p className="text-slate-400 text-[11.5px]">
                    Allocations of coordinate-protected chemical pseudonyms (e.g., Helium, Lithium) guarantee complete trace protection inside the Black Room. Registrants are bound to negotiate in good faith. Jadai Studios retains immediate auditing privileges to block abusive sessions.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] mb-1 flex items-center gap-1">
                    <span className="text-cyan-400">4.</span> Google Infrastructure credibility
                  </h4>
                  <p className="text-slate-400 text-[11.5px]">
                    Secure Google fast sign-in API pathways are integrated to guarantee user credentials integrity. All platform layouts are design concepts administered under Jadai Studios, leveraging Google services for verified uptime and sandbox deployment reliability.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl flex items-start gap-2">
                <Check className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                <p className="text-[10px] text-cyan-300 font-mono leading-normal">
                  By clicking accept, you authorize session register directories, consent to AML checklists, and verify that all outputs run under sterile simulated conditions.
                </p>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex gap-3 pt-5 mt-4 border-t border-slate-800 justify-end">
              <button
                type="button"
                onClick={() => setShowLicenseModal(false)}
                className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 text-xs font-black rounded-xl hover:brightness-110 transition-all cursor-pointer uppercase tracking-wider font-mono shadow-md shadow-cyan-500/10"
              >
                Accept Terms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}
