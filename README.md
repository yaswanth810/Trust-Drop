# TrustDrop 💧

**Blockchain-Powered NGO Fund Transparency Platform**

TrustDrop is a full-stack Web3 decentralized application built to bring complete transparency and accountability to charitable donations and NGO relief campaigns. By leveraging Ethereum smart contracts, donors can fund campaigns with confidence, knowing their contributions are locked and only released when real-world milestones are verified by independent validators.

---

## 🚀 Features

- **Milestone-Based Funding**: NGOs define specific goals, timelines, and budgets. Funds are only dispensed upon milestone completion.
- **Validator Approval System**: A decentralized network of validators (who stake 0.01 ETH) verify proof of work before any funds are released. Requires a 3/5 consensus.
- **Immutable Proof via IPFS**: All milestone execution proofs (images, documents) are permanently stored on IPFS.
- **Refund Mechanism**: If an NGO fails to deliver or a campaign is flagged as fraudulent, the contract can be frozen and all remaining funds returned proportionally to the original donors.
- **Premium User Interface**: A modern, sleek dark-themed UI built with React, Vite, and Tailwind CSS.
- **Smart Contract Security**: Built using Solidity 0.8.24 with full Reentrancy and Access control guards.

---

## 🛠️ Technology Stack

- **Frontend:** React.js, Vite, Tailwind CSS v3, Framer Motion, Lucide-React
- **Web3 Integration:** ethers.js v6
- **Smart Contracts:** Solidity `^0.8.24`, Hardhat
- **Network:** Ethereum Sepolia Testnet
- **Storage:** IPFS via Pinata REST API

---

## 📜 Smart Contract Overview

The core logic of TrustDrop runs on-chain via the `TrustDrop.sol` smart contract.

- **Deployed Network:** Sepolia
- **Contract Address:** `0x2d7087D83626526d5C4e8D976b1D3f6CBF741807`
- **Verification:** Successfully verified on Sourcify, Blockscout, and Routescan.

---

## ⚙️ Getting Started

### Prerequisites

You will need the following installed:
- Node.js (v18 or higher)
- npm or yarn
- MetaMask (browser extension) configured for the Sepolia Testnet
- Sepolia testnet ETH (from any standard faucet)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yaswanth810/Trust-Drop.git
   cd Trust-Drop
   ```

2. *(Optional)* **Install Dependencies**
   *Note: `node_modules` are included in this repo, so you may not need to install them, but if you do:*
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory based on the `.env.example`:
   ```env
   VITE_CONTRACT_ADDRESS=0x2d7087D83626526d5C4e8D976b1D3f6CBF741807
   VITE_SEPOLIA_RPC_URL=https://rpc.sepolia.org
   VITE_PINATA_API_KEY=your_pinata_api_key_here
   VITE_PINATA_SECRET_KEY=your_pinata_secret_key_here
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   Navigate to `http://localhost:5173` in your browser.

---

## 📖 How It Works

1. **NGO Creates Campaign**: The organization sets a funding goal divided into discrete physical milestones, each with a specific ETH allocation and deadline.
2. **Donors Contribute**: Users donate ETH to the campaign. The funds are locked securely inside the TrustDrop smart contract.
3. **NGO Submits Proof**: Once a milestone is achieved in the real world, the NGO uploads photo/documentary evidence to IPFS and submits the hash to the blockchain.
4. **Validators Approve**: Registered validators review the IPFS proof. If a minimum of 3 validators approve the milestone, the smart contract automatically releases that milestone's specific ETH allocation to the NGO's wallet.
5. **Transparency**: All steps, donations, and proofs are publicly verifiable on the Ethereum blockchain.

---

## 🎨 Design System

TrustDrop utilizes a modern, trustworthiness-inspiring design system:
- **Primary Colors:** Deep Navy Backgrounds (`#0A1628`, `#0F213A`)
- **Accent Color:** Vibrant Teal/Green (`#00C896`)
- **Typography:** Inter (Clean, legible sans-serif)
- **Aesthetics:** Glassmorphism (`backdrop-blur`), subtle inner shadows, and smooth micro-animations.

---

## 📄 License

This project is licensed under the MIT License.
