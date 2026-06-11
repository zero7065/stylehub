import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Bot, Clock } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  content: string;
  timestamp: string;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "bot",
      content: "Hello! I am **Jarvis** – your StyleHub AI Copilot. I can guide you through receipt simulator generation, anonymous chemical codes inside the **Black Room Ring**, safe Escrows ledger transfers, and direct developer bookings.\n\nType **`how it works`** or **`receipts`** to query details directly!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: "usr-" + Date.now(),
      sender: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMsg.content }]
        })
      });

      const data = await response.json();
      const botReply = data.response || "Server is currently synchronizing databases. Try asking again in a few seconds!";

      setMessages((prev) => [
        ...prev,
        {
          id: "bot-" + Date.now(),
          sender: "bot",
          content: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error("AI chat connection error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          sender: "bot",
          content: "⚠️ *Ah, lost connection trace!* Fortunately, you can review details inside the marketplace tabs or ping our administrators directly.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Expanded chat bubble panel */}
      {isOpen ? (
        <div className="w-[360px] max-h-[500px] h-[480px] rounded-3xl border border-slate-800 bg-[#0B0E14]/95 text-white shadow-2xl flex flex-col backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border-b border-slate-800/80 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-widest text-cyan-400 uppercase">Jarvis Workspace AI</h3>
                <span className="text-[9px] text-gray-400 font-mono">StyleHub Copilot</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Viewport */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-cyan-500 text-gray-950 rounded-tr-none font-medium"
                    : "bg-slate-900/80 border border-slate-800 rounded-tl-none text-slate-200"
                }`}>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  <div className={`text-[8px] mt-1 text-right font-mono ${m.sender === "user" ? "text-gray-900/60" : "text-slate-500"}`}>
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs text-cyan-400 flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 animate-bounce" />
                  <span className="animate-pulse">Jarvis is processing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Custom quick hints footer */}
          <div className="px-4 py-1.5 bg-slate-950/40 border-t border-slate-800 flex gap-1.5 overflow-x-auto text-[9px] text-cyan-400 font-mono scrollbar-none">
            <button
              id="hint-how-it-works"
              onClick={() => { setInput("how it works"); }}
              className="px-2 py-0.5 border border-cyan-500/20 rounded bg-cyan-950/10 hover:bg-cyan-950/30 whitespace-nowrap"
            >
              How it works
            </button>
            <button
              id="hint-receipts"
              onClick={() => { setInput("receipt templates"); }}
              className="px-2 py-0.5 border border-cyan-500/20 rounded bg-cyan-950/10 hover:bg-cyan-950/30 whitespace-nowrap"
            >
              Custom Receipts
            </button>
            <button
              id="hint-black-room"
              onClick={() => { setInput("black room anonymous trading"); }}
              className="px-2 py-0.5 border border-cyan-500/20 rounded bg-cyan-950/10 hover:bg-cyan-950/30 whitespace-nowrap"
            >
              Black Room
            </button>
          </div>

          {/* Form Input Submit */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800/80 bg-slate-950 flex gap-2">
            <input
              type="text"
              id="ai-assistant-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Jarvis anything about StyleHub..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/60"
            />
            <button
              type="submit"
              id="ai-assistant-send-btn"
              className="p-1.5 bg-cyan-500 text-gray-950 rounded-xl hover:brightness-110 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Trigger Circular Button */
        <button
          id="ai-assistant-toggle-btn"
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-gray-950 shadow-2xl shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all border border-cyan-300/40 relative group cursor-pointer"
        >
          <Bot className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-300"></span>
          </span>
          {/* Tooltip on Hover */}
          <div className="absolute right-16 bg-[#0B0E14] border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] text-cyan-400 font-mono uppercase tracking-widest hidden group-hover:block shadow-lg">
            Chat with AI
          </div>
        </button>
      )}
    </div>
  );
}
