import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// System-wide default chemical elements list
const pseudonyms = [
  "🔮 Lithium", "🌿 Helium", "🔥 Carbon", "⚡ Neon", "❄️ Argon",
  "💎 Silicon", "🪐 Xenon", "☣️ Uranium", "🧬 Platinum", "🔱 Titanium",
  "☄️ Cobalt", "💧 Hydrogen", "🍃 Nitrogen", "🛡️ Krypton", "🪙 Silver", "👑 Gold"
];

// Helper to load or initialize DB
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
          points: 1000000, // Pre-seeded with 1,000,000 points
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
          points: 1500, // Seeded with points to allow broker purchase test
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

  // Schema Hot Patches (Ensure compatibility if DB file already exists)
  let updated = false;

  // Set default admin-123's points to exactly 1,000,000 for user requirements
  const adminUser = db.users?.find((u: any) => u.email === "admin@stylehub.com");
  if (adminUser) {
    if (adminUser.points < 1000000) {
      adminUser.points = 1000000;
      updated = true;
    }
    if (!adminUser.subscription_tier) {
      adminUser.subscription_tier = "elite";
      updated = true;
    }
  }

  // Set default user-456's points and subscription_tier
  const demoUser = db.users?.find((u: any) => u.email === "user@stylehub.com");
  if (demoUser) {
    if (!demoUser.subscription_tier) {
      demoUser.subscription_tier = "professional";
      updated = true;
    }
  }

  // Initialize or upgrade crypto_brokers to Premium Simulated Fintech Apps (only if missing)
  if (!db.crypto_brokers || db.crypto_brokers.length === 0) {
    db.crypto_brokers = [
    {
      id: "cbroker-1",
      name: "InvestSafe Protocol",
      alias: "investsafe",
      description: "Ultra-secure, premium staking validator and automated compounding index. Earn active virtual yield blocks inside a secured and stable sandbox, featuring structured KYC validators and interactive yield multipliers.",
      price_points: 150,
      risk_level: "Low",
      projected_apy: 12,
      minimum_investment_points: 50,
      is_active: true,
      detailed_readme: "### InvestSafe Staking Engine\n- **License Fee**: 150 PLS Points\n- **Capabilities**: Access secure virtual liquidity pool staking, simulate real-time yield accrual, and perform direct KYC ID checks. Includes full integration with developer customizers and email linkages.",
      mock_trades: []
    },
    {
      id: "cbroker-2",
      name: "CryptoMiner Pro Console",
      alias: "cryptominer",
      description: "Immersive virtual cloud hashrate miner dashboard. Secure elite GPU cards, trigger active block computations, monitor live rig telemetry, and cashout mining credits directly.",
      price_points: 250,
      risk_level: "Medium",
      projected_apy: 48,
      minimum_investment_points: 100,
      is_active: true,
      detailed_readme: "### CryptoMiner Hashrate Engine\n- **License Fee**: 250 PLS Points\n- **Capabilities**: Unlocks cloud mining command center. Upgrade GPU rigs, mine blocks via proof-of-work simulator, watch heat telemetry logs, and trade raw hashes for points.",
      mock_trades: []
    },
    {
      id: "cbroker-3",
      name: "ApexGlobal Trading Hub",
      alias: "apexglobal",
      description: "Spot crypto trading terminal featuring live candlesticks, real-time CoinMarketCap statistics tracker, full order ledger books, buy/sell dispatch modals, and instant position reports.",
      price_points: 400,
      risk_level: "High",
      projected_apy: 120,
      minimum_investment_points: 150,
      is_active: true,
      detailed_readme: "### ApexGlobal Candlestick Exchange\n- **License ID**: cbroker-3\n- **Capabilities**: Real-time market study tracker, simulated limit/market trading, BTC order depth graphs, position histories, and instant execution simulation.",
      mock_trades: []
    },
    {
      id: "cbroker-4",
      name: "ZenithWealth Portfolio",
      alias: "zenithwealth",
      description: "Digital strategic index allocation fund layout. Generate growth schedules, choose conservative/aggressive risks, and simulate dynamic multi-asset distributions in a custom simulator layout.",
      price_points: 600,
      risk_level: "Medium",
      projected_apy: 35,
      minimum_investment_points: 200,
      is_active: true,
      detailed_readme: "### ZenithWealth Asset Manager\n- **License ID**: cbroker-4\n- **Capabilities**: Wealth accumulation simulators, customized target distributions, auto-rebalancing simulators, and dynamic strategic yields.",
      mock_trades: []
    },
    {
      id: "cbroker-5",
      name: "CalmCrypto Sovereign Wallet",
      alias: "calmcrypto",
      description: "Sleek, secure non-custodial multi-blockchain custody simulation. Create secure 12-seed paper recovery lists, browse simulated dApps, and export active cryptographic transaction blocks.",
      price_points: 900,
      risk_level: "Ultra",
      projected_apy: 220,
      minimum_investment_points: 250,
      is_active: true,
      detailed_readme: "### CalmCrypto Chain Gateway\n- **License ID**: cbroker-5\n- **Capabilities**: Elite multichain balance overview (ETH, SOL, BTC, BNB), backup phrase verification game, built-in staking sandbox, and high-contrast blockchain explorer receipts.",
      mock_trades: []
    }
  ];
    updated = true;
  }

  // Hotpatch system receipt price points to 150 as requested
  if (db.system_settings) {
    if (db.system_settings.receipt_price_points !== 150) {
      db.system_settings.receipt_price_points = 150;
      updated = true;
    }
  }

  // Add templates database list if it does not exist
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
            <div style="margin-top: 25px; background: rgba(212, 175, 55, 0.1); border: 1px solid #D4AF37; padding: 12px; border-radius: 10px; text-align: center;">
              <span style="display: block; font-size: 9px; color: #D4AF37; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">LEDGER DEBIT CONFIRMED</span>
              <span style="font-size: 22px; font-weight: 900; display: block; margin-top: 4px; color: #fff;">₦{{AMOUNT}}</span>
            </div>
            <div style="text-align: center; margin-top: 20px; font-size: 8px; opacity: 0.4;">
              POWERED BY SIGNIA SECURITY PROTOCOLS • JADAI LABS
            </div>
          </div>
        `,
        created_at: new Date().toISOString()
      },
      {
        id: "tmpl-emerald-receipt",
        name: "Emerald Sovereign Cash Stamp",
        category: "invoice",
        html_content: `
          <div style="background: #ffffff; color: #1e293b; padding: 30px; border-radius: 20px; border: 3px solid #10B981; font-family: sans-serif; max-width: 400px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
              <div>
                <h3 style="color: #10B981; margin: 0; font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">EMERALD SOVEREIGN</h3>
                <span style="font-size: 9px; color: #64748b; font-weight: 600;">INSTANT CREDIT ADVICE</span>
              </div>
              <div style="background: #10B981; color: #fff; font-size: 9px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; letter-spacing: 0.5px;">SETTLED</div>
            </div>
            <div style="text-align: center; margin: 25px 0;">
              <span style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px;">APPROVED VALUE</span>
              <h1 style="font-size: 32px; font-weight: 900; color: #0f172a; margin: 5px 0 0 0; letter-spacing: -1px;">₦{{AMOUNT}}</h1>
            </div>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 15px; font-size: 12px; display: grid; gap: 10px;">
              <div style="display: flex; justify-content: space-between;"><span style="color: #64748b; font-weight: 500;">Payer:</span><strong style="color: #0f172a;">{{SENDER_NAME}}</strong></div>
              <div style="display: flex; justify-content: space-between;"><span style="color: #64748b; font-weight: 500;">Beneficiary:</span><strong style="color: #0f172a;">{{RECEIVER_NAME}}</strong></div>
              <div style="display: flex; justify-content: space-between;"><span style="color: #64748b; font-weight: 500;">Bank Target:</span><strong style="color: #0f172a;">{{RECEIVER_BANK}}</strong></div>
              <div style="display: flex; justify-content: space-between;"><span style="color: #64748b; font-weight: 500;">Ledger Memo:</span><strong style="color: #64748b; font-weight: normal; font-style: italic;">{{REFERENCE}}</strong></div>
              <div style="display: flex; justify-content: space-between;"><span style="color: #64748b; font-weight: 500;">Audit Pin:</span><strong style="color: #0f172a; font-family: monospace;">{{TRANSACTION_ID}}</strong></div>
            </div>
            <div style="text-align: center; margin-top: 30px; font-size: 9px; color: #94a3b8; font-weight: 500; border-top: 1px dashed #e2e8f0; padding-top: 15px;">
              Thank you for secure escrow routing.
            </div>
          </div>
        `,
        created_at: new Date().toISOString()
      }
    ];
    updated = true;
  }

  if (!db.crypto_brokers) {
    db.crypto_brokers = [
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
    ];
    updated = true;
  }
  if (!db.user_unlocked_brokers) {
    db.user_unlocked_brokers = [];
    updated = true;
  }
  if (!db.user_investments) {
    db.user_investments = [];
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }
  return db;
}

function writeDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Log actions helper
function addLog(userId: string, email: string, action: string, details: string) {
  const db = getDB();
  db.activity_logs.unshift({
    id: "log-" + Date.now() + Math.random().toString(36).substr(2, 4),
    user_id: userId,
    user_email: email,
    action,
    details,
    timestamp: new Date().toISOString()
  });
  if (db.activity_logs.length > 300) {
    db.activity_logs = db.activity_logs.slice(0, 300);
  }
  writeDB(db);
}

// Initialize Gemini
let ai: any = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini Client: ", err);
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Register
app.post("/api/auth/register", (req, res) => {
  const { email, password, referral_code } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const db = getDB();
  const exists = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "User already exists" });
  }

  const settings = db.system_settings;
  const signUpPoints = settings.signup_bonus || 50;

  // Assign anonymous element alias
  const assignedAlias = pseudonyms[Math.floor(Math.random() * pseudonyms.length)];
  const user_id = "usr-" + Date.now();

  const newUser = {
    id: user_id,
    email: email.toLowerCase(),
    password: password,
    role: "user",
    points: signUpPoints,
    referral_code: "SH-" + Math.random().toString(36).substring(2, 7).toUpperCase(),
    referred_by: referral_code || undefined,
    kyc_status: "unsubmitted",
    black_room_alias: assignedAlias,
    trust_score: 90,
    created_at: new Date().toISOString()
  };

  // If referred, credit commission
  if (referral_code) {
    const referrer = db.users.find((u: any) => u.referral_code === referral_code);
    if (referrer) {
      const bonus = Math.round(signUpPoints * (settings.referral_percent / 100));
      referrer.points += bonus;
      addLog(referrer.id, referrer.email, "REFERRAL_BONUS", `Credited ${bonus} points for referring ${email}`);
    }
  }

  db.users.push(newUser);
  writeDB(db);

  addLog(newUser.id, newUser.email, "USER_REGISTER", `Registered with standard signup bonus of ${signUpPoints} points.`);

  res.json({ success: true, user: { id: newUser.id, email: newUser.email, role: newUser.role, points: newUser.points, black_room_alias: newUser.black_room_alias } });
});

// 2. Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const db = getDB();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  res.json({ success: true, user });
});

// 2B. Session Refresh Me
app.post("/api/auth/me", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing identity reference" });
  const db = getDB();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User session expired or invalid" });
  res.json({ success: true, user });
});

// Google login simulation
app.post("/api/auth/google", (req, res) => {
  const { googleId, email, name, isEasterEgg } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Google authentication failed" });
  }

  const db = getDB();
  let user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

  if (isEasterEgg) {
    // Supercharge this account as a sovereign root administrator with 1,000,000 PLS points
    if (!user) {
      const assignedAlias = pseudonyms[Math.floor(Math.random() * pseudonyms.length)];
      const user_id = "usr-g" + Date.now();
      user = {
        id: user_id,
        email: email.toLowerCase(),
        google_id: googleId || "g-rootadmin",
        role: "admin",
        points: 1000000,
        referral_code: "ROOT-ADMIN-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
        kyc_status: "approved",
        kyc_data: { name: "SOVEREIGN ROOT ADMIN", phone: "08012345678", pin: "1234" },
        black_room_alias: "👑 ROOT_ADMINISTRATOR",
        trust_score: 100,
        created_at: new Date().toISOString()
      };
      db.users.push(user);
    } else {
      user.role = "admin";
      user.points = 1000000;
      user.trust_score = 100;
      if (!user.kyc_data) {
        user.kyc_data = { name: "SOVEREIGN ROOT ADMIN", phone: "08012345678", pin: "1234" };
      }
    }
    writeDB(db);
    addLog(user.id, user.email, "SYS_ROOT_ELEVATION", "Easter Egg clicked 5x! Account elevated to Root Admin with 1,000,000 PLS points.");
  } else if (!user) {
    const settings = db.system_settings;
    const assignedAlias = pseudonyms[Math.floor(Math.random() * pseudonyms.length)];
    const user_id = "usr-g" + Date.now();

    user = {
      id: user_id,
      email: email.toLowerCase(),
      google_id: googleId,
      role: email.toLowerCase() === "jadaistudiosoffcl@gmail.com" || email.toLowerCase() === "admin@stylehub.com" || email.toLowerCase() === "jehuhudson@gmail.com" ? "admin" : "user",
      points: settings.signup_bonus,
      referral_code: "SH-G" + Math.random().toString(36).substring(2, 6).toUpperCase(),
      kyc_status: "unsubmitted",
      black_room_alias: assignedAlias,
      trust_score: 90,
      created_at: new Date().toISOString()
    };
    db.users.push(user);
    writeDB(db);
    addLog(user.id, user.email, "USER_GOOGLE_REGISTER", "Registered automatically via Google Sign-In.");
  } else {
    // Linked if user already existed
    if (!user.google_id) {
      user.google_id = googleId;
      writeDB(db);
    }
    addLog(user.id, user.email, "USER_GOOGLE_LOGIN", "Logged in via Google Sign-In.");
  }

  res.json({ success: true, user: { id: user.id, email: user.email, role: user.role, points: user.points, black_room_alias: user.black_room_alias, trust_score: user.trust_score, kyc_status: user.kyc_status, kyc_data: user.kyc_data, referral_code: user.referral_code } });
});

// Update profile / KYC submit
app.post("/api/profile/kyc", (req, res) => {
  const { userId, name, address, idCardBase64 } = req.body;
  const db = getDB();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.kyc_status = "pending";
  user.kyc_data = {
    name,
    address,
    id_card: idCardBase64 || "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=400&q=80"
  };
  writeDB(db);
  addLog(user.id, user.email, "KYC_SUBMIT", "Submitted identity KYC verification package.");
  res.json({ success: true, user });
});

// Irreversible Account Deletion Endpoint (self-service)
app.post("/api/user/delete", (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "Missing user identification parameters" });
  }

  const db = getDB();
  const index = db.users.findIndex((u: any) => u.id === userId);
  if (index === -1) {
    return res.status(404).json({ error: "Account not located in registry" });
  }
  
  if (userId === "admin-123" || db.users[index].role === "admin") {
    return res.status(403).json({ error: "Unauthorized access: Administrative accounts are protected from direct destruct commands" });
  }

  const deletedUserEmail = db.users[index].email;
  db.users.splice(index, 1);

  // Clean related digital goods, messages, and listings
  if (db.marketplace_listings) {
    db.marketplace_listings = db.marketplace_listings.filter((l: any) => l.user_id !== userId);
  }
  if (db.black_room_listings) {
    db.black_room_listings = db.black_room_listings.filter((l: any) => l.user_id !== userId);
  }

  writeDB(db);
  addLog(userId, deletedUserEmail, "USER_DESTRUCTION", "Account and dossier records permanently purged.");
  res.json({ success: true });
});

// Paystack packages Sim with tier subscriptions from $4 to $30
app.get("/api/points/packages", (req, res) => {
  res.json([
    { id: "pkg1", name: "Basic Core License", usd: 4, points: 400, tier: "basic", features: "unlocked receipts generator" },
    { id: "pkg2", name: "Professional Level License", usd: 10, points: 1200, tier: "professional", features: "+ autonomous core brokers" },
    { id: "pkg3", name: "Business Sovereign License", usd: 20, points: 2600, tier: "executive", features: "+ full escrow trading, blackroom access" },
    { id: "pkg4", name: "Elite Custom Ledger License", usd: 30, points: 4500, tier: "elite", features: "+ sovereign manual html templates upload (Signia)" }
  ]);
});

// Custom HTML Template list endpoint
app.get("/api/templates/list", (req, res) => {
  const db = getDB();
  res.json(db.templates || []);
});

// Custom HTML Template upload endpoint
app.post("/api/templates/upload", (req, res) => {
  const { userId, name, category, htmlContent } = req.body;
  if (!userId || !name || !htmlContent) {
    return res.status(400).json({ error: "Missing required upload parameters (userId, name, htmlContent)" });
  }

  const db = getDB();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User profile not found." });

  // Sovereign feature check: Custom Signia uploads are reserved for Premium members (Executive and Elite Tiers)
  const userTier = user.subscription_tier || "basic";
  if (userTier !== "executive" && userTier !== "elite" && user.role !== "admin") {
    return res.status(403).json({ 
      error: "Subscription Blocked: Standard HTML template uploads ('Signia files') require Executive Sovereign ($20) or Elite Custom Ledger ($30) subscriptions. Please top-up on Paystack to upgrade!" 
    });
  }

  const newTemplate = {
    id: "tmpl-" + Date.now(),
    name,
    category: category || "custom",
    html_content: htmlContent,
    uploaded_by: { id: user.id, email: user.email },
    created_at: new Date().toISOString()
  };

  if (!db.templates) db.templates = [];
  db.templates.unshift(newTemplate);
  writeDB(db);

  addLog(user.id, user.email, "TEMPLATE_UPLOAD", `Uploaded custom html template '${name}'.`);
  res.json({ success: true, template: newTemplate });
});

// Submitting a withdrawal request
app.post("/api/points/withdraw", (req, res) => {
  const { userId, amountPoints, usdtAddress } = req.body;
  if (!amountPoints || !usdtAddress) return res.status(400).json({ error: "Missing parameters" });

  const db = getDB();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(440).json({ error: "Session authentication error" });

  // 1. MUST clear KYC identity register dossiers
  if (user.kyc_status !== "verified") {
    return res.status(403).json({ error: "🔒 Identity Unverified: You must complete and clear KYC verification first in the Security tab before cashing out." });
  }

  // 2. MUST have made subscription with real cash
  const hasPromoOnly = !user.subscription_tier || user.subscription_tier === null;
  if (hasPromoOnly) {
    return res.status(403).json({ error: "🚫 Depositor Limitation: Spot withdrawals are restricted strictly to active license subscribers. Please buy a real-cash subscription package on the Home/Hub tab first to authorize cashouts." });
  }

  // 3. Minimum points target limit
  if (amountPoints < 1000) {
    return res.status(400).json({ error: "Minimum withdrawal threshold is 1000 points ($4.00 USDT cashout equivalent under high penalty conversion)." });
  }

  // 4. Any bonus or referral commissions is only for in-app services - limit to actual purchased_points
  const userPurchasedPts = user.purchased_points || 0;
  if (parseInt(amountPoints) > userPurchasedPts) {
    return res.status(400).json({ 
      error: `🚫 Gated Promotional Bonus: Out of your total points, only ${userPurchasedPts} are purchased real-cash points. Signup bonuses, system incentives, and referral commissions (totaling ${user.points - userPurchasedPts} points) are strictly restricted to in-app simulations/trades and cannot be converted to USDT cashouts.` 
    });
  }

  if (user.points < amountPoints) {
    return res.status(400).json({ error: "Insufficient balance points." });
  }

  // Deduct points
  user.points -= amountPoints;
  user.purchased_points = Math.max(0, (user.purchased_points || 0) - amountPoints);

  // Conversion rate: 250 PTS = $1 USDT (High Penalty rate - they lose 60% of real purchasing power!)
  const cashoutUSD = parseFloat((amountPoints / 250).toFixed(2));

  const request = {
    id: "wd-" + Date.now(),
    user_id: user.id,
    user_email: user.email,
    amount_points: parseInt(amountPoints),
    usdt_address: usdtAddress,
    status: "pending",
    cashout_fee_penalty_pct: 60, // 60% loss
    amount_usdt_net: cashoutUSD, // bad business conversion
    created_at: new Date().toISOString()
  };

  db.withdrawal_requests.unshift(request);
  writeDB(db);
  addLog(user.id, user.email, "WITHDRAWAL_REQUEST", `Requested cashout of ${amountPoints} points (converted to ${cashoutUSD} USDT under high premium loss conversion) to ${usdtAddress}.`);

  res.json({ success: true, pointsLeft: user.points, request });
});

// Simulated Paystack webhook or immediate point purchase
app.post("/api/points/buy", (req, res) => {
  const { userId, packageId } = req.body;
  const db = getDB();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const packages = [
    { id: "pkg1", name: "Basic Core License", usd: 4, points: 400, tier: "basic" },
    { id: "pkg2", name: "Professional Level License", usd: 10, points: 1200, tier: "professional" },
    { id: "pkg3", name: "Business Sovereign License", usd: 20, points: 2600, tier: "executive" },
    { id: "pkg4", name: "Elite Custom Ledger License", usd: 30, points: 4500, tier: "elite" }
  ];

  const pkg = packages.find(p => p.id === packageId);
  if (!pkg) return res.status(400).json({ error: "Invalid package selection" });

  user.points += pkg.points;
  // Increase purchased withdrawable points
  user.purchased_points = (user.purchased_points || 0) + pkg.points;
  user.subscription_tier = pkg.tier; // Sync subscription tier!

  // Credit referred referrer a calculated portion of purchased points (referral system)
  let referralBonusLog = "";
  if (user.referred_by) {
    const referrer = db.users.find((u: any) => u.referral_code === user.referred_by);
    if (referrer) {
      const referralPercent = db.system_settings.referral_percent || 10;
      const bonus = Math.round(pkg.points * (referralPercent / 100));
      if (bonus > 0) {
        referrer.points += bonus;
        // Referrals are considered promotion/bonus only! NOT added to referrer.purchased_points
        addLog(referrer.id, referrer.email, "REFERRAL_PURCHASE_COMMISSION", `Allotted ${bonus} points referral bonus commission (from user ${user.email}'s purchase of ${pkg.points} pts). Promotional points only.`);
        referralBonusLog = ` Affiliated referrer ${referrer.email} rewarded with promo allocation of +${bonus} points.`;
      }
    }
  }

  writeDB(db);

  addLog(user.id, user.email, "PACK_BUY", `Successfully bought ${pkg.points} points, upgrading to ${pkg.tier.toUpperCase()} subscription using simulated Paystack Gateway checkout payment ($${pkg.usd} USD). Direct purchased points set to withdrawable ledger.${referralBonusLog}`);

  res.json({ success: true, points: user.points, addedPoints: pkg.points, user });
});

