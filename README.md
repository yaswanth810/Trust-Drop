# TrustDrop 💧

**Blockchain-Powered NGO Fund Transparency Platform**

TrustDrop is a full-stack Web3 decentralized application built to bring complete transparency and accountability to charitable donations and NGO relief campaigns. By leveraging Ethereum smart contracts, donors can fund campaigns with confidence, knowing their contributions are locked and only released when real-world milestones are verified by independent validators.

---

## 🚀 Features

### Core Features
- **Milestone-Based Funding**: NGOs define specific goals, timelines, and budgets. Funds are only dispensed upon milestone completion.
- **Validator Approval System**: A decentralized network of validators (who stake 0.01 ETH) verify proof of work before any funds are released. Requires a 3/5 consensus.
- **Immutable Proof via IPFS**: All milestone execution proofs (images, documents) are permanently stored on IPFS.
- **Refund Mechanism**: If an NGO fails to deliver, the contract can be frozen and all remaining funds returned to original donors.

### Advanced Features (v2)
- **🏆 TrustScore System**: On-chain NGO reputation engine (0-100 score) with Gold/Silver/Bronze/Unverified badges visible on every campaign card.
- **📊 Analytics Dashboard**: Full analytics page with 4 interactive Recharts charts (Line, Bar, Pie, Area) and 6 stat cards showing platform performance.
- **🎖️ NFT Donor Badges**: ERC-721 NFT badges automatically awarded at Bronze (0.01 ETH), Silver (0.05 ETH), Gold (0.1 ETH), and Platinum (0.5 ETH) donation tiers.
- **📡 Real-Time Activity Feed**: Live blockchain event listener showing donations, proof submissions, milestone approvals, and fund releases in real-time.
- **🔍 Campaign Search & Filter**: Full-text search, category filters (Relief/Education/Medical/Infrastructure/Environment), status filters, sort options, and URL query parameter sync.
- **🌙 Dark / Light Mode**: Premium dark navy and clean light themes with smooth 200ms transitions, persisted in localStorage.
- **🌐 Multi-Language (i18n)**: English and Telugu (తెలుగు) language support with instant toggle via globe icon.
- **👨‍⚖️ Validator Leaderboard**: Validator reputation system with accuracy scores, vote counts, earnings tracking, and top-10 leaderboard.
- **📱 PWA Support**: Progressive Web App with offline caching, service worker, and installable on mobile devices.
- **🔖 Campaign Categories**: Campaigns tagged with categories (Relief, Education, Medical, Infrastructure, Environment) for better discoverability.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS v3, Framer Motion, Recharts |
| **Web3** | ethers.js v6 |
| **Smart Contracts** | Solidity ^0.8.24, Hardhat, OpenZeppelin |
| **Network** | Ethereum Sepolia Testnet |
| **Storage** | IPFS via Pinata REST API |
| **i18n** | react-i18next, i18next |
| **PWA** | vite-plugin-pwa, Workbox |

---

## 📜 Smart Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| **TrustDrop** | `0x2d7087D83626526d5C4e8D976b1D3f6CBF741807` | Main platform: campaigns, donations, milestones, validators |
| **TrustScore** | `0xEDf7b9864b40065CDD023D726Cc8A0D2D7A038c9` | NGO reputation engine (0-100 trust scoring) |
| **TrustDropNFT** | `0x2E98053Fccb781c05f0C63094C6c05e590D2656B` | ERC-721 donor badge NFTs (Bronze/Silver/Gold/Platinum) |

All contracts are deployed on **Sepolia Testnet** and verified on Sourcify, Blockscout, and Routescan.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MetaMask browser extension (configured for Sepolia)
- Sepolia testnet ETH (from any standard faucet)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yaswanth810/Trust-Drop.git
   cd Trust-Drop
   ```

2. *(Optional)* **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Environment Setup**
   Create a `.env` file:
   ```env
   VITE_CONTRACT_ADDRESS=0x2d7087D83626526d5C4e8D976b1D3f6CBF741807
   VITE_TRUSTSCORE_ADDRESS=0xEDf7b9864b40065CDD023D726Cc8A0D2D7A038c9
   VITE_NFT_ADDRESS=0x2E98053Fccb781c05f0C63094C6c05e590D2656B
   VITE_SEPOLIA_RPC_URL=https://rpc.sepolia.org
   VITE_PINATA_API_KEY=your_pinata_api_key
   VITE_PINATA_SECRET_KEY=your_pinata_secret_key
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. Open `http://localhost:5173` in your browser.

---

## 📖 How It Works

1. **NGO Creates Campaign** → Define milestones with categories, fund allocations, and deadlines.
2. **Donors Contribute** → ETH is locked securely in the TrustDrop smart contract.
3. **NGO Submits Proof** → Upload photo/document evidence to IPFS via Pinata.
4. **Validators Approve** → 3/5 staked validators review proof; on approval, ETH auto-releases to NGO.
5. **Trust Scores Update** → NGO reputation updates on-chain based on milestone performance.
6. **Donor Badges Mint** → Donors crossing tier thresholds earn ERC-721 NFT supporter badges.

---

## 🎨 Design System

- **Dark Theme**: Navy backgrounds (`#0A1628`, `#0F213A`), Accent green (`#00C896`)
- **Light Theme**: Clean white (`#F8FAFC`), Green accent (`#059669`)
- **Typography**: Inter (Google Fonts)
- **Effects**: Glassmorphism, gradient text, shimmer skeletons, micro-animations
- **Responsive**: Mobile-first, 375px+ support

---

## 📂 Project Structure

```
src/
├── abi/                    # Contract ABIs (TrustDrop, TrustScore, TrustDropNFT)
├── components/             # Reusable UI components
│   ├── ActivityFeed.jsx    # Real-time blockchain event feed
│   ├── BadgeShowcase.jsx   # NFT badge grid with tier display
│   ├── CampaignCard.jsx    # Campaign card with TrustScore badge
│   ├── TrustScoreBadge.jsx # Animated circular gauge (0-100)
│   ├── SkeletonCard.jsx    # Shimmer loading placeholder
│   ├── Navbar.jsx          # Nav with theme/language toggles
│   └── ...
├── context/                # React contexts
│   ├── Web3Context.jsx     # Wallet + 3 contract instances
│   └── ThemeContext.jsx     # Dark/light mode
├── locales/                # Translation files (en.json, te.json)
├── pages/                  # Route pages
│   ├── Analytics.jsx       # 4 charts + 6 stat cards
│   ├── NgoProfile.jsx      # On-chain NGO reputation profile
│   └── ...
├── utils/                  # Helpers, contract wrappers, IPFS
└── i18n.js                 # i18next configuration
contracts/
├── TrustDrop.sol           # Main platform contract
├── TrustScore.sol          # NGO reputation engine
└── TrustDropNFT.sol        # ERC-721 donor badges
```

---

## 📄 License

This project is licensed under the MIT License.
