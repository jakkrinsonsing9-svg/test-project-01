export type ActiveTab = 'home' | 'categories' | 'verify' | 'login' | 'settings' | 'notifications' | 'admin';

export interface ReportItem {
  id: string;
  targetTitle: string;
  targetPostId?: string;
  reason: string;
  reasonLabel: string;
  details?: string;
  reporterUid?: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface CommentItem {
  id: string;
  author: string;
  authorUid?: string;
  authorRole?: string;
  timeAgo: string;
  content: string;
  likes: number;
  isLiked?: boolean;
  avatarColor?: string;
  replies?: CommentItem[];
}

export interface PostItem {
  id: string;
  author: string;
  authorUid?: string;
  authorBuilding?: string;
  authorRole?: string;
  timeAgo: string;
  category: string;
  categoryKey: string;
  categoryEmoji: string;
  title?: string;
  content: string;
  imageUrl?: string;
  imageCaption?: string;
  likes: number;
  isLiked?: boolean;
  isUrgent?: boolean;
  statusUpdate?: string;
  tags?: string[];
  commentsCount: number;
  comments: CommentItem[];
}

export interface CategoryItem {
  id: string;
  title: string;
  emoji: string;
  subtitle: string;
  description: string;
  postCount: number;
  tagSnippet?: string;
  active?: boolean;
  featured?: boolean;
  sparkline?: boolean;
  latestActivity?: string;
}

export interface UserProfile {
  uid?: string;
  email?: string;
  avatarUrl?: string;
  studentIdMasked: string;
  emailMasked: string;
  realBuilding: string;
  realRoom: string;
  anonymousTag: string;
  floor: string;
  isVerified: boolean;
  defaultAnonymous: boolean;
  role?: 'resident' | 'staff' | 'admin';
  isAdmin?: boolean;
  darkMode?: boolean;
  notifications: {
    replies: boolean;
    likes: boolean;
    urgentNotices: boolean;
  };
}
