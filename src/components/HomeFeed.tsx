import React, { useState } from 'react';
import { ActiveTab, PostItem, UserProfile } from '../types';
import { AVATAR_URL, CATEGORIES } from '../data/mockData';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface HomeFeedProps {
  posts: PostItem[];
  user: UserProfile;
  activeCategoryFilter: string;
  setActiveCategoryFilter: (cat: string) => void;
  onOpenCreatePost: () => void;
  onOpenReportModal: (postTitle: string) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  onDeletePost?: (postId: string) => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  posts,
  user,
  activeCategoryFilter,
  setActiveCategoryFilter,
  onOpenCreatePost,
  onOpenReportModal,
  onLikePost,
  onAddComment,
  setActiveTab,
  searchQuery,
  onDeletePost,
}) => {
  const [showUrgentBanner, setShowUrgentBanner] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    'post-1': true,
  });
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [feedMode, setFeedMode] = useState<'latest' | 'popular' | 'announcements'>('latest');
  const [postToDelete, setPostToDelete] = useState<PostItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleExpand = (postId: string) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (activeCategoryFilter !== 'all' && post.categoryKey !== activeCategoryFilter) {
      return false;
    }
    if (feedMode === 'announcements' && post.categoryKey !== 'announcement') {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchContent = post.content.toLowerCase().includes(q);
      const matchTitle = post.title?.toLowerCase().includes(q);
      const matchCat = post.category.toLowerCase().includes(q);
      const matchTags = post.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchContent && !matchTitle && !matchCat && !matchTags) return false;
    }
    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (feedMode === 'popular') return b.likes - a.likes;
    return 0; // latest by default
  });

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 lg:px-8 pt-24 pb-16">
      {/* Urgent Emergency Alert Banner */}
      {showUrgentBanner && (
        <div className="mb-6 rounded-2xl bg-[#ffdad6] border border-[#ffb4ab] p-4 text-[#410002] shadow-xs flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ba1a1a] text-white flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                campaign
              </span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#93000a]">
                ประกาศด่วนจากนิติหอพัก
              </p>
              <p className="text-sm font-semibold text-[#111c2d]">
                แจ้งซ่อมบำรุงระบบน้ำประปา อาคาร A & B วันนี้เวลา 13:00 - 16:30 น.
                กรุณาสำรองน้ำใช้ล่วงหน้า
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCategoryFilter('announcement')}
              className="px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-xs font-semibold text-[#ba1a1a] transition-colors"
            >
              อ่านประกาศ
            </button>
            <button
              onClick={() => setShowUrgentBanner(false)}
              className="p-1 rounded-lg hover:bg-black/5 text-[#93000a]"
              title="ปิดการแจ้งเตือนนี้"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SIDEBAR (Cols 1-3) */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-5 sticky top-24">
          {/* User Anonymous Card */}
          <div className="rounded-2xl bg-white p-5 border border-[#e7eeff] shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl || AVATAR_URL}
                alt="Avatar"
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#e1e0ff]"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <span className="text-xs text-[#5a5e69]">คุณกำลังใช้งานในฐานะ</span>
                <span className="text-sm font-bold text-[#111c2d]">
                  สมาชิกนิรนาม {user.anonymousTag}
                </span>
                <div className="flex items-center gap-1 mt-0.5 text-[11px] font-medium text-[#006b2d]">
                  <span
                    className="material-symbols-outlined text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  <span>หอพักใน 2 Verified</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#f0f3ff] text-xs text-[#5a5e69] leading-relaxed">
              🔒 <strong className="text-[#111c2d]">ความเป็นส่วนตัว:</strong>{' '}
              ระบบจะไม่เปิดเผยชื่อจริง เลขห้อง หรือประวัติการเข้าสู่ระบบของคุณต่อสมาชิกท่านอื่น
            </div>
          </div>

          {/* Feed Modes & Filters */}
          <div className="rounded-2xl bg-white p-4 border border-[#e7eeff] shadow-xs flex flex-col gap-1.5">
            <div className="px-3 py-1.5 text-xs font-bold text-[#5a5e69] uppercase tracking-wider">
              มุมมองฟีด
            </div>

            <button
              onClick={() => setFeedMode('latest')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                feedMode === 'latest'
                  ? 'bg-[#e1e0ff] text-[#4648d4] font-semibold'
                  : 'text-[#464554] hover:bg-[#f0f3ff] hover:text-[#111c2d]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">schedule</span>
                <span>โพสต์ล่าสุด</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#4648d4] text-white text-[10px] font-bold">
                New
              </span>
            </button>

            <button
              onClick={() => setFeedMode('popular')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                feedMode === 'popular'
                  ? 'bg-[#e1e0ff] text-[#4648d4] font-semibold'
                  : 'text-[#464554] hover:bg-[#f0f3ff] hover:text-[#111c2d]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">local_fire_department</span>
                <span>โพสต์ยอดนิยม</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#f0f3ff] text-[#5a5e69] text-[10px]">
                24h
              </span>
            </button>

            <button
              onClick={() => setFeedMode('announcements')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                feedMode === 'announcements'
                  ? 'bg-[#e1e0ff] text-[#4648d4] font-semibold'
                  : 'text-[#464554] hover:bg-[#f0f3ff] hover:text-[#111c2d]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">campaign</span>
                <span>ประกาศจากนิติหอ</span>
              </div>
            </button>
          </div>

          {/* Quick Categories List */}
          <div className="rounded-2xl bg-white p-4 border border-[#e7eeff] shadow-xs flex flex-col gap-1.5">
            <div className="px-3 py-1.5 text-xs font-bold text-[#5a5e69] uppercase tracking-wider flex items-center justify-between">
              <span>หมวดหมู่หลัก</span>
              <button
                onClick={() => setActiveTab('categories')}
                className="text-[#4648d4] hover:underline normal-case font-medium"
              >
                ดูทั้งหมด
              </button>
            </div>

            {[
              { id: 'all', name: 'ทั้งหมด', emoji: '🌟', count: posts.length },
              { id: 'dorm', name: 'เรื่องหอพัก', emoji: '🏠', count: 42 },
              { id: 'food', name: 'อาหารและร้านค้า', emoji: '🍜', count: 19 },
              { id: 'study', name: 'การเรียน', emoji: '📚', count: 15 },
              { id: 'maintenance', name: 'แจ้งซ่อม', emoji: '🛠️', count: 8 },
              { id: 'announcement', name: 'ประกาศ', emoji: '📢', count: 6 },
              { id: 'gaming', name: 'บันเทิง', emoji: '🎮', count: 11 },
              { id: 'general', name: 'เรื่องทั่วไป', emoji: '💬', count: 33 },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeCategoryFilter === cat.id
                    ? 'bg-[#e7eeff] text-[#4648d4] font-semibold'
                    : 'text-[#464554] hover:bg-[#f0f3ff] hover:text-[#111c2d]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </div>
                <span className="text-[11px] text-[#5a5e69]">{cat.count}</span>
              </button>
            ))}
          </div>

          {/* Privacy Security Badge */}
          <div className="rounded-2xl bg-gradient-to-br from-[#f0f3ff] to-[#e7eeff] p-4 border border-[#dee8ff] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006b2d] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#111c2d]">Zero-Knowledge Identity</p>
              <p className="text-[11px] text-[#5a5e69] leading-tight mt-0.5">
                ข้อมูลส่วนบุคคลถูกแยกส่วนและเข้ารหัสทางเดียวเพื่อความเป็นส่วนตัวสูงสุด
              </p>
            </div>
          </div>
        </aside>

        {/* CENTER FEED (Cols 4-8 in 12-col grid) */}
        <main className="lg:col-span-6 flex flex-col gap-5">
          {/* Quick Post Creator Trigger Card */}
          <div className="rounded-2xl bg-white p-4 border border-[#e7eeff] shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl || AVATAR_URL}
                alt="Me"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#e1e0ff]"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={onOpenCreatePost}
                className="flex-1 text-left px-4 py-2.5 rounded-xl bg-[#f0f3ff] text-sm text-[#5a5e69] hover:bg-[#e7eeff] transition-colors"
              >
                คุณกำลังคิดอะไรอยู่? แบ่งปันเรื่องราวในหอพักแบบนิรนาม...
              </button>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#f0f3ff] text-xs font-medium text-[#5a5e69]">
              <button
                onClick={onOpenCreatePost}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#f0f3ff] hover:text-[#006b2d] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-[#006b2d]">add_a_photo</span>
                <span>แนบรูปจากเครื่อง</span>
              </button>
              <button
                onClick={onOpenCreatePost}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#f0f3ff] hover:text-[#4648d4] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-[#4648d4]">
                  ballot
                </span>
                <span>โพลสำรวจ</span>
              </button>
              <button
                onClick={onOpenCreatePost}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#f0f3ff] hover:text-[#e65100] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-[#e65100]">tag</span>
                <span>แท็กตึก/ชั้น</span>
              </button>
              <button
                onClick={onOpenCreatePost}
                className="px-4 py-1.5 rounded-xl bg-[#4648d4] text-white text-xs font-semibold hover:bg-[#6063ee] transition-all"
              >
                โพสต์
              </button>
            </div>
          </div>

          {/* Category Filter Chips Horizontal */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', name: 'ทั้งหมด', emoji: '🌟' },
              { id: 'dorm', name: 'เรื่องหอพัก', emoji: '🏠' },
              { id: 'food', name: 'อาหารและร้านค้า', emoji: '🍜' },
              { id: 'study', name: 'การเรียน', emoji: '📚' },
              { id: 'maintenance', name: 'แจ้งปัญหา', emoji: '🛠️' },
              { id: 'announcement', name: 'ประกาศ', emoji: '📢' },
              { id: 'gaming', name: 'บันเทิง', emoji: '🎮' },
              { id: 'general', name: 'เรื่องทั่วไป', emoji: '💬' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setActiveCategoryFilter(chip.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategoryFilter === chip.id
                    ? 'bg-[#4648d4] text-white font-semibold shadow-xs'
                    : 'bg-white text-[#464554] border border-[#e7eeff] hover:bg-[#f0f3ff]'
                }`}
              >
                <span>{chip.emoji}</span>
                <span>{chip.name}</span>
              </button>
            ))}
          </div>

          {/* Active Search / Category Indicator */}
          {(activeCategoryFilter !== 'all' || searchQuery.trim()) && (
            <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-[#f0f3ff] text-xs text-[#5a5e69]">
              <div className="flex items-center gap-2">
                <span>แสดงผลสำหรับ:</span>
                {activeCategoryFilter !== 'all' && (
                  <span className="px-2 py-0.5 rounded-md bg-[#e1e0ff] text-[#4648d4] font-semibold">
                    {CATEGORIES.find((c) => c.id === activeCategoryFilter)?.title ||
                      activeCategoryFilter}
                  </span>
                )}
                {searchQuery.trim() && (
                  <span className="px-2 py-0.5 rounded-md bg-[#dee2ef] text-[#111c2d] font-semibold">
                    "{searchQuery}"
                  </span>
                )}
                <span>(พบ {sortedPosts.length} โพสต์)</span>
              </div>
              <button
                onClick={() => {
                  setActiveCategoryFilter('all');
                }}
                className="text-[#4648d4] hover:underline font-medium"
              >
                ล้างตัวกรอง
              </button>
            </div>
          )}

          {/* POSTS LIST */}
          {sortedPosts.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center border border-[#e7eeff] flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-5xl text-[#5a5e69]">
                sentiment_content
              </span>
              <p className="font-bold text-[#111c2d] text-base">ไม่พบโพสต์ในหมวดหมู่นี้</p>
              <p className="text-xs text-[#5a5e69]">
                เป็นคนแรกที่เริ่มพูดคุยหรือแบ่งปันเรื่องราวในหมวดนี้
              </p>
              <button
                onClick={onOpenCreatePost}
                className="mt-2 px-5 py-2 rounded-xl bg-[#4648d4] text-white text-xs font-semibold hover:bg-[#6063ee]"
              >
                สร้างโพสต์ใหม่
              </button>
            </div>
          ) : (
            sortedPosts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl bg-white p-5 border border-[#e7eeff] shadow-xs flex flex-col gap-3.5 transition-all hover:border-[#dee8ff]"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f0f3ff] flex items-center justify-center text-lg shrink-0">
                      {post.categoryEmoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#111c2d]">{post.author}</span>
                        {post.authorRole && (
                          <span className="px-2 py-0.5 rounded-full bg-[#6063ee] text-white text-[10px] font-semibold">
                            {post.authorRole}
                          </span>
                        )}
                        {post.statusUpdate && (
                          <span className="px-2 py-0.5 rounded-full bg-[#00873b] text-white text-[10px] font-semibold">
                            {post.statusUpdate}
                          </span>
                        )}
                        {post.isUrgent && (
                          <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-semibold">
                            เร่งด่วน
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#5a5e69] mt-0.5">
                        {post.authorBuilding && <span>{post.authorBuilding}</span>}
                        <span>•</span>
                        <span>{post.timeAgo}</span>
                        <span>•</span>
                        <span className="text-[#4648d4] font-medium">{post.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Actions: Admin/Author Delete & Report */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(user.isAdmin || user.role === 'staff' || user.role === 'admin' || user.email === '69011219002@msu.ac.th' || (post.authorUid && post.authorUid === user.uid)) && (
                      <button
                        type="button"
                        onClick={() => {
                          setPostToDelete(post);
                          setIsDeleteModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6] text-[11px] font-bold transition-colors flex items-center gap-1 border border-[#ba1a1a]/30 active:scale-95"
                        title="ลบกระทู้ (สิทธิ์แอดมิน/เจ้าของกระทู้)"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                        <span className="hidden sm:inline">ลบโพสต์</span>
                      </button>
                    )}

                    {/* Post menu / Report button */}
                    <button
                      onClick={() => onOpenReportModal(post.title || post.content.slice(0, 30))}
                      className="p-1.5 rounded-lg text-[#5a5e69] hover:bg-[#f0f3ff] hover:text-[#ba1a1a] transition-colors"
                      title="รายงานเนื้อหาที่ไม่เหมาะสม"
                    >
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </div>
                </div>

                {/* Post Title & Content */}
                <div className="flex flex-col gap-2">
                  {post.title && (
                    <h4 className="font-bold text-base text-[#111c2d] leading-snug">{post.title}</h4>
                  )}
                  <p className="text-sm text-[#111c2d] leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                {/* Optional Attached Image */}
                {post.imageUrl && (
                  <div className="mt-1 rounded-xl overflow-hidden border border-[#e7eeff] bg-[#f9f9ff]">
                    <img
                      src={post.imageUrl}
                      alt={post.imageCaption || 'ภาพประกอบโพสต์'}
                      className="w-full max-h-96 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {post.imageCaption && (
                      <p className="px-3 py-1.5 text-[11px] text-[#5a5e69] italic bg-white/90 border-t border-[#f0f3ff]">
                        {post.imageCaption}
                      </p>
                    )}
                  </div>
                )}

                {/* Optional Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md bg-[#e1e0ff] text-[#4648d4] text-xs font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Bar (Upvote / Comment / Share) */}
                <div className="flex items-center justify-between pt-2 border-t border-[#f0f3ff] text-xs text-[#5a5e69]">
                  <div className="flex items-center gap-1 sm:gap-2">
                    {/* Upvote Button */}
                    <button
                      onClick={() => onLikePost(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                        post.isLiked
                          ? 'bg-[#e1e0ff] text-[#4648d4] font-bold'
                          : 'hover:bg-[#f0f3ff] text-[#5a5e69]'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: post.isLiked ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        thumb_up
                      </span>
                      <span>{post.likes}</span>
                    </button>

                    {/* Toggle Comment Button */}
                    <button
                      onClick={() => toggleExpand(post.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#f0f3ff] text-[#5a5e69] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                      <span>{post.commentsCount || post.comments.length} ความคิดเห็น</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      alert('คัดลอกลิงก์กระทู้เรียบร้อยแล้ว');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#f0f3ff] text-[#5a5e69] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">share</span>
                    <span className="hidden sm:inline">แชร์</span>
                  </button>
                </div>

                {/* Expandable Threaded Comments Section */}
                {expandedComments[post.id] && (
                  <div className="mt-3 pt-3 border-t border-[#f0f3ff] flex flex-col gap-3">
                    {/* Comments List */}
                    <div className="flex flex-col gap-3">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex flex-col gap-2">
                          {/* Level 1 Comment */}
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#dee2ef] flex items-center justify-center text-xs font-bold text-[#424751] shrink-0">
                              #
                            </div>
                            <div className="flex-1 rounded-2xl bg-[#f0f3ff] p-3 text-xs flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#111c2d]">
                                    {comment.author}
                                  </span>
                                  {comment.authorRole && (
                                    <span className="px-1.5 py-0.5 rounded bg-[#4648d4] text-white text-[9px] font-semibold">
                                      {comment.authorRole}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-[#5a5e69]">
                                  {comment.timeAgo}
                                </span>
                              </div>
                              <p className="text-[#111c2d] leading-relaxed">{comment.content}</p>
                              <div className="flex items-center gap-3 mt-1 text-[11px] text-[#5a5e69]">
                                <button className="hover:text-[#4648d4] font-medium">
                                  ถูกใจ ({comment.likes})
                                </button>
                                <button className="hover:text-[#4648d4] font-medium">ตอบกลับ</button>
                              </div>
                            </div>
                          </div>

                          {/* Nested Replies (Level 2 & 3) */}
                          {comment.replies &&
                            comment.replies.map((reply) => (
                              <div key={reply.id} className="ml-8 flex flex-col gap-2">
                                <div className="flex items-start gap-2">
                                  <div className="w-7 h-7 rounded-full bg-[#d8e3fb] flex items-center justify-center text-[10px] font-bold text-[#424751] shrink-0">
                                    #
                                  </div>
                                  <div className="flex-1 rounded-2xl bg-[#e7eeff] p-2.5 text-xs flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-[#111c2d]">
                                        {reply.author}
                                      </span>
                                      <span className="text-[10px] text-[#5a5e69]">
                                        {reply.timeAgo}
                                      </span>
                                    </div>
                                    <p className="text-[#111c2d]">{reply.content}</p>
                                  </div>
                                </div>

                                {/* Nested Level 3 (e.g. Juristic officer reply) */}
                                {reply.replies &&
                                  reply.replies.map((nested) => (
                                    <div key={nested.id} className="ml-8 flex items-start gap-2">
                                      <div className="w-6 h-6 rounded-full bg-[#4648d4] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                        นิติ
                                      </div>
                                      <div className="flex-1 rounded-2xl bg-[#e1e0ff] p-2.5 text-xs flex flex-col gap-1 border border-[#c0c1ff]">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-[#111c2d]">
                                              {nested.author}
                                            </span>
                                            {nested.authorRole && (
                                              <span className="px-1.5 py-0.2 rounded bg-[#006b2d] text-white text-[9px] font-semibold">
                                                {nested.authorRole}
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-[10px] text-[#5a5e69]">
                                            {nested.timeAgo}
                                          </span>
                                        </div>
                                        <p className="text-[#111c2d] leading-relaxed">
                                          {nested.content}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>

                    {/* Add New Comment Box */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommentSubmit(post.id);
                        }}
                        placeholder="แสดงความคิดเห็นแบบไม่ระบุตัวตน..."
                        className="flex-1 h-9 px-3.5 rounded-xl bg-[#f0f3ff] text-xs text-[#111c2d] placeholder:text-[#5a5e69] focus:outline-none focus:ring-1 focus:ring-[#4648d4]"
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                        className="px-3.5 h-9 rounded-xl bg-[#4648d4] text-white text-xs font-semibold hover:bg-[#6063ee] disabled:opacity-40 transition-all"
                      >
                        ส่ง
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
        </main>

        {/* RIGHT SIDEBAR (Cols 9-12) */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-5 sticky top-24">
          {/* Urgent Notice Card */}
          <div className="rounded-2xl bg-white p-5 border border-[#ffdad6] shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#ba1a1a]">
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                warning
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">ประกาศด่วน</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#111c2d]">
                วันนี้งดใช้น้ำ 13:00 - 16:30 น.
              </h4>
              <p className="text-xs text-[#5a5e69] mt-1 leading-relaxed">
                ซ่อมท่อเมนและเปลี่ยนวาล์วหลักอาคาร A และ B ขออภัยในความไม่สะดวกของนิสิตทุกท่าน
              </p>
            </div>
            <div className="pt-2 border-t border-[#f0f3ff] flex items-center justify-between text-[11px] text-[#5a5e69]">
              <span>เบอร์ช่างอาคาร: 02-xxx-xxxx กด 1</span>
            </div>
          </div>

          {/* Trending Topics & Sparkline */}
          <div className="rounded-2xl bg-white p-5 border border-[#e7eeff] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5a5e69] uppercase tracking-wider">
                หัวข้อยอดนิยม (Trending)
              </span>
              <span className="material-symbols-outlined text-[#4648d4] text-[18px]">
                trending_up
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                { tag: '#น้ำไม่ไหลตึกA', posts: '142 โพสต์', hot: true },
                { tag: '#ร้านข้าวมันไก่ป้าณี', posts: '89 โพสต์' },
                { tag: '#สรุปสอบเน็ตเวิร์ก', posts: '64 โพสต์' },
                { tag: '#แอร์หอในมีเสียงดัง', posts: '38 โพสต์' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveCategoryFilter('all');
                  }}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#111c2d] group-hover:text-[#4648d4] transition-colors">
                      {item.tag}
                    </span>
                    <span className="text-[10px] text-[#5a5e69]">{item.posts}</span>
                  </div>
                  {item.hot && (
                    <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold">
                      Hot
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Sparkline Visual */}
            <div className="p-3 rounded-xl bg-[#f0f3ff] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#5a5e69]">ความคึกคักวันนี้</span>
                <p className="text-xs font-bold text-[#006b2d]">+28% ผู้ใช้งาน</p>
              </div>
              <svg className="w-20 h-6 text-[#00873b]" viewBox="0 0 100 30" fill="none">
                <path
                  d="M0 25 L20 18 L40 22 L60 10 L80 14 L100 4"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Community Rules Card */}
          <div className="rounded-2xl bg-white p-5 border border-[#e7eeff] shadow-xs flex flex-col gap-3">
            <span className="text-xs font-bold text-[#5a5e69] uppercase tracking-wider">
              กฎระเบียบชุมชนหอคุย
            </span>
            <ul className="text-xs text-[#5a5e69] flex flex-col gap-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#006b2d] font-bold">✓</span>
                <span>รักษาความเป็นส่วนตัว ไม่เปิดเผยชื่อหรือห้องของผู้อื่น</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006b2d] font-bold">✓</span>
                <span>ให้เกียรติซึ่งกันและกัน ไม่ใช้ถ้อยคำคุกคามหรือเหยียดหยาม</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006b2d] font-bold">✓</span>
                <span>แจ้งปัญหาอย่างสร้างสรรค์เพื่อช่วยกันปรับปรุงหอพัก</span>
              </li>
            </ul>
          </div>

          {/* Quick Building Contacts */}
          <div className="rounded-2xl bg-white p-4 border border-[#e7eeff] shadow-xs text-xs text-[#5a5e69] flex flex-col gap-2">
            <span className="font-semibold text-[#111c2d]">ติดต่อฉุกเฉินหอพัก</span>
            <div className="flex items-center justify-between">
              <span>ป้อมยามหน้าหอ 2:</span>
              <span className="font-bold text-[#111c2d]">02-xxx-4112</span>
            </div>
            <div className="flex items-center justify-between">
              <span>ห้องพยาบาล ม.:</span>
              <span className="font-bold text-[#111c2d]">24 ชั่วโมง</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Floating Action Button (FAB) for Mobile/Desktop */}
      <button
        onClick={onOpenCreatePost}
        className="fixed bottom-20 lg:bottom-8 right-6 z-30 w-14 h-14 rounded-full bg-[#4648d4] text-white flex items-center justify-center shadow-xl hover:bg-[#6063ee] active:scale-95 transition-all"
        title="สร้างโพสต์ใหม่"
      >
        <span className="material-symbols-outlined text-[28px]">edit</span>
      </button>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPostToDelete(null);
        }}
        onConfirm={async () => {
          if (!postToDelete || !onDeletePost) return;
          setIsDeleting(true);
          try {
            await onDeletePost(postToDelete.id);
          } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setPostToDelete(null);
          }
        }}
        title="ยืนยันการลบกระทู้"
        itemName={postToDelete?.title || postToDelete?.content.slice(0, 30) || 'กระทู้นี้'}
        isDeleting={isDeleting}
      />
    </div>
  );
};
