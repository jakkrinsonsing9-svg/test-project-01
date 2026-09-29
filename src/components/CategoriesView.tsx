import React, { useState } from 'react';
import { CATEGORIES } from '../data/mockData';
import { ActiveTab, PostItem } from '../types';

interface CategoriesViewProps {
  posts: PostItem[];
  onOpenCreatePost: () => void;
  onLikePost: (postId: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setActiveCategoryFilter: (cat: string) => void;
  onOpenReportModal: (title: string) => void;
  initialSearchQuery?: string;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  posts,
  onOpenCreatePost,
  onLikePost,
  setActiveTab,
  setActiveCategoryFilter,
  onOpenReportModal,
  initialSearchQuery = '',
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>('maintenance');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeChip, setActiveChip] = useState<string>('#ซ่อมด่วน');
  const [showFilters, setShowFilters] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'matching' | 'empty' | 'skeleton'>('matching');
  const [errorRetrying, setErrorRetrying] = useState(false);

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    if (selectedCatId && p.categoryKey !== selectedCatId) {
      // allow matching if user searches
      if (!searchQuery.trim() && activeChip !== '#ซ่อมด่วน') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.content.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleRetry = () => {
    setErrorRetrying(true);
    setTimeout(() => {
      setErrorRetrying(false);
      setActiveSubTab('matching');
    }, 800);
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 lg:px-8 pt-24 pb-20 flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111c2d] tracking-tight">
          สำรวจตามหมวดหมู่
        </h1>
        <p className="text-sm text-[#5a5e69]">
          ค้นหาข้อมูล แจ้งปัญหา หรือพูดคุยเรื่องเฉพาะทางในหอพักได้อย่างตรงจุด
        </p>
      </div>

      {/* Search & Filter Command Bar */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 sm:p-5 border border-[#e7eeff] shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#5a5e69] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตามหัวข้อ เช่น #น้ำไม่ไหล, พัสดุ, ส่งต่อของ..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#f0f3ff] text-sm text-[#111c2d] placeholder:text-[#5a5e69] focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="h-11 px-4 rounded-xl bg-[#f0f3ff] hover:bg-[#dee8ff] text-xs font-semibold text-[#4648d4] flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>ตัวกรอง (2)</span>
            </button>

            {/* Found badge */}
            <div className="h-11 px-3.5 rounded-xl bg-[#dee2ef] text-xs font-semibold text-[#424751] flex items-center">
              <span>พบ {filteredPosts.length > 0 ? filteredPosts.length : 12} โพสต์ที่เกี่ยวข้อง</span>
            </div>
          </div>
        </div>

        {/* Quick Tag Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs text-[#5a5e69] shrink-0 font-medium">แท็กยอดนิยม:</span>
          {['#ซ่อมด่วน', '#ส่งต่อตู้เย็น', '#พัสดุหาย', '#หมูกระทะหน้าหอ'].map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setActiveChip(activeChip === chip ? '' : chip);
                if (chip === '#ซ่อมด่วน') setSelectedCatId('maintenance');
                if (chip === '#หมูกระทะหน้าหอ') setSelectedCatId('food');
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeChip === chip
                  ? 'bg-[#4648d4] text-white shadow-xs'
                  : 'bg-[#f0f3ff] text-[#464554] hover:bg-[#dee8ff]'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Optional Collapsible Filter Details */}
        {showFilters && (
          <div className="pt-3 border-t border-[#f0f3ff] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150">
            <div>
              <span className="font-semibold text-[#111c2d] block mb-1">ช่วงเวลา</span>
              <select className="w-full h-8 px-2 rounded-lg bg-[#f0f3ff] text-xs">
                <option>24 ชั่วโมงล่าสุด</option>
                <option>7 วันล่าสุด</option>
                <option>ทั้งหมด</option>
              </select>
            </div>
            <div>
              <span className="font-semibold text-[#111c2d] block mb-1">อาคาร</span>
              <select className="w-full h-8 px-2 rounded-lg bg-[#f0f3ff] text-xs">
                <option>ทุกอาคาร</option>
                <option>หอพัก 1</option>
                <option>หอพัก 2</option>
                <option>หอพัก 3</option>
              </select>
            </div>
            <div>
              <span className="font-semibold text-[#111c2d] block mb-1">สถานะ</span>
              <select className="w-full h-8 px-2 rounded-lg bg-[#f0f3ff] text-xs">
                <option>ทั้งหมด</option>
                <option>กำลังดำเนินการ</option>
                <option>แก้ไขแล้ว</option>
              </select>
            </div>
            <div>
              <span className="font-semibold text-[#111c2d] block mb-1">การเรียงลำดับ</span>
              <select className="w-full h-8 px-2 rounded-lg bg-[#f0f3ff] text-xs">
                <option>ล่าสุด</option>
                <option>ยอดนิยม (Upvotes)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bento Grid Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCatId === cat.id;
          const isFeatured = cat.featured;

          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`relative rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between border ${
                isFeatured ? 'md:col-span-2' : ''
              } ${
                isSelected
                  ? 'bg-[#f0f3ff] border-[#4648d4] ring-2 ring-[#4648d4]/30 shadow-md'
                  : 'bg-white border-[#e7eeff] hover:border-[#c0c1ff] hover:shadow-xs'
              }`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{cat.emoji}</span>
                    <div>
                      <h3 className="font-bold text-base text-[#111c2d]">{cat.title}</h3>
                      <p className="text-xs text-[#5a5e69]">{cat.subtitle}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full bg-[#4648d4] text-white text-[10px] font-bold">
                      เลือกอยู่
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#5a5e69] leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#f0f3ff] flex items-center justify-between text-xs mt-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#111c2d]">{cat.postCount}</span>
                  <span className="text-[#5a5e69]">โพสต์</span>
                </div>

                {cat.tagSnippet && (
                  <span className="text-[11px] font-medium text-[#4648d4]">{cat.tagSnippet}</span>
                )}

                {cat.sparkline && (
                  <div className="flex items-center gap-1.5 text-[#006b2d] text-[11px] font-semibold">
                    <span>+18 วันนี้</span>
                    <svg className="w-12 h-4 text-[#00873b]" viewBox="0 0 50 20" fill="none">
                      <path
                        d="M0 16 L15 12 L30 14 L50 4"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3 Showcase Tabs (Matching Posts / Empty State / Skeleton & Error) */}
      <div className="rounded-2xl bg-white p-6 border border-[#e7eeff] shadow-xs flex flex-col gap-6">
        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b border-[#e7eeff] pb-3 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('matching')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'matching'
                  ? 'bg-[#4648d4] text-white shadow-xs'
                  : 'text-[#5a5e69] hover:bg-[#f0f3ff]'
              }`}
            >
              โพสต์ที่ตรงกัน ({filteredPosts.length > 0 ? filteredPosts.length : 12})
            </button>
            <button
              onClick={() => setActiveSubTab('empty')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'empty'
                  ? 'bg-[#4648d4] text-white shadow-xs'
                  : 'text-[#5a5e69] hover:bg-[#f0f3ff]'
              }`}
            >
              ยังไม่มีโพสต์ (Empty State Showcase)
            </button>
            <button
              onClick={() => setActiveSubTab('skeleton')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'skeleton'
                  ? 'bg-[#4648d4] text-white shadow-xs'
                  : 'text-[#5a5e69] hover:bg-[#f0f3ff]'
              }`}
            >
              Skeleton & Error States
            </button>
          </div>

          <button
            onClick={onOpenCreatePost}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#e1e0ff] text-[#4648d4] text-xs font-bold hover:bg-[#c0c1ff]"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>โพสต์ในหมวดนี้</span>
          </button>
        </div>

        {/* Tab 1: Matching Posts */}
        {activeSubTab === 'matching' && (
          <div className="flex flex-col gap-4">
            {filteredPosts.slice(0, 2).map((post) => (
              <div
                key={post.id}
                className="p-5 rounded-2xl bg-[#f9f9ff] border border-[#e7eeff] flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{post.categoryEmoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#111c2d]">{post.author}</span>
                        {post.authorBuilding && (
                          <span className="text-xs text-[#5a5e69]">• {post.authorBuilding}</span>
                        )}
                        {post.isUrgent && (
                          <span className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold">
                            ซ่อมด่วน
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#5a5e69]">{post.timeAgo}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenReportModal(post.title || post.content)}
                    className="p-1 rounded-lg text-[#5a5e69] hover:bg-[#dee8ff]"
                  >
                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                  </button>
                </div>

                {post.title && <h4 className="font-bold text-sm text-[#111c2d]">{post.title}</h4>}
                <p className="text-xs text-[#111c2d] leading-relaxed">{post.content}</p>

                {post.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-[#dee8ff] max-w-md">
                    <img
                      src={post.imageUrl}
                      alt="รูปประกอบ"
                      className="w-full h-48 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#dee8ff] text-xs text-[#5a5e69]">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => onLikePost(post.id)}
                      className={`flex items-center gap-1 hover:text-[#4648d4] ${
                        post.isLiked ? 'text-[#4648d4] font-bold' : ''
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                      <span>{post.likes}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveCategoryFilter(post.categoryKey);
                        setActiveTab('home');
                      }}
                      className="flex items-center gap-1 hover:text-[#4648d4]"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                      <span>{post.commentsCount} ความคิดเห็น</span>
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setActiveCategoryFilter(post.categoryKey);
                      setActiveTab('home');
                    }}
                    className="text-xs font-semibold text-[#4648d4] hover:underline"
                  >
                    ดูในหน้าหลัก →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Empty State Showcase */}
        {activeSubTab === 'empty' && (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#f0f3ff] text-[#4648d4] flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">chat</span>
            </div>
            <h4 className="font-bold text-base text-[#111c2d]">ยังไม่มีโพสต์ในหัวข้อนี้</h4>
            <p className="text-xs text-[#5a5e69] max-w-sm leading-relaxed">
              ร่วมเป็นคนแรกที่เปิดประเด็นพูดคุย แนะนำ หรือตั้งคำถามกับเพื่อนร่วมหอพักแบบนิรนาม
            </p>
            <button
              onClick={onOpenCreatePost}
              className="mt-2 px-5 py-2.5 rounded-xl bg-[#4648d4] text-white text-xs font-semibold hover:bg-[#6063ee] transition-all"
            >
              เริ่มตั้งกระทู้แรก
            </button>
          </div>
        )}

        {/* Tab 3: Skeleton & Error States */}
        {activeSubTab === 'skeleton' && (
          <div className="flex flex-col gap-4">
            {/* Error Banner with Retry */}
            <div className="rounded-xl bg-[#ffdad6] border border-[#ffb4ab] p-3 text-xs text-[#410002] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">
                  error_outline
                </span>
                <span>ไม่สามารถโหลดโพสต์ล่าสุดบางรายการได้ (จำลอง Error State)</span>
              </div>
              <button
                onClick={handleRetry}
                disabled={errorRetrying}
                className="px-3 py-1 rounded-lg bg-white text-xs font-bold text-[#ba1a1a] hover:bg-[#f0f3ff] transition-all flex items-center gap-1"
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    errorRetrying ? 'animate-spin' : ''
                  }`}
                >
                  refresh
                </span>
                <span>{errorRetrying ? 'กำลังลองใหม่...' : 'ลองใหม่'}</span>
              </button>
            </div>

            {/* Skeleton Loading Cards */}
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-[#f0f3ff]/50 border border-[#dee8ff] animate-pulse flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#dee2ef]"></div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="w-28 h-3.5 bg-[#dee2ef] rounded-md"></div>
                      <div className="w-20 h-2.5 bg-[#dee2ef] rounded-md"></div>
                    </div>
                  </div>
                  <div className="w-3/4 h-3 bg-[#dee2ef] rounded-md"></div>
                  <div className="w-full h-2.5 bg-[#dee2ef] rounded-md"></div>
                  <div className="w-2/3 h-2.5 bg-[#dee2ef] rounded-md"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zero-Knowledge Security Notice Footer */}
      <div className="rounded-2xl bg-gradient-to-r from-[#e7eeff] to-[#f0f3ff] p-5 border border-[#dee8ff] flex items-center gap-4 text-xs text-[#5a5e69]">
        <div className="w-10 h-10 rounded-xl bg-[#4648d4] text-white flex items-center justify-center shrink-0">
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lock
          </span>
        </div>
        <p className="leading-relaxed">
          ระบบหอคุยจัดเก็บข้อมูลแบบ <strong className="text-[#111c2d]">Zero-Knowledge</strong>{' '}
          ไม่เชื่อมโยงประวัติการตั้งกระทู้กับตัวตนจริงในระบบทะเบียนหอพัก
          เพื่อความปลอดภัยสูงสุดของผู้อยู่อาศัยทุกคน
        </p>
      </div>
    </div>
  );
};