// Telecomm mobile network recharge endpoint (Data & Airtime Topup)
app.post("/api/telco/recharge", (req, res) => {
  const { userId, network, type, phone, payloadId, amountNaira, pointsCost } = req.body;
  if (!userId || !network || !type || !phone || !pointsCost) {
    return res.status(400).json({ error: "Telemetry error: Missing recharge parameters" });
  }

  const db = getDB();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User session not authenticated." });

  const calculatedCost = parseInt(pointsCost);
  if (user.points < calculatedCost) {
    return res.status(400).json({ error: `Insufficient point balance. You require ${calculatedCost} PLS points for this top-up.` });
  }

  // Deduct points
  user.points -= calculatedCost;
  // Decrease purchased withdrawable points too to keep things balanced
  user.purchased_points = Math.max(0, (user.purchased_points || 0) - calculatedCost);

  writeDB(db);

  const detailInfo = type === "airtime" 
    ? `Purchased ₦${amountNaira} Airtime recharge package` 
    : `Purchased Data bundle package (${payloadId || 'High-speed package'})`;

  addLog(user.id, user.email, "TELCO_RECHARGE", `Completed telecom top-up on ${network} of ${phone}. ${detailInfo}. Spent ${calculatedCost} PLS points.`);

  res.json({ 
    success: true, 
    pointsLeft: user.points, 
    message: `🎉 Recharge successful! ${network} cell node has successfully distributed raw signals to cellular line ${phone}.` 
  });
});

