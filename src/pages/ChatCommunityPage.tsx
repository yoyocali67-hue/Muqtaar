import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Image as ImageIcon,
  BarChart2,
  Link as LinkIcon,
  Search,
  Plus,
  ArrowLeft,
  ChevronLeft,
  ArrowUp,
  MessageCircle,
  MoreVertical,
  SlidersHorizontal,
  Check,
  CheckCheck,
  Gamepad2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  X,
  Paperclip,
  Smile,
  Flame,
  Award,
  Trophy,
  Heart,
  Bookmark,
  Share2,
  Eye,
  Video,
  Copy,
  Users,
  Flag,
  Ban,
  Quote,
} from 'lucide-react';
import {
  AppPage,
  CommunityPost,
  CommunityComment,
  ChatMessage,
  ChatConversation,
  UserCommunityProfile,
  FollowerUser,
} from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

interface ChatCommunityPageProps {
  onNavigate: (page: AppPage) => void;
}

type MainTab = 'community' | 'dm';
type ProfileSubTab = 'overview' | 'stats' | 'matches';

export function ChatCommunityPage({ onNavigate }: ChatCommunityPageProps) {
  const { lang } = useLanguage();

  // Navigation / View states
  const [activeTab, setActiveTab] = useState<MainTab>('community');
  const [sortMode, setSortMode] = useState<'latest' | 'popular'>('latest');

  // Community data states
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Create post modal / view state
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImageUrl, setNewPostImageUrl] = useState('');
  const [newPostVideoUrl, setNewPostVideoUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [quoteTargetPost, setQuoteTargetPost] = useState<CommunityPost | null>(null);
  const [composerError, setComposerError] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  // Social Share & Report Modals
  const [shareModalPost, setShareModalPost] = useState<CommunityPost | null>(null);
  const [shareToast, setShareToast] = useState('');
  const [friendsList, setFriendsList] = useState<FollowerUser[]>([]);
  const [reportModalPost, setReportModalPost] = useState<CommunityPost | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [activeDropdownPostId, setActiveDropdownPostId] = useState<string | null>(null);

  // Selected post comments modal
  const [activeCommentPost, setActiveCommentPost] = useState<CommunityPost | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // User Profile modal state (Screen 6)
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserCommunityProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileTab, setProfileTab] = useState<ProfileSubTab>('overview');

  // Conversations & Messaging states (Screen 4 & Screen 5)
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [searchConvQuery, setSearchConvQuery] = useState('');
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chatInputText, setChatInputText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteTime, setInviteTime] = useState('Today • 9:00 PM');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);

  // Player session token
  const playerToken = localStorage.getItem('somplay_player_token') || undefined;

  // Prohibited words client check
  const PROHIBITED_WORDS = [
    'wasakh', 'doqon', 'dabaal', 'nacas', 'khaniis', 'tuug', 'caay', 'dayuus',
    'fuck', 'bitch', 'asshole', 'bastard', 'whore', 'slut', 'scam', 'cheat'
  ];

  const checkProhibitedContent = (text: string): boolean => {
    const lower = text.toLowerCase();
    for (const word of PROHIBITED_WORDS) {
      const regex = new RegExp(`(^|\\s|[.,!?;])${word}($|\\s|[.,!?;])`, 'i');
      if (regex.test(lower)) return true;
    }
    return false;
  };

  // 1. Load Community Posts with sort mode
  const fetchPosts = async (mode: 'latest' | 'popular' = sortMode) => {
    try {
      setLoadingPosts(true);
      const res = await api.getCommunityPosts({ sort: mode, token: playerToken });
      if (res.success) {
        setPosts(res.posts);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // 2. Load Conversations & Friends
  const fetchConversationsAndFriends = async () => {
    try {
      setLoadingConversations(true);
      const res = await api.getConversations(playerToken);
      if (res.success) {
        setConversations(res.conversations);
      }
      if (playerToken) {
        const followersRes = await api.getFollowers(playerToken);
        if (followersRes.success) {
          setFriendsList(followersRes.friends || []);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations/friends:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchPosts(sortMode);
    fetchConversationsAndFriends();
  }, [sortMode]);

  // Scroll to bottom of message container internally without pulling entire page to footer
  useEffect(() => {
    if (activeConversation && chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
    }
  }, [conversationMessages, activeConversation]);

  // Load single conversation messages — keeps overall page at top
  const openConversation = async (conv: ChatConversation) => {
    setActiveConversation(conv);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    try {
      setLoadingMessages(true);
      const res = await api.getConversation(conv.id, playerToken);
      if (res.success) {
        setConversationMessages(res.messages);
        setTimeout(() => {
          if (chatMessagesContainerRef.current) {
            chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
          }
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 40);
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Start conversation directly from profile
  const handleStartMessageFromProfile = async (targetUser: UserCommunityProfile) => {
    setSelectedUserProfile(null);
    try {
      const res = await api.startConversation(
        targetUser.id,
        targetUser.name,
        targetUser.avatar,
        playerToken
      );
      if (res.success) {
        setActiveTab('dm');
        openConversation(res.conversation);
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  // Open user profile
  const handleOpenProfile = async (userId: string) => {
    try {
      setLoadingProfile(true);
      const res = await api.getUserProfile(userId, playerToken);
      if (res.success) {
        setSelectedUserProfile(res.profile);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Handle post reaction (upvote)
  const handleReactToPost = async (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isReacted = !p.userReacted;
          return {
            ...p,
            userReacted: isReacted,
            reactions: isReacted ? p.reactions + 1 : Math.max(0, p.reactions - 1),
          };
        }
        return p;
      })
    );

    try {
      const res = await api.reactToPost(postId, playerToken);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, reactions: res.reactions, userReacted: res.userReacted } : p
        )
      );
    } catch (err) {
      console.error('Failed to react:', err);
    }
  };

  // Handle create post submit with moderation, video, and quote
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    if (checkProhibitedContent(newPostContent)) {
      setComposerError('Qoraalkaagu wuxuu ka kooban yahay ereyo aan la oggolayn. Fadlan ilaali anshaxa bulshada. (Prohibited language detected)');
      return;
    }
    setComposerError('');

    try {
      setSubmittingPost(true);
      const res = await api.createCommunityPost(
        {
          content: newPostContent.trim(),
          imageUrl: newPostImageUrl.trim() || undefined,
          videoUrl: newPostVideoUrl.trim() || undefined,
          quotePost: quoteTargetPost ? {
            id: quoteTargetPost.id,
            authorName: quoteTargetPost.authorName,
            authorAvatar: quoteTargetPost.authorAvatar,
            content: quoteTargetPost.content,
            imageUrl: quoteTargetPost.imageUrl,
          } : undefined,
        },
        playerToken
      );

      if (res.success) {
        setPosts([res.post, ...posts]);
        setNewPostContent('');
        setNewPostImageUrl('');
        setNewPostVideoUrl('');
        setShowImageInput(false);
        setShowVideoInput(false);
        setQuoteTargetPost(null);
        setCreatePostOpen(false);
      }
    } catch (err: any) {
      setComposerError(err.message || 'Failed to create post');
      console.error('Failed to create post:', err);
    } finally {
      setSubmittingPost(false);
    }
  };

  // Handle post bookmark toggle
  const handleToggleBookmark = async (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.togglePostBookmark(postId, playerToken);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, userBookmarked: res.isBookmarked } : p))
      );
    } catch (err) {
      console.error('Failed to bookmark:', err);
    }
  };

  // Handle share post
  const handleSharePost = async (type: 'link' | 'chat' | 'quote', targetUserId?: string) => {
    if (!shareModalPost) return;

    try {
      if (type === 'link') {
        const postUrl = `${window.location.origin}/#post-${shareModalPost.id}`;
        await navigator.clipboard.writeText(postUrl);
        await api.sharePost(shareModalPost.id, { type: 'link' }, playerToken);
        setShareToast('Xiriiriyaha boostada waa la koobiyeeyay! (Link copied!)');
      } else if (type === 'chat' && targetUserId) {
        await api.sharePost(shareModalPost.id, { type: 'chat', targetUserId }, playerToken);
        setShareToast(`Boostada waxaa loo diray @${targetUserId}! (Sent to @${targetUserId}!)`);
      } else if (type === 'quote') {
        setQuoteTargetPost(shareModalPost);
        setShareModalPost(null);
        setCreatePostOpen(true);
        return;
      }

      setPosts((prev) =>
        prev.map((p) =>
          p.id === shareModalPost.id ? { ...p, sharesCount: (p.sharesCount || 0) + 1 } : p
        )
      );

      setTimeout(() => {
        setShareToast('');
        setShareModalPost(null);
      }, 1500);
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  // Handle block user
  const handleBlockUser = async (userId: string) => {
    if (!confirm(`Are you sure you want to block @${userId}? Their posts will be hidden.`)) return;
    try {
      await api.blockUser(userId, playerToken);
      setPosts((prev) => prev.filter((p) => p.authorId !== userId && p.authorName !== userId));
      setActiveDropdownPostId(null);
      alert(`User @${userId} has been blocked.`);
    } catch (err) {
      console.error('Failed to block user:', err);
    }
  };

  // Handle report submit
  const handleReportPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalPost || !reportReason.trim()) return;

    try {
      setReportSubmitting(true);
      await api.reportContent(
        {
          targetType: 'post',
          targetId: reportModalPost.id,
          reason: reportReason.trim(),
        },
        playerToken
      );
      alert('Warbixintaada waa la helay, mahadsanid. (Report received.)');
      setReportModalPost(null);
      setReportReason('');
      setActiveDropdownPostId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  };

  // Handle comment submit
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommentPost || !newCommentText.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await api.addPostComment(
        activeCommentPost.id,
        { text: newCommentText.trim() },
        playerToken
      );

      if (res.success) {
        const updatedPost = {
          ...activeCommentPost,
          commentsCount: res.commentsCount,
          comments: [...(activeCommentPost.comments || []), res.comment],
        };
        setActiveCommentPost(updatedPost);
        setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
        setNewCommentText('');
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle send DM message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConversation || !chatInputText.trim()) return;

    const textToSend = chatInputText.trim();
    setChatInputText('');

    try {
      setSendingMessage(true);
      const res = await api.sendChatMessage(activeConversation.id, { text: textToSend }, playerToken);
      if (res.success) {
        setConversationMessages((prev) => [...prev, res.message]);
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConversation.id ? res.conversation : c))
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Send Match Invite in chat
  const handleSendMatchInvite = async () => {
    if (!activeConversation) return;
    setInviteModalOpen(false);

    try {
      setSendingMessage(true);
      const res = await api.sendChatMessage(
        activeConversation.id,
        {
          type: 'match_invite',
          inviteData: {
            matchType: 'eFootball 2026',
            scheduledTime: inviteTime,
            status: 'pending',
          },
        },
        playerToken
      );
      if (res.success) {
        setConversationMessages((prev) => [...prev, res.message]);
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConversation.id ? res.conversation : c))
        );
      }
    } catch (err) {
      console.error('Failed to send invite:', err);
    } finally {
      setSendingMessage(false);
    }
  };



  // Calculate unread count total
  const totalUnreadCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // Time format helper
  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  // Metric count format helper
  const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div className="w-full max-w-md mx-auto px-3 sm:px-4 pt-3 pb-24 text-slate-800 animate-in fade-in duration-200">
      
      {/* ======================================================== */}
      {/* 1. TOP HERO BANNER (MATCHING REFERENCE SCREEN 1) */}
      {/* ======================================================== */}
      {!activeConversation && !createPostOpen && (
        <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#032b72] via-[#0442ab] to-[#011e54] text-white shadow-md shadow-blue-950/15 mb-4 p-5 min-h-[140px] flex items-center justify-between">
          {/* Subtle Stadium Floodlights Glow Effect */}
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-400/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Left Text */}
          <div className="relative z-10 max-w-[65%]">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              Chat Community
            </h1>
            <p className="text-xs text-blue-100 font-medium mt-1 tracking-wide">
              Talk • Share • Play Together
            </p>
          </div>

          {/* Right Floating Stadium Speech Emblem */}
          <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg shadow-black/20">
            <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow" />
            <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-emerald-400 border-2 border-[#0442ab] rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SEGMENT PILL SWITCH: Community vs DM (SCREEN 1 & 4) */}
      {/* ======================================================== */}
      {!activeConversation && !createPostOpen && (
        <div className="flex items-center justify-between bg-slate-100/90 p-1 rounded-full mb-4 shadow-inner border border-slate-200/60">
          <button
            onClick={() => setActiveTab('community')}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-full transition-all duration-150 cursor-pointer ${
              activeTab === 'community'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'so' ? 'Community' : lang === 'ar' ? 'المجتمع' : 'Community'}
          </button>

          <button
            onClick={() => setActiveTab('dm')}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'dm'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{lang === 'so' ? 'DM' : lang === 'ar' ? 'الرسائل' : 'DM'}</span>
            {totalUnreadCount > 0 && (
              <span
                className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                  activeTab === 'dm' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                }`}
              >
                {totalUnreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. COMMUNITY FEED VIEW (SCREEN 1 & SCREEN 2) */}
      {/* ======================================================== */}
      {activeTab === 'community' && !activeConversation && !createPostOpen && (
        <div className="flex flex-col gap-3">
          {/* Feed Sub-header with Filter */}
          <div className="flex items-center justify-between px-1">
            <h2 className="font-extrabold text-base text-slate-900">
              {lang === 'so' ? 'Community' : lang === 'ar' ? 'المجتمع' : 'Community'}
            </h2>

            {/* Filter Toggle: Latest vs Popular */}
            <div className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-xl p-0.5 shadow-xs text-xs font-semibold">
              <button
                onClick={() => setSortMode('latest')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  sortMode === 'latest' ? 'bg-blue-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setSortMode('popular')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  sortMode === 'popular' ? 'bg-blue-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Popular</span>
              </button>
            </div>
          </div>

          {/* Posts List */}
          {loadingPosts ? (
            <div className="flex flex-col gap-3 pt-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs animate-pulse"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                    <div className="flex-1">
                      <div className="w-24 h-3 bg-slate-200 rounded mb-1.5" />
                      <div className="w-14 h-2 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="w-full h-4 bg-slate-200 rounded mb-2" />
                  <div className="w-3/4 h-4 bg-slate-200 rounded mb-3" />
                  <div className="w-20 h-6 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center flex flex-col items-center">
              <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
              <p className="font-bold text-slate-700">Wali boostooyin ma jiraan</p>
              <p className="text-xs text-slate-400 mt-1">No community posts yet. Be the first!</p>
              <button
                onClick={() => setCreatePostOpen(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm hover:bg-blue-700 cursor-pointer"
              >
                + Create Post
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-blue-100 transition-all flex flex-col justify-between relative"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      onClick={() => handleOpenProfile(post.authorId || post.authorName)}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <div className="relative">
                        <img
                          src={
                            post.authorAvatar ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                          }
                          alt={post.authorName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-100 group-hover:ring-2 group-hover:ring-blue-400 transition-all"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white">
                          <Check className="w-2 h-2 stroke-[3]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                            {post.authorName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {formatTimeAgo(post.createdAt)} • eFootball
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveDropdownPostId(activeDropdownPostId === post.id ? null : post.id)
                        }
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu (Report / Block) */}
                      {activeDropdownPostId === post.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs">
                          <button
                            onClick={() => {
                              setReportModalPost(post);
                              setActiveDropdownPostId(null);
                            }}
                            className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Flag className="w-3.5 h-3.5 text-rose-500" />
                            <span>Report Post</span>
                          </button>
                          <button
                            onClick={() => handleBlockUser(post.authorId || post.authorName)}
                            className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5 text-rose-600" />
                            <span>Block User</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Post Caption */}
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-slate-800 leading-snug whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* Video Player if present */}
                    {post.videoUrl && (
                      <div className="mt-2.5 rounded-xl overflow-hidden bg-black border border-slate-100 aspect-video max-h-56">
                        <video
                          src={post.videoUrl}
                          controls
                          className="w-full h-full object-cover"
                          poster={post.imageUrl}
                        />
                      </div>
                    )}

                    {/* Attached Image if present and no video */}
                    {!post.videoUrl && post.imageUrl && (
                      <div className="mt-2.5 rounded-xl overflow-hidden bg-slate-900 border border-slate-100 aspect-video max-h-56">
                        <img
                          src={post.imageUrl}
                          alt="Post attachment"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Quoted Post Preview */}
                    {post.quotePost && (
                      <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1 text-xs">
                        <span className="font-bold text-slate-900">@{post.quotePost.authorName}</span>
                        <p className="text-slate-600 line-clamp-2">{post.quotePost.content}</p>
                      </div>
                    )}
                  </div>

                  {/* Interactions Footer (Like, Comments, Views, Save, Share) */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs text-slate-500 font-bold">
                    <div className="flex items-center gap-3">
                      {/* Upvote / Like Button */}
                      <button
                        onClick={(e) => handleReactToPost(post.id, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                          post.userReacted
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${post.userReacted ? 'fill-white' : ''}`} />
                        <span>{post.reactions}</span>
                      </button>

                      {/* Comment Count Button */}
                      <button
                        onClick={() => setActiveCommentPost(post)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{post.commentsCount || 0}</span>
                      </button>

                      {/* View Count */}
                      <div className="flex items-center gap-1 text-slate-400 font-medium">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{formatCount(post.views || 1900)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Share Button */}
                      <button
                        onClick={() => setShareModalPost(post)}
                        className="p-1.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Share post"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {/* Bookmark / Save Button */}
                      <button
                        onClick={(e) => handleToggleBookmark(post.id, e)}
                        className="p-1.5 rounded-full text-slate-400 hover:text-[#E52538] hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Save / Bookmark post"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${post.userBookmarked ? 'fill-[#E52538] text-[#E52538]' : ''}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Floating Action Button (Create Post) */}
          <button
            onClick={() => setCreatePostOpen(true)}
            className="fixed bottom-20 right-4 sm:right-6 z-30 w-13 h-13 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Create Post"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. CREATE POST SCREEN / MODAL (SCREEN 3) */}
      {/* ======================================================== */}
      {createPostOpen && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm animate-in fade-in duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <button
              onClick={() => {
                setCreatePostOpen(false);
                setQuoteTargetPost(null);
                setComposerError('');
              }}
              className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-bold text-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Create Post</span>
            </button>
          </div>

          {/* Error Banner (Moderation warning) */}
          {composerError && (
            <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <Ban className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{composerError}</span>
            </div>
          )}

          {/* Quoted Post Card Preview if Quoting */}
          {quoteTargetPost && (
            <div className="mb-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 relative flex items-start gap-2.5">
              <Quote className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-xs text-slate-900 block">
                  Quoting @{quoteTargetPost.authorName}
                </span>
                <p className="text-xs text-slate-600 truncate">{quoteTargetPost.content}</p>
              </div>
              <button
                type="button"
                onClick={() => setQuoteTargetPost(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCreatePost} className="flex flex-col gap-3">
            <textarea
              rows={4}
              value={newPostContent}
              onChange={(e) => {
                setNewPostContent(e.target.value);
                if (composerError) setComposerError('');
              }}
              placeholder="What's on your mind? Share eFootball formations, match highlights, or tactical tips..."
              className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white resize-none text-slate-800"
              autoFocus
            />

            {/* Optional Image URL Input */}
            {showImageInput && (
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <input
                  type="url"
                  value={newPostImageUrl}
                  onChange={(e) => setNewPostImageUrl(e.target.value)}
                  placeholder="Paste squad image URL..."
                  className="w-full text-xs bg-transparent focus:outline-none text-slate-700"
                />
                {newPostImageUrl && (
                  <button
                    type="button"
                    onClick={() => setNewPostImageUrl('')}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Optional Video URL Input */}
            {showVideoInput && (
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <Video className="w-4 h-4 text-purple-600 shrink-0" />
                <input
                  type="url"
                  value={newPostVideoUrl}
                  onChange={(e) => setNewPostVideoUrl(e.target.value)}
                  placeholder="Paste video clip URL (e.g. mp4)..."
                  className="w-full text-xs bg-transparent focus:outline-none text-slate-700"
                />
                {newPostVideoUrl && (
                  <button
                    type="button"
                    onClick={() => setNewPostVideoUrl('')}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Attachment Actions Row (Image | Video | Poll | Link) */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  showImageInput
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Image</span>
              </button>

              <button
                type="button"
                onClick={() => setShowVideoInput(!showVideoInput)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  showVideoInput
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-purple-600" />
                <span>Video</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!newPostContent.includes('Poll:')) {
                    setNewPostContent(
                      (prev) =>
                        prev +
                        (prev ? '\n\n' : '') +
                        'Poll: Who is the best CF in eFootball 2026?\n1. Mbappe\n2. Haaland\n3. Shevchenko'
                    );
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
              >
                <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Poll</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const url = prompt('Enter link URL (e.g. tactical guide):');
                  if (url) {
                    setNewPostContent((prev) => `${prev} ${url}`);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>Link</span>
              </button>
            </div>

            {/* Submit Post Button */}
            <button
              type="submit"
              disabled={submittingPost || !newPostContent.trim()}
              className="mt-2 w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {submittingPost ? 'Posting...' : 'Post to Community'}
            </button>
          </form>

          {/* Recent Posts Section (Screen 3 Bottom Stream) */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-3">
              Recent Posts
            </h3>
            <div className="flex flex-col gap-2.5">
              {posts.slice(0, 3).map((p) => (
                <div key={p.id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <img
                      src={
                        p.authorAvatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                      }
                      alt=""
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-bold text-xs text-slate-800">{p.authorName}</span>
                    <span className="text-[10px] text-slate-400 ml-auto">{formatTimeAgo(p.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium line-clamp-2">{p.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MESSAGES / DM LIST VIEW (SCREEN 4) */}
      {/* ======================================================== */}
      {activeTab === 'dm' && !activeConversation && !createPostOpen && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100/90 shadow-sm flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-1">
            <h2 className="font-extrabold text-base text-slate-900">
              {lang === 'so' ? 'Messages' : lang === 'ar' ? 'الرسائل' : 'Messages'}
            </h2>
            <button
              onClick={() => {
                // Quick start conversation with Ahmed_07 or first active player
                const target = 'Ahmed_07';
                handleOpenProfile(target);
              }}
              className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              title="Start new conversation"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Search Bar (Screen 4: Search conversations...) */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchConvQuery}
              onChange={(e) => setSearchConvQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
            />
          </div>

          {/* Conversations List */}
          {loadingConversations ? (
            <div className="flex flex-col gap-2 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-slate-200" />
                  <div className="flex-1">
                    <div className="w-24 h-3 bg-slate-200 rounded mb-1.5" />
                    <div className="w-40 h-2 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>Wadahadallo hore ma jiraan</p>
              <p className="mt-1">No messages yet. Message a player from community!</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {conversations
                .filter((c) => {
                  if (!searchConvQuery.trim()) return true;
                  const other =
                    c.participants.find((p) => p.id !== 'current-user') || c.participants[0];
                  return (
                    other?.name.toLowerCase().includes(searchConvQuery.toLowerCase()) ||
                    c.lastMessage?.toLowerCase().includes(searchConvQuery.toLowerCase())
                  );
                })
                .map((conv) => {
                  const partner =
                    conv.participants.find((p) => p.id !== 'current-user') || conv.participants[0];

                  return (
                    <div
                      key={conv.id}
                      onClick={() => openConversation(conv)}
                      className="flex items-center gap-3 py-3 px-1 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group"
                    >
                      {/* Avatar with Status Indicator */}
                      <div className="relative shrink-0">
                        <img
                          src={
                            partner?.avatar ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                          }
                          alt={partner?.name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-100 group-hover:scale-105 transition-transform"
                        />
                        {partner?.online && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                        )}
                      </div>

                      {/* Name & Last Message */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1">
                            <span className="font-extrabold text-sm text-slate-900 truncate">
                              {partner?.name}
                            </span>
                            <div className="w-3.5 h-3.5 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
                              <Check className="w-2 h-2 stroke-[3]" />
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">
                            {conv.lastMessageTime || 'Recently'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 font-medium truncate">
                          {conv.lastMessage || 'Say hi...'}
                        </p>
                      </div>

                      {/* Unread Badge (Screen 4 Blue Count) */}
                      {(conv.unreadCount || 0) > 0 && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. CONVERSATION / DM SCREEN (SCREEN 5) */}
      {/* ======================================================== */}
      {activeConversation && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[78vh] overflow-hidden">
          {/* Header */}
          {(() => {
            const partner =
              activeConversation.participants.find((p) => p.id !== 'current-user') ||
              activeConversation.participants[0];

            return (
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white/95 backdrop-blur-xs">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="p-1 -ml-1 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div
                    onClick={() => handleOpenProfile(partner.id)}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div className="relative">
                      <img
                        src={partner.avatar}
                        alt={partner.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-100"
                      />
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                    </div>

                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                          {partner.name}
                        </span>
                        <div className="w-3.5 h-3.5 bg-blue-600 rounded-full flex items-center justify-center text-white">
                          <Check className="w-2 h-2 stroke-[3]" />
                        </div>
                      </div>
                      <p className="text-[10px] text-emerald-600 font-bold">Online</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setInviteModalOpen(true)}
                    className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    title="Invite to eFootball Match"
                  >
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>Invite</span>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Messages Stream */}
          <div ref={chatMessagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafd]">
            {loadingMessages ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading messages...</div>
            ) : conversationMessages.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <p className="font-semibold text-slate-600">Start the conversation</p>
                <p className="mt-1">Send a message or a friendly match invite!</p>
              </div>
            ) : (
              conversationMessages.map((msg) => {
                const isMe = msg.senderId === 'current-user' || msg.senderName === 'You';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${
                      isMe ? 'ml-auto' : 'mr-auto'
                    }`}
                  >
                    {/* Match Invite Card (Screen 5 Rich Card) */}
                    {msg.type === 'match_invite' ? (
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs w-full max-w-[260px] text-left">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                            <Gamepad2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-900">Match Invite</h4>
                            <p className="text-[10px] text-slate-500 font-semibold">eFootball 2026</p>
                          </div>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 font-medium mb-3 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>{msg.inviteData?.scheduledTime || 'Today • 9:00 PM'}</span>
                        </div>

                        <button
                          onClick={() => {
                            alert('Match invite accepted! Opening eFootball 2026 lobby room.');
                          }}
                          className="w-full py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          View & Accept
                        </button>
                      </div>
                    ) : msg.type === 'post_share' && msg.sharedPost ? (
                      /* Rich Shared Post Card in DM */
                      <div
                        className={`p-3.5 rounded-2xl text-xs flex flex-col gap-2 shadow-xs w-full max-w-[280px] text-left ${
                          isMe
                            ? 'bg-[#0066ff] text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold opacity-90 text-[11px]">
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Shared post by @{msg.sharedPost.authorName}</span>
                        </div>
                        <p className="font-semibold line-clamp-2">{msg.sharedPost.content}</p>
                        {msg.sharedPost.imageUrl && (
                          <div className="rounded-xl overflow-hidden max-h-32 bg-slate-900/10">
                            <img src={msg.sharedPost.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setActiveTab('community');
                            setActiveConversation(null);
                          }}
                          className={`mt-1 py-1.5 px-3 rounded-xl font-bold text-center text-xs transition-colors cursor-pointer ${
                            isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          View in Community Feed
                        </button>
                      </div>
                    ) : (
                      /* Regular Chat Bubble */
                      <div
                        className={`py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-xs ${
                          isMe
                            ? 'bg-[#0066ff] text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-100/90 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}

                    {/* Timestamp & Delivery Checkmarks (✓✓) */}
                    <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400 font-semibold">
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-500 stroke-[2.5]" />}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar (Screen 5) */}
          <form
            onSubmit={handleSendMessage}
            className="p-2.5 sm:p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
              title="Attach Match Invite"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Input Box */}
            <input
              type="text"
              value={chatInputText}
              onChange={(e) => setChatInputText(e.target.value)}
              placeholder="Type a message..."
              enterKeyHint="send"
              className="flex-1 px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200/80 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
            />

            {/* Smiley Emoji helper */}
            <button
              type="button"
              onClick={() => setChatInputText((prev) => `${prev} 👍`)}
              className="p-1.5 text-slate-400 hover:text-amber-500 rounded-full transition-colors cursor-pointer"
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Blue Paper Plane Send Button */}
            <button
              type="submit"
              disabled={sendingMessage || !chatInputText.trim()}
              className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-sm disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. USER PROFILE MODAL / VIEW (SCREEN 6) */}
      {/* ======================================================== */}
      {selectedUserProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            
            {/* Stadium Backdrop Cover */}
            <div className="relative h-28 bg-gradient-to-r from-[#032b72] via-[#0442ab] to-[#011e54] p-3 flex items-start justify-between">
              <button
                onClick={() => setSelectedUserProfile(null)}
                className="w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-black uppercase text-blue-200 tracking-wider">
                User Profile
              </span>
            </div>

            {/* Profile Avatar & Actions Row */}
            <div className="px-5 pt-0 pb-4 relative -mt-10 flex flex-col">
              <div className="flex items-end justify-between mb-3">
                {/* Avatar with Verified Badge */}
                <div className="relative">
                  <img
                    src={selectedUserProfile.avatar}
                    alt={selectedUserProfile.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md bg-white"
                  />
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </div>

                {/* Follow & Message Buttons (Screen 6) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      const res = await api.followUser(selectedUserProfile.id, playerToken);
                      setSelectedUserProfile((prev) =>
                        prev
                          ? {
                              ...prev,
                              isFollowing: res.isFollowing,
                              followersCount:
                                prev.followersCount + (res.isFollowing ? 1 : -1),
                            }
                          : null
                      );
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedUserProfile.isFollowing
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                    }`}
                  >
                    {selectedUserProfile.isFollowing ? 'Following' : 'Follow'}
                  </button>

                  <button
                    onClick={() => handleStartMessageFromProfile(selectedUserProfile)}
                    className="px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>
                </div>
              </div>

              {/* Username & Online status */}
              <div className="mb-2">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-lg text-slate-900">{selectedUserProfile.name}</h3>
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Online</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {selectedUserProfile.followersCount} followers
                  </span>
                </div>
                {selectedUserProfile.bio && (
                  <p className="text-xs text-slate-600 mt-1 font-medium">{selectedUserProfile.bio}</p>
                )}
              </div>

              {/* Sub-tabs: Overview | Stats | Matches (Screen 6) */}
              <div className="flex items-center border-b border-slate-100 mt-2 mb-3">
                {(['overview', 'stats', 'matches'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setProfileTab(tab)}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      profileTab === tab
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Contents (Screen 6) */}
              <div className="overflow-y-auto max-h-[40vh] space-y-3 pr-1">
                {/* 1. Tournament Standing Card */}
                <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                      <p className="text-xs font-black text-emerald-600 mt-0.5">
                        {selectedUserProfile.tournamentStatus || 'Participating'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Group</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5">
                        {selectedUserProfile.tournamentGroup || 'Group A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Joined</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5">
                        {selectedUserProfile.joinedDate || '12 Jun 2026'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Stats Grid Card */}
                <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Matches</p>
                      <p className="text-sm font-black text-slate-900 mt-0.5">
                        {selectedUserProfile.stats?.matches || 8}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Wins</p>
                      <p className="text-sm font-black text-emerald-600 mt-0.5">
                        {selectedUserProfile.stats?.wins || 6}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Losses</p>
                      <p className="text-sm font-black text-rose-500 mt-0.5">
                        {selectedUserProfile.stats?.losses || 2}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Goals</p>
                      <p className="text-sm font-black text-blue-600 mt-0.5">
                        {selectedUserProfile.stats?.goalsFor || 18} /{' '}
                        {selectedUserProfile.stats?.goalsAgainst || 7}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Recent Matches (Screen 6 Bottom) */}
                <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100">
                  <h4 className="font-extrabold text-xs text-slate-900 mb-2">Recent Matches</h4>
                  <div className="flex flex-col gap-2">
                    {selectedUserProfile.recentMatches && selectedUserProfile.recentMatches.length > 0 ? (
                      selectedUserProfile.recentMatches.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{selectedUserProfile.name}</span>
                            <span className="font-extrabold text-blue-600 px-1.5 py-0.5 bg-blue-50 rounded">
                              {m.score}
                            </span>
                            <span className="font-bold text-slate-600">{m.opponent}</span>
                          </div>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              m.result === 'Win'
                                ? 'bg-emerald-100 text-emerald-700'
                                : m.result === 'Draw'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {m.result}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-slate-400 text-center py-2">
                        No official matches recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. COMMENTS DRAWER MODAL */}
      {/* ======================================================== */}
      {activeCommentPost && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Comments ({activeCommentPost.commentsCount || 0})
                </h3>
              </div>
              <button
                onClick={() => setActiveCommentPost(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original Post Snippet */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 text-xs text-slate-700">
              <span className="font-bold text-blue-600 mr-1.5">{activeCommentPost.authorName}:</span>
              <span>{activeCommentPost.content}</span>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeCommentPost.comments && activeCommentPost.comments.length > 0 ? (
                activeCommentPost.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <img
                      src={
                        c.authorAvatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                      }
                      alt={c.authorName}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{c.authorName}</span>
                        <span className="text-[10px] text-slate-400">{formatTimeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Faallooyin weli ma jiraan. No comments yet.
                </div>
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200/80 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
              />
              <button
                type="submit"
                disabled={submittingComment || !newCommentText.trim()}
                className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. MATCH INVITE MODAL (FOR DM) */}
      {/* ======================================================== */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-xl border border-slate-100 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Send Match Invite</h3>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3 font-medium">
              Invite this player to a 1v1 match in eFootball 2026.
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Scheduled Time
                </label>
                <input
                  type="text"
                  value={inviteTime}
                  onChange={(e) => setInviteTime(e.target.value)}
                  placeholder="e.g. Today • 9:00 PM"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={handleSendMatchInvite}
              className="w-full py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Send Invite
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 10. SOCIAL SHARE MODAL */}
      {/* ======================================================== */}
      {shareModalPost && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900">La wadaag Boostada (Share Post)</h3>
              </div>
              <button
                onClick={() => setShareModalPost(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {shareToast && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center">
                {shareToast}
              </div>
            )}

            {/* Snippet preview */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-4 flex items-center gap-3">
              <img
                src={shareModalPost.authorAvatar}
                alt={shareModalPost.authorName}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-slate-900 truncate">@{shareModalPost.authorName}</p>
                <p className="text-[11px] text-slate-500 line-clamp-1">{shareModalPost.content}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {/* Method 1: Copy link */}
              <button
                onClick={() => handleSharePost('link')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors text-left cursor-pointer border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Copy className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900">Koobiyeey Xiriiriyaha (Copy Link)</p>
                    <p className="text-[10px] text-slate-400">La wadaag baraha kale (Share to any app)</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600">Copy</span>
              </button>

              {/* Method 2: Quote / Share to Feed */}
              <button
                onClick={() => handleSharePost('quote')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors text-left cursor-pointer border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Quote className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900">Soo xigasho (Quote & Repost to Feed)</p>
                    <p className="text-[10px] text-slate-400">Ku dar fikirkaaga (Add your comment and share)</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-600">Quote</span>
              </button>
            </div>

            {/* Method 3: Send to mutual friends via DM */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>U dir Saaxiib (Send to Mutual Friends via DM)</span>
              </p>
              {friendsList && friendsList.length > 0 ? (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {friendsList.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-xs text-slate-900">{friend.name}</p>
                          <p className="text-[10px] text-emerald-600 font-medium">Saaxiib dhab ah (Mutual Friend)</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSharePost('chat', friend.id)}
                        className="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Dir (Send)
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                  Weli ma lihid saaxiibo labada dhinac is raacay (No mutual friends yet).
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 11. CONTENT MODERATION / REPORT MODAL */}
      {/* ======================================================== */}
      {reportModalPost && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-rose-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Gudbi Warbixin (Report Content)</h3>
              </div>
              <button
                onClick={() => setReportModalPost(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3 font-medium">
              Fadlan dooro sababta aad u gudbinayso boostadan @{reportModalPost.authorName}:
            </p>

            <form onSubmit={handleReportPost} className="space-y-3">
              <div className="space-y-1.5">
                {[
                  'Spam or Scam',
                  'Inappropriate Content / Slurs',
                  'Harassment or Bullying',
                  'Misleading Information',
                ].map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer border border-slate-100"
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={reportReason === reason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Sabab kale (Other reason)..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalPost(null)}
                  className="flex-1 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Ka noqo (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitting || !reportReason.trim()}
                  className="flex-1 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {reportSubmitting ? 'Gudbinaya...' : 'Gudbi (Submit)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
