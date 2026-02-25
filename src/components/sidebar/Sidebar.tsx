'use client'
import React, { useMemo } from 'react'
import { SidebarMenuItem } from './SidebarMenuItem';
import { MdOutlineSkateboarding, MdGavel, MdAdminPanelSettings, MdLeaderboard, MdGroups, MdLogout, MdSettings } from "react-icons/md";
import { GiSkateboard } from "react-icons/gi";
import { GiTrophy } from "react-icons/gi";
import { FaVideo } from "react-icons/fa";
import { useSession, signOut } from 'next-auth/react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';


export const Sidebar = () => {
  const { data: session } = useSession();
  const t = useTranslations();

  // Menu items with translation keys
  const skaterMenuItems = useMemo(() => [
    {
      path: '/dashboard/skaters/profile',
      icon: <MdOutlineSkateboarding size={28} />,
      title: t('menu.profile'),
      subTitle: t('menu.editProfile')
    },
    {
      path: '/dashboard/skaters/tricks',
      icon: <GiSkateboard size={28} />,
      title: t('menu.tricks'),
      subTitle: t('menu.inProgress')
    },
    {
      path: '/dashboard/skaters/submissions',
      icon: <FaVideo size={28} />,
      title: t('menu.submissions'),
      subTitle: t('menu.history')
    },
    {
      path: '/dashboard/leaderboard',
      icon: <MdLeaderboard size={28} />,
      title: t('menu.ranking'),
      subTitle: t('menu.topSkaters')
    },
    {
      path: '/dashboard/teams',
      icon: <MdGroups size={28} />,
      title: t('menu.teams'),
      subTitle: t('menu.myTeam')
    },
    {
      path: '/dashboard/skaters/logros',
      icon: <GiTrophy size={28} />,
      title: t('menu.achievements'),
      subTitle: t('menu.badges')
    }
  ], [t]);

  const judgeMenuItems = useMemo(() => [
    {
      path: '/dashboard/judges/evaluate',
      icon: <MdGavel size={28} />,
      title: t('menu.evaluate'),
      subTitle: t('menu.pendingHistory')
    },
    {
      path: '/dashboard/skaters/profile',
      icon: <MdOutlineSkateboarding size={28} />,
      title: t('menu.profile'),
      subTitle: t('menu.editProfile')
    },
    {
      path: '/dashboard/skaters/tricks',
      icon: <GiSkateboard size={28} />,
      title: t('menu.tricks'),
      subTitle: t('menu.asSkater')
    },
    {
      path: '/dashboard/leaderboard',
      icon: <MdLeaderboard size={28} />,
      title: t('menu.ranking'),
      subTitle: t('menu.topSkaters')
    },
    {
      path: '/dashboard/teams',
      icon: <MdGroups size={28} />,
      title: t('menu.teams'),
      subTitle: t('menu.myTeam')
    }
  ], [t]);

  const adminMenuItems = useMemo(() => [
    {
      path: '/dashboard/admin/users',
      icon: <MdAdminPanelSettings size={28} />,
      title: t('menu.users'),
      subTitle: t('menu.manage')
    },
    {
      path: '/dashboard/admin/challenges',
      icon: <GiSkateboard size={28} />,
      title: t('menu.challenges'),
      subTitle: t('menu.manage')
    },
    {
      path: '/dashboard/admin/settings',
      icon: <MdSettings size={28} />,
      title: t('menu.settings'),
      subTitle: t('menu.system')
    },
    {
      path: '/dashboard/judges/evaluate',
      icon: <MdGavel size={28} />,
      title: t('menu.evaluate'),
      subTitle: t('menu.score')
    },
    {
      path: '/dashboard/leaderboard',
      icon: <MdLeaderboard size={28} />,
      title: t('menu.ranking'),
      subTitle: t('menu.topSkaters')
    },
    {
      path: '/dashboard/teams',
      icon: <MdGroups size={28} />,
      title: t('menu.teams'),
      subTitle: t('menu.manage')
    }
  ], [t]);

  // Determine which menu to show based on role
  const menuItems = useMemo(() => {
    const userRole = session?.user?.role || 'skater';

    if (userRole === 'admin') {
      return adminMenuItems;
    } else if (userRole === 'judge') {
      return judgeMenuItems;
    } else {
      return skaterMenuItems;
    }
  }, [session?.user?.role, adminMenuItems, judgeMenuItems, skaterMenuItems]);

  return (
    <div
      id="menu"
      className="bg-neutral-900 min-h-auto lg:min-h-screen z-10 text-neutral-300 w-full lg:w-72 left-0 overflow-y-auto border-r-4 border-neutral-800"
    >
      {/* Logo Header with arcade style */}
      <div className="p-4">
        <Link href="/">
          <div className="bg-gradient-to-r from-accent-cyan-500 to-accent-purple-600 p-[3px] rounded-lg shadow-lg shadow-accent-cyan-500/30 hover:shadow-accent-cyan-500/50 transition-all cursor-pointer">
            <div className="bg-neutral-900 rounded-lg p-4">
              <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan-400 to-accent-purple-400 uppercase tracking-wider text-center">
                🛹 TRICKEST
              </h1>
              <p className="text-accent-cyan-400 text-xs text-center font-bold uppercase tracking-wider mt-1">
                2025 Skaters
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation menu */}
      <div className="px-4 pb-4">
        <p className="text-neutral-500 text-xs uppercase font-bold tracking-wider mb-3 px-2">
          {t('sidebar.navigation')}
        </p>
        <div className="space-y-2">
          {menuItems.map(item => (
            <SidebarMenuItem key={item.path} {...item} />
          ))}
        </div>
      </div>

      {/* Logout button */}
      <div className="px-4 pb-6 mt-auto">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full bg-gradient-to-r from-red-500 to-accent-pink-500 hover:from-red-400 hover:to-accent-pink-400 p-[3px] rounded-lg shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all"
        >
          <div className="bg-neutral-900 rounded-lg px-4 py-3 flex items-center gap-3 hover:bg-neutral-800 transition-all">
            <MdLogout size={24} className="text-red-400" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-black text-white uppercase tracking-wide">
                {t('auth.signOut')}
              </span>
              <span className="text-xs text-neutral-400 uppercase tracking-wider">
                {t('auth.logout')}
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