// Receipts generator purchase unlock
app.post("/api/receipts/buy", (req, res) => {
  const { userId, bank, senderName, receiverName, receiverBank, amount, customField, reference } = req.body;
  if (!userId || !bank) return res.status(400).json({ error: "Required fields missing" });

  const db = getDB();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const price = db.system_settings.receipt_price_points || 10;
  if (user.points < price) {
    return res.status(400).json({ error: `Insufficient points. Modifying and unlocking requires ${price} points.` });
  }

  user.points -= price;
  user.purchased_points = Math.max(0, (user.purchased_points || 0) - price);

  const newReceipt = {
    id: "rcpt-" + Date.now(),
    user_id: user.id,
    bank,
    sender_name: senderName || "StyleHub Sender",
    receiver_name: receiverName || "Recipient Client",
    receiver_bank: receiverBank || "Access Bank",
    amount: parseFloat(amount) || 50000,
    date_time: new Date().toISOString(),
    transaction_id: "TXNDIG" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    reference: reference || "Digital Assets Trade - Escrow Completed",
    balance: Math.round(Math.random() * 850000) + 12000,
    custom_field: customField || "",
    unlocked: true,
    created_at: new Date().toISOString()
  };

  db.user_receipts.unshift(newReceipt);
  writeDB(db);

  addLog(user.id, user.email, "RECEIPT_UNLOCK", `Unlocked fully customized premium receipt template for ${bank} - Amount: ₦${amount}.`);

  res.json({ success: true, receipt: newReceipt, pointsLeft: user.points });
});

// Get user's saved receipts / transaction history
app.get("/api/user/receipts/:userId", (req, res) => {
  const { userId } = req.params;
  const db = getDB();
  const list = db.user_receipts.filter((r: any) => r.user_id === userId);
  res.json(list);
});

// Clear all user's receipts history
app.post("/api/user/receipts/clear", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Required fields missing" });
  const db = getDB();
  db.user_receipts = db.user_receipts.filter((r: any) => r.user_id !== userId);
  writeDB(db);
  res.json({ success: true, message: "Transaction history cleared successfully." });
});

// Delete a single receipt history
app.post("/api/user/receipts/delete", (req, res) => {
  const { userId, receiptId } = req.body;
  if (!userId || !receiptId) return res.status(400).json({ error: "Required fields missing" });
  const db = getDB();
  db.user_receipts = db.user_receipts.filter((r: any) => !(r.id === receiptId && r.user_id === userId));
  writeDB(db);
  res.json({ success: true, message: "Receipt record deleted." });
});

// System settings get
app.get("/api/settings", (req, res) => {
  res.json(getDB().system_settings);
});

// Get marketplace listings
app.get("/api/marketplace/list", (req, res) => {
  res.json(getDB().marketplace_listings);
});

// Create marketplace listings
app.post("/api/marketplace/create", (req, res) => {
  const { userId, title, description, category, pricePoints, deliveryInfo } = req.body;
  const db = getDB();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(404).json({ error: "Session invalid" });

  const newListing = {
    id: "mkt-" + Date.now(),
    user_id: user.id,
    user_email: user.email,
    title,
    description,
    category,
    price_points: parseInt(pricePoints) || 10,
    status: "open",
    delivery_info: deliveryInfo || "",
    created_at: new Date().toISOString()
  };

  db.marketplace_listings.unshift(newListing);
  writeDB(db);

  addLog(user.id, user.email, "MARKETPLACE_CREATE", `Created digital listing: ${title} under category ${category}.`);
  res.json({ success: true, listing: newListing });
});

