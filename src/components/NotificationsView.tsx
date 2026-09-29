import React, { useState } from 'react';
import { ActiveTab } from '../types';

interface NotificationsViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onClearUnread: () => void;
  setActiveCategoryFilter: (cat: string) => void;
}

interface NotificationItem {
  id: string;
  type: 'urgent' | 'reply' | 'like' | 'system';
  title: string;
  description: string;
  time: string;
  unread: boolean;
  linkCategory?: string;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  setActiveTab,
  onClearUnread,
  setActiveCategoryFilter,
}) => {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'reply'>('all');
  const [items, setItems] = useState<NotificationItem[]>([
    {
      id: 'n1',
      type: 'urgent',
      title: 'ประกาศด่วนจากนิติหอพัก',
      description: 'แจ้งซ่อมบำรุงระบบน้ำประปา อาคาร A & B วันนี้เวลา 13:00 - 16:30 น.',
      time: '10 นาทีที่แล้ว',
      unread: true,
      linkCategory: 'announcement',
    },
    {
      id: 'n2',
      type: 'reply',
      title: 'ความคิดเห็นใหม่ในกระทู้ของคุณ',
      description:
        'เจ้าหน้าที่ฝ่ายอาคาร (Verified) ได้ตอบกลับ: "แจ้งไปแล้วครับ ช่างกำลังซ่อมปั๊มน้ำ คาดว่าเสร็จ 16:30 น."',
      time: '30 นาทีที่แล้ว',
      unread: true,
      linkCategory: 'dorm',
    },
    {
      id: 'n3',
      type: 'like',
      title: 'มีผู้เห็นด้วยกับโพสต์ของคุณ',
      description: 'เพื่อนร่วมหอ 12 คนกดถูกใจกระทู้เรื่องแนะนำร้านข้าวมันไก่',
      time: '2 ชั่วโมงที่แล้ว',
      unread: false,
      linkCategory: 'food',
    },
    {
      id: 'n4',
      type: 'system',
      title: 'การยืนยันตัวตนสำเร็จ',
      description:
        'คุณได้รับการรับรองผู้พักอาศัยหอพัก 2 ชั้น 4 แล้ว รหัสนิรนามของคุณพร้อมใช้งาน',
      time: 'เมื่อวานนี้',
      unread: false,
    },
  ]);

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
    onClearUnread();
  };

  const filtered = items.filter((item) => {
    if (filter === 'urgent') return item.type === 'urgent';
    if (filter === 'reply') return item.type === 'reply';
    return true;
  });

  return (
    <div className="w-full max-w-[800px] mx-auto px-4 lg:px-8 pt-24 pb-20 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111c2d] tracking-tight">
            การแจ้งเตือน
          </h1>
          <p className="text-xs text-[#5a5e69] mt-0.5">
            ติดตามความคืบหน้าของกระทู้และประกาศสำคัญจากหอพัก
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="text-xs font-semibold text-[#4648d4] hover:underline"
        >
          อ่านทั้งหมดแล้ว
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e7eeff] pb-2 text-xs font-medium">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-[#e1e0ff] text-[#4648d4] font-bold'
              : 'text-[#5a5e69] hover:bg-[#f0f3ff]'
          }`}
        >
          ทั้งหมด
        </button>
        <button
          onClick={() => setFilter('urgent')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === 'urgent'
              ? 'bg-[#ffdad6] text-[#ba1a1a] font-bold'
              : 'text-[#5a5e69] hover:bg-[#f0f3ff]'
          }`}
        >
          ประกาศด่วน
        </button>
        <button
          onClick={() => setFilter('reply')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === 'reply'
              ? 'bg-[#e1e0ff] text-[#4648d4] font-bold'
              : 'text-[#5a5e69] hover:bg-[#f0f3ff]'
          }`}
        >
          ตอบกลับ
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (item.linkCategory) {
                setActiveCategoryFilter(item.linkCategory);
                setActiveTab('home');
              }
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
              item.unread
                ? 'bg-white border-[#c0c1ff] shadow-xs'
                : 'bg-white/70 border-[#e7eeff]'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  item.type === 'urgent'
                    ? 'bg-[#ffdad6] text-[#ba1a1a]'
                    : item.type === 'reply'
                    ? 'bg-[#e1e0ff] text-[#4648d4]'
                    : item.type === 'like'
                    ? 'bg-[#e7eeff] text-[#6063ee]'
                    : 'bg-[#f7fff3] text-[#006b2d]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.type === 'urgent'
                    ? 'campaign'
                    : item.type === 'reply'
                    ? 'chat_bubble'
                    : item.type === 'like'
                    ? 'thumb_up'
                    : 'verified_user'}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#111c2d]">{item.title}</span>
                  {item.unread && (
                    <span className="w-2 h-2 rounded-full bg-[#4648d4]"></span>
                  )}
                </div>
                <p className="text-xs text-[#5a5e69] leading-relaxed">{item.description}</p>
                <span className="text-[10px] text-[#5a5e69] mt-1">{item.time}</span>
              </div>
            </div>

            <span className="material-symbols-outlined text-[18px] text-[#5a5e69]">
              chevron_right
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
