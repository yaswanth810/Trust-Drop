import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3 } from '../context/Web3Context';
import { shortenAddress } from '../utils/helpers';
import { Shield, Menu, X, Home, PlusCircle, CheckSquare, Heart, Wallet } from 'lucide-react';

export default function Navbar() {
  const { account, isConnected, connectWallet, balance, loading } = useWeb3();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/create', label: 'Create Campaign', icon: PlusCircle },
    { to: '/validator', label: 'Validator', icon: CheckSquare },
    { to: '/my-donations', label: 'My Donations', icon: Heart },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-800/80 backdrop-blur-xl border-b border-white/5">
      <div className="page-container">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-accent to-accent-700 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-accent/20 transition-all">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Trust<span className="gradient-text">Drop</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-accent/10 text-accent'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Wallet Button */}
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm">
                  <span className="status-dot connected" />
                  <span className="text-gray-300">{parseFloat(balance).toFixed(3)} ETH</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-sm">
                  <Wallet size={14} className="text-accent" />
                  <span className="text-accent font-medium">{shortenAddress(account)}</span>
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="btn-accent text-sm !py-2 !px-5"
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <Wallet size={16} />
                    Connect Wallet
                  </>
                )}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-navy-800/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
          >
            <div className="page-container py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? 'bg-accent/10 text-accent'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              ))}
              {isConnected && (
                <div className="flex items-center gap-2 px-4 py-3 mt-2 rounded-xl bg-accent/10 border border-accent/20">
                  <span className="status-dot connected" />
                  <span className="text-accent text-sm font-medium">{shortenAddress(account)}</span>
                  <span className="text-gray-400 text-sm ml-auto">{parseFloat(balance).toFixed(3)} ETH</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