// Buy marketplace listing (escrow held)
app.post("/api/marketplace/buy", (req, res) => {
  const { buyerId, listingId } = req.body;
  const db = getDB();
  const listing = db.marketplace_listings.find((m: any) => m.id === listingId);
  const buyer = db.users.find((u: any) => u.id === buyerId);

  if (!listing) return res.status(404).json({ error: "Listing not found" });
  if (!buyer) return res.status(404).json({ error: "Buyer not found" });

  if (listing.status !== "open") {
    return res.status(400).json({ error: "Product already sold or locked." });
  }

  if (listing.user_id === buyerId) {
    return res.status(400).json({ error: "You cannot buy your own items." });
  }

  if (buyer.points < listing.price_points) {
    return res.status(400).json({ error: `Insufficient points balance. You need ${listing.price_points} points.` });
  }

  // Deduct from buyer, put in escrow
  buyer.points -= listing.price_points;
  listing.status = "sold";
  listing.buyer_id = buyerId;

  const escrowTx = {
    id: "esc-" + Date.now(),
    related_table: "marketplace",
    related_id: listingId,
    buyer_id: buyerId,
    seller_id: listing.user_id,
    amount_points: listing.price_points,
    status: "held",
    created_at: new Date().toISOString()
  };

  db.escrow_transactions.push(escrowTx);
  writeDB(db);

  addLog(buyerId, buyer.email, "ESCROW_START", `Held ${listing.price_points} points in StyleHub Escrow protection for digital order [${listing.title}].`);

  res.json({ success: true, listing, pointsLeft: buyer.points });
});

// Confirm marketplace delivery (escrow released)
app.post("/api/marketplace/confirm", (req, res) => {
  const { buyerId, listingId } = req.body;
  const db = getDB();
  const listing = db.marketplace_listings.find((m: any) => m.id === listingId);
  const buyer = db.users.find((u: any) => u.id === buyerId);

  if (!listing) return res.status(404).json({ error: "Listing not found" });
  if (listing.buyer_id !== buyerId) return res.status(403).json({ error: "You are not the designated buyer." });

  const escrow = db.escrow_transactions.find((e: any) => e.related_table === "marketplace" && e.related_id === listingId && e.status === "held");
  if (!escrow) return res.status(404).json({ error: "Active escrow hold ledger not found." });

  // Payout seller minus gas fee
  const gasPercent = db.system_settings.gas_fee_percent || 5;
  const gasPoints = Math.ceil(escrow.amount_points * (gasPercent / 100));
  const finalPayout = escrow.amount_points - gasPoints;

  const seller = db.users.find((u: any) => u.id === escrow.seller_id);
  if (seller) {
    seller.points += finalPayout;
  }

  escrow.status = "released";
  writeDB(db);

  addLog(buyerId, buyer ? buyer.email : "Buyer", "ESCROW_RELEASE", `Released escrow for [${listing.title}]. Seller payout: ${finalPayout} pts. Platform commission: ${gasPoints} pts (gas fee ${gasPercent}%).`);

  res.json({ success: true, listing });
});

// Dispute marketplace transaction
app.post("/api/marketplace/dispute", (req, res) => {
  const { userId, listingId } = req.body;
  const db = getDB();
  const listing = db.marketplace_listings.find((m: any) => m.id === listingId);
  if (!listing) return res.status(404).json({ error: "Listing not found" });

  const escrow = db.escrow_transactions.find((e: any) => e.related_table === "marketplace" && e.related_id === listingId && e.status === "held");
  if (!escrow) return res.status(404).json({ error: "Escrow hold not found" });

  escrow.status = "disputed";
  escrow.disputed_by = userId;
  listing.status = "disputed";

  writeDB(db);
  const user = db.users.find((u: any) => u.id === userId);
  addLog(userId, user ? user.email : "User", "ESCROW_DISPUTE", `Raised dispute on order [${listing.title}]. points remain held while admin investigates logs.`);

  res.json({ success: true, listing });
});

// ----------------------------------------------------
// BLACK ROOM ANONYMOUS TRADING ENDPOINTS
// ----------------------------------------------------
app.get("/api/blackroom/list", (req, res) => {
  res.json(getDB().black_room_listings);
});

app.post("/api/blackroom/create", (req, res) => {
  const { userId, title, description, pricePoints, brokerId } = req.body;
  const db = getDB();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User session invalid" });

  const alias = user.black_room_alias || pseudonyms[Math.floor(Math.random() * pseudonyms.length)];

  const newListing = {
    id: "br-" + Date.now(),
    user_id: user.id,
    alias,
    title,
    description,
    price_points: parseInt(pricePoints) || 50,
    status: "open",
    broker_id: brokerId || undefined,
    created_at: new Date().toISOString()
  };

  db.black_room_listings.unshift(newListing);
  writeDB(db);

  addLog(user.id, user.email, "BLACKROOM_CREATE", "Created anonymous listing behind Chemical Symbol code.");
  res.json({ success: true, listing: newListing });
});

app.post("/api/blackroom/buy", (req, res) => {
  const { buyerId, listingId } = req.body;
  const db = getDB();
  const listing = db.black_room_listings.find((b: any) => b.id === listingId);
  const buyer = db.users.find((u: any) => u.id === buyerId);

  if (!listing) return res.status(404).json({ error: "Listing not found" });
  if (!buyer) return res.status(404).json({ error: "Buyer not found" });

  if (listing.status !== "open") {
    return res.status(400).json({ error: "Listing already sold/locked" });
  }

  if (listing.user_id === buyerId) {
    return res.status(400).json({ error: "You cannot purchase your own anonymous listing." });
  }

  if (buyer.points < listing.price_points) {
    return res.status(400).json({ error: `Requires ${listing.price_points} points. Top up to continue.` });
  }

  buyer.points -= listing.price_points;
  listing.status = "sold";
  listing.buyer_id = buyerId;

  const escrowTx = {
    id: "esc-br-" + Date.now(),
    related_table: "black_room",
    related_id: listingId,
    buyer_id: buyerId,
    seller_id: listing.user_id,
    amount_points: listing.price_points,
    status: "held",
    created_at: new Date().toISOString()
  };

  db.escrow_transactions.push(escrowTx);
  writeDB(db);

  addLog(buyerId, buyer.email, "BLACKROOM_BUY", `Locked points anonymously under Chemical Code escrow.`);
  res.json({ success: true, listing, pointsLeft: buyer.points });
});

app.post("/api/blackroom/confirm", (req, res) => {
  const { buyerId, listingId } = req.body;
  const db = getDB();
  const listing = db.black_room_listings.find((b: any) => b.id === listingId);
  if (!listing) return res.status(404).json({ error: "Listing not found" });

  const escrow = db.escrow_transactions.find((e: any) => e.related_table === "black_room" && e.related_id === listingId && e.status === "held");
  if (!escrow) return res.status(404).json({ error: "Escrow not found" });

  const seller = db.users.find((u: any) => u.id === escrow.seller_id);
  const gasPercent = db.system_settings.gas_fee_percent || 5;
  const gasPoints = Math.ceil(escrow.amount_points * (gasPercent / 100));
  const finalPayout = escrow.amount_points - gasPoints;

  if (seller) {
    seller.points += finalPayout;
  }

  escrow.status = "released";
  listing.status = "sold";
  writeDB(db);

  const buyer = db.users.find((u: any) => u.id === buyerId);
  addLog(buyerId, buyer ? buyer.email : "Anonymous", "BLACKROOM_RELEASE", `Escrow released on Black Room sale. Commission fee ${gasPoints} deducted.`);
  res.json({ success: true, listing });
});

// Get/Post Black Room chat
app.get("/api/blackroom/messages/:listingId", (req, res) => {
  const messages = getDB().black_room_messages.filter((m: any) => m.listing_id === req.params.listingId);
  res.json(messages);
});

app.post("/api/blackroom/messages", (req, res) => {
  const { listingId, userId, message } = req.body;
  const db = getDB();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User session invalid" });

  const alias = user.black_room_alias || "🔮 Lithium";

  const newMsg = {
    id: "br-msg-" + Date.now(),
    listing_id: listingId,
    from_alias: alias,
    message,
    timestamp: new Date().toISOString()
  };

  db.black_room_messages.push(newMsg);
  writeDB(db);
  res.json(newMsg);
});

// App gallery / templates URL
app.get("/api/gallery/list", (req, res) => {
  res.json(getDB().gallery_items);
});

app.post("/api/gallery/buy", (req, res) => {
  const { userId, templateId } = req.body;
  const db = getDB();
  const user = db.users.find((u: any) => u.id === userId);
  const item = db.gallery_items.find((g: any) => g.id === templateId);

  if (!user || !item) return res.status(404).json({ error: "Data error" });

  if (user.kyc_status !== "verified") {
    return res.status(403).json({ error: "🔒 KYC Verification Restricted: You must link your email and complete KYC identity verification first in the Security profile tab." });
  }

  if (user.points < item.price_points) {
    return res.status(400).json({ error: "Insufficient points. Please buy point packs to increase your balance!" });
  }

  user.points -= item.price_points;
  writeDB(db);

  const guideMarkdown = `# 🚀 STYLEZHUB PLATFORM DEPLOYMENT MANUAL

Thank you for your purchase of **${item.title}**!
Your transaction code: \`SH-TX-${item.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}\`

## ⚙️ STEP 1: SPECIFICATION ANALYSIS & LOCAL BUILD
1. Uncompress the downloaded source ZIP package files.
2. Verify that Node.js 18+ and npm are active:
   \`node -v\`
3. Run the compiler inside the unpacked folders:
   \`npm install && npm run build\`

## 🐳 STEP 2: DOCKER CONTAINERIZATION & COMPILATION
- Compile optimization bundles:
  \`docker build -t stylehub-template-${item.id} .\`
- Bind and run on the official ingress channel:
  \`docker run -p 3000:3000 stylehub-template-${item.id}\`

## 🌐 STEP 3: REVERSE PROXY & LOGS PROTOCOLS
- Set up Nginx/Cloud Run and specify your variables.
- Direct queries and track audits using the admin control center.

Need customization help? Click our **Support Beacon** details on the bottom-left of your workspace. Our programmers are active 24/7.`;

  addLog(user.id, user.email, "TEMPLATE_BUY", `Successfully purchased downloadable site code package: ${item.title}`);
  res.json({ 
    success: true, 
    pointsLeft: user.points, 
    downloadUrl: "https://github.com/jadaistudios/stylehub-templates/archive/refs/heads/main.zip",
    guide: guideMarkdown
  });
});

