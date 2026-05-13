import { useState, useEffect } from 'react';
import AuthScreen from './screens/AuthScreen';
import FeedScreen from './screens/FeedScreen';
import CameraScreen from './screens/CameraScreen';
import ProfileScreen from './screens/ProfileScreen';
import GroupScreen from './screens/GroupScreen';
import BottomTab from './components/BottomTab';
import {
  onAuthChange, fetchUserProfile, logoutUser,
  createPost, fetchPosts, toggleLikeDB,
  deletePost, editPost, updateUserProfile
} from './utils/firebase';
import { formatDate } from './utils/date';

export default function App() {
  const [tab, setTab] = useState('feed');
  const [screen, setScreen] = useState('feed');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);
        if (profile) {
          setUser({ id: firebaseUser.uid, ...profile });
        } else {
          setUser({ id: firebaseUser.uid, email: firebaseUser.email });
        }
        await loadPosts();
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function loadPosts() {
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch(e) { console.error(e); }
  }

  async function handleAuthComplete(userData) {
    const profile = await fetchUserProfile(userData.id);
    if (profile) {
      setUser({ id: userData.id, ...profile });
    } else {
      setUser(userData);
    }
    await loadPosts();
  }

  async function handleLogout() {
    if (window.confirm('로그아웃 하시겠어요?')) {
      await logoutUser();
      setUser(null);
      setPosts([]);
    }
  }

  async function handleUpdateUser(updatedUser) {
    setUser(updatedUser);
    await updateUserProfile(updatedUser.id, {
      name: updatedUser.name,
      avatar: updatedUser.avatar,
    });
  }

  const today = formatDate();

  async function handleSubmit({ imageBase64, caption }) {
    await createPost({
      userId: user.id, userName: user.name,
      userAvatar: user.avatar, imageBase64, caption, date: today,
    });
    await loadPosts();
    setScreen('feed');
    setTab('feed');
  }

  async function handleLike(postId, currentLikes) {
    const updated = await toggleLikeDB(postId, user.id, currentLikes);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: updated } : p));
  }

  async function handleDelete(postId, imageUrl) {
    await deletePost(postId, imageUrl);
    setPosts(prev => prev.filter(p => p.id !== postId));
  }

  async function handleEdit(postId, caption) {
    await editPost(postId, caption);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, caption } : p));
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0f0f14', display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:48 }}>🍀</div>
    </div>
  );

  if (!user) return <AuthScreen onComplete={handleAuthComplete} />;

  if (screen === 'camera') return (
    <CameraScreen user={user}
      onSubmit={handleSubmit} onBack={() => setScreen('feed')} />
  );

  return (
    <div>
      {tab === 'feed' && (
        <FeedScreen user={user} posts={posts} onRefresh={loadPosts}
          onLike={handleLike} onDelete={handleDelete} onEdit={handleEdit}
          onOpenCamera={() => setScreen('camera')} onLogout={handleLogout} />
      )}
      {tab === 'group' && (
        <GroupScreen user={user} posts={posts}
          onLike={handleLike} onDelete={handleDelete} onEdit={handleEdit} />
      )}
      {tab === 'profile' && (
        <ProfileScreen user={user} posts={posts}
          onUpdateUser={handleUpdateUser} onLogout={handleLogout} />
      )}
      <BottomTab screen={tab} onChange={setTab} />
    </div>
  );
}