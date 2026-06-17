import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, Lock, CheckCircle2, Copy, ExternalLink, ChevronRight, Clock } from "lucide-react";
import { formatCurrency, formatPhone, formatAccount, generateTxId, formatDate, BRAND_COLORS, FinhubAppId, getRandomAccount, getRandomPhone } from "../lib/finhub";

interface ReceiptPreviewProps {
  bank: string;
  senderName: string;
  receiverName: string;
  receiverBank: string;
  amount: number;
  dateTime: string;
  transactionId: string;
  reference: string;
  balance: number;
  customField?: string;
  unlocked: boolean;
  onUnlock?: () => void;
  isLoadingUnlock?: boolean;
  // New pixel-perfect fields
  senderAccount?: string;
  receiverAccount?: string;
  senderPhone?: string;
  receiverPhone?: string;
  fee?: number;
  paymentMethod?: string;
  transactionType?: string;
  status?: 'successful' | 'processing' | 'failed';
  billProvider?: string;
  meterNumber?: string;
  palmPointsUsed?: number;
  palmPointsEarned?: number;
  sessionDate?: string;
  sessionTime?: string;
}

export default function ReceiptPreview({
  bank, senderName, receiverName, receiverBank, amount, dateTime, transactionId,
  reference, balance, customField, unlocked, onUnlock, isLoadingUnlock = false,
  senderAccount, receiverAccount, senderPhone, receiverPhone, fee = 0,
  paymentMethod = 'OWealth', transactionType = 'Money Transfer - Bank account',
  status = 'successful', billProvider, meterNumber, palmPointsUsed, palmPointsEarned,
  sessionDate, sessionTime,
}: ReceiptPreviewProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const sAcct = senderAccount || getRandomAccount();
  const rAcct = receiverAccount || getRandomAccount();
  const sPhone = senderPhone || getRandomPhone();
  const rPhone = receiverPhone || getRandomPhone();
  const txId = transactionId || generateTxId(bank as FinhubAppId);
  const now = new Date();
  const formattedDate = dateTime || formatDate(bank as FinhubAppId, now);
  const colors = BRAND_COLORS[bank as FinhubAppId] || BRAND_COLORS.opay;

  const handleDownloadPNG = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });
      const link = document.createElement("a");
      link.download = `FINHUB_${bank}_Receipt_${txId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to generate receipt image:", err);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // 1. OPay — Pixel Perfect
  // ──────────────────────────────────────────────────────────────
  const renderOPay = () => (
    <div style={{ background: '#F5F5F5', fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif" }} className="w-full max-w-[400px]">
      {/* Header spacer */}
      <div style={{ background: '#00C5A3', height: 4 }} />
      <div className="bg-white">
        {/* Logo area */}
        <div className="flex flex-col items-center pt-6 pb-3 px-6">
          <div className="w-14 h-14 rounded-full bg-white border-2 border-[#00C5A3] flex items-center justify-center relative mb-3">
            <div className="w-9 h-9 rounded-full bg-[#00C5A3] flex items-center justify-center">
              <div className="w-4 h-4 bg-white" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }} />
            </div>
          </div>
          <span className="text-sm text-gray-500">Transfer to</span>
          <span className="text-base font-bold text-gray-900 mt-0.5">{receiverName}</span>
        </div>

        {/* Amount */}
        <div className="text-center pb-4 px-6">
          <span className="text-4xl font-black text-gray-900 tracking-tight">{formatCurrency(amount)}</span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-1.5 pb-6 px-6">
          <CheckCircle2 className="w-4 h-4" style={{ color: colors.success }} />
          <span className="text-sm font-semibold" style={{ color: colors.success }}>Successful</span>
        </div>

        {/* Transaction Details Card */}
        <div className="mx-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Transaction Details</span>
          </div>
          <div className="divide-y divide-gray-100">
            {/* Recipient Details */}
            <div className="px-4 py-3">
              <span className="text-xs text-gray-400 block mb-1">Recipient Details</span>
              <span className="text-sm font-bold text-gray-900 block">{receiverName}</span>
              <span className="text-xs" style={{ color: colors.label }}>
                {receiverBank || 'OPay'} | {formatPhone(rPhone)}
              </span>
            </div>
            {/* Transaction No. */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block">Transaction No.</span>
                <span className="text-xs font-mono text-gray-700">{txId}</span>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(txId); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="flex items-center gap-1 text-xs font-semibold" style={{ color: colors.primary }}
              >
                <Copy className="w-3 h-3" /> {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            {/* Payment Method */}
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-gray-400">Payment Method</span>
              <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                {paymentMethod} <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            {/* Transaction Date */}
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-gray-400">Transaction Date</span>
              <span className="text-xs text-gray-700 font-medium">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* More Actions */}
        <div className="mx-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">More Actions</span>
          </div>
          <div className="flex divide-x divide-gray-100">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold" style={{ color: colors.primary }}>
              <ExternalLink className="w-3.5 h-3.5" />
              Transfer Again
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold" style={{ color: colors.primary }}>
              <Clock className="w-3.5 h-3.5" />
              View Records
            </button>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="flex gap-3 px-4 pb-6">
          <button className="flex-1 py-2.5 rounded-full border-2 text-xs font-bold text-center" style={{ borderColor: colors.primary, color: colors.primary }}>
            Report Issue
          </button>
          <button className="flex-1 py-2.5 rounded-full text-xs font-bold text-center text-white" style={{ background: colors.primary }}>
            Share Receipt
          </button>
        </div>
      </div>
      <div className="text-center py-3 text-[9px] uppercase tracking-widest" style={{ color: colors.label }}>
        Licensed by the CBN and insured by the NDIC
      </div>
    </div>
  );

  const isOpay = bank.toLowerCase() === 'opay';

  return (
    <div className="relative flex flex-col items-center bg-slate-900/60 p-4 border border-slate-800 rounded-3xl backdrop-blur-md">
      <div className="overflow-hidden rounded-xl bg-neutral-900 border border-slate-800 flex justify-center w-full p-2.5 relative">
        <div
          ref={receiptRef}
          className={`${!unlocked ? "blur-md select-none pointer-events-none filter brightness-50 contrast-75" : ""} w-full flex justify-center`}
          style={{ background: '#FFFFFF', borderRadius: 8 }}
        >
          {renderOPay()}
        </div>

        {!unlocked && (
          <div className="absolute inset-x-2 inset-y-2 flex flex-col justify-center items-center bg-slate-950/75 backdrop-blur-md rounded-xl p-4 text-center border border-cyan-500/20 shadow-2xl">
            <div className="h-10 w-10 rounded-full bg-cyan-950/50 border border-cyan-400/40 flex items-center justify-center text-cyan-400 animate-pulse mb-3.5">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black tracking-widest text-cyan-400 uppercase">RAW WATERMARKED PREVIEW</h4>
            <p className="text-[11px] text-slate-300 mt-2.5 max-w-[270px] leading-relaxed">
              Verify your design variables above. Pay <span className="text-cyan-400 font-bold">10 points</span> to completely lift watermarks, wipe blur, and enable instant Ultra-HD PNG downloads.
            </p>
            <button
              id="unlock-receipt-btn"
              onClick={onUnlock}
              disabled={isLoadingUnlock}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-xs font-black text-gray-950 hover:brightness-110 active:scale-95 transition-all text-white flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {isLoadingUnlock ? "Processing Unlock..." : "Unlock Full Receipt (10 PLS)"}
            </button>
          </div>
        )}
      </div>

      {unlocked && (
        <button
          id="download-receipt-png"
          onClick={handleDownloadPNG}
          className="mt-4 py-2.5 px-6 w-full bg-gradient-to-r from-[#00E5FF] to-cyan-500 text-gray-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
        >
          <Download className="w-4 h-4" /> Download ultra-HD PNG Receipt
        </button>
      )}
    </div>
  );
}