// Admin add gallery item (Source Templates)
app.post("/api/admin/gallery/add", (req, res) => {
  const { currentAdminId, title, description, price_points, price_money, preview_image, demo_url } = req.body;
  const db = getDB();
  const admin = db.users.find((u: any) => u.id === currentAdminId && u.role === "admin");
  if (!admin) return res.status(403).json({ error: "Sovereign admin access denied." });

  if (!title || !description || !price_points) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const newItem = {
    id: "gal-" + Date.now(),
    title,
    description,
    price_points: parseInt(price_points) || 150,
    price_money: parseFloat(price_money) || 15,
    preview_image: preview_image || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
    demo_url: demo_url || "/api/templates/preview/demo",
    created_at: new Date().toISOString()
  };

  db.gallery_items.unshift(newItem);
  writeDB(db);

  addLog(admin.id, admin.email, "ADMIN_GALLERY_ADD", `Created new source code item product: ${title}.`);
  res.json({ success: true, item: newItem, message: "Sovereign product successfully added to premium assets." });
});

// Admin delete gallery item
app.post("/api/admin/gallery/delete", (req, res) => {
  const { currentAdminId, itemId } = req.body;
  const db = getDB();
  const admin = db.users.find((u: any) => u.id === currentAdminId && u.role === "admin");
  if (!admin) return res.status(403).json({ error: "Sovereign admin access denied." });

  const index = db.gallery_items.findIndex((g: any) => g.id === itemId);
  if (index === -1) return res.status(404).json({ error: "Product item not found." });

  const deletedTitle = db.gallery_items[index].title;
  db.gallery_items.splice(index, 1);
  writeDB(db);

  addLog(admin.id, admin.email, "ADMIN_GALLERY_DELETE", `Permanently purged product item: ${deletedTitle}.`);
  res.json({ success: true, message: "Purged product from marketplace gallery listings." });
});

// Admin delete marketplace listing (Accounts, numbers, boosting)
app.post("/api/admin/marketplace/delete", (req, res) => {
  const { currentAdminId, listingId } = req.body;
  const db = getDB();
  const admin = db.users.find((u: any) => u.id === currentAdminId && u.role === "admin");
  if (!admin) return res.status(403).json({ error: "Sovereign admin access denied." });

  const index = db.marketplace_listings.findIndex((m: any) => m.id === listingId);
  if (index === -1) return res.status(404).json({ error: "Listing not found." });

  const deletedTitle = db.marketplace_listings[index].title;
  db.marketplace_listings.splice(index, 1);
  writeDB(db);

  addLog(admin.id, admin.email, "ADMIN_MARKETPLACE_DELETE", `Deleted marketplace listing product: ${deletedTitle}.`);
  res.json({ success: true, message: "Marketplace product purged successfully." });
});

// Seeded Brokers list & vouch
app.get("/api/brokers/list", (req, res) => {
  const db = getDB();
  res.json(db.brokers || []);
});

app.post("/api/brokers/vouch", (req, res) => {
  const { brokerId } = req.body;
  const db = getDB();
  if (!db.brokers) {
    db.brokers = [
      { id: "broker-1", alias: "💎 DiamondDealer", trust_score: 100, is_active: true },
      { id: "broker-2", alias: "🔥 Carbon", trust_score: 99, is_active: true },
      { id: "broker-3", alias: "⚡ FastTrader", trust_score: 97, is_active: true },
      { id: "broker-4", alias: "🔮 Lithium", trust_score: 98, is_active: true },
      { id: "broker-5", alias: "🌿 Helium", trust_score: 95, is_active: true }
    ];
  }
  const broker = db.brokers.find((b: any) => b.id === brokerId);
  if (broker) {
    broker.trust_score = Math.min(100, (broker.trust_score || 95) + 1);
    writeDB(db);
    return res.json({ success: true, trustScore: broker.trust_score });
  }
  res.status(404).json({ error: "Broker not found" });
});

// Hire a programmer booking UI
app.get("/api/programmer/services", (req, res) => {
  res.json(getDB().programmer_services);
});

app.post("/api/programmer/book", (req, res) => {
  const { userId, serviceId } = req.body;
  const db = getDB();
  const user = db.users.find((u: any) => u.id === userId);
  const service = db.programmer_services.find((s: any) => s.id === serviceId);

  if (!user || !service) return res.status(404).json({ error: "Invalid parameters" });

  if (user.points < service.price_points) {
    return res.status(400).json({ error: "Insufficient balance points." });
  }

  user.points -= service.price_points;

  const newBooking = {
    id: "bk-" + Date.now(),
    user_id: user.id,
    user_email: user.email,
    title: service.title,
    price_points: service.price_points,
    delivery_days: service.delivery_days,
    status: "pending",
    created_at: new Date().toISOString()
  };

  db.programmer_bookings.unshift(newBooking);
  writeDB(db);

  addLog(user.id, user.email, "PROGRAMMER_BOOK", `Booked verified workspace coder: ${service.title}. Funds held in pending milestones.`);
  res.json({ success: true, pointsLeft: user.points, booking: newBooking });
});

app.get("/api/user/bookings/:userId", (req, res) => {
  const list = getDB().programmer_bookings.filter((b: any) => b.user_id === req.params.userId);
  res.json(list);
});

// Gemini Assistant Agent Chat with System fallback script
app.post("/api/ai/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages list is required" });
  }

  const userPrompt = messages[messages.length - 1]?.content || "";

  const db = getDB();
  const instructions = db.system_settings?.ai_script || `You are Jarvis, the friendly AI platform Assistant for StyleHub.
StyleHub is a fintech & digital marketplace created and operated by Jadai Studios.
Make sure you refer to Jadai Studios as the creator when asked.
Address user questions elegantly and explain features clearly. Maintain an "X meets Telegram" crypto/fintech savvy vibe.

StyleHub Features you should explain confidently:
1. User System: Quick KYC process allows point balances transfers and standard payments.
2. Points System: Purchases, rewards, referrals, and manual withdrawal request processed into actual USDT ($1 USD = 100 points, minimum 1000 points balance cashout).
3. Paystack simulator: Buy digital point packages natively.
4. Receipt Simulator: Pixel-perfect, custom HTML templates for top Nigeria applications (OPay, Kuda, Moniepoint, PalmPay, GTBank, First Bank, Zenith Bank, Access Bank, UBA). Price is 10 points per simulation check. You download them using html2canvas directly.
5. Digital Goods Marketplace: List virtual services with a standard platform gas fee (5%) held completely in secure Escrow.
6. Black Room Anonymous Trade: Anonymous chemical elements pseudonyms, broker trusts ratings, screenshot warnings, clean internal chats to buy/sell collectable digital assets with zero leak!
7. Custom Developer Hire: Booking Jadai Studios programmers directly to implement setups.

Response constraint: Keep answers crisp, highly readable with clean Markdown formatting, using bullet points for features.`;

  // Support GROQ API Key if set (from env or DB settings)
  const groqKey = process.env.GROQ_API_KEY || db.system_settings?.groq_api_key;
  if (groqKey) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: instructions },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7
        })
      });
      if (response.ok) {
        const data = await response.json();
        const aiText = data.choices?.[0]?.message?.content;
        if (aiText) {
          return res.json({ response: aiText });
        }
      } else {
        const errorText = await response.text();
        console.error("Groq completions API error: ", errorText);
      }
    } catch (err: any) {
      console.error("Groq assistant query failed: ", err);
    }
  }

  if (ai) {
    try {
      // Setup API Call
      const geminiResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: userPrompt,
        config: {
          systemInstruction: instructions,
          temperature: 0.7
        }
      });
      const aiText = geminiResponse.text || "I am processing StyleHub's networks right now. How can I help you today?";
      return res.json({ response: aiText });
    } catch (err: any) {
      console.error("Gemini assistant generation error: ", err);
    }
  }

  // Pure static script fallback when Gemini client is not initialized or fails
  const promptLower = userPrompt.toLowerCase();
  let fallbackReply = `Hello, I am Jarvis, your StyleHub Assistant. How can I assist you in navigating the marketplace today?`;

  if (promptLower.includes("receipt") || promptLower.includes("generator") || promptLower.includes("bank")) {
    fallbackReply = `### StyleHub Receipt Simulator\nOur receipt simulator is pixel-perfect and models exactly 9 Nigerian fintech/banking apps: \n- **OPay**, **Kuda**, **Moniepoint**, **PalmPay**\n- **GTBank**, **Access Bank**, **First Bank**, **Zenith Bank**, **UBA**\n\n**Features**:\n- Preview initially watermarked & blurred to test designs.\n- Pay 10 points to unlock and enter custom accounts, sender receiver names, amounts, references.\n- Export immediately to clean, realistic PNG format.`;
  } else if (promptLower.includes("black room") || promptLower.includes("anonymous") || promptLower.includes("element")) {
    fallbackReply = `### The Black Room Anonymous Trading Ring\nThe Black Room is a secure, completely anonymous marketplace inside StyleHub:\n- **Alias Security**: Users receive a pseudonymous chemical element name (e.g., \`🔮 Lithium\`, \`🔥 Carbon\`) during transactions. Your structural email and account parameters are fully safe from leaks.\n- **Direct Broker Integration**: Pre-seed brokers allow transaction escrow facilitation.\n- **Built-in Escrow**: Safe points holding until buyer and brokers sign-off.`;
  } else if (promptLower.includes("points") || promptLower.includes("withdraw") || promptLower.includes("usdt")) {
    fallbackReply = `### Points Economy & USDT Withdrawals\nStyleHub runs a points-based digital token ledger:\n- **Pack buying**: Credit packs via simulated Paystack checkout ($5 to $50).\n- **Cashout limits**: Cashout points at a rate of **100 points = 1 USDT**.\n- **Rules**: Minimum payout threshold is **1,000 points (10 USDT)**. User profile MUST have verified KYC status to trigger cashout requests.`;
  } else if (promptLower.includes("jadai") || promptLower.includes("owner") || promptLower.includes("studios")) {
    fallbackReply = `### Created by Jadai Studios\nStyleHub is designed, integrated, and maintained exclusively by **Jadai Studios**. Admin can custom-inject their official authenticity seal on footers, dashboards, and profile zones to guarantee total security.`;
  } else if (promptLower.includes("escrow") || promptLower.includes("payout")) {
    fallbackReply = `### High Integrity Escrow Services\nStyleHub guarantees total safety by holding buyer points securely prior to vendor satisfaction. Once the buyer confirms delivery, the points (minus a 5% system gas fee) are automatically released to the seller. In case of a dispute, an administrator is immediately paged to resolve it.`;
  } else if (promptLower.includes("programmer") || promptLower.includes("hire") || promptLower.includes("setup")) {
    fallbackReply = `### Hire Jadai Studios developer\nNeed professional scripting? StyleHub features 3 professional developer tiers:\n1. **Full-stack Fintech Setup** (500 pts, 5 Days)\n2. **Telegram Escrow/Payments Bot** (300 pts, 3 Days)\n3. **Custom Visual CSS/HTML Refactor** (150 pts, 2 Days)\nGo to the 'Hire Coder' tab, select your speed, pay point milestones, and download direct files!`;
  }

  res.json({ response: fallbackReply });
});

