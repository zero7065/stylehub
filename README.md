# 🌌 StylezHub – Anonymous Marketplace & Fintech Simulation Suite
### Operated & Maintained under JADAI STUDIOS®

Welcome to the production deployment and operating manual for **StylezHub** – a high-fidelity, standalone, full-stack Fintech Simulation & Anonymous digital marketplace sandbox.

StylezHub is powered by a high-performance **Express API server** and an advanced **Vite + React SPA interface**, completely bundled into a production-ready CJS delivery payload designed for instant, resilient horizontal scaling on Google Cloud Run, AWS App Runner, or direct VPS.

---

## ⚡ 1. Rapid Local Quick-Start

To boot development mode (which utilizes Hot Module Reloading for frontend and native TypeScript execution on backend simultaneously):

```bash
# 1. Install all system dependencies
npm install

# 2. Boot dev server on port 3000
npm run dev
```

The system will initialize a local JSON ledger database `db.json` and host the platform at `http://localhost:3000` automatically.

---

## ⚙️ 2. Critical Environment Configuration

To configure your staging or production servers, edit `.env` or inject configuration variables inside your container deployment cluster. 

Create a `.env` file at the project root using these parameters:

```env
# ==============================================================================
# STYLEZHUB SYSTEM ENVIRONMENT PARAMETERS
# ==============================================================================

# Node Environment Mode (development | production)
NODE_ENV=production

# Network bind ports (Ingress proxy default)
PORT=3000

# Secret Key for session sign-offs and cookie ledger validation (Insert random string)
SESSION_SECRET=jadai_sovereign_secure_secret_hash_2026

# ==============================================================================
# THIRD-PARTY DEPLOYMENT VARIABLES (e.g. PAYSTACK INTEGRATION)
# ==============================================================================

# Paystack Public Secret Key (Used server-side for processing instant points boughts)
PAYSTACK_SECRET_KEY=sk_live_xxxxxx_insert_your_paystack_secret_here
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxx_insert_your_paystack_public_here

# Main Sandbox administrative email fallback configuration keys
FALLBACK_ADMIN_EMAIL=admin@stylehub.com
FALLBACK_ADMIN_PASS=Admin@123456
```

> [!NOTE]
> All Paystack checkout events are currently captured and resolved in-app via a graceful simulated webhook bridge. If you supply genuine Paystack variables, your users will be redirected to the secure live Paystack payment gate before points allocation takes place.

---

## 🚀 3. Google Cloud Run Deployment Guide

StylezHub is containerized and standardized to satisfy server-side requirements. You can deploy to Google Cloud Run in three simple steps:

### Option A: Direct gcloud CLI build
```bash
# 1. Initialize google project parameters
gcloud config set project [YOUR_PROJECT_ID]

# 2. Compile and push images directly using Cloud Build
gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/stylezhub

# 3. Launch secure container bound on Ingress port 3000
gcloud run deploy stylezhub \
  --image gcr.io/[YOUR_PROJECT_ID]/stylezhub \
  --platform managed \
  --port 3000 \
  --allow-unauthenticated \
  --set-env-vars=NODE_ENV=production,SESSION_SECRET=your_secret_hash
```

---

## 🛠️ 4. Build System & Compilation Pipeline

The application features a dual compilation design. When compiling for stable production environments (via `npm run build`), the following processes occur:

1. **Frontend Compilation**: Vite compiles the React framework code, performs tree-shaking, and minifies the output bundle into static folders within `dist/`.
2. **Server Compilation**: `esbuild` bundles `server.ts` into a self-contained, compiled CommonJS module at `dist/server.cjs`. This native compilation bypasses strict ESM relative file checks, accelerating server boot speeds.
3. **Stand-Alone Initiation**: To launch the production deployment, the server runs `node dist/server.cjs`.

---

## 💎 5. Dynamic Features & Branding Integrations

### ☯️ Jadai Insignia (Custom Emblem Code)
The director of Jadai Studios holds total sovereignty. Administrators can enter any custom HTML or inline SVG inside the **Admin Panel - Settings** parameter named **"Watermark custom HTML emblem seal"**. Once set, this custom HTML re-renders dynamically inside the global header on all user screens.

### 📤 Custom HTML (Signia Engine Upload)
Premium users (Executive & Elite subscribers) can drag and drop or manually upload raw HTML templates inside the **"Custom HTML Signia Upload"** widget in the Fintech Simulator tab. 
* **Rendering Mechanics**: StylezHub captures the raw HTML upload, writes it dynamically to `/api/templates/upload` server storage, and utilizes a secure Sandbox Virtual Frame to immediately render the HTML code with high-performance real-time data inputs and custom parameter injection. It operates perfectly like the built-in OPay simulation.

### 🚨 Profile Account Deletion
Under **Profile & AML Security**, users can permanently trigger account destruction. This irreversible command immediately communicates with the security endpoint `/api/user/delete`, purges the user's data record, and registers an auditable system action ledger.

---

*Intellectual Property of Jadai Studios®. Core Engine Integrated under Federated Cloud SSO Services.*
