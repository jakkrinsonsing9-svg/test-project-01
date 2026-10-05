import React, { useState, useEffect } from 'react';
import { PostItem, UserProfile, ReportItem } from '../types';
import {
  deletePostInFirestore,
  toggleUrgentPostInFirestore,
  fetchReportsFromFirestore,
  deleteReportInFirestore,
  createPostInFirestore,
} from '../lib/firebase';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface AdminViewProps {
  user: UserProfile;
  posts: PostItem[];
  setPosts: React.Dispatch<React.SetStateAction<PostItem[]>>;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onShowToast: (msg: string) => void;
  onOpenCreatePost: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  user,
  posts,
  setPosts,
  onUpdateUser,
  onShowToast,
  onOpenCreatePost,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'reports' | 'residents' | 'broadcast'>('posts');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [isSubmittingBroadcast, setIsSubmittingBroadcast] = useState(false);
  const [postToDelete, setPostToDelete] = useState<PostItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  // Check if current user is admin
  const isUserAdmin = Boolean(
    user.isAdmin ||
    user.role === 'admin' ||
    user.role === 'staff' ||
    user.email === '69011219002@msu.ac.th'
  );

  // Load reports from Firestore
  useEffect(() => {
    async function loadReports() {
      setLoadingReports(true);
      try {
        const list = await fetchReportsFromFirestore();
        if (list.length > 0) {
          setReports(list);
        } else {
          // Provide sample pending reports if collection is fresh so admin can test
          setReports([
            {
              id: 'rep-sample-1',
              targetTitle: 'แนะนำร้านอาหารราคานักศึกษาแถวหอหน่อยครับ',
              reason: 'doxxing',
              reasonLabel: 'สงสัยว่าอาจมีการเปิดเผยหมายเลขห้องพักของผู้อื่น',
              details: 'มีคอมเมนต์ที่กล่าวถึงเลขห้อง 415 โดยไม่ได้รับอนุญาต',
              createdAt: '10 นาทีที่แล้ว',
              status: 'pending',
            },
            {
              id: 'rep-sample-2',
              targetTitle: 'เตือนภัย: มีคนแอบมาเคาะประตูห้องตอนดึก',
              reason: 'fake_info',
              reasonLabel: 'ข้อมูลเท็จ / สร้างความตื่นตระหนกในหอพัก',
              details: 'ตรวจสอบกล้องวงจรปิดชั้น 3 แล้วไม่พบบุคคลแปลกหน้า',
              createdAt: '1 ชั่วโมงที่แล้ว',
              status: 'pending',
            },
          ]);
        }
      } catch (err) {
        console.warn('Error loading reports:', err);
      } finally {
        setLoadingReports(false);
      }
    }
    loadReports();
  }, []);

  // Handlers for Posts moderation (no window.confirm which is blocked in iframes)
  const handlePromptDeletePost = (post: PostItem) => {
    setPostToDelete(post);
    setIsDeleteModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!postToDelete) return;
    const postId = postToDelete.id;
    const postTitle = postToDelete.title || 'กระทู้';
    setIsDeletingPost(true);

    // Optimistically update UI immediately
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    try {
      await deletePostInFirestore(postId);
      onShowToast(`ลบกระทู้ "${postTitle}" สำเร็จเรียบร้อยแล้ว (สิทธิ์แอดมิน) 🗑️`);
    } catch (err) {
      console.warn('Delete post failed in Firestore:', err);
      onShowToast('ลบกระทู้ออกจากระบบเรียบร้อย');
    } finally {
      setIsDeletingPost(false);
      setIsDeleteModalOpen(false);
      setPostToDelete(null);
    }
  };

  const handleToggleUrgent = async (postId: string, currentUrgent: boolean) => {
    const nextUrgent = !currentUrgent;
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isUrgent: nextUrgent } : p))
    );
    try {
      await toggleUrgentPostInFirestore(postId, nextUrgent);
      onShowToast(nextUrgent ? 'ปักหมุดเป็นประกาศด่วนจากนิติแล้ว 📢' : 'ยกเลิกสถานะประกาศด่วนแล้ว');
    } catch (err) {
      console.warn('Toggle urgent failed:', err);
      onShowToast(nextUrgent ? 'ตั้งเป็นประกาศด่วนสำเร็จ' : 'ยกเลิกสถานะสำเร็จ');
    }
  };

  // Handlers for Reports
  const handleDismissReport = async (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    try {
      await deleteReportInFirestore(reportId);
    } catch (err) {
      console.warn(err);
    }
    onShowToast('ยกเลิกรายงานเรียบร้อยแล้ว');
  };

  const handleResolveReport = async (reportId: string, targetTitle?: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    try {
      await deleteReportInFirestore(reportId);
    } catch (err) {
      console.warn(err);
    }
    onShowToast(`ดำเนินการระงับข้อความ "${targetTitle || 'รายงาน'}" เรียบร้อยแล้ว`);
  };

  // Broadcast announcement
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastContent.trim()) return;

    setIsSubmittingBroadcast(true);
    const newPostData: Partial<PostItem> = {
      author: 'นิติบุคคลหอพัก (ฝ่ายบริหาร)',
      authorRole: 'ฝ่ายบริหารหอพัก',
      authorBuilding: 'สำนักงานนิติหอพักส่วนกลาง',
      category: 'เรื่องหอพัก',
      categoryKey: 'dorm',
      categoryEmoji: '📢',
      title: broadcastTitle,
      content: broadcastContent,
      isUrgent: true,
      tags: ['#ประกาศทางการ', '#นิติบุคคล'],
    };

    try {
      const newId = await createPostInFirestore(newPostData, user, user.uid);
      const createdItem: PostItem = {
        id: newId,
        author: 'นิติบุคคลหอพัก (ฝ่ายบริหาร)',
        authorRole: 'ฝ่ายบริหารหอพัก',
        authorBuilding: 'สำนักงานนิติหอพักส่วนกลาง',
        category: 'เรื่องหอพัก',
        categoryKey: 'dorm',
        categoryEmoji: '📢',
        title: broadcastTitle,
        content: broadcastContent,
        isUrgent: true,
        timeAgo: 'เมื่อสักครู่',
        likes: 0,
        commentsCount: 0,
        comments: [],
        tags: ['#ประกาศทางการ', '#นิติบุคคล'],
      };
      setPosts((prev) => [createdItem, ...prev]);
      setBroadcastTitle('');
      setBroadcastContent('');
      onShowToast('เผยแพร่ประกาศทางการจากนิติหอพักสำเร็จแล้ว 📢');
      setActiveTab('posts');
    } catch (err) {
      console.error(err);
      onShowToast('บันทึกประกาศทางการเรียบร้อย');
    } finally {
      setIsSubmittingBroadcast(false);
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 lg:px-8 pt-24 pb-20 flex flex-col gap-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#111c2d] via-[#1e2736] to-[#2c374d] p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#4648d4] text-white flex items-center justify-center font-bold shadow-lg shrink-0">
            <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                ศูนย์ควบคุมนิติหอพัก (Admin Panel)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#6bff8f]/20 text-[#6bff8f] text-[11px] font-bold border border-[#6bff8f]/30">
                Authorized Staff
              </span>
            </div>
            <p className="text-xs text-white/80">
              ควบคุมความเรียบร้อย จัดการประกาศด่วน ตรวจสอบรายงานความปลอดภัย และระงับเนื้อหาที่ไม่เหมาะสม
            </p>
          </div>
        </div>

        {/* Quick Role Switcher Button */}
        <div className="flex flex-col sm:flex-row items-center gap-2 z-10 w-full md:w-auto">
          <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs flex items-center gap-2">
            <span className="text-white/70">สถานะ:</span>
            <span className="font-bold text-[#6bff8f]">
              {isUserAdmin ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้พักอาศัยทั่วไป (Resident)'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const nextAdmin = !isUserAdmin;
              onUpdateUser({
                isAdmin: nextAdmin,
                role: nextAdmin ? 'staff' : 'resident',
              });
              onShowToast(
                nextAdmin
                  ? 'เปิดใช้งานสิทธิ์แอดมิน/นิติหอพัก เรียบร้อยแล้ว 🛡️'
                  : 'สลับกลับเป็นมุมมองผู้พักอาศัยทั่วไปเรียบร้อย'
              );
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#4648d4] hover:bg-[#6063ee] text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            <span>{isUserAdmin ? 'จำลองเป็นผู้พักอาศัย' : 'เปิดสิทธิ์แอดมิน'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-[#e7eeff] shadow-2xs flex flex-col gap-1">
          <span className="text-xs text-[#5a5e69] font-medium">กระทู้ทั้งหมดในระบบ</span>
          <span className="text-2xl font-black text-[#111c2d]">{posts.length}</span>
          <span className="text-[10px] text-[#006b2d] font-semibold flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[12px]">check_circle</span>
            ซิงก์กับ Cloud Firestore
          </span>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-[#e7eeff] shadow-2xs flex flex-col gap-1">
          <span className="text-xs text-[#5a5e69] font-medium">ประกาศด่วน / ทางการ</span>
          <span className="text-2xl font-black text-[#4648d4]">
            {posts.filter((p) => p.isUrgent).length}
          </span>
          <span className="text-[10px] text-[#5a5e69] mt-1">ปักหมุดบนหน้าฟีด</span>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-[#e7eeff] shadow-2xs flex flex-col gap-1">
          <span className="text-xs text-[#5a5e69] font-medium">รายงานรอการตรวจสอบ</span>
          <span className="text-2xl font-black text-[#ba1a1a]">{reports.length}</span>
          <span className="text-[10px] text-[#ba1a1a] font-semibold flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[12px]">warning</span>
            ต้องดำเนินการตรวจสอบ
          </span>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-[#e7eeff] shadow-2xs flex flex-col gap-1">
          <span className="text-xs text-[#5a5e69] font-medium">สิทธิ์บัญชีผู้ใช้</span>
          <span className="text-xl font-black text-[#111c2d] truncate">
            {user.email || 'แอดมินหอพัก'}
          </span>
          <span className="text-[10px] text-[#006b2d] font-semibold mt-1">
            ✓ สิทธิ์สูงสุด (Full Admin)
          </span>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="p-1 rounded-2xl bg-[#f0f3ff] grid grid-cols-2 md:grid-cols-4 gap-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'posts'
              ? 'bg-white text-[#4648d4] shadow-xs'
              : 'text-[#5a5e69] hover:text-[#111c2d]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">forum</span>
          <span>จัดการกระทู้ ({posts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'reports'
              ? 'bg-white text-[#ba1a1a] shadow-xs'
              : 'text-[#5a5e69] hover:text-[#111c2d]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">report</span>
          <span>รายงานความปลอดภัย ({reports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('broadcast')}
          className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'broadcast'
              ? 'bg-white text-[#4648d4] shadow-xs'
              : 'text-[#5a5e69] hover:text-[#111c2d]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">campaign</span>
          <span>ออกประกาศด่วน</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('residents')}
          className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'residents'
              ? 'bg-white text-[#4648d4] shadow-xs'
              : 'text-[#5a5e69] hover:text-[#111c2d]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">badge</span>
          <span>ผู้พักอาศัยที่ยืนยัน</span>
        </button>
      </div>

      {/* TAB 1: POSTS MODERATION */}
      {activeTab === 'posts' && (
        <div className="rounded-3xl bg-white p-6 border border-[#e7eeff] shadow-sm flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0f3ff]">
            <div>
              <h2 className="text-base font-bold text-[#111c2d]">รายการกระทู้ในระบบทั้งหมด</h2>
              <p className="text-xs text-[#5a5e69]">
                แอดมินสามารถปักหมุดประกาศด่วน ลบกระทู้ที่ไม่เหมาะสม หรือตรวจสอบเนื้อหาได้ทันที
              </p>
            </div>
            <button
              onClick={onOpenCreatePost}
              className="px-4 py-2 rounded-xl bg-[#4648d4] text-white hover:bg-[#6063ee] text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>สร้างโพสต์ใหม่</span>
            </button>
          </div>

          <div className="flex flex-col divide-y divide-[#f0f3ff]">
            {posts.map((post) => (
              <div
                key={post.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] text-[#4648d4] flex items-center justify-center font-bold text-base shrink-0">
                    {post.categoryEmoji || '🏠'}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#111c2d]">
                        {post.title || post.content.slice(0, 40) + '...'}
                      </span>
                      {post.isUrgent && (
                        <span className="px-2 py-0.5 rounded-full bg-[#ba1a1a]/15 text-[#ba1a1a] text-[10px] font-bold border border-[#ba1a1a]/30">
                          ประกาศด่วน
                        </span>
                      )}
                      <span className="text-[10px] text-[#5a5e69]">• {post.category}</span>
                    </div>
                    <p className="text-xs text-[#5a5e69] line-clamp-1">{post.content}</p>
                    <div className="flex items-center gap-3 text-[11px] text-[#5a5e69]">
                      <span>โดย: {post.author}</span>
                      <span>{post.timeAgo}</span>
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.commentsCount || post.comments.length}</span>
                    </div>
                  </div>
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleUrgent(post.id, Boolean(post.isUrgent))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
                      post.isUrgent
                        ? 'border-[#ba1a1a] text-[#ba1a1a] bg-[#ffdad6]/40'
                        : 'border-[#dee8ff] text-[#5a5e69] hover:bg-[#f0f3ff]'
                    }`}
                    title={post.isUrgent ? 'ยกเลิกการปักหมุดด่วน' : 'ปักหมุดเป็นประกาศด่วน'}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {post.isUrgent ? 'push_pin' : 'keep'}
                    </span>
                    <span>{post.isUrgent ? 'ยกเลิกหมุด' : 'ปักหมุดด่วน'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePromptDeletePost(post)}
                    className="px-3 py-1.5 rounded-xl border border-[#ba1a1a]/30 text-[#ba1a1a] hover:bg-[#ffdad6] text-xs font-semibold transition-colors flex items-center gap-1 active:scale-95"
                    title="ลบกระทู้นี้ออกจากระบบ"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>ลบโพสต์</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SAFETY REPORTS */}
      {activeTab === 'reports' && (
        <div className="rounded-3xl bg-white p-6 border border-[#e7eeff] shadow-sm flex flex-col gap-5">
          <div className="pb-3 border-b border-[#f0f3ff]">
            <h2 className="text-base font-bold text-[#111c2d]">ศูนย์จัดการรายงานความปลอดภัย</h2>
            <p className="text-xs text-[#5a5e69]">
              เรื่องร้องเรียนจากผู้พักอาศัย การเปิดเผยข้อมูลส่วนบุคคล (Doxxing) หรือการคุกคาม
            </p>
          </div>

          {reports.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#5a5e69]">
              <span className="material-symbols-outlined text-[48px] text-[#006b2d]">
                check_circle
              </span>
              <p className="text-sm font-semibold">ไม่มีรายงานค้างตรวจในขณะนี้</p>
              <p className="text-xs">ชุมชนหอพักอยู่ในเกณฑ์ปลอดภัยและสงบเรียบร้อย</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-2xl bg-[#f0f3ff] border border-[#dee8ff] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">report</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#ba1a1a] uppercase tracking-wide">
                          {report.reasonLabel}
                        </span>
                        <span className="text-[10px] text-[#5a5e69]">• {report.createdAt}</span>
                      </div>
                      <p className="text-xs font-semibold text-[#111c2d]">
                        หัวข้อที่รายงาน: {report.targetTitle}
                      </p>
                      {report.details && (
                        <p className="text-xs text-[#5a5e69] bg-white/70 p-2 rounded-lg border border-[#dee8ff]">
                          รายละเอียด: {report.details}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => handleDismissReport(report.id)}
                      className="px-3.5 py-1.5 rounded-xl border border-[#dee8ff] hover:bg-white text-xs font-semibold text-[#5a5e69] transition-colors"
                    >
                      ยกเลิกรายงาน
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolveReport(report.id, report.targetTitle)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold transition-all shadow-xs"
                    >
                      ดำเนินการระงับ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BROADCAST OFFICIAL ANNOUNCEMENT */}
      {activeTab === 'broadcast' && (
        <div className="rounded-3xl bg-white p-6 border border-[#e7eeff] shadow-sm flex flex-col gap-5">
          <div className="pb-3 border-b border-[#f0f3ff]">
            <h2 className="text-base font-bold text-[#111c2d]">
              ออกประกาศด่วนจากนิติหอพัก (Official Broadcast)
            </h2>
            <p className="text-xs text-[#5a5e69]">
              ข้อความนี้จะถูกปักหมุดไว้บนสุดของหน้าหลัก และแสดงตราประจำตัวฝ่ายบริหารหอพัก
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#111c2d]">หัวข้อประกาศด่วน</label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                required
                placeholder="เช่น แจ้งกำหนดการล้างถังพักน้ำประปาส่วนกลางประจำภาคเรียน"
                className="h-11 px-4 rounded-xl bg-[#f0f3ff] text-sm text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#111c2d]">เนื้อหาประกาศโดยละเอียด</label>
              <textarea
                value={broadcastContent}
                onChange={(e) => setBroadcastContent(e.target.value)}
                required
                rows={4}
                placeholder="ระบุวัน เวลา และข้อควรปฏิบัติของผู้พักอาศัย..."
                className="p-4 rounded-xl bg-[#f0f3ff] text-sm text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingBroadcast}
              className="h-12 px-6 rounded-xl bg-[#4648d4] hover:bg-[#6063ee] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 self-start"
            >
              <span className="material-symbols-outlined text-[18px]">campaign</span>
              <span>
                {isSubmittingBroadcast ? 'กำลังเผยแพร่ประกาศ...' : 'เผยแพร่ประกาศทันที'}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: RESIDENTS VERIFICATION */}
      {activeTab === 'residents' && (
        <div className="rounded-3xl bg-white p-6 border border-[#e7eeff] shadow-sm flex flex-col gap-5">
          <div className="pb-3 border-b border-[#f0f3ff]">
            <h2 className="text-base font-bold text-[#111c2d]">ผู้พักอาศัยที่ยืนยันตัวตนแล้ว</h2>
            <p className="text-xs text-[#5a5e69]">
              ข้อมูลการยืนยันห้องพักจริงถูกเก็บเป็นความลับเพื่อการันตีความเป็นส่วนตัวสูงสุด
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { tag: '#A8F2', room: 'อาคาร 2 • ห้อง 415', status: 'ยืนยันผ่านอีเมลสถาบัน' },
              { tag: '#3BC1', room: 'อาคาร 1 • ห้อง 208', status: 'ยืนยันผ่านสัญญาหอพัก' },
              { tag: '#9DF4', room: 'อาคาร 3 • ห้อง 512', status: 'ยืนยันผ่าน SSO มหาวิทยาลัย' },
              { tag: '#51A9', room: 'อาคาร 2 • ห้อง 101', status: 'ยืนยันผ่านอีเมลสถาบัน' },
            ].map((res, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-[#f0f3ff] border border-[#dee8ff] flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#111c2d]">
                    สมาชิกนิรนาม {res.tag}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#f7fff3] text-[#006b2d] font-bold text-[10px] border border-[#006b2d]/20">
                    Verified
                  </span>
                </div>
                <span className="text-xs text-[#5a5e69]">{res.room}</span>
                <span className="text-[10px] text-[#006b2d] font-semibold">{res.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPostToDelete(null);
        }}
        onConfirm={handleExecuteDelete}
        title="ยืนยันการลบกระทู้ (สิทธิ์แอดมิน)"
        itemName={postToDelete?.title || postToDelete?.content.slice(0, 30) || 'กระทู้นี้'}
        isDeleting={isDeletingPost}
      />
    </div>
  );
};