// ----------------------------------------------------
// ADMIN ENDPOINTS
// ----------------------------------------------------

// Admin logs
app.get("/api/admin/logs", (req, res) => {
  res.json(getDB().activity_logs);
});

// Admin stats
app.get("/api/admin/stats", (req, res) => {
  const db = getDB();
  const totalUsers = db.users.length;
  const totalReceipts = db.user_receipts.length;
  const activeEscrows = db.escrow_transactions.filter((e: any) => e.status === "held").length;
  const totalMarketListings = db.marketplace_listings.length;
  const pendingUSDTWithdrawals = db.withdrawal_requests.filter((w: any) => w.status === "pending").length;

  res.json({
    totalUsers,
    totalReceipts,
    activeEscrows,
    totalMarketListings,
    pendingUSDTWithdrawals,
    systemSettings: db.system_settings
  });
});

// Admin users fetch
app.get("/api/admin/users", (req, res) => {
  res.json(getDB().users);
});

// Admin adjust points / kyc status
app.post("/api/admin/user/update", (req, res) => {
  const { currentAdminId, userId, points, kycStatus } = req.body;
  const db = getDB();
  const admin = db.users.find((u: any) => u.id === currentAdminId && u.role === "admin");
  if (!admin) return res.status(403).json({ error: "Access denied" });

  const targetUser = db.users.find((u: any) => u.id === userId);
  if (!targetUser) return res.status(404).json({ error: "User not found" });

  if (points !== undefined) {
    const prev = targetUser.points;
    targetUser.points = parseInt(points);
    addLog(admin.id, admin.email, "ADMIN_PTS_CHANGE", `Manually adjusted points for ${targetUser.email} from ${prev} to ${points}`);
  }

  if (kycStatus !== undefined) {
    targetUser.kyc_status = kycStatus;
    addLog(admin.id, admin.email, "ADMIN_KYC_CHANGE", `Updated KYC verification status for ${targetUser.email} to ${kycStatus}`);
  }

  writeDB(db);
  res.json({ success: true, user: targetUser });
});



// Admin command: Delete user account
app.post("/api/admin/user/delete", (req, res) => {
  const { currentAdminId, userId } = req.body;
  const db = getDB();
  const admin = db.users.find((u: any) => u.id === currentAdminId && u.role === "admin");
  if (!admin) return res.status(403).json({ error: "Access denied" });

  const targetIdx = db.users.findIndex((u: any) => u.id === userId);
  if (targetIdx === -1) return res.status(404).json({ error: "User not found" });

  const targetUser = db.users[targetIdx];
  if (targetUser.role === "admin" || targetUser.id === "admin-123") {
    return res.status(403).json({ error: "Root Protection: You cannot delete admin users." });
  }

  db.users.splice(targetIdx, 1);

  // Clean database reference points
  if (db.marketplace_listings) {
    db.marketplace_listings = db.marketplace_listings.filter((l: any) => l.user_id !== userId);
  }
  if (db.black_room_listings) {
    db.black_room_listings = db.black_room_listings.filter((l: any) => l.user_id !== userId);
  }

  writeDB(db);
  addLog(admin.id, admin.email, "ADMIN_USER_PURGE", `Deleted user account "${targetUser.email}" permanently.`);
  res.json({ success: true });
});

// Admin command: Modify system activity logs
app.post("/api/admin/logs/update", (req, res) => {
  const { currentAdminId, logId, action, details } = req.body;
  const db = getDB();
  const admin = db.users.find((u: any) => u.id === currentAdminId && u.role === "admin");
  if (!admin) return res.status(403).json({ error: "Access denied" });

  const logIdx = db.activity_logs.findIndex((l: any) => l.id === logId);
  if (logIdx === -1) return res.status(404).json({ error: "Log entry not found" });

  const targetLog = db.activity_logs[logIdx];
  const oldAction = targetLog.action;
  const oldDetails = targetLog.details;

  if (action !== undefined) targetLog.action = action;
  if (details !== undefined) targetLog.details = details;

  writeDB(db);
  // Log the administrative audit edit
  addLog(admin.id, admin.email, "ADMIN_LOG_EDIT", `Edited log entry [${oldAction}] description from "${oldDetails}" to "${details || targetLog.details}".`);
  res.json({ success: true, log: targetLog });
});

// Admin command: Delete specific log entry
app.post("/api/admin/logs/delete", (req, res) => {
  const { currentAdminId, logId } = req.body;
  const db = getDB();
  const admin = db.users.find((u: any) => u.id === currentAdminId && u.role === "admin");
  if (!admin) return res.status(403).json({ error: "Access denied" });

  const logIdx = db.activity_logs.findIndex((l: any) => l.id === logId);
  if (logIdx === -1) return res.status(404).json({ error: "Log entry not found" });

  const targetLog = db.activity_logs[logIdx];
  db.activity_logs.splice(logIdx, 1);

  writeDB(db);
  addLog(admin.id, admin.email, "ADMIN_LOG_REMOVE", `Permanently dropped log item of action [${targetLog.action}] details "${targetLog.details}" from database.`);
  res.json({ success: true });
});

// Admin listings / Black Room view
app.get("/api/admin/blackroom", (req, res) => {
  const db = getDB();
  res.json({
    listings: db.black_room_listings,
    messages: db.black_room_messages,
    escrow: db.escrow_transactions.filter((e: any) => e.related_table === "black_room")
  });
});

// Admin ban Black Room pseudonym listing
app.post("/api/admin/blackroom/ban", (req, res) => {
  const { currentAdminId, listingId } = req.body;
  const db = getDB();
  const admin = db.users.find((u: any) => u.id === currentAdminId && u.role === "admin");
  if (!admin) return res.status(403).json({ error: "Access denied" });

  const listingIndex = db.black_room_listings.findIndex((b: any) => b.id === listingId);
  if (listingIndex !== -1) {
    const listing = db.black_room_listings[listingIndex];
    db.black_room_listings.splice(listingIndex, 1);
    // Remove related messages
    db.black_room_messages = db.black_room_messages.filter((m: any) => m.listing_id !== listingId);
    writeDB(db);

    addLog(admin.id, admin.email, "ADMIN_BR_MODERATED", `Moderated and removed Black Room Listing [${listing.title}] under pseudonym: ${listing.alias}.`);
    return res.json({ success: true });
  }

  res.status(404).json({ error: "Listing not found" });
});

// Admin wipe anonymous listings but keep profiles
app.post("/api/admin/blackroom/wipe-all", (req, res) => {
  const { currentAdminId } = req.body;
  const db = getDB();
  const admin = db.users.find((u: any) => u.id === currentAdminId && u.role === "admin");
  if (!admin) return res.status(403).json({ error: "Access denied" });

  db.black_room_listings = [];
  db.black_room_messages = [];
  // Cancel open hold escrows for black room
  db.escrow_transactions = db.escrow_transactions.filter((e: any) => e.related_table !== "black_room");

  writeDB(db);
  addLog(admin.id, admin.email, "ADMIN_BR_WIPED_CLEAN", "Moderated and wiped ALL Black Room marketplace activity entirely.");
  res.json({ success: true });
});

