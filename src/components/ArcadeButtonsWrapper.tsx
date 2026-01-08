'use client';

import { useState } from 'react';
import ArcadeButtons from './ArcadeButtons';
import { usePathname } from 'next/navigation';

export default function ArcadeButtonsWrapper() {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  // Solo mostrar en homepage
  if (pathname !== '/') return null;

  const handlePressStart = () => {
    setShowMenu(true);
    // Disparar evento personalizado para que SigninButton abra su menú
    window.dispatchEvent(new CustomEvent('arcade-press-start'));
  };

  return <ArcadeButtons onPressStart={handlePressStart} />;
}
