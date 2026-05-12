import { useState, useEffect } from 'react';
import SetupScreen from './screens/SetupScreen';
import FeedScreen from './screens/FeedScreen';
import CameraScreen from './screens/CameraScreen';
import { createPost, fetchPosts, toggleLikeDB } from './utils/firebase';
import { formatDate } from './utils/date';

const USER_KEY = 'studycert_user';

export default function App() {
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

  const today = formatDate();
  const alreadyCertified = posts.some(p => p.date === today && p.userId === user?.id);

  async function handleSubmit({ imageBase64, caption }) {
    await createPost({
      userId: user.id, userName: user.name,
      userAvatar: user.avatar, imageBase64, caption, date: today,
    });
    await loadPosts();
    setScreen('feed');
  }

  async function handleLike(postId, currentLikes) {
    const updated = await toggleLikeDB(postId, user.id, currentLikes);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: updated } : p));
  }

  if (!user) return <SetupScreen onComplete={handleSetupComplete} />;
  if (screen === 'camera') return (
    <CameraScreen user={user} alreadyCertified={alreadyCertified}
      onSubmit={handleSubmit} onBack={() => setScreen('feed')} />
  );
  return (
    <FeedScreen user={user} posts={posts} onRefresh={loadPosts}
      onLike={handleLike} onOpenCamera={() => setScreen('camera')} onLogout={handleLogout} />
  );
}