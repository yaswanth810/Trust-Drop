import { motion } from 'framer-motion';

const TIERS = [
  { min: 80, label: 'Highly Trusted', emoji: '🥇', color: '#FBBF24', badgeClass: 'badge-gold', gradient: ['#FBBF24', '#F59E0B'] },
  { min: 50, label: 'Trusted', emoji: '🥈', color: '#D1D5DB', badgeClass: 'badge-silver', gradient: ['#D1D5DB', '#9CA3AF'] },
  { min: 20, label: 'Building Trust', emoji: '🥉', color: '#D97706', badgeClass: 'badge-bronze', gradient: ['#D97706', '#B45309'] },
  { min: 0, label: 'New / Unverified', emoji: '⚠️', color: '#F87171', badgeClass: 'badge-unverified', gradient: ['#F87171', '#EF4444'] },
];

function getTier(score) {
  return TIERS.find((t) => score >= t.min) || TIERS[TIERS.length - 1];
}

export default function TrustScoreBadge({ score = 0, size = 'md', showLabel = true }) {
  const tier = getTier(score);
  const circumference = 2 * Math.PI * 36;
  const progress = (score / 100) * circumference;

  const sizes = {
    sm: { container: 'w-10 h-10', svg: 32, textSize: 'text-[9px]', labelSize: 'text-[8px]' },
    md: { container: 'w-16 h-16', svg: 56, textSize: 'text-sm', labelSize: 'text-[10px]' },
    lg: { container: 'w-28 h-28', svg: 100, textSize: 'text-2xl', labelSize: 'text-xs' },
    xl: { container: 'w-40 h-40', svg: 140, textSize: 'text-4xl', labelSize: 'text-sm' },
  };

  const s = sizes[size] || sizes.md;
  const radius = size === 'sm' ? 12 : size === 'lg' ? 42 : size === 'xl' ? 58 : 22;
  const strokeWidth = size === 'sm' ? 2 : size === 'xl' ? 5 : 3;
  const circ = 2 * Math.PI * radius;
  const prog = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`trust-gauge ${s.container}`}>
        <svg width={s.svg} height={s.svg} viewBox={`0 0 ${s.svg} ${s.svg}`}>
          {/* Background circle */}
          <circle
            cx={s.svg / 2}
            cy={s.svg / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <motion.circle
            cx={s.svg / 2}
            cy={s.svg / 2}
            r={radius}
            fill="none"
            stroke={tier.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - prog }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 4px ${tier.color}40)` }}
          />
          {/* Score text */}
          <text
            x={s.svg / 2}
            y={s.svg / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill={tier.color}
            className={`${s.textSize} font-bold`}
            style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
          >
            {score}
          </text>
        </svg>
      </div>

      {showLabel && size !== 'sm' && (
        <div className="text-center">
          <span className={`${tier.badgeClass} badge !text-[10px] !py-0.5`}>
            {tier.emoji} {tier.label}
          </span>
        </div>
      )}
    </div>
  );
}

export { getTier, TIERS };
