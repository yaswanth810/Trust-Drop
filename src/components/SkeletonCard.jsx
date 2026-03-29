import { motion } from 'framer-motion';

export default function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden h-full">
      <div className="h-2 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse" />
      <div className="p-6 space-y-4">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-white/5 rounded-lg w-3/4 animate-shimmer" />
          <div className="h-3 bg-white/5 rounded-lg w-1/3 animate-shimmer" />
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-white/5 rounded-lg w-full animate-shimmer" />
          <div className="h-3 bg-white/5 rounded-lg w-5/6 animate-shimmer" />
        </div>

        {/* Progress skeleton */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 bg-white/5 rounded-lg w-24 animate-shimmer" />
            <div className="h-3 bg-white/5 rounded-lg w-10 animate-shimmer" />
          </div>
          <div className="h-1.5 bg-white/5 rounded-full w-full animate-shimmer" />
        </div>

        {/* Footer skeleton */}
        <div className="pt-4 border-t border-white/5 flex justify-between">
          <div className="h-3 bg-white/5 rounded-lg w-28 animate-shimmer" />
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-white/5 animate-shimmer" />
            ))}
          </div>
        </div>

        {/* Button skeleton */}
        <div className="h-11 bg-white/5 rounded-xl w-full animate-shimmer" />
      </div>
    </div>
  );
}
