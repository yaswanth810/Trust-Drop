import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatEth, calculatePercentage, getMilestoneStatus, shortenAddress } from '../utils/helpers';
import { ArrowRight, Target, Users } from 'lucide-react';
import TrustScoreBadge from './TrustScoreBadge';

export default function CampaignCard({ campaign, index = 0 }) {
  const percentage = calculatePercentage(campaign.raisedFunds, campaign.totalFunds);

  const completedMilestones = campaign.milestones
    ? campaign.milestones.filter((m) => m.isApproved || m.fundsReleased).length
    : 0;

  // Compute a simple trust score from milestone data
  const totalMs = campaign.milestones?.length || 1;
  const simpleScore = Math.min(Math.round((completedMilestones / totalMs) * 80 + 10), 100);

  // Extract category from description if present
  const categoryMatch = campaign.description?.match(/^\[(\w+)\]/);
  const category = categoryMatch ? categoryMatch[1] : null;
  const cleanDescription = campaign.description?.replace(/^\[\w+\]\s*/, '') || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={`/campaign/${campaign.campaignId}`} className="block group">
        <div className="glass-card overflow-hidden h-full">
          {/* Campaign Header Gradient */}
          <div className="h-2 bg-gradient-to-r from-accent via-accent-600 to-blue" />

          <div className="p-6">
            {/* Title & NGO + TrustScore */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 mr-3">
                <div className="flex items-center gap-2 mb-1">
                  {category && (
                    <span className="badge badge-approved !text-[9px] !py-0 !px-2">{category}</span>
                  )}
                </div>
                <h3 className="text-lg font-bold group-hover:text-accent transition-colors line-clamp-1">
                  {campaign.title}
                </h3>
                <Link
                  to={`/ngo/${campaign.ngoAddress}`}
                  className="text-gray-400 text-sm flex items-center gap-1 hover:text-accent transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Users size={14} />
                  {shortenAddress(campaign.ngoAddress)}
                </Link>
              </div>
              <TrustScoreBadge score={simpleScore} size="sm" showLabel={false} />
            </div>

            {/* Description */}
            <p className="text-gray-400 text-sm leading-relaxed mb-5 line-clamp-2">
              {cleanDescription}
            </p>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300 font-medium">
                  {formatEth(campaign.raisedFunds)} ETH raised
                </span>
                <span className="text-accent font-semibold">{percentage}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
              </div>
              <p className="text-gray-500 text-xs mt-1.5">
                Goal: {formatEth(campaign.totalFunds)} ETH
              </p>
            </div>

            {/* Milestone Status */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-gray-400" />
                <span className="text-gray-400 text-sm">
                  {completedMilestones}/{campaign.milestoneCount} milestones
                </span>
              </div>

              {/* Milestone Dots */}
              <div className="flex gap-1">
                {campaign.milestones && campaign.milestones.slice(0, 4).map((m, i) => {
                  const status = getMilestoneStatus(m);
                  return (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        m.fundsReleased || m.isApproved
                          ? 'bg-accent'
                          : m.ipfsHash
                          ? 'bg-blue-400'
                          : 'bg-gray-600'
                      }`}
                      title={status.label}
                    />
                  );
                })}
              </div>
            </div>

            {/* Donate CTA */}
            <button className="w-full mt-4 py-3 rounded-xl bg-accent/10 text-accent font-semibold text-sm flex items-center justify-center gap-2 group-hover:bg-accent group-hover:text-white transition-all">
              Donate Now
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
