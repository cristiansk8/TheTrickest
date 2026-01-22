'use client';

import { MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SpotFloatingButtonProps {
  onClick: () => void;
}

export default function SpotFloatingButton({ onClick }: SpotFloatingButtonProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if geolocation is available
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        setHasPermission(result.state === 'granted');
      });
    } else if ('geolocation' in navigator) {
      setHasPermission(true);
    } else {
      setHasPermission(false);
    }
  }, []);

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-full shadow-2xl shadow-cyan-500/50 border-4 border-white transition-all transform hover:scale-110 active:scale-95 group"
      title="Registrar spot o validar ubicación"
    >
      <MapPin className="w-8 h-8 group-hover:animate-pulse" />

      {/* Pulse animation ring */}
      <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-20"></span>
    </button>
  );
}