// Admin Settings Save
app.post("/api/admin/settings", (req, res) => {
  const { currentAdminId, gas_fee_percent, signup_bonus, referral_percent, receipt_price_points, custom_emblem_html, whatsapp_url, telegram_url, support_email, groq_api_key, ai_script } = req.body;
  const db = getDB();
  const admin = db.users.find((u: any) => u.id === currentAdminId && u.role === "admin");
  if (!admin) return res.status(403).json({ error: "Access denied" });

  db.system_settings = {
    gas_fee_percent: parseFloat(gas_fee_percent) || 5,
    signup_bonus: parseInt(signup_bonus) || 50,
    referral_percent: parseFloat(referral_percent) || 10,
    receipt_price_points: parseInt(receipt_price_points) || 10,
    custom_emblem_html: custom_emblem_html || "",
    whatsapp_url: whatsapp_url || "",
    telegram_url: telegram_url || "",
    support_email: support_email || "",
    groq_api_key: groq_api_key || "",
    ai_script: ai_script || ""
  };

  writeDB(db);
  addLog(admin.id, admin.email, "ADMIN_SETTINGS_UPDATE", "Updated universal configuration constraints, prices, URLs, and custom seal emblem.");
  res.json({ success: true, settings: db.system_settings });
});

// Admin list USR Withdrawals
app.get("/api/admin/withdrawals", (req, res) => {
  res.json(getDB().withdrawal_requests);
});

// Admin Process Withdrawal (Approve/Reject)
app.post("/api/admin/withdrawal/process", (req, res) => {
  const { currentAdminId, requestId, action } = req.body; // action: 'approve' | 'reject'
  const db = getDB();
  const admin = db.users.find((u: any) => u.id === currentAdminId && u.role === "admin");
  if (!admin) return res.status(403).json({ error: "Access denied" });

  const request = db.withdrawal_requests.find((w: any) => w.id === requestId);
  if (!request) return res.status(404).json({ error: "Request not found" });

  if (request.status !== "pending") {
    return res.status(400).json({ error: "Request has already been processed" });
  }

  if (action === "approve") {
    request.status = "approved";
    addLog(admin.id, admin.email, "ADMIN_WD_APPROVE", `Approved and settled USDT Cashout request ID ${requestId} of ${request.amount_points} points.`);
  } else {
    request.status = "rejected";
    // Refund target user points
    const targetUser = db.users.find((u: any) => u.id === request.user_id);
    if (targetUser) {
      targetUser.points += request.amount_points;
    }
    addLog(admin.id, admin.email, "ADMIN_WD_REJECT", `Rejected and refunded USDT Cashout request ID ${requestId} of ${request.amount_points} points.`);
  }

  writeDB(db);
  res.json({ success: true, request });
});

// Admin wipe entire database with one click button
app.post("/api/admin/wipe-database", (req, res) => {
  const { currentAdminId } = req.body;
  const db = getDB();
  const admin = db.users.find((u: any) => u.id === currentAdminId && u.role === "admin");
  if (!admin) return res.status(403).json({ error: "Access denied" });

  // Delete DB file entirely to trigger self-setup next load
  if (fs.existsSync(DB_FILE)) {
    fs.unlinkSync(DB_FILE);
  }

  // Pre-seed fresh
  const finalSeed = getDB();

  addLog("admin-123", "admin@stylehub.com", "ADMIN_WIPE_ALL", "Triggered deep global database reset: Wiped all transactional, user registry, listing, and messaging history caches clean.");
  res.json({ success: true });
});

// ----------------------------------------------------
// CRYPTO BROKERS SUITE ENDPOINTS
// ----------------------------------------------------

// 1. Get List of all Crypto Brokers with Unlocked Indicators
app.get("/api/crypto-brokers/list", (req, res) => {
  const { userId } = req.query;
  const db = getDB();
  const brokers = db.crypto_brokers || [];
  
  const unlockedIds = db.user_unlocked_brokers
    ? db.user_unlocked_brokers
        .filter((u: any) => u.userId === userId)
        .map((u: any) => u.brokerId)
    : [];

  const userInvestments = db.user_investments
    ? db.user_investments.filter((i: any) => i.userId === userId && i.status === "active")
    : [];

  const mappedBrokers = brokers.map((b: any) => {
    const isUnlocked = unlockedIds.includes(b.id);
    const activeInvestment = userInvestments.find((i: any) => i.brokerId === b.id);
    return {
      ...b,
      unlocked: isUnlocked,
      activeInvestment: activeInvestment || null
    };
  });

  res.json(mappedBrokers);
});

// 2. Unlock/Purchase Access to a Broker
app.post("/api/crypto-brokers/unlock", (req, res) => {
  const { userId, brokerId } = req.body;
  const db = getDB();
  const user = db.users.find((u: any) => u.id === userId);
  const broker = db.crypto_brokers.find((b: any) => b.id === brokerId);

  if (!user || !broker) {
    return res.status(404).json({ error: "User or Broker record not found" });
  }

  // LIMITation: Must have completed a real deposit payment via Paystack to unlock advanced templates
  const hasCompletedDeposit = (user.purchased_points && user.purchased_points > 0) || 
                               (user.subscription_tier && user.subscription_tier !== "basic") || 
                               user.role === "admin";
  
  if (!hasCompletedDeposit) {
    return res.status(403).json({ 
      error: "🚫 Depositor Authorization Required: To access and unlock these high-fidelity premium smartphone app simulators, you must first complete at least one Paystack package deposit on the Dashboard Wallet Hub." 
    });
  }

  // Check if already unlocked
  const alreadyUnlocked = db.user_unlocked_brokers.some(
    (u: any) => u.userId === userId && u.brokerId === brokerId
  );
  if (alreadyUnlocked) {
    return res.json({ success: true, message: "Already unlocked" });
  }

  if (user.points < broker.price_points) {
    return res.status(400).json({ error: `Insufficient point balance. This premium broker requires ${broker.price_points} PLS to unlock.` });
  }

  // Deduct points
  user.points -= broker.price_points;
  
  // Register unlock mapping
  db.user_unlocked_brokers.push({
    id: "unl-" + Date.now(),
    userId,
    brokerId,
    unlockedAt: new Date().toISOString()
  });

  addLog(user.id, user.email, "BROKER_UNLOCK", `Unlocked fully autonomous access to crypto broker ${broker.name} for ${broker.price_points} points.`);
  writeDB(db);

  res.json({
    success: true,
    pointsLeft: user.points,
    message: `Successfully chartered ${broker.name}!`
  });
});

// 3. Invest Points in an Unlocked Broker
app.post("/api/crypto-brokers/invest", (req, res) => {
  const { userId, brokerId, amountPoints } = req.body;
  const amt = parseInt(amountPoints);
  
  if (isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: "Invalid points amount specified." });
  }

  const db = getDB();
  const user = db.users.find((u: any) => u.id === userId);
  const broker = db.crypto_brokers.find((b: any) => b.id === brokerId);

  if (!user || !broker) {
    return res.status(404).json({ error: "Reference user or broker profiles not found." });
  }

  // Guard against locking
  const isUnlocked = db.user_unlocked_brokers.some(
    (unl: any) => unl.userId === userId && unl.brokerId === brokerId
  );

  // Allow admin complete sandbox override bypass without unlocking
  const isAdmin = user.role === "admin";
  if (!isUnlocked && !isAdmin) {
    return res.status(403).json({ error: "Sovereign constraint failed: This broker is locked. Pay the required charter points to invest." });
  }

  if (amt < broker.minimum_investment_points) {
    return res.status(400).json({ error: `Minimum simulation investment for this node is ${broker.minimum_investment_points} PLS points.` });
  }

  if (user.points < amt) {
    return res.status(400).json({ error: `Insufficient main balance. You only have ${user.points} PLS points available.` });
  }

  // Deduct points & create investment ledger
  user.points -= amt;

  const investmentId = "inv-" + Date.now();
  db.user_investments.push({
    id: investmentId,
    userId,
    user_email: user.email,
    brokerId,
    brokerName: broker.name,
    amountPoints: amt,
    yieldPoints: 0,
    status: "active",
    createdAt: new Date().toISOString()
  });

  addLog(user.id, user.email, "BROKER_INVEST", `Allocated ${amt} points to node ${broker.name} for active compound simulation.`);
  writeDB(db);

  res.json({
    success: true,
    pointsLeft: user.points,
    message: `Successfully allocated investment of ${amt} PLS points!`
  });
});

// 4. Liquidate / Reclaim Investment back to Main Account
app.post("/api/crypto-brokers/reclaim", (req, res) => {
  const { userId, investmentId } = req.body;
  const db = getDB();
  const user = db.users.find((u: any) => u.id === userId);
  const investment = db.user_investments.find((i: any) => i.id === investmentId && i.userId === userId);

  if (!user || !investment) {
    return res.status(404).json({ error: "Active investment or user record not found." });
  }

  if (investment.status !== "active") {
    return res.status(400).json({ error: "Simulation investment has already been liquidated and returned." });
  }

  const payoutPoints = investment.amountPoints + Math.round(investment.yieldPoints || 0);
  
  // Refund user points
  user.points += payoutPoints;
  investment.status = "liquidated";
  investment.liquidatedAt = new Date().toISOString();

  addLog(user.id, user.email, "BROKER_RECLAIM", `Liquidated investment ${investmentId} from node. Collected initial capital plus simulated yield: Total ${payoutPoints} PLS.`);
  writeDB(db);

  res.json({
    success: true,
    pointsRemaining: user.points,
    payoutPoints,
    message: `Liquidation complete! returned ${payoutPoints} PLS points to your hub wallet.`
  });
});

