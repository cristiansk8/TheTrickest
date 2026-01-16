'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoginEmailForm from './LoginEmailForm';
import RegisterEmailForm from './RegisterEmailForm';
import SetPasswordModal from './SetPasswordModal';
import SkateProfileCompletionModal from './SkateProfileCompletionModal';
import UserScoreBadge from './UserScoreBadge';
import ModalPortal from './ModalPortal';

type MenuOption = {
  label: string;
  action: (() => void) | null;
  isHeader?: boolean;
  isPrimary?: boolean;
};

const SigninButton = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [openModal, setModal] = useState(false);
  const [openVideoModal, setOpenVideoModal] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [openSetPasswordModal, setOpenSetPasswordModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0);

  const handleModal = () => setModal(!openModal);
  const handleVideoModal = () => setOpenVideoModal(!openVideoModal);
  const handleMenu = () => {
    setOpenMenu(!openMenu);
    setSelectedOption(0); // Reset selection when opening menu
  };

  const profileStatus = session?.user?.profileStatus || 'basic';
  const isProfileComplete = profileStatus === 'complete';
  const hasPassword = session?.user?.hasPassword;

  // Estados para login/registro
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Mostrar modal de contraseña si el usuario está autenticado pero no tiene contraseña
  useEffect(() => {
    // Solo mostrar si hay sesión válida, email confirmado, estado autenticado y hasPassword es explícitamente false
    if (status === 'authenticated' && session?.user?.email && hasPassword === false) {
      setOpenSetPasswordModal(true);
    }
  }, [session, hasPassword, status]);

  // Función para hacer scroll a partners
  const scrollToPartners = () => {
    const partnersSection = document.getElementById('team');
    if (partnersSection) {
      partnersSection.scrollIntoView({ behavior: 'smooth' });
    }
    handleMenu();
  };

  // Menú de opciones estilo PS2
  const menuOptions: MenuOption[] = session?.user
    ? [
        {
          label: isProfileComplete ? '🎮 CONTINUAR' : '⚠️ COMPLETAR PERFIL',
          action: () => {
            handleMenu();
            isProfileComplete
              ? (window.location.href = '/dashboard/skaters/profile')
              : handleModal();
          },
        },
        { label: '🤝 PARTNERS', action: scrollToPartners },
        {
          label: '❓ CÓMO JUGAR',
          action: () => {
            handleMenu();
            handleVideoModal();
          },
        },
        {
          label: '👤 ' + (session.user.name?.toUpperCase() || 'JUGADOR'),
          action: null,
          isHeader: true,
        },
        {
          label: '🚪 SALIR',
          action: () => {
            handleMenu();
            signOut();
          },
        },
      ]
    : [
        {
          label: '🔐 LOGIN CON GOOGLE',
          action: () => {
            handleMenu();
            signIn('google');
          },
          isPrimary: true,
        },
        {
          label: '📧 LOGIN CON EMAIL',
          action: () => {
            handleMenu();
            setShowLoginForm(true);
          },
        },
        {
          label: '✍️ CREAR CUENTA',
          action: () => {
            handleMenu();
            setShowRegisterForm(true);
          },
        },
        { label: '🤝 PARTNERS', action: scrollToPartners },
        {
          label: '❓ CÓMO JUGAR',
          action: () => {
            handleMenu();
            handleVideoModal();
          },
        },
      ];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cerrar modales con ESC
      if (e.key === 'Escape') {
        if (openMenu) handleMenu();
        else if (openModal) handleModal();
        else if (openVideoModal) handleVideoModal();
        return;
      }

      // Navegación de menú solo si está abierto y no hay otros modales
      if (openMenu && !openModal && !openVideoModal) {
        if (e.key === 'ArrowUp') {
          setSelectedOption((prev) =>
            prev > 0 ? prev - 1 : menuOptions.length - 1
          );
        } else if (e.key === 'ArrowDown') {
          setSelectedOption((prev) =>
            prev < menuOptions.length - 1 ? prev + 1 : 0
          );
        } else if (e.key === 'Enter') {
          const option = menuOptions[selectedOption];
          if (option.action && !option.isHeader) option.action();
        }
      }
    };

    // Escuchar evento de botones arcade
    const handleArcadeStart = () => {
      if (!openMenu && !openModal && !openVideoModal) {
        handleMenu();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('arcade-press-start', handleArcadeStart);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('arcade-press-start', handleArcadeStart);
    };
  }, [selectedOption, menuOptions, openMenu, openModal, openVideoModal]);

  return (
    <>
      {/* Menú Modal Estilo PS2/Xbox */}
      {openMenu && (
        <ModalPortal>
        <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-[9999] p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-black border-4 border-cyan-400 rounded-lg shadow-2xl shadow-cyan-500/50 relative my-auto max-h-[90vh] flex flex-col">
            {/* Header del menú */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 md:p-6 rounded-t-lg border-b-4 border-cyan-300 flex-shrink-0">
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest text-center animate-pulse">
                {session?.user ? 'JUGADOR ACTIVO' : 'MAIN MENU'}
              </h2>
              {session?.user && (
                <p className="text-cyan-200 text-xs md:text-sm mt-2 text-center">
                  ⚡{' '}
                  {profileStatus === 'complete'
                    ? 'PERFIL COMPLETO'
                    : 'PERFIL BÁSICO'}
                </p>
              )}
            </div>

            {/* Botón de cerrar */}
            <button
              onClick={handleMenu}
              className="absolute top-2 right-2 z-10 bg-red-600 hover:bg-red-700 text-white font-bold w-10 h-10 rounded-full border-4 border-white shadow-lg transform hover:scale-110 transition-all"
            >
              ✖
            </button>

            {/* Opciones del menú - Con scroll interno */}
            <div className="p-6 space-y-2 overflow-y-auto flex-1">
              {menuOptions.map((option, index) => {
                const isSelected = index === selectedOption;
                const isHeader = option.isHeader;
                const isPrimary = option.isPrimary;

                return (
                  <button
                    key={index}
                    onClick={() =>
                      !isHeader && option.action && option.action()
                    }
                    onMouseEnter={() => setSelectedOption(index)}
                    disabled={isHeader}
                    className={`w-full text-left px-4 py-3 md:py-4 rounded-lg font-black uppercase tracking-wider transition-all duration-200 ${
                      isHeader
                        ? 'bg-purple-900/50 text-purple-300 cursor-default border-2 border-purple-700'
                        : isPrimary
                        ? isSelected
                          ? 'bg-gradient-to-r from-green-600 to-cyan-600 text-white scale-105 shadow-lg shadow-green-500/50 border-4 border-white'
                          : 'bg-gradient-to-r from-green-700 to-cyan-700 text-white hover:scale-105 border-4 border-green-400'
                        : isSelected
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white scale-105 shadow-lg shadow-cyan-500/50 border-4 border-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-4 border-slate-600 hover:border-cyan-500'
                    } text-sm md:text-base`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={
                          isSelected && !isHeader ? 'animate-pulse' : ''
                        }
                      >
                        {isSelected && !isHeader ? '▶ ' : '　'}
                        {option.label}
                      </span>
                      {isSelected && !isHeader && (
                        <span className="text-xs md:text-sm opacity-75">
                          ENTER
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer con controles */}
            <div className="p-4 border-t-4 border-slate-700 bg-slate-900/50 rounded-b-lg text-center flex-shrink-0">
              <p className="text-cyan-300 text-[10px] md:text-xs uppercase tracking-wide">
                ⌨️ Use ↑↓ para navegar　|　Enter para seleccionar　|　ESC para
                cerrar
              </p>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Modal para completar el registro */}
      {openModal && (
        <ModalPortal>
        <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-[9999] p-4">
          <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-black border-4 border-purple-500 rounded-lg shadow-2xl shadow-purple-500/50 relative">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-lg border-b-4 border-purple-300">
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider text-center">
                ⚡ COMPLETAR PERFIL
              </h2>
            </div>

            {/* Botón de cerrar */}
            <button
              onClick={handleModal}
              className="absolute top-2 right-2 z-10 bg-red-600 hover:bg-red-700 text-white font-bold w-10 h-10 rounded-full border-4 border-white shadow-lg transform hover:scale-110 transition-all"
            >
              ✖
            </button>

            {/* Contenido del modal */}
            <div className="p-6">
              <SkateProfileCompletionModal
                openModal={openModal}
                handleModal={handleModal}
              />
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Modal para el video */}
      {openVideoModal && (
        <ModalPortal>
        <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-[9999] p-4">
          <div className="w-full max-w-4xl bg-gradient-to-b from-slate-900 to-black border-4 border-cyan-500 rounded-lg shadow-2xl shadow-cyan-500/50 relative">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 rounded-t-lg border-b-4 border-cyan-300">
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider text-center">
                📺 CÓMO JUGAR
              </h2>
            </div>

            {/* Botón de cerrar */}
            <button
              onClick={handleVideoModal}
              className="absolute top-2 right-2 z-10 bg-red-600 hover:bg-red-700 text-white font-bold w-10 h-10 rounded-full border-4 border-white shadow-lg transform hover:scale-110 transition-all"
            >
              ✖
            </button>

            {/* Contenido del modal */}
            <div className="p-6">
              <div
                className="relative w-full"
                style={{ paddingBottom: '56.25%' }}
              >
                <video
                  className="absolute top-0 left-0 w-full h-full rounded-lg border-4 border-slate-700"
                  src="/demo.mp4"
                  autoPlay
                  controls
                  onEnded={handleVideoModal}
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-cyan-300 text-sm uppercase tracking-wide">
                  ⌨️ Presiona ESC para cerrar
                </p>
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Modal para establecer contraseña (usuarios de Google) */}
      <SetPasswordModal
        isOpen={openSetPasswordModal}
        onClose={() => setOpenSetPasswordModal(false)}
        onSuccess={() => {
          // Recargar la sesión para actualizar hasPassword
          window.location.reload();
        }}
      />

      {/* Modal para Login con Email */}
      <LoginEmailForm
        isOpen={showLoginForm}
        onClose={() => setShowLoginForm(false)}
        onSuccess={() => {
          setShowLoginForm(false);
          window.location.reload(); // Recargar para mostrar el badge
        }}
        onSwitchToRegister={() => {
          setShowLoginForm(false);
          setShowRegisterForm(true);
        }}
      />

      {/* Modal para Registro con Email */}
      <RegisterEmailForm
        isOpen={showRegisterForm}
        onClose={() => setShowRegisterForm(false)}
        onSuccess={() => {
          setShowRegisterForm(false);
          window.location.reload(); // Recargar para mostrar el badge
        }}
        onSwitchToLogin={() => {
          setShowRegisterForm(false);
          setShowLoginForm(true);
        }}
      />

      {/* User Score Badge - Mostrar cuando el usuario está logeado */}
      {session?.user && <UserScoreBadge />}
    </>
  );
};

export default SigninButton;
