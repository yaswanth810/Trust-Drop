import { ExternalLink, CheckCircle2, Hash, Clock } from 'lucide-react';
import { getEtherscanUrl, shortenAddress } from '../utils/helpers';
import { motion } from 'framer-motion';

export default function OnChainReceipt({ txHash, amount, timestamp }) {
  if (!txHash) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <CheckCircle2 size={16} className="text-accent" />
        On-Chain Receipt
      </h4>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400 flex items-center gap-1">
            <Hash size={12} />
            Tx Hash
          </span>
          <a
            href={getEtherscanUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline flex items-center gap-1"
          >
            {shortenAddress(txHash)}
            <ExternalLink size={12} />
          </a>
        </div>

        {amount && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Amount</span>
            <span className="text-white font-medium">{amount} ETH</span>
          </div>
        )}

        {timestamp && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 flex items-center gap-1">
              <Clock size={12} />
              Time
            </span>
            <span className="text-gray-300">{new Date(timestamp).toLocaleString()}</span>
          </div>
        )}
      </div>

      <a
        href={getEtherscanUrl(txHash)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 w-full py-2 rounded-lg bg-accent/10 text-accent text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent/20 transition-colors"
      >
        View on Etherscan Sepolia
        <ExternalLink size={14} />
      </a>
    </motion.div>
  );
}
