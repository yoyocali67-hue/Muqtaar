import React, { useState, useEffect } from 'react';
import {
  Bell,
  Settings,
  MapPin,
  Heart,
  MessageCircle,
  Eye,
  Bookmark,
  Share2,
  MoreVertical,
  Check,
  ArrowLeft,
  Camera,
  Plus,
  CheckCircle2,
  ShieldCheck,
  Lock,
  User,
  Trophy,
  LogOut,
  ChevronRight,
  TrendingUp,
  X,
  Grid,
  Users,
  Copy,
  Send,
  Flag,
  Ban,
  Play,
  Award,
} from 'lucide-react';
import {
  AppPage,
  AccountMeResponse,
  CommunityPost,
  FollowerUser,
  UserCommentWithPost,
} from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

interface MyAccountPageProps {
  onNavigate: (page: AppPage) => void;
}

type ViewSubScreen = 'main' | 'edit-profile' | 'followers' | 'comments' | 'public-user';
type ProfileTab = 'posts' | 'liked' | 'saved' | 'tournament';
type FollowersSubTab = 'followers' | 'following' | 'friends';

export function MyAccountPage({ onNavigate }: MyAccountPageProps) {
  const { lang, setLang } = useLanguage();

  // Authentication State
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem('somplay_player_token');
    if (stored) return stored;
    const defaultToken = 'ply_token_cGx5LTE3OTMwNTQ5MjIxNTUtODgxOjE3OTQxNTg3MjA1OTI=';
    try {
      localStorage.setItem('somplay_player_token', defaultToken);
    } catch {}
    return defaultToken;
  });

  const [accountData, setAccountData] = useState<AccountMeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sub-screens & Tabs
  const [currentScreen, setCurrentScreen] = useState<ViewSubScreen>('main');
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileTab>('posts');
  const [followersTab, setFollowersTab] = useState<FollowersSubTab>('followers');

  // Activity data
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<CommunityPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<CommunityPost[]>([]);
  const [userComments, setUserComments] = useState<UserCommentWithPost[]>([]);
  const [followersList, setFollowersList] = useState<FollowerUser[]>([]);
  const [followingList, setFollowingList] = useState<FollowerUser[]>([]);
  const [friendsList, setFriendsList] = useState<FollowerUser[]>([]);

  // Selected other user profile
  const [viewedUser, setViewedUser] = useState<any>(null);

  // Modals
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareModalPost, setShareModalPost] = useState<CommunityPost | null>(null);
  const [shareSuccessToast, setShareSuccessToast] = useState('');
  const [reportModalPost, setReportModalPost] = useState<CommunityPost | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState('Somali_Star10');
  const [editBio, setEditBio] = useState("eFootball is not just a game, it's a lifestyle.");
  const [editAvatar, setEditAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState({
    likedPostsPrivate: true,
    savedPostsPrivate: true,
  });

  // Unauthenticated Login/Register state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('+252 ');
  const [regPassword, setRegPassword] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  // Preset avatars for Edit Profile
  const presetBadges = [
    { id: 'av-1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80' },
    { id: 'av-2', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80' },
    { id: 'av-3', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&q=80' },
    { id: 'av-4', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80' },
  ];

  // 1. Load Account Profile
  const loadAccount = async (sessionToken: string) => {
    try {
      setLoading(true);
      const data = await api.getMyAccount(sessionToken);
      setAccountData(data);
      setEditName(data.user.name || 'Somali_Star10');
      setEditBio(data.user.bio || "eFootball is not just a game, it's a lifestyle.");
      setEditAvatar(data.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80');
      if (data.user.privacySettings) {
        setPrivacySettings(data.user.privacySettings);
      }
    } catch (err: any) {
      console.error('Failed to load account:', err);
      if (err.message?.includes('expired') || err.message?.includes('invalid')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Load User Posts, Liked Posts, Saved Posts, and Comments
  const loadPostsAndActivity = async (sessionToken: string) => {
    try {
      const res = await api.getAccountPosts(sessionToken);
      if (res.success) {
        setUserPosts(res.posts || []);
        setLikedPosts(res.likedPosts || []);
        setSavedPosts(res.bookmarkedPosts || []);
        setUserComments(
          (res.comments || []).map((c: any) => ({
            id: c.id || String(Math.random()),
            authorName: c.authorName || 'User',
            authorAvatar: c.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
            verified: true,
            timeAgo: c.timeAgo || '2h ago',
            text: c.text,
            postTitle: c.postTitle,
            postThumbnail: c.postThumbnail || '/assets/images/stars_banner.jpg',
            postId: c.postId,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load posts/activity:', err);
    }
  };

  // 3. Load Followers, Following, and Mutual Friends
  const loadFollowersData = async (sessionToken: string) => {
    try {
      const res = await api.getFollowers(sessionToken);
      if (res.success) {
        setFollowersList(res.followers || []);
        setFollowingList(res.following || []);
        setFriendsList(res.friends || []);
      }
    } catch (err) {
      console.error('Failed to load followers:', err);
    }
  };

  useEffect(() => {
    if (token) {
      loadAccount(token);
      loadPostsAndActivity(token);
      loadFollowersData(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  // Handle post like toggle
  const handleToggleLike = async (postId: string) => {
    try {
      const res = await api.reactToPost(postId, token || undefined);
      if (res.success) {
        const updater = (list: CommunityPost[]) =>
          list.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  reactions: res.reactions,
                  userReacted: res.userReacted,
                }
              : p
          );

        setUserPosts(updater);
        setLikedPosts(updater);
        setSavedPosts(updater);

        if (token) {
          loadAccount(token);
          loadPostsAndActivity(token);
        }
      }
    } catch (err) {
      console.error('Failed to react:', err);
    }
  };

  // Handle post bookmark / save toggle
  const handleToggleBookmark = async (postId: string) => {
    try {
      const res = await api.togglePostBookmark(postId, token || undefined);
      if (res.success) {
        const updater = (list: CommunityPost[]) =>
          list.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  userBookmarked: res.isBookmarked,
                }
              : p
          );

        setUserPosts(updater);
        setLikedPosts(updater);
        setSavedPosts(updater);

        if (token) loadPostsAndActivity(token);
      }
    } catch (err) {
      console.error('Failed to bookmark:', err);
    }
  };

  // Handle user follow / unfollow toggle (mutual friendship updates automatically)
  const handleToggleFollow = async (userId: string) => {
    try {
      const res = await api.followUser(userId, token || undefined);
      if (res.success) {
        // If viewing this user's public profile, immediately update viewedUser
        setViewedUser((prev: any) => {
          if (!prev) return null;
          if (prev.name !== userId && (prev as any).id !== userId) return prev;
          const newIsFollowing = res.isFollowing;
          const diff = newIsFollowing ? 1 : -1;
          const updatedFollowers = Math.max(0, (prev.followers || 0) + diff);
          const isMutual = (res as any).isMutualFriend ?? false;
          return {
            ...prev,
            isFollowing: newIsFollowing,
            followers: updatedFollowers,
            isMutualFriend: isMutual,
          };
        });

        if (token) {
          await loadFollowersData(token);
          await loadAccount(token);
        }
      }
    } catch (err) {
      console.error('Failed to follow:', err);
    }
  };

  // Handle saving profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setUpdatingProfile(true);
      const res = await api.updateAccountProfile(
        {
          name: editName.trim(),
          bio: editBio.trim(),
          avatar: editAvatar,
        },
        token
      );
      if (res.success) {
        setEditSuccessMsg('Profile updated successfully!');
        await loadAccount(token);
        setTimeout(() => {
          setCurrentScreen('main');
          setEditSuccessMsg('');
        }, 600);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Handle Privacy Toggle
  const handleTogglePrivacy = async (key: 'likedPostsPrivate' | 'savedPostsPrivate') => {
    if (!token) return;
    const newSettings = {
      ...privacySettings,
      [key]: !privacySettings[key],
    };
    setPrivacySettings(newSettings);
    try {
      await api.updatePrivacySettings(newSettings, token);
    } catch (err) {
      console.error('Failed to update privacy settings:', err);
    }
  };

  // Handle Post Share
  const handleSharePost = async (type: 'link' | 'chat' | 'quote', targetUserId?: string) => {
    if (!shareModalPost) return;

    try {
      if (type === 'link') {
        const postUrl = `${window.location.origin}/#post-${shareModalPost.id}`;
        await navigator.clipboard.writeText(postUrl);
        await api.sharePost(shareModalPost.id, { type: 'link' }, token || undefined);
        setShareSuccessToast('Xiriiriyaha boostada waa la koobiyeeyay! (Link copied!)');
      } else if (type === 'chat' && targetUserId) {
        await api.sharePost(shareModalPost.id, { type: 'chat', targetUserId }, token || undefined);
        setShareSuccessToast(`Boostada waxaa loo diray @${targetUserId}! (Sent to @${targetUserId}!)`);
      }

      setTimeout(() => {
        setShareSuccessToast('');
        setShareModalPost(null);
      }, 1500);

      if (token) loadPostsAndActivity(token);
    } catch (err) {
      console.error('Error sharing post:', err);
    }
  };

  // Handle Report Post
  const handleReportSubmit = async (e: React.FormEvent) => {
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
        token || undefined
      );
      alert('Warbixintaada waa la helay, mahadsanid. (Report submitted successfully.)');
      setReportModalPost(null);
      setReportReason('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  };

  // Login handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setAuthError('Please enter your email');
      return;
    }

    try {
      setAuthSubmitting(true);
      setAuthError('');
      const res = await api.loginTournamentPlayer(loginEmail.trim(), loginPassword || undefined);
      if (res.success && res.token) {
        localStorage.setItem('somplay_player_token', res.token);
        setToken(res.token);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Sign in failed');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleQuickLogin = async (email: string) => {
    try {
      setAuthSubmitting(true);
      setAuthError('');
      setLoginEmail(email);
      const res = await api.loginTournamentPlayer(email);
      if (res.success && res.token) {
        localStorage.setItem('somplay_player_token', res.token);
        setToken(res.token);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Quick login failed');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setAuthError('Player name and valid email are required');
      return;
    }

    try {
      setAuthSubmitting(true);
      setAuthError('');
      const res = await api.registerTournament({
        name: regName.trim(),
        email: regEmail.trim(),
        whatsapp: regWhatsapp.trim(),
        password: regPassword || undefined,
      });
      if (res.success && res.token) {
        localStorage.setItem('somplay_player_token', res.token);
        setToken(res.token);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('somplay_player_token');
    setToken(null);
    setAccountData(null);
    setCurrentScreen('main');
    setSettingsOpen(false);
  };

  // Open public profile
  const openPublicProfile = async (userItem: any) => {
    const targetName = userItem.name || userItem.id || 'Somali_Star10';
    // Immediate responsive state
    setViewedUser({
      name: targetName,
      handle: `@${targetName.replace(/\s+/g, '_')}`,
      avatar:
        userItem.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
      bio: userItem.bio || 'eFootball player in SOMPLAY community',
      location: userItem.location || 'Somalia',
      followers: userItem.followersCount ?? userItem.followers ?? 0,
      following: userItem.followingCount ?? userItem.following ?? 0,
      friends: userItem.friendsCount ?? userItem.friends ?? 0,
      likesReceived: userItem.totalLikesReceived ?? 0,
      pepBalance: 250,
      isFollowing: userItem.isFollowing ?? false,
      isMutualFriend: userItem.isMutualFriend ?? false,
      stats: {
        group: userItem.tournamentGroup || 'Group A',
        rank: '2nd',
        matches: userItem.stats?.matches ?? 6,
        wins: userItem.stats?.wins ?? 4,
        losses: userItem.stats?.losses ?? 2,
        goals: userItem.stats?.goalsFor ?? userItem.stats?.goals ?? 12,
      },
    });
    setCurrentScreen('public-user');

    // Fetch authoritative public profile for this specific user
    try {
      const res = await api.getUserProfile(targetName, token || undefined);
      if (res.success && res.profile) {
        const p = res.profile;
        setViewedUser({
          name: p.name,
          handle: `@${p.name.replace(/\s+/g, '_')}`,
          avatar:
            p.avatar ||
            userItem.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
          bio: p.bio || 'eFootball player in SOMPLAY community',
          location: p.location || 'Somalia',
          followers: p.followersCount ?? (p as any).followers ?? 0,
          following: p.followingCount ?? (p as any).following ?? 0,
          friends: p.friendsCount ?? (p as any).friends ?? 0,
          likesReceived: p.totalLikesReceived ?? 0,
          pepBalance: (p as any).pepBalance ?? 250,
          isFollowing: p.isFollowing ?? false,
          isMutualFriend: p.isMutualFriend ?? false,
          stats: {
            group: p.tournamentGroup || (p.stats as any)?.group || 'Group A',
            rank: p.rank || '2nd',
            matches: p.stats?.matches ?? 6,
            wins: p.stats?.wins ?? 4,
            losses: p.stats?.losses ?? 2,
            goals: p.stats?.goalsFor ?? (p.stats as any)?.goals ?? 12,
          },
        });
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    }
  };

  // Format count (e.g., 1900 -> 1.9k)
  const formatCount = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    return String(num);
  };

  // ==============================================================
  // SUB-SCREEN: EDIT PROFILE
  // ==============================================================
  if (currentScreen === 'edit-profile') {
    return (
      <div className="w-full max-w-md mx-auto bg-white min-h-[92vh] flex flex-col font-sans pb-24 animate-in fade-in duration-150">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-20">
          <button
            onClick={() => setCurrentScreen('main')}
            className="flex items-center gap-2 text-slate-900 font-bold text-sm cursor-pointer hover:opacity-75"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            <span className="text-base font-black tracking-tight">Edit Profile</span>
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={updatingProfile}
            className="text-[#E52538] font-bold text-sm hover:underline cursor-pointer disabled:opacity-50"
          >
            {updatingProfile ? 'Saving...' : 'Save'}
          </button>
        </div>

        {editSuccessMsg && (
          <div className="m-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{editSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="p-4 flex flex-col gap-5 flex-1">
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100">
              <img src={editAvatar} alt="Profile" className="w-full h-full object-cover" />
              <button
                type="button"
                className="absolute bottom-1 right-1 w-7 h-7 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center text-white cursor-pointer shadow-sm active:scale-95"
              >
                <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 mt-4 overflow-x-auto max-w-full pb-1">
              {presetBadges.map((badge) => (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => setEditAvatar(badge.url)}
                  className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    editAvatar === badge.url ? 'border-blue-600 ring-2 ring-blue-600/30 scale-105' : 'border-slate-200 opacity-80'
                  }`}
                >
                  <img src={badge.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-black text-slate-900 tracking-tight">In-Game Display Name</label>
            <input
              type="text"
              value={editName}
              maxLength={20}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-black text-slate-900 tracking-tight">Biography</label>
            <textarea
              rows={3}
              value={editBio}
              maxLength={150}
              onChange={(e) => setEditBio(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 resize-none"
            />
            <div className="text-right text-[10px] text-slate-400 font-bold">{editBio.length}/150</div>
          </div>

          <button
            type="submit"
            disabled={updatingProfile}
            className="w-full py-3 rounded-full bg-[#E52538] hover:bg-[#d01e30] text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer mt-2"
          >
            {updatingProfile ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      </div>
    );
  }

  // ==============================================================
  // SUB-SCREEN: FOLLOWERS / FOLLOWING / FRIENDS
  // ==============================================================
  if (currentScreen === 'followers') {
    const displayedList =
      followersTab === 'friends'
        ? friendsList
        : followersTab === 'following'
        ? followingList
        : followersList;

    return (
      <div className="w-full max-w-md mx-auto bg-white min-h-[92vh] flex flex-col font-sans pb-24 animate-in fade-in duration-150">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-20">
          <button
            onClick={() => setCurrentScreen('main')}
            className="flex items-center gap-2 text-slate-900 font-bold text-sm cursor-pointer hover:opacity-75"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            <span className="text-base font-black tracking-tight">Social Network</span>
          </button>
        </div>

        {/* 3 Tabs: Followers | Following | Friends (Mutual) */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-100">
          <div className="flex p-1 rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
            <button
              onClick={() => setFollowersTab('followers')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                followersTab === 'followers' ? 'bg-[#E52538] text-white font-black shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Followers ({followersList.length})
            </button>
            <button
              onClick={() => setFollowersTab('following')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                followersTab === 'following' ? 'bg-[#E52538] text-white font-black shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Following ({followingList.length})
            </button>
            <button
              onClick={() => setFollowersTab('friends')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                followersTab === 'friends' ? 'bg-[#E52538] text-white font-black shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Friends ({friendsList.length})
            </button>
          </div>
        </div>

        {/* Friends Description Note */}
        {followersTab === 'friends' && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-50/70 border border-rose-100 text-[11px] text-slate-600">
            <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-0.5">
              <Users className="w-3.5 h-3.5 text-[#E52538]" />
              <span>Mutual Friends</span>
            </p>
            <span>You and these players follow each other. You can message them directly or share posts into your chat.</span>
          </div>
        )}

        {/* User Rows */}
        <div className="divide-y divide-slate-100 px-4 flex-1 mt-1">
          {displayedList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No accounts found in this list.
            </div>
          ) : (
            displayedList.map((user) => (
              <div key={user.id} className="py-3 flex items-center justify-between gap-3">
                <div
                  onClick={() => openPublicProfile(user)}
                  className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 truncate group-hover:text-blue-600">
                        {user.name}
                      </span>
                      {user.verified && (
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center p-0.5">
                          <Check className="w-2 h-2 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{user.activityTime || 'Active'}</span>
                      {user.isMutualFriend && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-[#E52538] font-bold text-[9px]">
                          Friend
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: If Mutual Friend, show Message + Follow toggle */}
                <div className="flex items-center gap-2">
                  {user.isMutualFriend && (
                    <button
                      onClick={() => onNavigate('chat')}
                      className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Send className="w-3 h-3 text-slate-500" />
                      <span>Message</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleFollow(user.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0 ${
                      user.isFollowing
                        ? 'bg-[#E52538] text-white shadow-xs hover:bg-[#c8102e]'
                        : 'bg-white border border-[#E52538] text-[#E52538] hover:bg-rose-50'
                    }`}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ==============================================================
  // SUB-SCREEN: PUBLIC PROFILE (WHEN VIEWING ANOTHER PLAYER)
  // ==============================================================
  if (currentScreen === 'public-user' && viewedUser) {
    return (
      <div className="w-full max-w-md mx-auto bg-white min-h-[92vh] flex flex-col font-sans pb-24 animate-in fade-in duration-150">
        <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white/95 backdrop-blur-md z-20">
          <button
            onClick={() => setCurrentScreen('main')}
            className="flex items-center gap-2 text-slate-900 font-bold text-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            <span className="text-base font-black tracking-tight">Profile</span>
          </button>
          <button className="text-slate-600 hover:text-slate-900 p-1">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Red Curved Header */}
        <div className="relative w-full bg-gradient-to-b from-[#C8102E] to-[#E52538] text-white pt-5 pb-16 px-4 rounded-b-[36px] flex flex-col items-center shadow-sm">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
            <span className="text-sm">🪙</span>
            <span className="text-[10px] font-bold text-white/90">PEP Balance</span>
          </div>
          <span className="text-3xl font-black font-mono tracking-tight text-white mt-1">
            {viewedUser.pepBalance || 250} PEP
          </span>
        </div>

        <div className="relative -mt-12 flex flex-col items-center px-4">
          <div className="relative w-22 h-22 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100">
            <img src={viewedUser.avatar} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            <h2 className="text-base font-black text-slate-900">{viewedUser.name}</h2>
            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center p-0.5">
              <Check className="w-2 h-2 stroke-[3]" />
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium">{viewedUser.handle}</span>
          <p className="text-xs text-slate-600 text-center mt-1">{viewedUser.bio}</p>

          <div className="flex items-center gap-1 text-blue-600 text-xs font-bold mt-1">
            <MapPin className="w-3.5 h-3.5 fill-blue-600 text-white" />
            <span>{viewedUser.location}</span>
          </div>

          {/* Social Stats Row */}
          <div className="grid grid-cols-4 gap-2 w-full mt-3 pt-3 border-t border-slate-100 text-center">
            <div>
              <span className="block text-sm font-black text-slate-900">{viewedUser.following}</span>
              <span className="text-[10px] text-slate-400 font-medium">Following</span>
            </div>
            <div>
              <span className="block text-sm font-black text-slate-900">{viewedUser.followers}</span>
              <span className="text-[10px] text-slate-400 font-medium">Followers</span>
            </div>
            <div>
              <span className="block text-sm font-black text-slate-900">{viewedUser.likesReceived}</span>
              <span className="text-[10px] text-slate-400 font-medium">Likes</span>
            </div>
            <div>
              <span className="block text-sm font-black text-slate-900">{viewedUser.friends}</span>
              <span className="text-[10px] text-slate-400 font-medium">Friends</span>
            </div>
          </div>

          {/* Follow Button */}
          <div className="flex items-center gap-2 w-full mt-4">
            <button
              onClick={() => handleToggleFollow(viewedUser.name)}
              className={`flex-1 py-2.5 rounded-full font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-98 ${
                viewedUser.isFollowing ? 'bg-slate-800 text-white' : 'bg-[#E52538] hover:bg-[#c8102e] text-white'
              }`}
            >
              {viewedUser.isFollowing ? 'Following' : 'Follow'}
            </button>
            <button
              onClick={() => onNavigate('chat')}
              className="px-4 py-2.5 rounded-full border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-slate-500" />
              <span>Message</span>
            </button>
          </div>

          {/* Privacy Note for Liked/Saved tabs */}
          <div className="w-full mt-4 p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>This user's liked and saved posts are private.</span>
          </div>

          {/* Tournament Stats Card */}
          <div className="w-full mt-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Tournament Record</span>
            </h3>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <div className="flex items-center justify-between pr-3 border-r border-slate-100">
                <span className="text-slate-500 font-medium">Group:</span>
                <span className="font-bold text-slate-900">{viewedUser.stats.group}</span>
              </div>
              <div className="flex items-center justify-between pl-3">
                <span className="text-slate-500 font-medium">Matches:</span>
                <span className="font-bold text-slate-900">{viewedUser.stats.matches}</span>
              </div>
              <div className="flex items-center justify-between pr-3 border-r border-slate-100">
                <span className="text-slate-500 font-medium">Rank:</span>
                <span className="font-bold text-slate-900">{viewedUser.stats.rank}</span>
              </div>
              <div className="flex items-center justify-between pl-3">
                <span className="text-slate-500 font-medium">Wins:</span>
                <span className="font-bold text-emerald-600">{viewedUser.stats.wins}</span>
              </div>
              <div className="flex items-center justify-between pr-3 border-r border-slate-100">
                <span className="text-slate-500 font-medium">Losses:</span>
                <span className="font-bold text-rose-600">{viewedUser.stats.losses}</span>
              </div>
              <div className="flex items-center justify-between pl-3">
                <span className="text-slate-500 font-medium">Goals:</span>
                <span className="font-bold text-slate-900">{viewedUser.stats.goals}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // MAIN PROFILE SCREEN (TIKTOK-STYLE + SOMPLAY BRANDING)
  // ==============================================================
  return (
    <div className="w-full max-w-md mx-auto bg-[#F8FAFC] min-h-screen flex flex-col font-sans pb-24">
      {/* 1. Header Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-30 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#E52538] flex items-center justify-center p-1 text-white shadow-xs">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <span className="text-base font-black tracking-tight text-slate-900 font-sans">SOMPLAY</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('chat')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
            title="Chat"
          >
            <Bell className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>
        </div>
      </header>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-[#E52538] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading profile...</p>
        </div>
      )}

      {/* Unauthenticated View */}
      {!loading && !token && (
        <div className="p-4 flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col gap-4">
            <div className="rounded-2xl bg-gradient-to-r from-[#C8102E] to-[#E52538] text-white p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black tracking-tight leading-tight">
                  Sign In to Your SOMPLAY Profile
                </h2>
                <p className="text-[11px] text-white/80 mt-1">
                  Access your 250 PEP balance, community feed, and eFootball tournament stats.
                </p>
              </div>
            </div>

            <div className="flex p-1 rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'login' ? 'bg-[#E52538] text-white font-extrabold shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'register' ? 'bg-[#E52538] text-white font-extrabold shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Register
              </button>
            </div>

            {authError && <p className="text-xs text-rose-600 font-bold">{authError}</p>}

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Email address (e.g. somalistar@somply.com)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-600"
                />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password (optional)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-600"
                />
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-2.5 rounded-full bg-[#E52538] text-white font-bold text-xs shadow-xs hover:bg-[#c8102e] cursor-pointer"
                >
                  {authSubmitting ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="pt-2 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Instant Demo Login</p>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('somalistar@somply.com')}
                    className="w-full py-2 rounded-xl bg-rose-50 text-[#E52538] border border-rose-200 text-xs font-bold hover:bg-rose-100 cursor-pointer"
                  >
                    ⚡ Open Somali_Star10 Profile
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-3">
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="eFootball Player Name (e.g. Somali_Star10)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-600"
                />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-600"
                />
                <input
                  type="tel"
                  value={regWhatsapp}
                  onChange={(e) => setRegWhatsapp(e.target.value)}
                  placeholder="WhatsApp number (+252...)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-600"
                />
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-2.5 rounded-full bg-[#E52538] text-white font-bold text-xs shadow-xs hover:bg-[#c8102e] cursor-pointer"
                >
                  {authSubmitting ? 'Registering...' : 'Register'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Authenticated Profile Content */}
      {!loading && token && accountData && (
        <div className="flex flex-col">
          {/* 2. Red Curved Header Banner with Real PEP Balance (STRICTLY PEP) */}
          <div className="relative w-full bg-gradient-to-b from-[#C8102E] via-[#D81B34] to-[#E52538] text-white pt-4 pb-14 px-4 rounded-b-[40px] flex flex-col items-center shadow-xs">
            <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1 rounded-full backdrop-blur-xs">
              <span className="text-sm">🪙</span>
              <span className="text-[10px] font-bold text-white/90">PEP Balance</span>
            </div>

            <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white mt-1">
              {accountData.wallet?.pepBalance ?? 250} PEP
            </span>
          </div>

          {/* 3. Avatar Overlapping & Profile Header */}
          <div className="relative -mt-12 flex flex-col items-center px-4">
            <div className="relative w-23 h-23 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100">
              <img
                src={accountData.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80'}
                alt={accountData.user.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setCurrentScreen('edit-profile')}
                className="absolute bottom-0.5 right-0.5 w-6 h-6 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center text-white cursor-pointer shadow-sm active:scale-95"
                title="Change Avatar"
              >
                <Camera className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>

            {/* Display Name with Blue Checkmark */}
            <div className="flex items-center gap-1.5 mt-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {accountData.user.name || 'Somali_Star10'}
              </h1>
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center p-0.5" title="Verified Player">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            </div>

            {/* Unique Username Handle */}
            <span className="text-xs text-slate-400 font-medium">
              {accountData.user.handle || `@${accountData.user.name || 'Somali_Star10'}`}
            </span>

            {/* Short Editable Biography */}
            <p className="text-xs text-slate-600 font-medium text-center mt-1 max-w-xs leading-snug">
              {accountData.user.bio || "eFootball is not just a game, it's a lifestyle."}
            </p>

            {/* Location */}
            <div className="flex items-center gap-1 text-blue-600 text-xs font-bold mt-1">
              <MapPin className="w-3.5 h-3.5 fill-blue-600 text-white" />
              <span>{accountData.user.location || 'Somalia'}</span>
            </div>

            {/* 4. Four Interactive Social Statistics: Following | Followers | Likes | Friends */}
            <div className="grid grid-cols-4 gap-2 w-full max-w-sm mt-3 pt-3 border-t border-slate-100 text-center">
              {/* Following */}
              <button
                onClick={() => {
                  setFollowersTab('following');
                  setCurrentScreen('followers');
                }}
                className="flex flex-col items-center cursor-pointer group hover:opacity-80 transition-opacity"
              >
                <span className="block text-sm sm:text-base font-black text-slate-900 group-hover:text-[#E52538] transition-colors">
                  {accountData.communityStats?.followingCount ?? followingList.length ?? 0}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Following</span>
              </button>

              {/* Followers */}
              <button
                onClick={() => {
                  setFollowersTab('followers');
                  setCurrentScreen('followers');
                }}
                className="flex flex-col items-center cursor-pointer group hover:opacity-80 transition-opacity"
              >
                <span className="block text-sm sm:text-base font-black text-slate-900 group-hover:text-[#E52538] transition-colors">
                  {accountData.communityStats?.followersCount ?? followersList.length ?? 0}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Followers</span>
              </button>

              {/* Likes (Total likes received across user's own posts) */}
              <button
                onClick={() => setLikesModalOpen(true)}
                className="flex flex-col items-center cursor-pointer group hover:opacity-80 transition-opacity"
              >
                <span className="block text-sm sm:text-base font-black text-slate-900 group-hover:text-[#E52538] transition-colors">
                  {accountData.communityStats?.totalLikesReceived ?? 0}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Likes</span>
              </button>

              {/* Friends (Mutual Follows: A follows B AND B follows A) */}
              <button
                onClick={() => {
                  setFollowersTab('friends');
                  setCurrentScreen('followers');
                }}
                className="flex flex-col items-center cursor-pointer group hover:opacity-80 transition-opacity relative"
              >
                <span className="block text-sm sm:text-base font-black text-[#E52538] group-hover:underline transition-all">
                  {accountData.communityStats?.friendsCount ?? friendsList.length ?? 0}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">Friends</span>
              </button>
            </div>

            {/* 5. Action Buttons: Red "Edit Profile" + Settings Gear Icon */}
            <div className="flex items-center gap-2.5 w-full mt-4">
              <button
                onClick={() => setCurrentScreen('edit-profile')}
                className="flex-1 py-2.5 rounded-2xl bg-[#E52538] hover:bg-[#d01e30] text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-98 text-center"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="w-10 h-10 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                title="Account Settings"
              >
                <Settings className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* 6. Icon-Based Profile Content Tabs: Posts | Liked | Saved | Tournament (ONLY if registered) */}
            <div className="w-full mt-5 border-b border-slate-200/80">
              <div className="flex items-center justify-around">
                {/* 1. Posts Tab */}
                <button
                  onClick={() => setActiveProfileTab('posts')}
                  className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold transition-all relative cursor-pointer ${
                    activeProfileTab === 'posts'
                      ? 'text-[#E52538] font-black'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Grid className="w-4 h-4 stroke-[2.2]" />
                  <span>Posts ({userPosts.length})</span>
                  {activeProfileTab === 'posts' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E52538] rounded-full" />
                  )}
                </button>

                {/* 2. Liked Posts Tab */}
                <button
                  onClick={() => setActiveProfileTab('liked')}
                  className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold transition-all relative cursor-pointer ${
                    activeProfileTab === 'liked'
                      ? 'text-[#E52538] font-black'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Heart className="w-4 h-4 stroke-[2.2]" />
                  <span>Liked</span>
                  {privacySettings.likedPostsPrivate && (
                    <span title="Private to you">
                      <Lock className="w-3 h-3 text-slate-400" />
                    </span>
                  )}
                  {activeProfileTab === 'liked' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E52538] rounded-full" />
                  )}
                </button>

                {/* 3. Saved Posts Tab */}
                <button
                  onClick={() => setActiveProfileTab('saved')}
                  className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold transition-all relative cursor-pointer ${
                    activeProfileTab === 'saved'
                      ? 'text-[#E52538] font-black'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Bookmark className="w-4 h-4 stroke-[2.2]" />
                  <span>Saved</span>
                  {privacySettings.savedPostsPrivate && (
                    <span title="Private to you">
                      <Lock className="w-3 h-3 text-slate-400" />
                    </span>
                  )}
                  {activeProfileTab === 'saved' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E52538] rounded-full" />
                  )}
                </button>

                {/* 4. Tournament Tab — RENDERED ONLY IF REGISTERED IN TOURNAMENT */}
                {accountData.user.isTournamentRegistered && accountData.tournamentStats && (
                  <button
                    onClick={() => setActiveProfileTab('tournament')}
                    className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold transition-all relative cursor-pointer ${
                      activeProfileTab === 'tournament'
                        ? 'text-[#E52538] font-black'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Trophy className="w-4 h-4 stroke-[2.2]" />
                    <span>Tournament</span>
                    {activeProfileTab === 'tournament' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E52538] rounded-full" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 7. Tab Content Rendering */}
          <div className="p-4 flex flex-col gap-4">
            {/* TAB: POSTS */}
            {activeProfileTab === 'posts' && (
              <div className="flex flex-col gap-4">
                {userPosts.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No posts published yet. Share your eFootball formations or highlights in Chat!
                  </div>
                ) : (
                  userPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col"
                    >
                      {/* Author Header */}
                      <div className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                            <img src={post.authorAvatar} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-slate-900">{post.authorName}</span>
                              <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center p-0.5">
                                <Check className="w-2 h-2 stroke-[3]" />
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">Recent • eFootball</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setReportModalPost(post)}
                          className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                          title="Report post"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Content Caption */}
                      <p className="px-3.5 pb-2 text-xs font-semibold text-slate-900 leading-normal">{post.content}</p>

                      {/* Video Player if present */}
                      {post.videoUrl && (
                        <div className="w-full aspect-video bg-black overflow-hidden relative">
                          <video
                            src={post.videoUrl}
                            controls
                            className="w-full h-full object-cover"
                            poster={post.imageUrl}
                          />
                        </div>
                      )}

                      {/* Image if present and no video */}
                      {!post.videoUrl && post.imageUrl && (
                        <div className="w-full aspect-[16/9] bg-slate-100 overflow-hidden">
                          <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Quoted Post Card */}
                      {post.quotePost && (
                        <div className="mx-3.5 mb-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1 text-xs">
                          <span className="font-bold text-slate-800">@{post.quotePost.authorName}</span>
                          <p className="text-slate-600 line-clamp-2">{post.quotePost.content}</p>
                        </div>
                      )}

                      {/* Interaction Bar */}
                      <div className="px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleToggleLike(post.id)}
                            className="flex items-center gap-1.5 hover:text-rose-600 cursor-pointer"
                          >
                            <Heart
                              className={`w-4 h-4 ${post.userReacted ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`}
                            />
                            <span className="font-bold">{post.reactions}</span>
                          </button>

                          <button
                            onClick={() => onNavigate('chat')}
                            className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4 text-slate-400" />
                            <span className="font-bold">{post.commentsCount}</span>
                          </button>

                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Eye className="w-4 h-4" />
                            <span className="font-medium">{formatCount(post.views || 1900)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Share button */}
                          <button
                            onClick={() => setShareModalPost(post)}
                            className="p-1 hover:text-blue-600 text-slate-400 cursor-pointer"
                            title="Share post"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          {/* Save / Bookmark button */}
                          <button
                            onClick={() => handleToggleBookmark(post.id)}
                            className="p-1 hover:text-[#E52538] cursor-pointer"
                            title="Save / Bookmark post"
                          >
                            <Bookmark
                              className={`w-4 h-4 ${post.userBookmarked ? 'fill-[#E52538] text-[#E52538]' : 'text-slate-400'}`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: LIKED POSTS */}
            {activeProfileTab === 'liked' && (
              <div className="flex flex-col gap-4">
                <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500 flex items-center gap-2 border border-slate-200">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Your liked posts are {privacySettings.likedPostsPrivate ? 'private' : 'public'}. You can adjust privacy in Settings.
                  </span>
                </div>

                {likedPosts.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No liked posts yet. Tap the heart on community posts to like them!
                  </div>
                ) : (
                  likedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col"
                    >
                      <div className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                            <img src={post.authorAvatar} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900">{post.authorName}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Liked Post</span>
                          </div>
                        </div>
                      </div>

                      <p className="px-3.5 pb-2 text-xs font-semibold text-slate-900">{post.content}</p>

                      {post.imageUrl && (
                        <div className="w-full aspect-[16/9] bg-slate-100 overflow-hidden">
                          <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleToggleLike(post.id)}
                            className="flex items-center gap-1.5 text-rose-600 font-bold cursor-pointer"
                          >
                            <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                            <span>{post.reactions}</span>
                          </button>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.commentsCount}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setShareModalPost(post)}
                          className="p-1 hover:text-blue-600 text-slate-400 cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: SAVED / BOOKMARKED POSTS */}
            {activeProfileTab === 'saved' && (
              <div className="flex flex-col gap-4">
                <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500 flex items-center gap-2 border border-slate-200">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Your saved posts are {privacySettings.savedPostsPrivate ? 'private' : 'public'}. Only you can see them.
                  </span>
                </div>

                {savedPosts.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No saved posts. Tap the bookmark icon on any post to save it for later!
                  </div>
                ) : (
                  savedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col"
                    >
                      <div className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                            <img src={post.authorAvatar} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900">{post.authorName}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Saved Post</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleBookmark(post.id)}
                          className="text-[#E52538] p-1 cursor-pointer"
                          title="Remove bookmark"
                        >
                          <Bookmark className="w-4 h-4 fill-[#E52538]" />
                        </button>
                      </div>

                      <p className="px-3.5 pb-2 text-xs font-semibold text-slate-900">{post.content}</p>

                      {post.imageUrl && (
                        <div className="w-full aspect-[16/9] bg-slate-100 overflow-hidden">
                          <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: TOURNAMENT (ONLY DISPLAYED IF USER IS REGISTERED) */}
            {activeProfileTab === 'tournament' && accountData.tournamentStats && (
              <div className="flex flex-col gap-4">
                {/* Stats Summary Card */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Tournament Status</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-black text-[10px] uppercase">
                      {accountData.tournamentStats.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">GROUP</span>
                      <span className="text-sm font-black text-slate-900">{accountData.tournamentStats.group}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">RANK</span>
                      <span className="text-sm font-black text-blue-600">{accountData.tournamentStats.rank || '1st'}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">MATCHES PLAYED</span>
                      <span className="text-sm font-black text-slate-900">{accountData.tournamentStats.played}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">WIN / LOSS</span>
                      <span className="text-sm font-black text-emerald-600">
                        {accountData.tournamentStats.won}W - {accountData.tournamentStats.lost}L
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">GOALS (FOR / AGAINST)</span>
                      <span className="text-sm font-black text-slate-900">
                        {accountData.tournamentStats.goalsFor} - {accountData.tournamentStats.goalsAgainst}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">BRACKET POSITION</span>
                      <span className="text-sm font-black text-[#E52538] truncate block">
                        {accountData.tournamentStats.bracketPosition}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('tournament')}
                    className="w-full mt-2 py-2.5 rounded-xl bg-[#E52538] hover:bg-[#c8102e] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>View Tournament Draw & Bracket</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Recent Matches */}
                {accountData.recentMatches && accountData.recentMatches.length > 0 && (
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col gap-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Previous Results</h3>
                    <div className="divide-y divide-slate-100">
                      {accountData.recentMatches.map((m, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                              <img src={m.opponentAvatar} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-900">vs {m.opponent}</span>
                              <span className="text-[10px] text-slate-400">{m.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">{m.score}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                m.result === 'Win'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : m.result === 'Draw'
                                  ? 'bg-slate-100 text-slate-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {m.result}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: LIKES RECEIVED BREAKDOWN */}
      {likesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <Heart className="w-4 h-4 fill-rose-600" />
                <h3 className="text-sm font-black text-slate-900">Total Likes Received</h3>
              </div>
              <button
                onClick={() => setLikesModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-3 bg-rose-50/60 rounded-2xl border border-rose-100">
              <span className="text-4xl font-black text-rose-600">
                {accountData?.communityStats.totalLikesReceived || 296}
              </span>
              <p className="text-xs text-slate-600 font-medium mt-1">Likes received across all your posts</p>
            </div>

            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1 divide-y divide-slate-100">
              {userPosts.map((p) => (
                <div key={p.id} className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-700 truncate max-w-[200px] font-medium">{p.content}</span>
                  <div className="flex items-center gap-1 text-rose-600 font-black shrink-0">
                    <Heart className="w-3.5 h-3.5 fill-rose-600" />
                    <span>{p.reactions}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setLikesModalOpen(false)}
              className="w-full py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL: SHARE POST (3 Methods: Copy Link, Send to Mutual Friend in DM, Quote) */}
      {shareModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-600">
                <Share2 className="w-4 h-4" />
                <h3 className="text-sm font-black text-slate-900">Share Post</h3>
              </div>
              <button
                onClick={() => setShareModalPost(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {shareSuccessToast && (
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200">
                {shareSuccessToast}
              </div>
            )}

            {/* Post Snippet Preview */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              {shareModalPost.imageUrl && (
                <img src={shareModalPost.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black text-slate-900">@{shareModalPost.authorName}</span>
                <p className="text-[11px] text-slate-600 truncate">{shareModalPost.content}</p>
              </div>
            </div>

            {/* Method 1: Copy Link */}
            <button
              onClick={() => handleSharePost('link')}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-800 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Copy className="w-4 h-4 text-slate-500" />
              <span>Copy Link to Post</span>
            </button>

            {/* Method 2: Share to Mutual Friends via DM */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#E52538]" />
                <span>Send to Mutual Friends in DM</span>
              </span>

              {friendsList.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No mutual friends yet. Mutual follows will appear here.</p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                  {friendsList.map((fr) => (
                    <div key={fr.id} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={fr.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                        <span className="text-xs font-bold text-slate-900">{fr.name}</span>
                      </div>
                      <button
                        onClick={() => handleSharePost('chat', fr.id)}
                        className="px-3 py-1 rounded-full bg-[#E52538] hover:bg-[#c8102e] text-white text-[11px] font-bold cursor-pointer"
                      >
                        Send
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REPORT CONTENT */}
      {reportModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleReportSubmit}
            className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <Flag className="w-4 h-4" />
                <h3 className="text-sm font-black text-slate-900">Report Post</h3>
              </div>
              <button
                type="button"
                onClick={() => setReportModalPost(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Fadlan dooro sababta aad u warbixinayso boostadan (Please specify reason for report):
            </p>

            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none"
              required
            >
              <option value="">Select reason...</option>
              <option value="Prohibited or offensive language">Prohibited or offensive language</option>
              <option value="Spam or fraudulent content">Spam or fraudulent content</option>
              <option value="Harassment or personal attack">Harassment or personal attack</option>
              <option value="Tournament rules violation">Tournament rules violation</option>
            </select>

            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setReportModalPost(null)}
                className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reportSubmitting || !reportReason}
                className="flex-1 py-2.5 rounded-full bg-[#E52538] text-white font-bold text-xs disabled:opacity-50"
              >
                {reportSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: SETTINGS & PRIVACY (Opened via gear icon) */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-black text-slate-900">Profile & Privacy Settings</h3>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Privacy Toggles */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Privacy Controls</span>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Private Liked Posts</span>
                  <span className="text-[10px] text-slate-500">Only you can see posts you liked</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePrivacy('likedPostsPrivate')}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                    privacySettings.likedPostsPrivate ? 'bg-[#E52538]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                      privacySettings.likedPostsPrivate ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Private Saved Posts</span>
                  <span className="text-[10px] text-slate-500">Only you can see bookmarked posts</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePrivacy('savedPostsPrivate')}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                    privacySettings.savedPostsPrivate ? 'bg-[#E52538]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                      privacySettings.savedPostsPrivate ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Quick Navigation Shortcuts */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Navigation</span>

              <button
                onClick={() => {
                  setSettingsOpen(false);
                  setCurrentScreen('edit-profile');
                }}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center justify-between text-left cursor-pointer"
              >
                <span>Edit Profile</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setSettingsOpen(false);
                  onNavigate('tournament');
                }}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center justify-between text-left cursor-pointer"
              >
                <span>Tournament Center</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setSettingsOpen(false);
                  onNavigate('player-training');
                }}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center justify-between text-left cursor-pointer"
              >
                <span>Player Training</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 flex items-center justify-between">
                <span>Language</span>
                <button
                  onClick={() => setLang(lang === 'so' ? 'en' : 'so')}
                  className="font-bold text-[#E52538] hover:underline cursor-pointer"
                >
                  {lang.toUpperCase()}
                </button>
              </div>

              {token && (
                <button
                  onClick={handleLogout}
                  className="mt-2 p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
