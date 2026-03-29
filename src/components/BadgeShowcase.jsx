import { motion, AnimatePresence } from 'framer-motion';
import { Award, Share2, ExternalLink } from 'lucide-react';

const TIER_CONFIG = {
  0: { name: 'Bronze Supporter', color: '#D97706', bgGrad: 'from-amber-900/30 to-amber-700/10', border: 'border-amber-600/30', threshold: '0.01+' },
  1: { name: 'Silver Supporter', color: '#9CA3AF', bgGrad: 'from-gray-600/30 to-gray-400/10', border: 'border-gray-400/30', threshold: '0.05+' },
  2: { name: 'Gold Supporter', color: '#FBBF24', bgGrad: 'from-yellow-700/30 to-yellow-500/10', border: 'border-yellow-500/30', threshold: '0.1+' },
  3: { name: 'Platinum Guardian', color: '#A78BFA', bgGrad: 'from-purple-800/30 to-purple-500/10', border: 'border-purple-400/30', threshold: '0.5+' },
};

const TIER_EMOJIS = { 0: '🥉', 1: '🥈', 2: '🥇', 3: '💎' };

function BadgeCard({ tier, totalDonated, campaignsSupported, delay = 0 }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG[0];
  const emoji = TIER_EMOJIS[tier] || '🏅';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      className={`glass-card overflow-hidden bg-gradient-to-br ${config.bgGrad} ${config.border}`}
    >
      <div className="p-6 text-center">
        <div className="text-5xl mb-3">{emoji}</div>
        <h3 className="font-bold text-lg mb-1" style={{ color: config.color }}>
          {config.name}
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          {config.threshold} ETH donated
        </p>

        <div className="flex justify-center gap-6 text-sm text-gray-400">
          <div>
            <p className="font-bold text-lg" style={{ color: config.color }}>{totalDonated}</p>
            <p className="text-xs">ETH Total</p>
          </div>
          <div>
            <p className="font-bold text-lg" style={{ color: config.color }}>{campaignsSupported}</p>
            <p className="text-xs">Campaigns</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function BadgeShowcase({ badges = [], totalDonated = '0', campaignsSupported = 0 }) {
  // Determine which tiers are earned based on total donation
  const totalEth = parseFloat(totalDonated);
  const earnedTiers = [];
  if (totalEth >= 0.01) earnedTiers.push(0); // Bronze
  if (totalEth >= 0.05) earnedTiers.push(1); // Silver
  if (totalEth >= 0.1) earnedTiers.push(2);  // Gold
  if (totalEth >= 0.5) earnedTiers.push(3);  // Platinum

  const handleShare = (tier) => {
    const config = TIER_CONFIG[tier];
    const text = `Just earned my ${config.name} badge on TrustDrop 🏆\nDonated ${totalDonated} ETH to verified NGO campaigns.\nTrack every rupee on-chain → trustdrop.app #Web3ForGood #TrustDrop`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (earnedTiers.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Award size={40} className="text-gray-600 mx-auto mb-3" />
        <h3 className="font-semibold mb-2">No Badges Earned Yet</h3>
        <p className="text-gray-400 text-sm mb-4">
          Donate to campaigns to earn NFT supporter badges!
        </p>
        <div className="flex justify-center gap-4 text-xs text-gray-500">
          <span>🥉 0.01 ETH</span>
          <span>🥈 0.05 ETH</span>
          <span>🥇 0.1 ETH</span>
          <span>💎 0.5 ETH</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <Award size={20} className="text-accent" />
          Your NFT Badges
        </h3>
        {earnedTiers.length > 0 && (
          <button
            onClick={() => handleShare(earnedTiers[earnedTiers.length - 1])}
            className="btn-secondary !py-1.5 !px-3 text-xs"
          >
            <Share2 size={12} />
            Share on X
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((tier) => {
          const earned = earnedTiers.includes(tier);
          const config = TIER_CONFIG[tier];
          return earned ? (
            <BadgeCard
              key={tier}
              tier={tier}
              totalDonated={totalDonated}
              campaignsSupported={campaignsSupported}
              delay={tier * 0.1}
            />
          ) : (
            <div
              key={tier}
              className="glass-card-static p-6 text-center opacity-40 grayscale"
            >
              <div className="text-4xl mb-2">{TIER_EMOJIS[tier]}</div>
              <h4 className="font-medium text-sm mb-1">{config.name}</h4>
              <p className="text-gray-500 text-xs">{config.threshold} ETH</p>
              <p className="text-gray-600 text-xs mt-2">🔒 Locked</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
