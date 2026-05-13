import { useState, useEffect } from 'react';
import SetupScreen from './screens/SetupScreen';
import FeedScreen from './screens/FeedScreen';
import CameraScreen from './screens/CameraScreen';
import ProfileScreen from './screens/ProfileScreen';
import GroupScreen from './screens/GroupScreen';
import BottomTab from './components/BottomTab';
import { createPost, fetchPosts, toggleLikeDB, deletePost, editPost } from './utils/firebase';
import { formatDate } from './utils/date';

const USER_KEY = 'studycert_user';

export default function App() {
  const [tab, setTab] = useState('feed');
  const [screen, setScreen] = useState('feed');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [posts, setPosts] = useState([]);

  useEffect(() => { loadPosts(); }, []);

  async function loadPosts() {
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch(e) { console.error(e); }
  }

  function handleSetupComplete(newUser) {
    setUser(newUser);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  }

  function handleLogout() {
    if (window.confirm('로그아웃 하시겠어요?')) {
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  }

  function handleUpdateUser(updatedUser) {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }

  const today = formatDate();
  const alreadyCertified = posts.some(p => p.date === today && p.userId === user?.id);

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

  if (!user) return <SetupScreen onComplete={handleSetupComplete} />;

  if (screen === 'camera') return (
    <CameraScreen user={user} alreadyCertified={alreadyCertified}
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