import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  getDocs,
  setDoc,
  getDoc,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { PostItem, CommentItem, UserProfile, ReportItem } from '../types';
import { INITIAL_POSTS } from '../data/mockData';
import firebaseConfigData from '../../firebase-applet-config.json';

export const firebaseConfig = firebaseConfigData;

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is limited.');
    } else {
      console.log('Firebase connection probe status:', (error as Error)?.message || error);
    }
    return false;
  }
}

// Format relative time helper
export function formatTimeAgo(date: Date | Timestamp | null | undefined): string {
  if (!date) return 'เมื่อสักครู่';
  const target = date instanceof Timestamp ? date.toDate() : new Date(date);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (diffSec < 60) return 'เมื่อสักครู่';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} นาทีที่แล้ว`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} ชั่วโมงที่แล้ว`;
  const diffDays = Math.floor(diffSec / 86400);
  if (diffDays === 1) return 'เมื่อวานนี้';
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  return target.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

// Ensure initial seed data exists if collection is brand new
export async function seedInitialPostsIfEmpty(): Promise<void> {
  const path = 'posts';
  try {
    const existing = await getDocs(collection(db, path));
    if (!existing.empty) return;

    console.log('Seeding initial community posts to Cloud Firestore...');
    const batch = writeBatch(db);

    for (const post of INITIAL_POSTS) {
      const postRef = doc(collection(db, path));
      batch.set(postRef, {
        author: post.author,
        authorBuilding: post.authorBuilding || 'อาคารหอพักส่วนกลาง',
        authorRole: post.authorRole || null,
        category: post.category,
        categoryKey: post.categoryKey,
        categoryEmoji: post.categoryEmoji,
        title: post.title || '',
        content: post.content,
        imageUrl: post.imageUrl || null,
        imageCaption: post.imageCaption || null,
        likes: post.likes || 0,
        likedBy: [],
        commentsCount: post.comments.length,
        isUrgent: post.isUrgent || false,
        statusUpdate: post.statusUpdate || null,
        tags: post.tags || [],
        createdAt: serverTimestamp(),
      });

      // Also seed top comments as subcollection
      for (const comment of post.comments) {
        const commentRef = doc(collection(db, `posts/${postRef.id}/comments`));
        batch.set(commentRef, {
          author: comment.author,
          authorRole: comment.authorRole || null,
          content: comment.content,
          likes: comment.likes || 0,
          avatarColor: comment.avatarColor || 'bg-[#dee2ef]',
          createdAt: serverTimestamp(),
          replies: comment.replies || [],
        });
      }
    }

    await batch.commit();
    console.log('Seeding completed successfully.');
  } catch (error) {
    console.warn('Could not seed initial posts (might already exist or permission restricted):', error);
  }
}

// Subscribe to real-time posts
export function subscribePosts(
  onUpdate: (posts: PostItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'posts';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      try {
        const postsList: PostItem[] = [];

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const postId = docSnap.id;

          // Fetch comments for this post
          let comments: CommentItem[] = [];
          try {
            const commentsSnap = await getDocs(
              query(collection(db, `posts/${postId}/comments`), orderBy('createdAt', 'asc'))
            );
            comments = commentsSnap.docs.map((cDoc) => {
              const cData = cDoc.data();
              return {
                id: cDoc.id,
                author: cData.author || 'สมาชิกนิรนาม',
                authorRole: cData.authorRole || undefined,
                content: cData.content || '',
                likes: cData.likes || 0,
                timeAgo: formatTimeAgo(cData.createdAt),
                avatarColor: cData.avatarColor || 'bg-[#dee2ef]',
                replies: cData.replies || [],
              };
            });
          } catch {
            // fallback if comments subcollection fetch is pending
          }

          const currentUserId = auth.currentUser?.uid;
          const likedByArray: string[] = Array.isArray(data.likedBy) ? data.likedBy : [];
          const isLiked = currentUserId ? likedByArray.includes(currentUserId) : false;

          postsList.push({
            id: postId,
            author: data.author || 'สมาชิกนิรนาม',
            authorBuilding: data.authorBuilding || undefined,
            authorRole: data.authorRole || undefined,
            timeAgo: formatTimeAgo(data.createdAt),
            category: data.category || 'เรื่องหอพัก',
            categoryKey: data.categoryKey || 'dorm',
            categoryEmoji: data.categoryEmoji || '🏠',
            title: data.title || undefined,
            content: data.content || '',
            imageUrl: data.imageUrl || undefined,
            imageCaption: data.imageCaption || undefined,
            likes: typeof data.likes === 'number' ? data.likes : 0,
            isLiked,
            isUrgent: data.isUrgent || false,
            statusUpdate: data.statusUpdate || undefined,
            tags: data.tags || [],
            commentsCount: comments.length > 0 ? comments.length : (data.commentsCount || 0),
            comments,
          });
        }

        onUpdate(postsList);
      } catch (err) {
        console.error('Error processing posts snapshot:', err);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError) onError(wrapped as Error);
      }
    }
  );

  return unsubscribe;
}

