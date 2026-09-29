import React from 'react';
import { ActiveTab, UserProfile } from '../types';
import { AVATAR_URL } from '../data/mockData';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: UserProfile;
  unreadNotificationsCount: number;
  onOpenCreatePost: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  user,
  unreadNotificationsCount,
  onOpenCreatePost,
  searchQuery,
  setSearchQuery,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#ffffff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e7eeff]">
      <div className="h-20 max-w-[1280px] mx-auto px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#4648d4] group-hover:bg-[#6063ee] transition-colors flex items-center justify-center text-white font-bold text-xl shadow-sm">
              ห
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[#111c2d] tracking-tight leading-none text-base">
                หอคุย
              </span>
              <span className="text-xs font-semibold text-[#4648d4] tracking-wide leading-none mt-1">
                DormTalk
              </span>
            </div>
          </button>

          {/* Privacy Trust Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f3ff] text-[#464554] text-xs font-medium border border-[#dee8ff]">
            <span
              className="material-symbols-outlined text-[16px] text-[#006b2d]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
            <span>พื้นที่ปลอดภัย ไม่เปิดเผยชื่อจริง</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-3 items-center relative">
          <span className="material-symbols-outlined absolute left-3.5 text-[#5a5e69] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (activeTab !== 'categories' && activeTab !== 'home') {
                setActiveTab('categories');
              }
            }}
            placeholder="ค้นหาโพสต์หรือหัวข้อ... เช่น 'น้ำไม่ไหล'"
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#f0f3ff] text-[#111c2d] placeholder:text-[#5a5e69] text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:bg-white transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-[#5a5e69] hover:text-[#111c2d]"
              title="Clear search"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Navigation & User Actions */}
        <div className="flex items-center gap-2">
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'home'
                  ? 'bg-[#6063ee] text-white font-semibold shadow-sm'
                  : 'text-[#464554] hover:bg-[#dee8ff] hover:text-[#111c2d]'
              }`}
            >
              หน้าหลัก
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'categories'
                  ? 'bg-[#6063ee] text-white font-semibold shadow-sm'
                  : 'text-[#464554] hover:bg-[#dee8ff] hover:text-[#111c2d]'
              }`}
            >
              หมวดหมู่
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'notifications'
                  ? 'bg-[#6063ee] text-white font-semibold shadow-sm'
                  : 'text-[#464554] hover:bg-[#dee8ff] hover:text-[#111c2d]'
              }`}
            >
              การแจ้งเตือน
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#6063ee] text-white font-semibold shadow-sm'
                  : 'text-[#464554] hover:bg-[#dee8ff] hover:text-[#111c2d]'
              }`}
            >
              การตั้งค่า
            </button>

            <button
              onClick={() => setActiveTab('verify')}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'verify'
                  ? 'bg-[#6063ee] text-white font-semibold shadow-sm'
                  : 'text-[#464554] hover:bg-[#dee8ff] hover:text-[#111c2d]'
              }`}
            >
              ยืนยันตัวตน
            </button>

            <button
              onClick={() => setActiveTab('login')}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'login'
                  ? 'bg-[#6063ee] text-white font-semibold shadow-sm'
                  : 'text-[#464554] hover:bg-[#dee8ff] hover:text-[#111c2d]'
              }`}
            >
              เข้าสู่ระบบ
            </button>
          </nav>

          {/* User Tag & Buttons */}
          <div className="flex items-center gap-2 pl-1">
            <div
              onClick={() => setActiveTab('settings')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#dee2ef] text-[#424751] text-xs font-medium cursor-pointer hover:bg-[#c2c6d3] transition-colors"
              title="คลิกเพื่อไปที่การตั้งค่ารหัสนิรนาม"
            >
              <span className="w-2 h-2 rounded-full bg-[#4648d4] animate-pulse"></span>
              <span>สมาชิกนิรนาม {user.anonymousTag}</span>
            </div>

            {/* Theme Quick Toggle */}
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                aria-label="Toggle Theme"
                title={darkMode ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
                className="p-2 rounded-xl hover:bg-[#dee8ff] text-[#464554] hover:text-[#111c2d] transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">
                  {darkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => setActiveTab('notifications')}
              aria-label="Notifications"
              className="relative p-2 rounded-xl hover:bg-[#dee8ff] text-[#464554] hover:text-[#111c2d] transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#ba1a1a] ring-2 ring-white"></span>
              )}
            </button>

            {/* Create Post Button */}
            <button
              onClick={onOpenCreatePost}
              className="hidden sm:flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#4648d4] text-white hover:bg-[#6063ee] text-sm font-medium transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>สร้างโพสต์</span>
            </button>

            {/* User Profile Avatar */}
            <button
              onClick={() => setActiveTab('settings')}
              className="focus:outline-none rounded-full ring-2 ring-[#4648d4]/30 hover:ring-[#4648d4] transition-all"
              title="โปรไฟล์และการตั้งค่า"
            >
              <img
                src={AVATAR_URL}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
