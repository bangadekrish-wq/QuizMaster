import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  FolderKanban,
  Trophy,
  BarChart3,
  Settings as SettingsIcon,
  User as UserIcon,
  LogOut,
  Compass,
  History,
  X,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { role, logout } = useAuth();
  const location = useLocation();

  const isAdmin = role === 'ADMIN';

  const adminNav = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    {
      section: 'MANAGE',
      items: [
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Quizzes', path: '/admin/quizzes', icon: BookOpen },
        { label: 'Categories', path: '/admin/categories', icon: FolderKanban },
        { label: 'Leaderboard', path: '/admin/leaderboard', icon: Trophy },
      ],
    },
    {
      section: 'ANALYTICS',
      items: [
        { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
      ],
    },
    {
      section: 'SETTINGS',
      items: [
        { label: 'Profile', path: '/admin/profile', icon: UserIcon },
        { label: 'Settings', path: '/admin/settings', icon: SettingsIcon },
      ],
    },
  ];

  const studentNav = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    {
      section: 'DISCOVER',
      items: [
        { label: 'Explore Quizzes', path: '/student/quizzes', icon: Compass },
      ],
    },
    {
      section: 'MY LEARNING',
      items: [
        { label: 'Attempt History', path: '/student/attempts', icon: History },
        { label: 'Leaderboard', path: '/student/leaderboard', icon: Trophy },
      ],
    },
    {
      section: 'ACCOUNT',
      items: [
        { label: 'My Profile', path: '/student/profile', icon: UserIcon },
        { label: 'Settings', path: '/student/settings', icon: SettingsIcon },
      ],
    },
  ];

  const currentNav = isAdmin ? adminNav : studentNav;

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={() => {
          if (onClose) onClose();
        }}
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-ms text-sm font-medium transition-all duration-200 group relative ${
          isActive
            ? 'bg-brand-cyan/15 text-brand-cyanLight active-nav-glow font-semibold border-l-2 border-brand-cyan'
            : 'text-slate-400 hover:text-slate-100 hover:bg-dark-card/60'
        }`}
      >
        <Icon
          className={`w-4 h-4 transition-colors ${
            isActive ? 'text-brand-cyan' : 'text-slate-400 group-hover:text-slate-200'
          }`}
        />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-60 bg-dark-sidebar border-r border-dark-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Section */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-dark-border/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-ms bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan shadow-ms-glow">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-100 tracking-tight block leading-none">
                Quiz<span className="text-brand-cyan">Master</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mt-0.5">
                Assessment Platform
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-slate-400 hover:text-white rounded-ms"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {currentNav.map((entry, idx) => {
            if (entry.section) {
              return (
                <div key={idx} className="space-y-1">
                  <div className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {entry.section}
                  </div>
                  {entry.items.map((item) => renderNavItem(item))}
                </div>
              );
            }
            return renderNavItem(entry);
          })}
        </div>

        {/* Footer User & Logout */}
        <div className="p-4 border-t border-dark-border bg-dark-sidebar/90">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-brand-redLight hover:bg-brand-red/10 rounded-ms transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
