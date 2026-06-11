import React, { useState, useEffect } from "react";
import { Shield, Users, RefreshCw, Layers, DollarSign, Settings, Trash2, Check, X, AlertTriangle, FileText, Globe } from "lucide-react";
import { User, WithdrawalRequest, SystemSettings, ActivityLog } from "../types";

interface AdminPanelProps {
  currentUserId: string;
  onSettingsUpdate?: (newSettings: SystemSettings) => void;
  onRefreshUserPoints?: () => void;
}

export default function AdminPanel({ currentUserId, onSettingsUpdate, onRefreshUserPoints }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [stats, setStats] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "withdrawals" | "settings" | "logs" | "products">("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  // States for updating credit packages
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pointsToSet, setPointsToSet] = useState<string>("");

  // Product management states
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [marketListings, setMarketListings] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPricePoints, setNewPricePoints] = useState("150");
  const [newPriceMoney, setNewPriceMoney] = useState("15");
  const [newPreviewImage, setNewPreviewImage] = useState("");
  const [newDemoUrl, setNewDemoUrl] = useState("");

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) {
      alert("Please fill in title and description.");
      return;
    }
    try {
      const res = await fetch("/api/admin/gallery/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentAdminId: currentUserId,
          title: newTitle,
          description: newDesc,
          price_points: parseInt(newPricePoints) || 150,
          price_money: parseFloat(newPriceMoney) || 15,
          preview_image: newPreviewImage,
          demo_url: newDemoUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Product template successfully added!");
        setNewTitle("");
        setNewDesc("");
        setNewPricePoints("150");
        setNewPriceMoney("15");
        setNewPreviewImage("");
        setNewDemoUrl("");
        fetchAdminData();
      } else {
        alert(data.error || "Failed to add product.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (itemId: string) => {
    if (!window.confirm("Purge this premium gallery item product?")) return;
    try {
      const res = await fetch("/api/admin/gallery/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentAdminId: currentUserId,
          itemId
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Product template deleted.");
        fetchAdminData();
      } else {
        alert(data.error || "Failed to delete product.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMarketListing = async (listingId: string) => {
    if (!window.confirm("Purge this user's marketplace product listing item?")) return;
    try {
      const res = await fetch("/api/admin/marketplace/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentAdminId: currentUserId,
          listingId
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Marketplace listing item deleted.");
        fetchAdminData();
      } else {
        alert(data.error || "Failed to delete listing.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "dashboard") {
        const statsRes = await fetch("/api/admin/stats");
        const statsData = await statsRes.json();
        setStats(statsData);
        setSettings(statsData.systemSettings);
      } else if (activeTab === "users") {
        const usersRes = await fetch("/api/admin/users");
        const usersData = await usersRes.json();
        setUsers(usersData);
      } else if (activeTab === "withdrawals") {
        const wRes = await fetch("/api/admin/withdrawals");
        const wData = await wRes.json();
        setWithdrawals(wData);
      } else if (activeTab === "settings") {
        const sRes = await fetch("/api/settings");
        const sData = await sRes.json();
        setSettings(sData);
      } else if (activeTab === "logs") {
        const lRes = await fetch("/api/admin/logs");
        const lData = await lRes.json();
        setLogs(lData);
      } else if (activeTab === "products") {
        const galRes = await fetch("/api/gallery/list");
        const galData = await galRes.json();
        setGalleryItems(galData);

        const mktRes = await fetch("/api/marketplace/list");
        const mktData = await mktRes.json();
        setMarketListings(mktData);
      }
    } catch (err) {
      console.error("Admin retrieve error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, targetPoints?: number, targetKyc?: string) => {
    try {
      const res = await fetch("/api/admin/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentAdminId: currentUserId,
          userId,
          points: targetPoints,
          kycStatus: targetKyc,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedUser(null);
        setPointsToSet("");
        fetchAdminData();
        if (onRefreshUserPoints) onRefreshUserPoints();
      } else {
        alert(data.error || "Failed to update user parameters.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessWithdrawal = async (requestId: string, action: "approve" | "reject") => {
    try {
      const res = await fetch("/api/admin/withdrawal/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentAdminId: currentUserId,
          requestId,
          action,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      } else {
        alert(data.error || "Could not process withdrawal transaction.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentAdminId: currentUserId,
          ...settings,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Platform parameters updated successfully!");
        if (onSettingsUpdate) onSettingsUpdate(data.settings);
        fetchAdminData();
      } else {
        alert(data.error || "Save configuration failure");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeepWipe = async () => {
    if (!window.confirm("🔴 DANGER! You are about to initiate a global database RESET. This will wipe and truncate all custom users register balances, points history, digital escrow locks, listings, receipts, and revert system setting to original seeds. Confirm database wipe?")) return;
    setIsWiping(true);
    try {
      const res = await fetch("/api/admin/wipe-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentAdminId: currentUserId }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Database wiped successfully! System loaded seeded defaults. Session is resetting.");
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsWiping(false);
    }
  };

  const handleDeleteUserAdmin = async (userId: string, userEmail: string) => {
    if (userId === "admin-123") {
      alert("❌ Protect Error: Master administrator profile cannot be deleted.");
      return;
    }
    const check1 = window.confirm(`⚠️ WARNING: Are you sure you want to permanently delete the user content and profile for ${userEmail}?`);
    if (!check1) return;
    const check2 = window.confirm(`🔥 FINAL OVERRULE WARNING: This will drop ${userEmail} completely from database records and wipe their active transactions. Confirm purge?`);
    if (!check2) return;

    try {
      const res = await fetch("/api/admin/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentAdminId: currentUserId, userId })
      });
      const data = await res.json();
      if (data.success) {
        alert("💀 User account dropped successfully!");
        fetchAdminData();
        if (onRefreshUserPoints) onRefreshUserPoints();
      } else {
        alert(data.error || "Failed to drop user account.");
      }
    } catch (err) {
      console.error(err);
      alert("Network transmission error.");
    }
  };

  const handleModifyLogAdmin = async (log: ActivityLog) => {
    const newAction = window.prompt(`Modify Activity Log Action type [${log.action}]:`, log.action);
    if (newAction === null) return;
    const newDetails = window.prompt("Modify Activity Log Details message description:", log.details);
    if (newDetails === null) return;

    try {
      const res = await fetch("/api/admin/logs/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentAdminId: currentUserId,
          logId: log.id,
          action: newAction,
          details: newDetails
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      } else {
        alert(data.error || "Could not modify log audit.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLogAdmin = async (logId: string) => {
    if (!window.confirm("Permanently drop this log entry from the audit ledger?")) return;
    try {
      const res = await fetch("/api/admin/logs/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentAdminId: currentUserId, logId })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      } else {
        alert(data.error || "Failed to delete log entry.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#0B0E14] border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden font-sans text-white">
      {/* Header section with credentials flag */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 shadow">
            <Shield className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-widest text-red-500 uppercase">JADAI ADMIN CONTROL CORE</h2>
            <span className="text-[10px] text-gray-400 font-mono font-medium">Full autonomous system overwrite</span>
          </div>
        </div>
        <button
          onClick={fetchAdminData}
          disabled={isLoading}
          className="p-1.5 border border-slate-800 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-white transition-all active:rotate-45"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Navigation Hub */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 mb-6 overflow-x-auto text-[11px] font-semibold">
        <button
          id="admin-tab-dashboard"
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-1.5 rounded-xl border transition-all ${
            activeTab === "dashboard"
              ? "bg-red-500 text-gray-950 border-red-500"
              : "bg-slate-900 border-slate-800 text-gray-400 hover:text-white"
          }`}
        >
          Overview Core
        </button>
        <button
          id="admin-tab-users"
          onClick={() => setActiveTab("users")}
          className={`px-4 py-1.5 rounded-xl border transition-all ${
            activeTab === "users"
              ? "bg-red-500 text-gray-950 border-red-500"
              : "bg-slate-900 border-slate-800 text-gray-400 hover:text-white"
          }`}
        >
          User Registry
        </button>
        <button
          id="admin-tab-withdrawals"
          onClick={() => setActiveTab("withdrawals")}
          className={`px-4 py-1.5 rounded-xl border transition-all ${
            activeTab === "withdrawals"
              ? "bg-red-500 text-gray-950 border-red-500"
              : "bg-slate-900 border-slate-800 text-gray-400 hover:text-white"
          }`}
        >
          Withdrawals ({withdrawals.filter((w) => w.status === "pending").length})
        </button>
        <button
          id="admin-tab-settings"
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-1.5 rounded-xl border transition-all ${
            activeTab === "settings"
              ? "bg-red-500 text-gray-950 border-red-500"
              : "bg-slate-900 border-slate-800 text-gray-400 hover:text-white"
          }`}
        >
          Global Engine Settings
        </button>
        <button
          id="admin-tab-logs"
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-1.5 rounded-xl border transition-all ${
            activeTab === "logs"
              ? "bg-red-500 text-gray-950 border-red-500"
              : "bg-slate-900 border-slate-800 text-gray-400 hover:text-white"
          }`}
        >
          System Logs Audits
        </button>
        <button
          id="admin-tab-products"
          onClick={() => setActiveTab("products")}
          className={`px-4 py-1.5 rounded-xl border transition-all ${
            activeTab === "products"
              ? "bg-red-500 text-gray-950 border-red-500"
              : "bg-slate-900 border-slate-800 text-gray-400 hover:text-white"
          }`}
        >
          📦 Store Products
        </button>
      </div>

      {isLoading && (
        <div className="py-20 text-center text-xs font-mono text-red-500 animate-pulse flex items-center justify-center gap-2">
          <Layers className="w-4 h-4 animate-spin" /> Retrieving data from secure local files...
        </div>
      )}

      {!isLoading && (
        <div>
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <span className="text-gray-400 text-[10px] font-bold block uppercase tracking-wider">Total Registers</span>
                  <span className="text-2xl font-black text-white mt-1 block">{stats.totalUsers}</span>
                </div>
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <span className="text-gray-400 text-[10px] font-bold block uppercase tracking-wider">Receipt Checked</span>
                  <span className="text-2xl font-black text-cyan-400 mt-1 block">{stats.totalReceipts}</span>
                </div>
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <span className="text-gray-400 text-[10px] font-bold block uppercase tracking-wider">Active Escrow Handles</span>
                  <span className="text-2xl font-black text-amber-500 mt-1 block">{stats.activeEscrows}</span>
                </div>
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <span className="text-gray-300 text-[10px] font-bold block uppercase tracking-wider">USDT Withdraw Pending</span>
                  <span className="text-2xl font-black text-red-500 mt-1 block">{stats.pendingUSDTWithdrawals}</span>
                </div>
              </div>

              {/* Fast settings audit */}
              <div className="p-5 border border-red-500/20 bg-red-950/5 rounded-2xl">
                <h3 className="text-xs font-black tracking-wider uppercase text-red-400 flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4" /> System Overwrite Guidelines
                </h3>
                <p className="text-[11px] text-slate-300 max-w-[500px] leading-relaxed">
                  As the verified director of Jadai Studios, you hold total sovereignty. Add points to users, verify KYC uploads, issue approvals for USDT cashout packages, modify the customized emblem seal Pasteur HTML, or execute data purges immediately.
                </p>
                <button
                  id="admin-clear-db-btn"
                  onClick={handleDeepWipe}
                  disabled={isWiping}
                  className="mt-4 py-2 px-5 bg-gradient-to-r from-red-650 to-rose-600 hover:from-red-700 font-bold hover:to-rose-700 text-xs font-mono rounded-xl border border-red-500/20 text-white flex items-center gap-2 shadow-lg transition-all"
                >
                  <Trash2 className="w-4 h-4 text-rose-300" /> {isWiping ? "Purging Files..." : "Wipe entire Database (Reset defaults)"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: USER REGISTRY */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Registered accounts</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Email Address</th>
                      <th className="py-2.5 px-3 text-center">Active Points</th>
                      <th className="py-2.5 px-3">KYC Status</th>
                      <th className="py-2.5 px-3">Chemical Symbol</th>
                      <th className="py-2.5 px-3">Trust</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-slate-900 hover:bg-slate-900/40 text-[11px]">
                        <td className="py-3 px-3">
                          <span className="font-semibold block">{u.email}</span>
                          <span className="text-[9px] text-gray-500 font-mono">ID: {u.id} | Role: {u.role}</span>
                        </td>
                        <td className="py-3 px-3 text-center text-cyan-400 font-mono font-black">{u.points}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            u.kyc_status === "verified" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            u.kyc_status === "pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse" :
                            "bg-gray-800 text-gray-400"
                          }`}>
                            {u.kyc_status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-200">{u.black_room_alias || "n/a"}</td>
                        <td className="py-3 px-3 font-mono text-gray-500">{u.trust_score}%</td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex gap-1.5 justify-end">
                            {u.kyc_status === "pending" && (
                              <>
                                <button
                                  id={`verify-kyc-${u.id}`}
                                  onClick={() => handleUpdateUser(u.id, undefined, "verified")}
                                  className="p-1 rounded bg-emerald-500 text-gray-950 hover:brightness-110"
                                  title="Approve verification"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  id={`reject-kyc-${u.id}`}
                                  onClick={() => handleUpdateUser(u.id, undefined, "rejected")}
                                  className="p-1 rounded bg-rose-500 text-white hover:brightness-110"
                                  title="Reject verification"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              id={`adjust-pts-${u.id}`}
                              onClick={() => {
                                setSelectedUser(u);
                                setPointsToSet(String(u.points));
                              }}
                              className="px-2 py-1 bg-slate-800 text-[10px] font-bold rounded hover:bg-slate-700"
                            >
                              Overrule Balance
                            </button>
                            {u.role !== "admin" && (
                              <button
                                id={`delete-user-${u.id}`}
                                onClick={() => handleDeleteUserAdmin(u.id, u.email)}
                                className="p-1 rounded bg-red-950/40 hover:bg-red-900 border border-red-500/30 text-rose-400 hover:text-white"
                                title="Delete account permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Point overrule modal pop */}
              {selectedUser && (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-3 max-w-sm mt-4">
                  <h4 className="text-xs font-black uppercase text-red-500">Overrule Points: {selectedUser.email}</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      id="points-adjust-input"
                      value={pointsToSet}
                      onChange={(e) => setPointsToSet(e.target.value)}
                      className="bg-slate-950 text-white rounded px-3 py-1 text-xs border border-slate-800 flex-1"
                      placeholder="Input absolute balance pts"
                    />
                    <button
                      id="points-update-submit"
                      onClick={() => handleUpdateUser(selectedUser.id, parseInt(pointsToSet))}
                      className="px-4 py-1.5 bg-red-500 text-gray-950 font-black rounded-lg text-xs"
                    >
                      Apply
                    </button>
                    <button
                      id="cancel-points-adjust"
                      onClick={() => setSelectedUser(null)}
                      className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: USDT WITHDRAWALS CASH OUT REQUESTS */}
          {activeTab === "withdrawals" && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Cashout requests ledger</h3>
              <p className="text-[10px] text-gray-500 font-mono mb-4 leading-relaxed">
                Users submit withdrawal requests once they clear KYC with points balance. 100 points = $1 USDT. Approve handles or reject to refund their points.
              </p>

              {withdrawals.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">No pending withdrawal cashouts.</div>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((w) => (
                    <div key={w.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{w.user_email}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                            w.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            w.status === "rejected" ? "bg-red-500/10 text-red-400 border border-red-505/20" :
                            "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                          }`}>
                            {w.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-cyan-400 mt-1">Address: {w.usdt_address}</p>
                        <span className="text-[9px] text-gray-500 font-mono mt-1 block">Request ID: {w.id} • Points: {w.amount_points} (${w.amount_points / 100} USDT)</span>
                      </div>

                      {w.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            id={`approve-withdraw-${w.id}`}
                            onClick={() => handleProcessWithdrawal(w.id, "approve")}
                            className="px-3.5 py-1.5 bg-emerald-500 text-gray-950 font-bold rounded-lg text-xs"
                          >
                            Approve
                          </button>
                          <button
                            id={`reject-withdraw-${w.id}`}
                            onClick={() => handleProcessWithdrawal(w.id, "reject")}
                            className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs"
                          >
                            Reject & Refund
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ENGINE GLOBAL CONFIGS */}
          {activeTab === "settings" && settings && (
            <form onSubmit={handleSaveSettings} className="space-y-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Global system settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Market Gas fee %</label>
                  <input
                    type="number"
                    id="setting-gas-fee"
                    value={settings.gas_fee_percent}
                    onChange={(e) => setSettings({ ...settings, gas_fee_percent: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Signup Bonus points</label>
                  <input
                    type="number"
                    id="setting-signup-bonus"
                    value={settings.signup_bonus}
                    onChange={(e) => setSettings({ ...settings, signup_bonus: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Referral commission key %</label>
                  <input
                    type="number"
                    id="setting-referral-com"
                    value={settings.referral_percent}
                    onChange={(e) => setSettings({ ...settings, referral_percent: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Receipt Simulation Price (pts)</label>
                  <input
                    type="number"
                    id="setting-receipt-price"
                    value={settings.receipt_price_points}
                    onChange={(e) => setSettings({ ...settings, receipt_price_points: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Injected HTML Emblem Textarea */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-red-500 uppercase flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Pasted custom emblem HTML Watermark
                </label>
                <p className="text-[9px] text-gray-500 leading-normal">
                  Paste the official Jadai Studios emblem code. It re-renders in the platform's global layout footer automatically.
                </p>
                <textarea
                  id="setting-emblem-html"
                  value={settings.custom_emblem_html}
                  onChange={(e) => setSettings({ ...settings, custom_emblem_html: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-400 focus:outline-none focus:border-red-500/40"
                  placeholder="Insert emblem SVG or div code here..."
                />
              </div>

              {/* Injected AI script Textarea */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-red-500 uppercase flex items-center gap-1">
                  🤖 Configurable AI Assistant Chatbot Script
                </label>
                <p className="text-[9px] text-gray-500 leading-normal">
                  Customize the system instructions or prompt fallback for Jarvis AI Copilot assistant.
                </p>
                <textarea
                  id="setting-ai-script"
                  value={settings.ai_script || ""}
                  onChange={(e) => setSettings({ ...settings, ai_script: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-400 focus:outline-none focus:border-red-500/40"
                  placeholder="Insert custom AI system instructions prompt..."
                />
              </div>

              {/* Support links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">WhatsApp Link</label>
                  <input
                    type="text"
                    id="setting-whatsapp-url"
                    value={settings.whatsapp_url}
                    onChange={(e) => setSettings({ ...settings, whatsapp_url: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Telegram Support</label>
                  <input
                    type="text"
                    id="setting-telegram-url"
                    value={settings.telegram_url}
                    onChange={(e) => setSettings({ ...settings, telegram_url: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Support Email</label>
                  <input
                    type="text"
                    id="setting-support-email"
                    value={settings.support_email}
                    onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white"
                  />
                </div>
              </div>

              {/* GROQ API Key */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-amber-400 uppercase flex items-center gap-1">
                  🟢 GROQ API Key (fallback when Gemini is exhausted)
                </label>
                <p className="text-[9px] text-gray-500 leading-normal">
                  Paste your Groq API key here to use Llama 3 models as the AI fallback when Gemini API is exhausted or unavailable. Leave empty to use Gemini only.
                </p>
                <input
                  type="text"
                  id="setting-groq-key"
                  value={(settings as any).groq_api_key || ""}
                  onChange={(e) => setSettings({ ...settings, groq_api_key: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500/40"
                  placeholder="gsk_your_groq_api_key_here"
                />
              </div>

              <button
                type="submit"
                id="save-settings-btn"
                className="w-full py-3 bg-red-500 text-gray-300 font-bold text-xs uppercase hover:brightness-110 active:scale-95 transition-all text-gray-950 font-black rounded-xl"
              >
                Save universal engine parameters
              </button>
            </form>
          )}

          {/* TAB 5: PLATFORM LOGS VIEW */}
          {activeTab === "logs" && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Activity trails audit</h3>
              <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl max-h-[350px] overflow-y-auto space-y-2.5 font-mono text-[10px]">
                {logs.map((l) => (
                  <div key={l.id} className="border-b border-slate-900/40 pb-2 relative group animate-fadeIn">
                    <div className="flex justify-between text-rose-500 font-bold items-center">
                      <span>[{l.action}]</span>
                      <div className="flex items-center gap-2 text-[9px] font-sans">
                        <span className="text-gray-500 font-mono">{new Date(l.timestamp).toLocaleTimeString()}</span>
                        <button
                          type="button"
                          onClick={() => handleModifyLogAdmin(l)}
                          className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded border border-slate-800 transition-colors cursor-pointer text-[8px]"
                          title="Modify Log details"
                        >
                          EDIT
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLogAdmin(l.id)}
                          className="px-1.5 py-0.5 bg-red-950/20 hover:bg-red-900 text-rose-400 rounded border border-slate-800 hover:text-white transition-colors cursor-pointer text-[8px]"
                          title="Delete Log permanently"
                        >
                          DROP
                        </button>
                      </div>
                    </div>
                    <div className="text-slate-300 mt-0.5">Details: {l.details}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5 text-slate-500">By: {l.user_email} • User-ID: {l.user_id}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: STORE PRODUCTS MANAGEMENT */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#00E5FF] mb-4">✨ Add Premium Gallery Source Product</h3>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Product Title</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                      placeholder="e.g. OPay Premium Cloned Script V2"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Display Price (Points)</label>
                    <input
                      type="number"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white"
                      placeholder="e.g. 150"
                      value={newPricePoints}
                      onChange={(e) => setNewPricePoints(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Short Description</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                      placeholder="High-fidelity front and backend secure automated simulation template bundle."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Mock Equivalent Price (USD)</label>
                    <input
                      type="number"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white"
                      placeholder="e.g. 24"
                      value={newPriceMoney}
                      onChange={(e) => setNewPriceMoney(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Image URL (Optional)</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white"
                      placeholder="https://images.unsplash.com/..."
                      value={newPreviewImage}
                      onChange={(e) => setNewPreviewImage(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-550 to-emerald-500 hover:brightness-105 rounded-xl font-bold font-sans text-xs uppercase tracking-wide text-gray-950"
                    >
                      Publish Premium Product Asset
                    </button>
                  </div>
                </form>
              </div>

              {/* Gallery Items Listing with Delete */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Active Gallery Products ({galleryItems.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {galleryItems.map((item) => (
                    <div key={item.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex justify-between items-start">
                      <div className="space-y-1 max-w-[80%]">
                        <span className="text-xs font-bold text-white block">{item.title}</span>
                        <p className="text-[10px] text-gray-400 line-clamp-2">{item.description}</p>
                        <div className="flex gap-2 items-center text-[9px] font-mono mt-1">
                          <span className="text-cyan-400">{item.price_points} Points</span>
                          <span className="text-gray-600">|</span>
                          <span className="text-gray-500">${item.price_money} USD</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(item.id)}
                        className="p-1.5 rounded bg-rose-950 hover:bg-rose-900 border border-red-500/30 text-rose-400 hover:text-white"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Marketplace listings (Accounts, numbers, boosts) with delete */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">User Marketplace Listings ({marketListings.length})</h3>
                <div className="space-y-2">
                  {marketListings.length === 0 ? (
                    <div className="text-center py-6 text-slate-600 text-xs font-mono">No active user listings catalog records.</div>
                  ) : (
                    marketListings.map((list) => (
                      <div key={list.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">{list.title}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/20">{list.category}</span>
                          </div>
                          <span className="text-[10px] text-gray-500 block mt-0.5">Seller: {list.seller_email} • Price: {list.price} pts</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteMarketListing(list.id)}
                          className="p-1 rounded bg-rose-950/30 hover:bg-rose-900/60 border border-rose-500/20 text-rose-400 hover:text-white"
                          title="Purge record"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
