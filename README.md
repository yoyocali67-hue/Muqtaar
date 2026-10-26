# SOM PLY eFootball 2026

Modern, full-stack website built specifically for Somali eFootball 2026 players.

---

## 🌟 Key Features

1. **Homepage**:
   - Modern gaming aesthetic: pure black background, dark navy glass cards, glowing blue and amber/gold accents.
   - Somali welcome message for eFootball gamers.
   - Four large primary feature cards:
     - **Coins & Packs**
     - **DreamSquad** (AI Formation Builder)
     - **Player Training** (Tababarka Ciyaartoyda)
     - **Exchange** (Locked with Padlock & "COMING SOON")

2. **Coins & Packs (Order & Payment System)**:
   - Full catalog of eFootball coins, special edition packs, and match passes.
   - Payment methods: **EVC Plus (Hormuud)**, **Sahal (Golis)**, and **Premier Bank**.
   - Mandatory Somali notice:
     > *“Macmiil, eFootball-ka lama adeegsanayo qaabka PUBG oo kale. Marka lacagtaada la xaqiijiyo ayaa shaqada dalabkaaga la bilaabayaa.”*
   - Button **“Waan bixiyey”** opens a secure order form (Player ID, WhatsApp contact, TRX reference, optional receipt image attachment, agreement checkbox).
   - Generates unique order number (e.g. `SOM-2026-XXXX`) and persists in database.
   - Displays required Somali confirmation:
     > *“Dalabkaaga waa la helay, waxaana la sugayaa xaqiijinta lacagta.”*
   - Live order tracker with real-time status updates:
     - `Pending Payment`
     - `Awaiting Verification`
     - `Payment Confirmed`
     - `Processing`
     - `Completed` (Displays: *“Waa lagu guulaystay dalabkaaga, macmiil. Waad ku mahadsan tahay sida aad uga adeegatay SOM PLY!”*)
     - `Rejected`

3. **Strict Security Standards**:
   - **No Gmail password, No email login password, and No email OTP codes** are ever requested or stored.
   - Uses genuine payment references (TRX ID) and customer-submitted receipt screenshots only.

4. **DreamSquad (AI Formation Builder)**:
   - Interactive formation optimization for Somali players.
   - Select playstyle (*Quick Counter, Long Ball Counter, Possession Game, Out Wide, Long Ball*).
   - Optional formation screenshot upload analyzed with **Gemini 3.8 Flash Multimodal Vision** on the server.
   - Outputs complete tactical overview, key strengths, and individual player instructions in authentic Somali, rendered on an interactive visual pitch.
   - Fallback to internal tactical engine when API key is not configured, clearly informing the user of the engine status.

5. **Player Training**:
   - Searchable player-training library for top cards (Messi, Haaland, Mbappé, Rodri, Bellingham).
   - Search by player name, filter by position (*FW, MF, DF, GK*).
   - Displays recommended progression point distribution, max rating calculations, key attributes, and Somali tactical advice.
   - Managed and editable by the administrator.

6. **Exchange (Coming Soon)**:
   - Premium locked card with padlock icon, dark blue & gold gaming design.
   - Displays:
     > *“Qaybtan dhawaan ayaa la furi doonaa.”*
     > *COMING SOON*
   - Remains disabled until unlocked by the administrator via the Admin Dashboard.

7. **Protected Administrator Dashboard**:
   - Accessible via the lock icon on the navigation bar or footer.
   - Default login credentials: `admin` / `somply2026!`.
   - Manage incoming orders: inspect transaction references and receipt screenshots, approve or reject payments, change status to `Payment Confirmed`, `Processing`, or `Completed`.
   - Add, edit, or delete coin packages and set custom pricing.
   - Configure EVC Plus, Sahal, and bank merchant account numbers and transfer instructions.
   - Add and update player progression builds.
   - Toggle the Exchange feature on/off.

---

## 🛠️ Architecture & Setup Instructions

### Backend & Database
- Built with **Node.js, Express, and Vite**.
- Data is stored in atomic persistent JSON files in `/data`:
  - `data/orders.json`
  - `data/packages.json`
  - `data/settings.json`
  - `data/players.json`
- Changes made in the Admin Dashboard are saved instantly and persist across server reloads.

### Environment Variables
Configure the following in `.env` (or via AI Studio Secrets):
```env
# Gemini API Key for DreamSquad Vision & Tactics analysis
GEMINI_API_KEY="your-api-key-here"

# Admin Authentication
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="somply2026!"
```

### Running Locally
```bash
npm install
npm run dev     # Runs tsx server.ts on port 3000
npm run build   # Builds production frontend bundle
```
