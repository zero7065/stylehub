import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// ===== PORT =====
const PORT = process.env.PORT || 3000;

// ===== DATABASE =====
const DB_FILE = path.join(process.cwd(), "db.json");

// System-wide default chemical elements list
const pseudonyms = [
  "🔮 Lithium", "🌿 Helium", "🔥 Carbon", "⚡ Neon", "❄️ Argon",
  "💎 Silicon", "🪐 Xenon", "☣️ Uranium", "🧬 Platinum", "🔱 Titanium",
  "☄️ Cobalt", "💧 Hydrogen", "🍃 Nitrogen", "🛡️ Krypton", "🪙 Silver", "👑 Gold"
];

function getDB() {
  let db: any;
  if (!fs.existsSync(DB_FILE)) {
    const initialDB = {
      users: [
        {
          id: "admin-123",
          email: "jehuhudson@gmail.com",
          password: "admin1234",
          role: "admin",
          points: 1000000,
          referral_code: "ADMINSH",
          kyc_status: "verified",
          black_room_alias: "👑 Gold",
          trust_score: 100,
          created_at: new Date().toISOString()
        },
        {
          id: "user-456",
          email: "user@stylehub.com",
          password: "User@123456",
          role: "user",
          points: 1500,
          referral_code: "USERSTYLE",
          referred_by: "ADMINSH",
          kyc_status: "verified",
          kyc_data: {
            name: "John Demo Doe",
            address: "123 Naira Way, Lagos"
          },
          black_room_alias: "🔮 Lithium",
          trust_score: 95,
          created_at: new Date().toISOString()
        }
      ],
      black_room_listings: [
        {
          id: "listing-br1",
          user_id: "admin-123",
          alias: "👑 Gold",
          title: "Premium 10K IG Account Boosted",
          description: "High quality US-based audience. Fully clean, ready for monetization niche. Handover immediately via Escrow.",
          price_points: 150,
          status: "open",
          created_at: new Date().toISOString()
        },
        {
          id: "listing-br2",
          user_id: "broker-2",
          alias: "🔥 Carbon",
          title: "Verified UK Virtual Number (1 Year)",
          description: "Perfect for WhatsApp/Telegram activation. Direct sim routing, no expiry for 12 months.",
          price_points: 80,
          status: "open",
          created_at: new Date().toISOString()
        }
      ],
      black_room_messages: [
        {
          id: "msg-1",
          listing_id: "listing-br1",
          from_alias: "👑 Gold",
          message: "Welcome to the premium listing chat. Safe escrow only.",
          timestamp: new Date().toISOString()
        }
      ],
      brokers: [
        { id: "broker-1", alias: "💎 DiamondDealer", trust_score: 100, is_active: true },
        { id: "broker-2", alias: "🔥 Carbon", trust_score: 99, is_active: true },
        { id: "broker-3", alias: "⚡ FastTrader", trust_score: 97, is_active: true },
        { id: "broker-4", alias: "🔮 Lithium", trust_score: 98, is_active: true },
        { id: "broker-5", alias: "🌿 Helium", trust_score: 95, is_active: true }
      ],
      escrow_transactions: [],
      marketplace_listings: [
        {
          id: "mkt-1",
          user_id: "admin-123",
          user_email: "admin@stylehub.com",
          title: "+1 USA VoIP Clean Number",
          description: "Freshly generated and warmed up. Excellent for PayPal & Stripe confirmations.",
          category: "numbers",
          price_points: 30,
          status: "open",
          created_at: new Date().toISOString()
        },
        {
          id: "mkt-2",
          user_id: "admin-123",
          user_email: "admin@stylehub.com",
          title: "TikTok Account Creator Booster Panel",
          description: "Simulate and trigger automatic platform engagement of up to 5k clicks.",
          category: "boosting",
          price_points: 120,
          status: "open",
          created_at: new Date().toISOString()
        }
      ],
      programmer_services: [
        { id: "srv-1", title: "Full-Stack Express + React Fintech Setup", description: "Design a complete digital banking system customized to your enterprise visual style.", price_points: 500, delivery_days: 5, is_active: true },
        { id: "srv-2", title: "Telegram Auto-Transaction Escrow Bot", description: "Script a node-based bot to monitor wallet transfers and manage instant payouts.", price_points: 300, delivery_days: 3, is_active: true },
        { id: "srv-3", title: "Pixel Perfect custom HTML Mock Integrator", description: "Craft highly dynamic forms, receipts and transaction cards with gorgeous visuals.", price_points: 150, delivery_days: 2, is_active: true }
      ],
      programmer_bookings: [],
      gallery_items: [
        { id: "gal-1", title: "Dark Bento Fintech Landing Page Template", description: "Complete responsive glassmorphism client site focusing on points, transactions and crypto blocks.", preview_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80", demo_url: "#", price_points: 200, price_money: 15, created_at: new Date().toISOString() },
        { id: "gal-2", title: "Ultra HD Telegram Web App Store", description: "Sleek bento layout with dynamic cart state and integrated point-deduction mock systems.", preview_image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80", demo_url: "#", price_points: 350, price_money: 25, created_at: new Date().toISOString() }
      ],
      user_receipts: [],
      withdrawal_requests: [],
      activity_logs: [
        { id: "log-seed", user_id: "system", user_email: "system@stylehub", action: "PLATFORM_INIT", details: "StyleHub engine successfully booted and database pre-seeded by Jadai Studios.", timestamp: new Date().toISOString() }
      ],
      system_settings: {
        gas_fee_percent: 5,
        signup_bonus: 50,
        referral_percent: 10,
        receipt_price_points: 10,
        custom_emblem_html: `<div class="flex items-center gap-2 px-3.5 py-1.5 border border-cyan-500/30 rounded-full bg-cyan-950/20 backdrop-blur-sm shadow-lg shadow-cyan-500/10"><span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span><span class="text-[10px] font-mono font-semibold tracking-widest text-cyan-400 uppercase">⚡ JADAI STUDIOS INTEGRITY SEAL</span></div>`,
        whatsapp_url: "https://wa.me/2340000000000",
        telegram_url: "https://t.me/jadaistudios",
        support_email: "support@stylehub.net",
        groq_api_key: "",
        ai_script: "You are Jarvis, the friendly AI platform Assistant for StyleHub. StyleHub is a fintech & digital marketplace created and operated by Jadai Studios. Keep answers crisp and refer users to the various tabs (the Digital Goods Marketplace, Black Room anonymous trades, or Custom Receipt Simulator)."
      },
      crypto_brokers: [
        {
          id: "cbroker-1",
          name: "Ares Algo Arbitrage",
          alias: "⚡ Ares Algo",
          description: "High-frequency triangular arbitrage trading pool scanning 15+ decentralized exchanges. Safely captures swift micro-price discrepancies in BTC, ETH, and SOL pairs with mathematical precision.",
          price_points: 150,
          risk_level: "Low",
          projected_apy: 45,
          minimum_investment_points: 10,
          is_active: true,
          detailed_readme: "### Ares Algo Arbitrage Protocol\n- **Strategy**: Cross-DEX Triangular Arbitrage.\n- **Risk Protocol**: Absolute neutral hedging. Runs zero direction directional exposure.\n- **Liquidity Lock**: Locked in smart multi-sig custody vaults.\n- **Target Yield**: Stable 35% - 55% APY based on volatility coefficients.\n- **Sovereign Admin Parameters**: Admin controls yield variables directly via System Admin Control HUD.",
          mock_trades: [
            { id: "t1", ticker: "BTC/USDT", amount: 1540, profit: 4.5, time: "Just now" },
            { id: "t2", ticker: "ETH/USDT", amount: 820, profit: -1.2, time: "2 mins ago" },
            { id: "t3", ticker: "SOL/USD", amount: 310, profit: 12.8, time: "5 mins ago" }
          ]
        },
        {
          id: "cbroker-2",
          name: "Zephyr Liquidity Fund",
          alias: "🔮 Zephyr Yield",
          description: "Automated layer-1 proof-of-stake node operator and concentrated liquidity pool manager. Strategically supplies deep capital to Uniswap V3 tight ranges for amplified fee shares.",
          price_points: 250,
          risk_level: "Medium",
          projected_apy: 78,
          minimum_investment_points: 25,
          is_active: true,
          detailed_readme: "### Zephyr Concentrated Liquidity Fund\n- **Strategy**: Active Concentrated Fee Optimization.\n- **Rebalancing**: Programmatic adjusting of price ranges twice daily.\n- **Underlying Assets**: Stablecoin pairings (USDC/USDT), core majors (WBTC, WETH).\n- **Target Yield**: Target APY range 65% - 90% in low-to-medium risk profiles.",
          mock_trades: [
            { id: "t4", ticker: "USDC/USDT", amount: 5040, profit: 0.8, time: "Just now" },
            { id: "t5", ticker: "ETH/USDT", amount: 2400, profit: 15.4, time: "1 min ago" },
            { id: "t6", ticker: "LINK/ETH", amount: 1250, profit: -2.3, time: "8 mins ago" }
          ]
        },
        {
          id: "cbroker-3",
          name: "Titan Leverage System",
          alias: "🔱 Titan Leverage",
          description: "High-leverage altcoin momentum trading node. Scans coin velocities and breakouts, executing multi-leverage longs or shorts with custom automated stop-loss thresholds.",
          price_points: 400,
          risk_level: "High",
          projected_apy: 125,
          minimum_investment_points: 50,
          is_active: true,
          detailed_readme: "### Titan Leveraged Altcoins System\n- **Strategy**: Leveraged Momentum Breakout Scalping.\n- **Margin Assets**: High volatility majors and selection altcoins.\n- **Protection Suite**: Programmatic target hard-stops at -5% and trailing take-profits.\n- **Target Yield**: Dynamic yield cycles up to 150% based on active trends.",
          mock_trades: [
            { id: "t7", ticker: "SOL/USDT (10x Long)", amount: 500, profit: 45.0, time: "Just now" },
            { id: "t8", ticker: "DOGE/USDT (5x Short)", amount: 1200, profit: -18.2, time: "3 mins ago" },
            { id: "t9", ticker: "AVAX/USDT (10x Long)", amount: 650, profit: 89.4, time: "11 mins ago" }
          ]
        },
        {
          id: "cbroker-4",
          name: "Apollo DeFi Smart Crops",
          alias: "☀️ Apollo Farms",
          description: "Decentralized automated compounder crawling high-yield swap routers and borrowing vaults. Employs advanced flash-loaning to lock yield ratios and minimize impermanent loss.",
          price_points: 600,
          risk_level: "Very High",
          projected_apy: 180,
          minimum_investment_points: 100,
          is_active: true,
          detailed_readme: "### Apollo DeFi Smart Farms\n- **Strategy**: Multi-Chain Yield Farming and Flash Loan Compounding.\n- **Asset Crawlers**: Ethereum, Arbitrum, Optimism liquidity layers.\n- **Hedging Protocol**: Self-liquidating collateral debt ratios.\n- **Target Yield**: Hyper-compounded APY range 140% - 220%. Allow auto-reinvestment.",
          mock_trades: [
            { id: "t10", ticker: "AAVE/GHO-Farm", amount: 2500, profit: 124.9, time: "Just now" },
            { id: "t11", ticker: "CRV/cvxCRV-LP", amount: 4800, profit: -8.5, time: "12 mins ago" },
            { id: "t12", ticker: "UNI/V3-Fees", amount: 1900, profit: 64.2, time: "30 mins ago" }
          ]
        },
        {
          id: "cbroker-5",
          name: "Chronos Scalping Sentinel",
          alias: "☄️ Chronos Scalp AI",
          description: "AI-trained predictive model capturing microsecond trend differentials. Trades high frequency order flows and sentiment shifts on extreme volatility tokens.",
          price_points: 900,
          risk_level: "Extreme",
          projected_apy: 240,
          minimum_investment_points: 200,
          is_active: true,
          detailed_readme: "### Chronos AI Predictive Systems\n- **Strategy**: Artificial Neural Network Micro-Scalping.\n- **Feed Integrity**: Realtime orderbook deep-level analytics and social sentiment indexing.\n- **Risk Factor**: Extreme high-speed delta-risk; highly sensitive to market shocks.\n- **Target Yield**: Maximum speculative performance up to 300% APY.",
          mock_trades: [
            { id: "t13", ticker: "PEPE/USDT", amount: 95000, profit: 785.4, time: "Just now" },
            { id: "t14", ticker: "WIF/USDT", amount: 42000, profit: -312.2, time: "4 mins ago" },
            { id: "t15", ticker: "BONK/USDT", amount: 135000, profit: 942.5, time: "18 mins ago" }
          ]
        }
      ],
      user_unlocked_brokers: [],
      user_investments: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
    db = initialDB;
  } else {
    db = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  }

  // Schema hot patches (keeping your logic)
  let updated = false;
  const adminUser = db.users?.find((u: any) => u.email === "admin@stylehub.com");
  if (adminUser) {
    if (adminUser.points < 1000000) { adminUser.points = 1000000; updated = true; }
    if (!adminUser.subscription_tier) { adminUser.subscription_tier = "elite"; updated = true; }
  }
  const demoUser = db.users?.find((u: any) => u.email === "user@stylehub.com");
  if (demoUser && !demoUser.subscription_tier) {
    demoUser.subscription_tier = "professional";
    updated = true;
  }
  if (!db.crypto_brokers || db.crypto_brokers.length === 0) {
    db.crypto_brokers = [
      { id: "cbroker-1", name: "InvestSafe Protocol", alias: "investsafe", description: "Ultra-secure, premium staking validator and automated compounding index. Earn active virtual yield blocks inside a secured and stable sandbox, featuring structured KYC validators and interactive yield multipliers.", price_points: 150, risk_level: "Low", projected_apy: 12, minimum_investment_points: 50, is_active: true, detailed_readme: "### InvestSafe Staking Engine\n- **License Fee**: 150 PLS Points\n- **Capabilities**: Access secure virtual liquidity pool staking, simulate real-time yield accrual, and perform direct KYC ID checks. Includes full integration with developer customizers and email linkages.", mock_trades: [] },
      { id: "cbroker-2", name: "CryptoMiner Pro Console", alias: "cryptominer", description: "Immersive virtual cloud hashrate miner dashboard. Secure elite GPU cards, trigger active block computations, monitor live rig telemetry, and cashout mining credits directly.", price_points: 250, risk_level: "Medium", projected_apy: 48, minimum_investment_points: 100, is_active: true, detailed_readme: "### CryptoMiner Hashrate Engine\n- **License Fee**: 250 PLS Points\n- **Capabilities**: Unlocks cloud mining command center. Upgrade GPU rigs, mine blocks via proof-of-work simulator, watch heat telemetry logs, and trade raw hashes for points.", mock_trades: [] },
      { id: "cbroker-3", name: "ApexGlobal Trading Hub", alias: "apexglobal", description: "Spot crypto trading terminal featuring live candlesticks, real-time CoinMarketCap statistics tracker, full order ledger books, buy/sell dispatch modals, and instant position reports.", price_points: 400, risk_level: "High", projected_apy: 120, minimum_investment_points: 150, is_active: true, detailed_readme: "### ApexGlobal Candlestick Exchange\n- **License ID**: cbroker-3\n- **Capabilities**: Real-time market study tracker, simulated limit/market trading, BTC order depth graphs, position histories, and instant execution simulation.", mock_trades: [] },
      { id: "cbroker-4", name: "ZenithWealth Portfolio", alias: "zenithwealth", description: "Digital strategic index allocation fund layout. Generate growth schedules, choose conservative/aggressive risks, and simulate dynamic multi-asset distributions in a custom simulator layout.", price_points: 600, risk_level: "Medium", projected_apy: 35, minimum_investment_points: 200, is_active: true, detailed_readme: "### ZenithWealth Asset Manager\n- **License ID**: cbroker-4\n- **Capabilities**: Wealth accumulation simulators, customized target distributions, auto-rebalancing simulators, and dynamic strategic yields.", mock_trades: [] },
      { id: "cbroker-5", name: "CalmCrypto Sovereign Wallet", alias: "calmcrypto", description: "Sleek, secure non-custodial multi-blockchain custody simulation. Create secure 12-seed paper recovery lists, browse simulated dApps, and export active cryptographic transaction blocks.", price_points: 900, risk_level: "Ultra", projected_apy: 220, minimum_investment_points: 250, is_active: true, detailed_readme: "### CalmCrypto Chain Gateway\n- **License ID**: cbroker-5\n- **Capabilities**: Elite multichain balance overview (ETH, SOL, BTC, BNB), backup phrase verification game, built-in staking sandbox, and high-contrast blockchain explorer receipts.", mock_trades: [] }
    ];
    updated = true;
  }
  if (db.system_settings && db.system_settings.receipt_price_points !== 150) {
    db.system_settings.receipt_price_points = 150;
    updated = true;
  }
  if (!db.templates) {
    db.templates = [
      {
        id: "tmpl-gold-signia",
        name: "Signia Premium Gold Voucher",
        category: "voucher",
        html_content: `
          <div style="background: linear-gradient(135deg, #0d0e12 0%, #15161d 100%); color: #fff; padding: 25px; border-radius: 16px; border: 1px solid #D4AF37; font-family: monospace; max-width: 400px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); text-shadow: 0 1px 1px #000;">
            <div style="text-align: center; border-bottom: 1px dashed rgba(212, 175, 55, 0.3); padding-bottom: 12px; margin-bottom: 20px;">
              <h2 style="color: #D4AF37; margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 2px;">GOLD SIGNIA</h2>
              <p style="font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.6; margin: 4px 0 0 0;">Secure Premium Asset Voucher</p>
            </div>
            <div style="font-size: 11px; line-height: 2;">
              <div style="display: flex; justify-content: space-between;"><strong style="color: #D4AF37;">SENDER:</strong> <span>{{SENDER_NAME}}</span></div>
              <div style="display: flex; justify-content: space-between;"><strong style="color: #D4AF37;">RECIPIENT:</strong> <span>{{RECEIVER_NAME}}</span></div>
              <div style="display: flex; justify-content: space-between;"><strong style="color: #D4AF37;">DESTINATION:</strong> <span>{{RECEIVER_BANK}}</span></div>
              <div style="display: flex; justify-content: space-between;"><strong style="color: #D4AF37;">REFERENCE:</strong> <span style="font-style: italic;">{{REFERENCE}}</span></div>
              <div style="display: flex; justify-content: space-between;"><strong style="color: #D4AF37;">STAMP REF:</strong> <span style="font-family: serif;">{{TRANSACTION_ID}}</span></div>
            </div>
            <div style="border-top: 1px dashed rgba(212, 175, 55, 0.3); margin-top: 20px; padding-top: 15px; text-align: center; font-size: 9px; opacity: 0.5; letter-spacing: 1px;">JADAI STUDIOS • SIGNIA ENGINE v1.0</div>
          </div>
        `
      }
    ];
    updated = true;
  }
  if (updated) fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  return db;
}

// ===== YOUR API ROUTES GO HERE =====
// (They are unchanged – keep all your app.get/post/put/delete endpoints)
// For brevity, I'm not rewriting all of them – you already have them in your original file.
// Just paste your existing route handlers below this line.
// ...
// ...

// ===== CONDITIONAL FRONTEND SERVING (FIXED) =====
const isDev = process.env.NODE_ENV === "development";

if (isDev) {
  // Development: use Vite middleware
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
  console.log("🔧 Dev mode – Vite middleware active.");
} else {
  // Production: serve static files from the built React app
  const clientDist = path.join(__dirname, "../client"); // adjust if your build outputs elsewhere
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    // Catch-all to serve index.html for SPA routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
    console.log(`📦 Serving static files from ${clientDist}`);
  } else {
    console.warn(`⚠️ Client dist not found at ${clientDist}. Make sure you ran 'npm run build'.`);
    // Fallback: if no static files, send a simple message
    app.get("*", (req, res) => {
      res.send("StylezHub – built files missing. Please build the frontend.");
    });
  }
}

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 StylezHub running on port ${PORT} (${isDev ? "development" : "production"})`);
});