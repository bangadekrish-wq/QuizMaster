import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../common/SearchBar';
import { Avatar } from '../common/Avatar';
import { Dropdown } from '../common/Dropdown';
import { Badge } from '../common/Badge';
import {
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
} from 'lucide-react';

export const Topbar = ({ onMenuClick }) => {
  const { user, role, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (role === 'ADMIN') {
        navigate(`/admin/quizzes?search=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/student/quizzes?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const userDropdownItems = [
    {
      label: 'My Profile',
      icon: User,
      onClick: () => navigate(role === 'ADMIN' ? '/admin/profile' : '/student/profile'),
    },
    {
      label: 'Settings',
      icon: Settings,
      onClick: () => navigate(role === 'ADMIN' ? '/admin/settings' : '/student/settings'),
    },
    { divider: true },
    {
      label: 'Logout',
      icon: LogOut,
      danger: true,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <header className="h-16 bg-dark-sidebar/80 backdrop-blur-md border-b border-dark-border sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-ms hover:bg-dark-card transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="w-full max-w-md" onKeyDown={handleSearchSubmit}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search quizzes, categories, students, topics..."
          />
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-dark-card rounded-ms transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-cyan rounded-full animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-cyan rounded-full" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-dark-elevated border border-dark-borderLight rounded-ms-lg shadow-2xl p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-dark-border mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Notifications
                </span>
                <span className="text-[10px] bg-brand-cyan/20 text-brand-cyan px-2 py-0.5 rounded-full font-bold">
                  3 New
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2 rounded bg-dark-card border border-dark-border hover:bg-dark-cardHover transition-colors cursor-pointer">
                  <p className="font-semibold text-slate-200">New Quiz Published</p>
                  <p className="text-slate-400 mt-0.5">React Hooks & State Management is live.</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">10 mins ago</span>
                </div>
                <div className="p-2 rounded bg-dark-card border border-dark-border hover:bg-dark-cardHover transition-colors cursor-pointer">
                  <p className="font-semibold text-slate-200">Leaderboard Update</p>
                  <p className="text-slate-400 mt-0.5">You moved up to Rank #2 this week!</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">2 hours ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-dark-border hidden sm:block" />

        {/* User Profile Dropdown */}
        <Dropdown
          trigger={
            <div className="flex items-center gap-3 p-1 rounded-ms hover:bg-dark-card border border-transparent hover:border-dark-border transition-all cursor-pointer select-none">
              <Avatar src={user?.avatar} name={user?.name || 'User'} size="sm" />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-100 leading-tight">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {role === 'ADMIN' ? 'Administrator' : 'Student'}
                </span>
              </div>
              <Badge variant={role === 'ADMIN' ? 'purple' : 'cyan'} size="sm" className="hidden md:inline-flex">
                {role}
              </Badge>
            </div>
          }
          items={userDropdownItems}
        />
      </div>
    </header>
  );
};
