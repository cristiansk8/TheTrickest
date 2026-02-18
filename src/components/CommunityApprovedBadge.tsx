'use client';

import { Shield, Users } from 'lucide-react';

interface CommunityApprovedBadgeProps {
  communityApproved: boolean;
  className?: string;
}

export default function CommunityApprovedBadge({
  communityApproved,
  className = '',
}: CommunityApprovedBadgeProps) {
  if (communityApproved) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-accent-cyan-500/20 to-accent-blue-500/20 border border-accent-cyan-500/30 ${className}`}
      >
        <Users className="w-4 h-4 text-accent-cyan-400" />
        <span className="text-sm font-semibold text-accent-cyan-400">
          Aprobado por Comunidad
        </span>
        <span className="text-xs text-accent-cyan-300/70">✨</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-accent-purple-500/20 to-accent-pink-500/20 border border-accent-purple-500/30 ${className}`}
    >
      <Shield className="w-4 h-4 text-accent-purple-400" />
      <span className="text-sm font-semibold text-accent-purple-400">
        Aprobado por Juez
      </span>
      <span className="text-xs text-accent-purple-300/70">⚡</span>
    </div>
  );
}
