import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3 } from '../context/Web3Context';
import { donateToCampaign } from '../utils/contract';
import { formatEth, isValidEthAmount, getEtherscanUrl } from '../utils/helpers';
import { X, Wallet, Heart, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DonateModal({ campaign, isOpen, onClose, onSuccess }) {
  const { contract, isConnected, connectWallet, account, balance } = useWeb3();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [success, setSuccess] = useState(false);

  const quickAmounts = ['0.01', '0.025', '0.05', '0.1'];

  const handleDonate = async () => {
    if (!isConnected) {
      connectWallet();
      return;
    }

    if (!isValidEthAmount(amount)) {
      toast.error('Please enter a valid ETH amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      setLoading(true);
      const tx = await donateToCampaign(contract, campaign.campaignId, amount);
      setTxHash(tx.hash);
      toast.loading('Transaction pending...', { id: 'donate' });

      await tx.wait();
      toast.success('Donation confirmed! ✓', { id: 'donate' });
      setSuccess(true);

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Donation error:', err);
      toast.error(err.reason || 'Transaction failed', { id: 'donate' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setTxHash(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card w-full max-w-md p-6 relative"
          style={{ background: 'rgba(10, 22, 40, 0.95)' }}
        >
          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {success ? (
            /* Success State */
            <div className="text-center py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <CheckCircle2 size={64} className="text-accent mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Donation Successful!</h3>
              <p className="text-gray-400 mb-4">
                You contributed {amount} ETH to {campaign.title}
              </p>
              {txHash && (
                <a
                  href={getEtherscanUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-accent hover:underline text-sm"
                >
                  View on Etherscan
                  <ExternalLink size={14} />
                </a>
              )}
              <button
                onClick={handleClose}
                className="w-full mt-6 btn-accent"
              >
                Done
              </button>
            </div>
          ) : (
            /* Donate Form */
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Heart size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Donate</h3>
                  <p className="text-gray-400 text-sm">{campaign.title}</p>
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Amount (ETH)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.05"
                    className="input-field text-xl font-semibold pr-16"
                    disabled={loading}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    ETH
                  </span>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2 mb-6">
                {quickAmounts.map((qa) => (
                  <button
                    key={qa}
                    onClick={() => setAmount(qa)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      amount === qa
                        ? 'bg-accent/20 text-accent border border-accent/30'
                        : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/20'
                    }`}
                    disabled={loading}
                  >
                    {qa}
                  </button>
                ))}
              </div>

              {/* Info */}
              {amount && isValidEthAmount(amount) && (
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/10 mb-6 text-sm text-gray-300">
                  <p>Your contribution: <span className="text-accent font-semibold">{amount} ETH</span></p>
                  <p className="text-xs text-gray-400 mt-1">
                    Locked until milestones are completed and verified
                  </p>
                </div>
              )}

              {/* Balance */}
              {isConnected && (
                <p className="text-xs text-gray-500 mb-4">
                  Balance: {parseFloat(balance).toFixed(4)} ETH
                </p>
              )}

              {/* Submit */}
              <button
                onClick={handleDonate}
                disabled={loading || (!isConnected ? false : !isValidEthAmount(amount))}
                className="w-full btn-accent justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : !isConnected ? (
                  <>
                    <Wallet size={18} />
                    Connect Wallet to Donate
                  </>
                ) : (
                  <>
                    <Heart size={18} />
                    Donate {amount || '0'} ETH
                  </>
                )}
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