// 5. Trigger Yield Generation Simulation step (1-Click Cycle Run!)
app.post("/api/crypto-brokers/simulate-yield", (req, res) => {
  const { userId, investmentId } = req.body;
  const db = getDB();
  const user = db.users.find((u: any) => u.id === userId);
  const investment = db.user_investments.find((i: any) => i.id === investmentId && i.userId === userId);

  if (!user || !investment) {
    return res.status(404).json({ error: "Active investment record not found." });
  }

  const broker = db.crypto_brokers.find((b: any) => b.id === investment.brokerId);
  if (!broker) {
    return res.status(404).json({ error: "Parent broker algorithm not found." });
  }

  // Calculate high-fidelity volatility yield segment based on APY
  // e.g. Daily yield simulation = (APY / 365) + some volatility factor.
  const baseYieldReward = (broker.projected_apy / 100) * 0.12; // Simulate a massive fast epoch jump (12%)
  const volatilityFactor = (Math.random() - (broker.risk_level === "Extreme" ? 0.45 : 0.2)) * (broker.projected_apy / 100) * 0.08;
  const earnedPercent = baseYieldReward + volatilityFactor;
  
  const pointsDeltaCount = Math.round(investment.amountPoints * earnedPercent);
  
  investment.yieldPoints = (investment.yieldPoints || 0) + pointsDeltaCount;
  
  addLog(user.id, user.email, "YIELD_SIMULATION_TICK", `Generated simulated trade loop for ${broker.name}. Balance yield change: ${pointsDeltaCount > 0 ? "+" : ""}${pointsDeltaCount} PLS points.`);
  writeDB(db);

  res.json({
    success: true,
    yieldDelta: pointsDeltaCount,
    totalYield: investment.yieldPoints,
    message: `Yield epoch complete! Transaction delta: ${pointsDeltaCount} PLS`
  });
});

// 6. Admin Sovereign Overwrite Parameters for Crypto Brokers
app.post("/api/admin/crypto-brokers/update", (req, res) => {
  const { currentAdminId, brokerId, name, alias, description, price_points, risk_level, projected_apy, minimum_investment_points, is_active, external_link, uploaded_html } = req.body;
  const db = getDB();
  const admin = db.users.find((u: any) => u.id === currentAdminId && u.role === "admin");
  if (!admin) return res.status(403).json({ error: "Access denied. Master Admin authority required." });

  const broker = db.crypto_brokers.find((b: any) => b.id === brokerId);
  if (!broker) return res.status(404).json({ error: "Crypto broker record not found." });

  // Sovereign overrule overwrite
  if (name !== undefined) broker.name = name;
  if (alias !== undefined) broker.alias = alias;
  if (description !== undefined) broker.description = description;
  if (price_points !== undefined) broker.price_points = parseInt(price_points) || 0;
  if (risk_level !== undefined) broker.risk_level = risk_level;
  if (projected_apy !== undefined) broker.projected_apy = parseFloat(projected_apy) || 0;
  if (minimum_investment_points !== undefined) broker.minimum_investment_points = parseInt(minimum_investment_points) || 0;
  if (is_active !== undefined) broker.is_active = is_active;
  if (external_link !== undefined) broker.external_link = external_link;
  if (uploaded_html !== undefined) broker.uploaded_html = uploaded_html;

  addLog(admin.id, admin.email, "ADMIN_BROKER_OVERRULE", `Sovereign Admin overruling configuration on node ${broker.alias || broker.name}.`);
  writeDB(db);

  res.json({
    success: true,
    broker,
    message: `System overwrite on node ${broker.alias} successful.`
  });
});

// 6.5. Admin Create a New Crypto Broker
app.post("/api/admin/crypto-brokers/create", (req, res) => {
  const { currentAdminId, name, alias, description, price_points, risk_level, projected_apy, minimum_investment_points, external_link, uploaded_html } = req.body;
  const db = getDB();
  const admin = db.users.find((u: any) => u.id === currentAdminId && u.role === "admin");
  if (!admin) return res.status(403).json({ error: "Access denied. Master Admin authority required." });

  if (!name || !alias || !description) {
    return res.status(400).json({ error: "Missing required broker fields (name, alias, description)." });
  }

  const newBroker = {
    id: "cbroker-" + Date.now(),
    name,
    alias: alias.toLowerCase(),
    description,
    price_points: parseInt(price_points) || 150,
    risk_level: risk_level || "Medium",
    projected_apy: parseFloat(projected_apy) || 45,
    minimum_investment_points: parseInt(minimum_investment_points) || 0,
    is_active: true,
    is_crypto: true,
    external_link: external_link || "",
    uploaded_html: uploaded_html || "",
    detailed_readme: `### ${name} Strategy Readme\n- **Type**: Speculative automated trading\n- **Target Yield**: Projected APY of ${projected_apy}%\n- **Risk Protocol**: Fully audited algorithms executed autonomously.`,
    mock_trades: [
      { id: "tm-1", ticker: "BTC/USDT", amount: 1000, profit: 5, time: "Just now" },
      { id: "tm-2", ticker: "ETH/USDT", amount: 2000, profit: -2, time: "3 mins ago" }
    ]
  };

  if (!db.crypto_brokers) db.crypto_brokers = [];
  db.crypto_brokers.push(newBroker);
  addLog(admin.id, admin.email, "ADMIN_BROKER_CREATE", `Created new custom crypto broker: ${name} (${alias}).`);
  writeDB(db);

  res.json({ success: true, broker: newBroker, message: "Custom crypto broker added successfully!" });
});

// 7. Quick Admin Point Top-up at Will (Fulfills the user request 'can add even more points at will')
app.post("/api/admin/add-points", (req, res) => {
  const { currentAdminId, targetUserId, bonusPoints } = req.body;
  const db = getDB();
  const admin = db.users.find((u: any) => u.id === currentAdminId && u.role === "admin");
  if (!admin) return res.status(403).json({ error: "Access denied." });

  const targetUser = db.users.find((u: any) => u.id === targetUserId);
  if (!targetUser) return res.status(404).json({ error: "Target user not found." });

  const ptsToAdd = parseInt(bonusPoints);
  if (isNaN(ptsToAdd)) return res.status(400).json({ error: "Invalid points value specification." });

  targetUser.points += ptsToAdd;

  addLog(admin.id, admin.email, "ADMIN_POINTS_GRANT", `Sovereign admin injected ${ptsToAdd} points directly into user ${targetUser.email}. New user balance: ${targetUser.points} PLS.`);
  writeDB(db);

  res.json({
    success: true,
    newPoints: targetUser.points,
    message: `Instantly granted ${ptsToAdd} points. New wallet balance: ${targetUser.points} PLS.`
  });
});

// ----------------------------------------------------
// CUSTOM DYNAMIC ONLINE BROKERS PERSISTENCE
// ----------------------------------------------------

// 8. Retrieve list of registered custom online brokers
app.get("/api/online-brokers/list", (req, res) => {
  const db = getDB();
  res.json(db.online_brokers || []);
});

// 9. Add or register a custom online broker link (depositor-authorization lock!)
app.post("/api/online-brokers/add", (req, res) => {
  const { userId, name, url, description, demo_url } = req.body;
  if (!userId || !name || !url) {
    return res.status(400).json({ error: "Missing required fields: userId, name, and url are required." });
  }

  const db = getDB();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User profile not found." });

  // Limit payment check (must have completed deposit or have active subscription)
  const hasCompletedDeposit = (user.purchased_points && user.purchased_points > 0) || 
                               (user.subscription_tier && user.subscription_tier !== "basic") || 
                               user.role === "admin";
  
  if (!hasCompletedDeposit) {
    return res.status(403).json({ 
      error: "🚫 Depositor Authorization Required: To publish or register custom online mock brokers inside the central hub directory, you must first complete at least one Paystack package top-up." 
    });
  }

  const newBrokerLink = {
    id: "onl-" + Date.now(),
    userId,
    userName: user.email.split("@")[0].toUpperCase(),
    name,
    url: url.startsWith("http") ? url : "https://" + url,
    demo_url: demo_url ? (demo_url.startsWith("http") ? demo_url : "https://" + demo_url) : (url.startsWith("http") ? url : "https://" + url),
    description: description || "Interactive high-fidelity custom online broker desktop view",
    created_at: new Date().toISOString()
  };

  if (!db.online_brokers) db.online_brokers = [];
  db.online_brokers.unshift(newBrokerLink);
  writeDB(db);

  addLog(user.id, user.email, "ONLINE_BROKER_ADD", `Registered online broker link '${name}' to URL: ${url}.`);
  res.json({ success: true, item: newBrokerLink });
});

// 10. Delete a custom registered online broker
app.post("/api/online-brokers/delete", (req, res) => {
  const { userId, brokerId } = req.body;
  const db = getDB();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User profile not found." });

  const list = db.online_brokers || [];
  const index = list.findIndex((ob: any) => ob.id === brokerId && (ob.userId === userId || user.role === "admin"));
  if (index === -1) {
    return res.status(404).json({ error: "Online broker record not found or unauthorized to manage." });
  }

  const deleted = list.splice(index, 1)[0];
  db.online_brokers = list;
  writeDB(db);

  addLog(user.id, user.email, "ONLINE_BROKER_DELETE", `Sovereign purge of online broker '${deleted.name}'.`);
  res.json({ success: true });
});


// ----------------------------------------------------
// VITE CONTROLLERS
// ----------------------------------------------------
async function runServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StyleHub full-stack framework engine is live on port ${PORT}`);
  });
}

runServer();
