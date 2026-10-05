import React from 'react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCreatePost: () => void;
  unreadCount: number;
  isAdmin?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreatePost,
  unreadCount,
  isAdmin,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#c7c4d7]/40 px-2 py-1.5 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      <nav className="flex items-center justify-around">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center py-1 px-2.5 ${
            activeTab === 'home' ? 'text-[#4648d4] font-semibold' : 'text-[#464554]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span className="text-[10px] leading-tight mt-0.5">หน้าหลัก</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex flex-col items-center py-1 px-2.5 ${
            activeTab === 'categories' ? 'text-[#4648d4] font-semibold' : 'text-[#464554]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">category</span>
          <span className="text-[10px] leading-tight mt-0.5">หมวดหมู่</span>
        </button>

        {/* Floating Add Post Center */}
        <button
          onClick={onOpenCreatePost}
          className="flex flex-col items-center -mt-5"
          aria-label="สร้างโพสต์"
        >
          <div className="w-11 h-11 rounded-full bg-[#4648d4] text-white flex items-center justify-center shadow-lg hover:bg-[#6063ee] active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[24px]">add</span>
          </div>
          <span className="text-[10px] text-[#464554] mt-1">โพสต์</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`relative flex flex-col items-center py-1 px-2.5 ${
            activeTab === 'notifications' ? 'text-[#4648d4] font-semibold' : 'text-[#464554]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
          )}
          <span className="text-[10px] leading-tight mt-0.5">แจ้งเตือน</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center py-1 px-2.5 ${
            activeTab === 'admin' ? 'text-[#ba1a1a] font-bold' : 'text-[#ba1a1a]/70'
          }`}
          title="แอดมิน"
        >
          <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
          <span className="text-[10px] leading-tight mt-0.5 font-bold">นิติ/แอดมิน</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center py-1 px-2.5 ${
            activeTab === 'settings' ? 'text-[#4648d4] font-semibold' : 'text-[#464554]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
          <span className="text-[10px] leading-tight mt-0.5">ตั้งค่า</span>
        </button>
      </nav>
    </div>
  );
};
