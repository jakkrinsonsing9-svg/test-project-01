import React, { useState, useEffect } from 'react';
import { ActiveTab, PostItem, UserProfile } from './types';
import { INITIAL_POSTS, INITIAL_USER } from './data/mockData';
import { applyThemeVariables, getInitialDarkMode } from './utils/theme';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { HomeFeed } from './components/HomeFeed';
import { CategoriesView } from './components/CategoriesView';
import { VerificationView } from './components/VerificationView';
import { LoginView } from './components/LoginView';
import { SettingsView } from './components/SettingsView';
import { NotificationsView } from './components/NotificationsView';
import { AdminView } from './components/AdminView';
import { CreatePostModal } from './components/CreatePostModal';
import { ReportModal } from './components/ReportModal';
import { FirebaseRulesModal } from './components/FirebaseRulesModal';
import {
  auth,
  testConnection,
  seedInitialPostsIfEmpty,
  subscribePosts,
  createPostInFirestore,
  toggleLikePostInFirestore,
  addCommentToFirestore,
  saveUserProfileToFirestore,
  getUserProfileFromFirestore,
  deletePostInFirestore,
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [darkMode, setDarkMode] = useState<boolean>(() => getInitialDarkMode());
  const [user, setUser] = useState<UserProfile>(() => {
    const savedAvatar = typeof window !== 'undefined' ? localStorage.getItem('dormtalk_avatar') : null;
    return {
      ...INITIAL_USER,
      avatarUrl: savedAvatar || INITIAL_USER.avatarUrl,
      darkMode: getInitialDarkMode(),
    };
  });
  const [posts, setPosts] = useState<PostItem[]>(INITIAL_POSTS);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(2);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(true);
  const [hasRulesModalOpen, setHasRulesModalOpen] = useState<boolean>(false);
  const [hasRulesNotice, setHasRulesNotice] = useState<boolean>(false);

  // Sync theme variables and class on mount & changes
  useEffect(() => {
    applyThemeVariables(darkMode);
  }, [darkMode]);

  const handleToggleDarkMode = (explicitValue?: boolean) => {
    const next = explicitValue !== undefined ? explicitValue : !darkMode;
    setDarkMode(next);
    applyThemeVariables(next);
    setUser((prev) => {
      const updated = { ...prev, darkMode: next };
      if (auth.currentUser?.uid) {
        saveUserProfileToFirestore(auth.currentUser.uid, { darkMode: next });
      }
      return updated;
    });
    showToast(
      next
        ? 'เปิดใช้งานโหมดมืด (Dark Mode) • อัปเดต CSS Variables สำเร็จ'
        : 'สลับเป็นโหมดสว่าง (Light Mode) เรียบร้อยแล้ว'
    );
  };

  // Modals
  const [isCreatePostOpen, setIsCreatePostOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportTarget, setReportTarget] = useState<string>('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Firebase Initialization & Auth state listener
  useEffect(() => {
    let unsubscribePosts: (() => void) | null = null;

    async function initFirebase() {
      try {
        await testConnection();
        setFirebaseConnected(true);
        // Seed initial posts if the Firestore collection is fresh
        await seedInitialPostsIfEmpty();
      } catch (e) {
        console.warn('Firebase connection check:', e);
      } finally {
        setIsFirebaseLoading(false);
      }

      // Real-time Firestore subscription for posts & comments
      unsubscribePosts = subscribePosts(
        (updatedPosts) => {
          if (updatedPosts) {
            if (updatedPosts.length > 0) {
              setPosts(updatedPosts);
            }
            setHasRulesNotice(false);
          }
        },
        (error) => {
          console.warn('Firestore subscription notice:', error.message);
          if (
            error.message.includes('Missing or insufficient permissions') ||
            error.message.includes('permission-denied')
          ) {
            setHasRulesNotice(true);
          }
        }
      );
    }

    initFirebase();

    // Firebase Auth observer
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await getUserProfileFromFirestore(fbUser.uid);
          const isMasterAdmin = fbUser.email === '69011219002@msu.ac.th';
          if (profile) {
            setUser((prev) => ({
              ...prev,
              ...profile,
              uid: fbUser.uid,
              email: fbUser.email || undefined,
              isAdmin: Boolean(profile.isAdmin || isMasterAdmin),
              role: profile.role || (isMasterAdmin ? 'staff' : 'resident'),
            }));
          } else {
            // New user, assign initial profile
            setUser((prev) => ({
              ...prev,
              uid: fbUser.uid,
              email: fbUser.email || undefined,
              studentIdMasked: fbUser.email ? fbUser.email.slice(0, 4) + '****' : prev.studentIdMasked,
              isAdmin: isMasterAdmin,
              role: isMasterAdmin ? 'staff' : 'resident',
            }));
          }
        } catch (e) {
          console.error('Error fetching user profile:', e);
        }
      } else {
        // Guest mode fallback
        setUser((prev) => ({
          ...INITIAL_USER,
          darkMode: prev.darkMode,
        }));
      }
    });

    return () => {
      if (unsubscribePosts) unsubscribePosts();
      unsubscribeAuth();
    };
  }, []);

  // Handlers for Posts, Likes, Comments in Cloud Firestore
  const handleLikePost = async (postId: string) => {
    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const currentLiked = Boolean(targetPost.isLiked);

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const nextLiked = !currentLiked;
          return {
            ...post,
            isLiked: nextLiked,
            likes: nextLiked ? post.likes + 1 : Math.max(0, post.likes - 1),
          };
        }
        return post;
      })
    );

    // Persist to Cloud Firestore
    try {
      await toggleLikePostInFirestore(postId, currentLiked, auth.currentUser?.uid);
    } catch (err) {
      console.warn('Could not sync like to Firestore:', err);
    }
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    const authorName = `สมาชิกนิรนาม ${user.anonymousTag}`;

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const newComment = {
            id: `c-${Date.now()}`,
            author: authorName,
            timeAgo: 'เมื่อสักครู่',
            content: commentText,
            likes: 0,
            avatarColor: 'bg-[#e1e0ff]',
          };
          return {
            ...post,
            commentsCount: (post.commentsCount || post.comments.length) + 1,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      })
    );
    showToast('เพิ่มความคิดเห็นเรียบร้อยแล้ว');

    // Persist to Cloud Firestore
    try {
      await addCommentToFirestore(postId, commentText, authorName, auth.currentUser?.uid);
    } catch (err) {
      console.warn('Could not sync comment to Firestore:', err);
    }
  };

  const handleCreatePost = async (newPostData: Partial<PostItem>) => {
    showToast('กำลังบันทึกโพสต์ลง Cloud Firestore...');
    setActiveTab('home');

    try {
      await createPostInFirestore(newPostData, user, auth.currentUser?.uid);
      showToast('สร้างโพสต์ใหม่สำเร็จบน Cloud Firestore ✨');
    } catch (err) {
      console.error('Failed to create post in Firestore:', err);
      // Fallback local addition if Firestore write fails
      const localPost: PostItem = {
        id: `post-${Date.now()}`,
        author: newPostData.author || `สมาชิกนิรนาม ${user.anonymousTag}`,
        authorBuilding: newPostData.authorBuilding || `${user.realBuilding} • ${user.floor}`,
        timeAgo: 'เมื่อสักครู่',
        category: newPostData.category || 'เรื่องหอพัก',
        categoryKey: newPostData.categoryKey || 'dorm',
        categoryEmoji: newPostData.categoryEmoji || '🏠',
        content: newPostData.content || '',
        imageUrl: newPostData.imageUrl,
        tags: newPostData.tags,
        likes: 1,
        isLiked: true,
        commentsCount: 0,
        comments: [],
      };
      setPosts([localPost, ...posts]);
      showToast('โพสต์ถูกสร้างในหน่วยความจำเรียบร้อยแล้ว');
    }
  };

  const handleDeletePost = async (postId: string) => {
    // Optimistic UI update
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await deletePostInFirestore(postId);
      showToast('ลบกระทู้เรียบร้อยแล้ว (Cloud Firestore) 🗑️');
    } catch (err) {
      console.warn('Failed to delete post in Firestore:', err);
      showToast('ลบกระทู้เรียบร้อยแล้ว');
    }
  };

  const handleUpdateUser = async (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
    if (updated.avatarUrl && typeof window !== 'undefined') {
      localStorage.setItem('dormtalk_avatar', updated.avatarUrl);
    }
    if (auth.currentUser?.uid) {
      try {
        await saveUserProfileToFirestore(auth.currentUser.uid, updated);
        showToast('อัปเดตข้อมูลผู้ใช้ใน Cloud Firestore สำเร็จ');
      } catch (err) {
        console.warn('Failed to sync user profile:', err);
      }
    }
  };

  const handleOpenReportModal = (title: string) => {
    setReportTarget(title);
    setIsReportModalOpen(true);
  };

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-on-surface)] selection:bg-[#e1e0ff] selection:text-[#4648d4] transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#111c2d] text-white shadow-xl text-xs font-medium border border-white/10">
            <span
              className="material-symbols-outlined text-[18px] text-[#6bff8f]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Firebase Rules Helper Alert Banner */}
      {hasRulesNotice && (
        <div className="bg-[#fff8e1] dark:bg-[#2e2614] border-b border-[#ffe082] dark:border-[#5c4a1e] px-4 py-2 text-xs text-[#795548] dark:text-[#ffecb3] flex items-center justify-between gap-3 sticky top-16 z-30 shadow-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 max-w-5xl mx-auto flex-1 flex-wrap">
            <span
              className="material-symbols-outlined text-[18px] text-[#f57c00]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              security
            </span>
            <span>
              <strong>แจ้งเตือน Firebase Security Rules:</strong> โครงการ <code className="font-mono font-bold text-[#b26a00] dark:text-[#ffd54f]">dormtalk-131e0</code> บน Firebase Console ยังไม่ได้ Publish สิทธิ์อนุญาตให้เข้าถึงคอลเลกชัน <code>posts</code>
            </span>
            <button
              onClick={() => setHasRulesModalOpen(true)}
              className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f57c00] text-white hover:bg-[#e65100] font-semibold text-[11px] transition-colors shrink-0 shadow-2xs"
            >
              <span>ดูวิธีคัดลอก Rules</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
          <button
            onClick={() => setHasRulesNotice(false)}
            className="text-[#8d6e63] dark:text-[#ffecb3] hover:text-[#3e2723] p-1 rounded transition-colors"
            title="ปิดการแจ้งเตือน"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && (
          <HomeFeed
            posts={posts}
            user={user}
            activeCategoryFilter={activeCategoryFilter}
            setActiveCategoryFilter={setActiveCategoryFilter}
            onOpenCreatePost={() => setIsCreatePostOpen(true)}
            onOpenReportModal={handleOpenReportModal}
            onLikePost={handleLikePost}
            onAddComment={handleAddComment}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            onDeletePost={handleDeletePost}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView
            posts={posts}
            onOpenCreatePost={() => setIsCreatePostOpen(true)}
            onLikePost={handleLikePost}
            setActiveTab={setActiveTab}
            setActiveCategoryFilter={setActiveCategoryFilter}
            onOpenReportModal={handleOpenReportModal}
            initialSearchQuery={searchQuery}
          />
        )}

        {activeTab === 'verify' && (
          <VerificationView
            user={user}
            onUpdateUser={handleUpdateUser}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'login' && (
          <LoginView
            user={user}
            setActiveTab={setActiveTab}
            onLoginSuccess={(updatedProfile) => {
              if (updatedProfile) {
                setUser((prev) => ({ ...prev, ...updatedProfile }));
              }
              showToast('เข้าสู่ระบบสำเร็จผ่าน Firebase Auth');
            }}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            user={user}
            onUpdateUser={handleUpdateUser}
            setActiveTab={setActiveTab}
            onOpenReportModal={handleOpenReportModal}
            onShowToast={showToast}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onOpenRulesModal={() => setHasRulesModalOpen(true)}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsView
            setActiveTab={setActiveTab}
            onClearUnread={() => setUnreadNotificationsCount(0)}
            setActiveCategoryFilter={setActiveCategoryFilter}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView
            user={user}
            posts={posts}
            setPosts={setPosts}
            onUpdateUser={handleUpdateUser}
            onShowToast={showToast}
            onOpenCreatePost={() => setIsCreatePostOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
        unreadCount={unreadNotificationsCount}
        isAdmin={Boolean(user.isAdmin || user.role === 'staff' || user.role === 'admin' || user.email === '69011219002@msu.ac.th')}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmitPost={handleCreatePost}
        user={user}
      />

      {/* Content Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={showToast}
        targetTitle={reportTarget}
      />

      {/* Cloud Firestore Security Rules Instruction Modal */}
      <FirebaseRulesModal
        isOpen={hasRulesModalOpen}
        onClose={() => setHasRulesModalOpen(false)}
      />
    </div>
  );
}
