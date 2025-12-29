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
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 ${className}`}
      >
        <Users className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-semibold text-cyan-400">
          Aprobado por Comunidad
        </span>
        <span className="text-xs text-cyan-300/70">✨</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 ${className}`}
    >
      <Shield className="w-4 h-4 text-purple-400" />
      <span className="text-sm font-semibold text-purple-400">
        Aprobado por Juez
      </span>
      <span className="text-xs text-purple-300/70">⚡</span>
    </div>
  );
}
