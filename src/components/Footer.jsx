import { Shield, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-700 rounded-lg flex items-center justify-center">
                <Shield size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Trust<span className="gradient-text">Drop</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Blockchain-powered NGO fund transparency platform. Every donation is tracked, 
              every milestone verified, every rupee accounted for.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 text-sm hover:text-accent transition-colors">Browse Campaigns</Link></li>
              <li><Link to="/create" className="text-gray-400 text-sm hover:text-accent transition-colors">Create Campaign</Link></li>
              <li><Link to="/validator" className="text-gray-400 text-sm hover:text-accent transition-colors">Become a Validator</Link></li>
              <li><Link to="/my-donations" className="text-gray-400 text-sm hover:text-accent transition-colors">My Donations</Link></li>
            </ul>
          </div>

          {/* Network */}
          <div>
            <h4 className="text-white font-semibold mb-4">Network</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://sepolia.etherscan.io" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-accent transition-colors">
                  Sepolia Etherscan
                </a>
              </li>
              <li>
                <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-accent transition-colors">
                  Get Testnet ETH
                </a>
              </li>
              <li>
                <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-accent transition-colors">
                  Install MetaMask
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2025 TrustDrop. Built on Ethereum Sepolia Testnet.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Made with <Heart size={14} className="text-accent" /> for transparent philanthropy
          </p>
        </div>
      </div>
    </footer>
  );
}
