'use client'
import React, { useMemo, useEffect, useState } from 'react'
import Image from 'next/image'
import { SidebarMenuItem } from './SidebarMenuItem';
import { MdOutlineSkateboarding, MdGavel, MdAdminPanelSettings, MdLeaderboard, MdGroups, MdLogout, MdSettings } from "react-icons/md";
import { GiSkateboard } from "react-icons/gi";
import { GiTrophy } from "react-icons/gi";
import { FaVideo } from "react-icons/fa";
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';


const skaterMenuItems = [
  {
    path: '/dashboard/skaters/profile',
    icon: <MdOutlineSkateboarding size={28} />,
    title: 'Perfil',
    subTitle: 'editar perfil'
  },
  {
    path: '/dashboard/skaters/tricks',
    icon: <GiSkateboard size={28} />,
    title: 'Trucos',
    subTitle: 'trucos en curso'
  },
  {
    path: '/dashboard/skaters/submissions',
    icon: <FaVideo size={28} />,
    title: 'Submissions',
    subTitle: 'historial'
  },
  {
    path: '/dashboard/leaderboard',
    icon: <MdLeaderboard size={28} />,
    title: 'Ranking',
    subTitle: 'top skaters'
  },
  {
    path: '/dashboard/teams',
    icon: <MdGroups size={28} />,
    title: 'Equipos',
    subTitle: 'mi equipo'
  },
  {
    path: '/dashboard/skaters/logros',
    icon: <GiTrophy size={28} />,
    title: 'Logros',
    subTitle: 'achievements'
  }
]

const judgeMenuItems = [
  {
    path: '/dashboard/judges/evaluate',
    icon: <MdGavel size={28} />,
    title: 'Evaluar',
    subTitle: 'pendientes e historial'
  },
  {
    path: '/dashboard/skaters/profile',
    icon: <MdOutlineSkateboarding size={28} />,
    title: 'Perfil',
    subTitle: 'editar perfil'
  },
  {
    path: '/dashboard/skaters/tricks',
    icon: <GiSkateboard size={28} />,
    title: 'Trucos',
    subTitle: 'como skater'
  },
  {
    path: '/dashboard/leaderboard',
    icon: <MdLeaderboard size={28} />,
    title: 'Ranking',
    subTitle: 'top skaters'
  },
  {
    path: '/dashboard/teams',
    icon: <MdGroups size={28} />,
    title: 'Equipos',
    subTitle: 'mi equipo'
  }
]

const adminMenuItems = [
  {
    path: '/dashboard/admin/users',
    icon: <MdAdminPanelSettings size={28} />,
    title: 'Usuarios',
    subTitle: 'gestionar'
  },
  {
    path: '/dashboard/admin/challenges',
    icon: <GiSkateboard size={28} />,
    title: 'Desafíos',
    subTitle: 'gestionar'
  },
  {
    path: '/dashboard/admin/settings',
    icon: <MdSettings size={28} />,
    title: 'Configuración',
    subTitle: 'sistema'
  },
  {
    path: '/dashboard/judges/evaluate',
    icon: <MdGavel size={28} />,
    title: 'Evaluar',
    subTitle: 'calificar'
  },
  {
    path: '/dashboard/leaderboard',
    icon: <MdLeaderboard size={28} />,
    title: 'Ranking',
    subTitle: 'top skaters'
  },
  {
    path: '/dashboard/teams',
    icon: <MdGroups size={28} />,
    title: 'Equipos',
    subTitle: 'gestionar'
  }
]


export const Sidebar = () => {
  const { data: session, status } = useSession();
  const [totalScore, setTotalScore] = useState(0);

  // Determinar qué menú mostrar según el rol
  const menuItems = useMemo(() => {
    const userRole = session?.user?.role || 'skater';

    if (userRole === 'admin') {
      return adminMenuItems;
    } else if (userRole === 'judge') {
      return judgeMenuItems;
    } else {
      return skaterMenuItems;
    }
  }, [session?.user?.role]);

  // Obtener el score total del usuario
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      const fetchScore = async () => {
        try {
          const response = await fetch(`/api/users/score?email=${session.user?.email}`);
          if (response.ok) {
            const data = await response.json();
            setTotalScore(data.totalScore || 0);
          }
        } catch (error) {
          console.error('Error fetching score:', error);
        }
      };
      fetchScore();
    }
  }, [status, session?.user?.email]);

  // Obtener el badge del rol
  const getRoleBadge = () => {
    const userRole = session?.user?.role || 'skater';

    if (userRole === 'admin') {
      return (
        <span className="text-xs bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-wider shadow-lg shadow-red-500/50">
          ADMIN
        </span>
      );
    } else if (userRole === 'judge') {
      return (
        <span className="text-xs bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-3 py-1 rounded-full font-black uppercase tracking-wider shadow-lg shadow-yellow-500/50">
          JUEZ
        </span>
      );
    }
    return (
      <span className="text-xs bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-wider shadow-lg shadow-cyan-500/50">
        SKATER
      </span>
    );
  };

  return (
    <div
      id="menu"
      className="bg-slate-900 min-h-auto lg:min-h-screen z-10 text-slate-300 w-full lg:w-72 left-0 overflow-y-auto border-r-4 border-slate-800"
    >
      {/* Logo Header con estilo arcade */}
      <div className="p-4">
        <Link href="/">
          <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-[3px] rounded-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all cursor-pointer">
            <div className="bg-slate-900 rounded-lg p-4">
              <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 uppercase tracking-wider text-center">
                🛹 TRICKEST
              </h1>
              <p className="text-cyan-400 text-xs text-center font-bold uppercase tracking-wider mt-1">
                2025 Skaters
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Score Card */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-[3px] rounded-lg">
          <div className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Tu Score</p>
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              {totalScore}
            </p>
          </div>
        </div>
      </div>

      {/* Perfil del usuario */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-[3px] rounded-lg">
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-2">
              Bienvenido
            </p>
            {status === "loading" ? (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur-sm"></div>
                  <Image
                    className="relative rounded-full w-12 h-12 border-2 border-white"
                    src={session?.user?.image || "/logo.png"}
                    alt="User avatar"
                    width={48}
                    height={48}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-black text-white uppercase tracking-wide truncate max-w-[140px]">
                    {session?.user?.name || 'Skater'}
                  </span>
                  {getRoleBadge()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menú de navegación */}
      <div className="px-4 pb-4">
        <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-3 px-2">
          Navegación
        </p>
        <div className="space-y-2">
          {menuItems.map(item => (
            <SidebarMenuItem key={item.path} {...item} />
          ))}
        </div>
      </div>

      {/* Botón de Logout */}
      <div className="px-4 pb-6 mt-auto">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 p-[3px] rounded-lg shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all"
        >
          <div className="bg-slate-900 rounded-lg px-4 py-3 flex items-center gap-3 hover:bg-slate-800 transition-all">
            <MdLogout size={24} className="text-red-400" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-black text-white uppercase tracking-wide">
                Cerrar Sesión
              </span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                Logout
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