// Create a new post in Cloud Firestore
export async function createPostInFirestore(
  newPostData: Partial<PostItem>,
  user: UserProfile,
  userId?: string
): Promise<string> {
  const path = 'posts';
  try {
    const docRef = await addDoc(collection(db, path), {
      author: newPostData.author || `สมาชิกนิรนาม ${user.anonymousTag}`,
      authorUid: userId || auth.currentUser?.uid || 'anonymous',
      authorBuilding: newPostData.authorBuilding || `${user.realBuilding} • ${user.floor}`,
      category: newPostData.category || 'เรื่องหอพัก',
      categoryKey: newPostData.categoryKey || 'dorm',
      categoryEmoji: newPostData.categoryEmoji || '🏠',
      title: newPostData.title || null,
      content: newPostData.content || '',
      imageUrl: newPostData.imageUrl || null,
      tags: newPostData.tags || [],
      likes: 0,
      likedBy: [],
      commentsCount: 0,
      isUrgent: newPostData.isUrgent || false,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Like / Unlike post in Cloud Firestore
export async function toggleLikePostInFirestore(
  postId: string,
  currentLiked: boolean,
  userId?: string
): Promise<void> {
  const path = `posts/${postId}`;
  const effectiveUid = userId || auth.currentUser?.uid || 'anonymous_user';

  try {
    const postRef = doc(db, 'posts', postId);
    if (currentLiked) {
      await updateDoc(postRef, {
        likes: increment(-1),
        likedBy: arrayRemove(effectiveUid),
      });
    } else {
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: arrayUnion(effectiveUid),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Add comment to Cloud Firestore
export async function addCommentToFirestore(
  postId: string,
  commentText: string,
  authorName: string,
  userUid?: string
): Promise<string> {
  const path = `posts/${postId}/comments`;
  try {
    const commentRef = await addDoc(collection(db, path), {
      author: authorName,
      authorUid: userUid || auth.currentUser?.uid || 'anonymous',
      content: commentText,
      likes: 0,
      avatarColor: 'bg-[#e1e0ff]',
      createdAt: serverTimestamp(),
      replies: [],
    });

    // Increment commentsCount on parent post
    await updateDoc(doc(db, 'posts', postId), {
      commentsCount: increment(1),
    });

    return commentRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Save or update user profile in Firestore
export async function saveUserProfileToFirestore(
  uid: string,
  profile: Partial<UserProfile>
): Promise<void> {
  const path = `users/${uid}`;
  try {
    await setDoc(
      doc(db, 'users', uid),
      {
        ...profile,
        uid,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Load user profile from Firestore
export async function getUserProfileFromFirestore(
  uid: string
): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Delete a post from Cloud Firestore (Admin or Owner)
export async function deletePostInFirestore(postId: string): Promise<void> {
  const path = `posts/${postId}`;
  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Toggle post urgent/announcement status in Firestore
export async function toggleUrgentPostInFirestore(
  postId: string,
  isUrgent: boolean
): Promise<void> {
  const path = `posts/${postId}`;
  try {
    await updateDoc(doc(db, 'posts', postId), {
      isUrgent,
      statusUpdate: isUrgent ? 'ประกาศด่วนจากนิติหอพัก' : null,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Create a safety report in Cloud Firestore
export async function createReportInFirestore(reportData: {
  targetTitle: string;
  targetPostId?: string;
  reason: string;
  reasonLabel: string;
  details?: string;
}): Promise<string> {
  const path = 'reports';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...reportData,
      reporterUid: auth.currentUser?.uid || 'anonymous',
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Fetch all safety reports (for Admin Dashboard)
export async function fetchReportsFromFirestore(): Promise<ReportItem[]> {
  const path = 'reports';
  try {
    const snapshot = await getDocs(query(collection(db, path), orderBy('createdAt', 'desc')));
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        targetTitle: data.targetTitle || 'โพสต์ในระบบ',
        targetPostId: data.targetPostId || undefined,
        reason: data.reason || 'other',
        reasonLabel: data.reasonLabel || data.reason || 'เนื้อหาไม่เหมาะสม',
        details: data.details || undefined,
        reporterUid: data.reporterUid,
        createdAt: formatTimeAgo(data.createdAt),
        status: data.status || 'pending',
      };
    });
  } catch (error) {
    console.warn('Could not fetch reports:', error);
    return [];
  }
}

// Delete or dismiss report in Firestore
export async function deleteReportInFirestore(reportId: string): Promise<void> {
  const path = `reports/${reportId}`;
  try {
    await deleteDoc(doc(db, 'reports', reportId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
