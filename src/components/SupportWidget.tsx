import React, { useState } from "react";
import { HelpCircle, ExternalLink, Mail } from "lucide-react";
import { SystemSettings } from "../types";

interface SupportWidgetProps {
  settings: SystemSettings | null;
}

export default function SupportWidget({ settings }: SupportWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);

  const telegramUrl = settings?.telegram_url || "https://t.me/jadaistudios";
  const whatsappUrl = settings?.whatsapp_url || "https://wa.me/2340000000000";
  const supportEmail = settings?.support_email || "support@stylehub.net";

  return (
    <div 
      className="fixed bottom-6 left-6 z-50 font-sans"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Expanded Actions Panel */}
      <div 
        className={`absolute bottom-16 left-0 bg-[#0E131F]/95 border border-slate-800 rounded-3xl p-4 w-60 shadow-2xl backdrop-blur-md transition-all duration-300 origin-bottom-left ${
          isHovered 
            ? "scale-100 opacity-100 translate-y-0" 
            : "scale-75 opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <span className="text-[9px] font-mono font-black text-cyan-400 uppercase tracking-widest block mb-1">
          Jadai Studios Integrity Help
        </span>
        <h4 className="text-xs font-black text-white leading-none mb-3">
          Direct Agent Support Escrow
        </h4>

        <div className="space-y-2">
          {/* Telegram Line */}
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#00E5FF]/40 text-xs text-slate-200 hover:text-white transition-all"
          >
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-[10px] font-bold">TG</span>
              Telegram Channel help
            </span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </a>

          {/* WhatsApp Route */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-green-500/40 text-xs text-slate-200 hover:text-white transition-all"
          >
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center text-[10px] font-bold">WA</span>
              WhatsApp Official Hub
            </span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </a>

          {/* Direct Email */}
          <a
            href={`mailto:${supportEmail}`}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-200 hover:text-white transition-all"
          >
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              Direct Support ticket
            </span>
            <Mail className="w-3.5 h-3.5 text-gray-500" />
          </a>
        </div>

        <div className="text-[9px] font-mono text-gray-500 text-center mt-3 border-t border-slate-800/60 pt-2 leading-relaxed">
          Operational hours: 24/7 Support Desk • Escrow Disputes Auditing
        </div>
      </div>

      {/* Trigger floating button */}
      <button
        type="button"
        className="h-14 w-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-cyan-500/40 shadow-2xl hover:scale-105 active:scale-95 transition-all relative cursor-pointer"
        aria-label="Support contacts"
      >
        <HelpCircle className="w-6 h-6 text-cyan-400" />
        <span className="absolute -top-1 -left-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
        </span>
      </button>
    </div>
  );
}
