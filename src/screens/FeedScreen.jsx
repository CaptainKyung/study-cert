import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { formatDate } from '../utils/date';
import { colors } from '../utils/theme';
import { fetchTodos, addTodo, toggleTodo, deleteTodo } from '../utils/firebase';

export default function FeedScreen({ user, posts, onRefresh, onLike, onDelete, onEdit, onOpenCamera, onLogout }) {
  const today = formatDate();
  const [selectedDay, setSelectedDay] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loadingTodos, setLoadingTodos] = useState(false);

  useEffect(() => {
    loadTodos(selectedDay);
  }, [selectedDay]);

  async function loadTodos(date) {
    setLoadingTodos(true);
    try {
      const data = await fetchTodos(user.id, date);
      setTodos(data.sort((a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0)));
    } catch(e) { console.error(e); }
    finally { setLoadingTodos(false); }
  }

  async function handleAddTodo() {
    if (!newTodo.trim()) return;
    const todo = await addTodo(user.id, selectedDay, newTodo.trim());
    setTodos(prev => [...prev, todo]);
    setNewTodo('');
  }

  async function handleToggleTodo(todoId, done) {
    await toggleTodo(todoId, done);
    setTodos(prev => prev.map(t => t.id === todoId ? { ...t, done: !done } : t));
  }

  async function handleDeleteTodo(todoId) {
    await deleteTodo(todoId);
    setTodos(prev => prev.filter(t => t.id !== todoId));
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calDays = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calDays.push(i);

  function getDateKey(day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const selectedPosts = posts.filter(p => p.date === selectedDay);
  const isToday = selectedDay === today;
  const isPast = selectedDay < today;
  const isFuture = selectedDay > today;

  return (
    <div style={{ minHeight:'100vh', background:colors.bg,
      fontFamily:'sans-serif', paddingBottom:120 }}>

      {/* 헤더 */}
      <div style={{ padding:'20px 20px 0', display:'flex',
        alignItems:'center', justifyContent:'space-between' }}>
        <h1 style={{ color:'#fff', fontSize:22, fontWeight:900, margin:0 }}>스터디 인증 🍀</h1>
        <button onClick={onLogout} style={{ background:colors.card, border:'none',
          borderRadius:'50%', width:44, height:44, fontSize:22, cursor:'pointer' }}>
          {user.avatar}
        </button>
      </div>

      {/* 캘린더 */}
      <div style={{ margin:'16px 20px', background:colors.card, borderRadius:20,
        padding:'16px', border:`1.5px solid ${colors.border}` }}>
        <div style={{ display:'flex', alignItems:'center',
          justifyContent:'space-between', marginBottom:12 }}>
          <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} style={{
            background:'none', border:'none', color:'#fff', fontSize:20, cursor:'pointer' }}>‹</button>
          <span style={{ color:'#fff', fontWeight:700, fontSize:16 }}>
            {year}년 {month + 1}월
          </span>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} style={{
            background:'none', border:'none', color:'#fff', fontSize:20, cursor:'pointer' }}>›</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:4 }}>
          {['일','월','화','수','목','금','토'].map((d, i) => (
            <div key={d} style={{ textAlign:'center',
              color: i===0?'#f87171': i===6?'#7c6af7':colors.textMuted,
              fontSize:11, fontWeight:600, padding:'4px 0' }}>{d}</div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
          {calDays.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const dateKey = getDateKey(day);
            const hasCert = posts.some(p => p.date === dateKey && p.userId === user.id);
            const isSelected = selectedDay === dateKey;
            const isTodayDate = dateKey === today;
            const isFutureDate = dateKey > today;

            return (
              <button key={dateKey} onClick={() => !isFutureDate && setSelectedDay(dateKey)}
                style={{
                  padding:'6px 2px', borderRadius:8, border:'none',
                  background: isSelected ? colors.accent : 'transparent',
                  cursor: isFutureDate ? 'default' : 'pointer',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:2,
                  opacity: isFutureDate ? 0.3 : 1,
                }}>
                <span style={{
                  color: isSelected ? '#fff' : isTodayDate ? colors.accent : '#fff',
                  fontSize:13, fontWeight: isSelected || isTodayDate ? 700 : 400,
                }}>{day}</span>
                {hasCert && (
                  <div style={{ width:4, height:4, borderRadius:'50%',
                    background: isSelected ? '#fff' : colors.accentLight }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택한 날짜 섹션 */}
      <div style={{ padding:'0 20px' }}>
        <p style={{ color:colors.textMuted, fontSize:12, fontWeight:600,
          marginBottom:10, textTransform:'uppercase', letterSpacing:1 }}>
          {isToday ? '오늘' : selectedDay}
        </p>

        {/* 인증 사진들 */}
        {selectedPosts.length > 0 && (
          <div style={{ marginBottom:16 }}>
            {selectedPosts.map(post => (
              <PostCard key={post.id} post={post} currentUserId={user.id}
                currentUser={user} onLike={onLike} onDelete={onDelete} onEdit={onEdit} />
            ))}
          </div>
        )}

        {isPast && selectedPosts.length === 0 && (
          <div style={{ textAlign:'center', padding:'24px 0', marginBottom:16,
            background:colors.card, borderRadius:16, border:`1.5px solid ${colors.border}` }}>
            <div style={{ fontSize:36 }}>📭</div>
            <p style={{ color:'#444', fontSize:13, marginTop:8 }}>이날은 인증 기록이 없어요</p>
          </div>
        )}

        {/* 투두리스트 */}
        {!isFuture && (
          <div style={{ background:colors.card, borderRadius:20,
            border:`1.5px solid ${colors.border}`, overflow:'hidden', marginBottom:16 }}>
            <div style={{ padding:'14px 16px', borderBottom:`1px solid ${colors.border}` }}>
              <p style={{ color:'#fff', fontWeight:700, fontSize:15, margin:0 }}>
                ✅ 투두리스트
              </p>
            </div>

            {loadingTodos ? (
              <div style={{ padding:20, textAlign:'center',
                color:colors.textMuted, fontSize:13 }}>로딩 중...</div>
            ) : (
              <>
                {todos.length === 0 && (
                  <div style={{ padding:'16px', textAlign:'center' }}>
                    <p style={{ color:'#444', fontSize:13 }}>할 일을 추가해보세요!</p>
                  </div>
                )}
                {todos.map(todo => (
                  <div key={todo.id} style={{ display:'flex', alignItems:'center',
                    gap:12, padding:'12px 16px',
                    borderBottom:`1px solid ${colors.border}` }}>
                    <button onClick={() => handleToggleTodo(todo.id, todo.done)} style={{
                      width:22, height:22, borderRadius:'50%',
                      border:`2px solid ${todo.done ? colors.accent : colors.border}`,
                      background: todo.done ? colors.accent : 'transparent',
                      cursor:'pointer', flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {todo.done && <span style={{ color:'#fff', fontSize:12 }}>✓</span>}
                    </button>
                    <span style={{ flex:1, color: todo.done ? colors.textMuted : '#fff',
                      fontSize:14, textDecoration: todo.done ? 'line-through' : 'none' }}>
                      {todo.text}
                    </span>
                    <button onClick={() => handleDeleteTodo(todo.id)} style={{
                      background:'none', border:'none', color:'#444',
                      fontSize:16, cursor:'pointer', padding:0 }}>✕</button>
                  </div>
                ))}

                <div style={{ display:'flex', gap:8, padding:'12px 16px' }}>
                  <input value={newTodo} onChange={e => setNewTodo(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddTodo()}
                    placeholder="할 일 추가..."
                    style={{ flex:1, background:colors.bg, border:`1.5px solid ${colors.border}`,
                      borderRadius:10, padding:'10px 12px', color:'#fff', fontSize:14,
                      outline:'none' }} />
                  <button onClick={handleAddTodo} style={{
                    background:colors.accent, border:'none', borderRadius:10,
                    padding:'10px 16px', color:'#fff', fontWeight:700,
                    fontSize:14, cursor:'pointer' }}>+</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* FAB - 미래 날짜 제외하고 모두 사진 올리기 가능 */}
      {!isFuture && (
        <button onClick={() => onOpenCamera(selectedDay)} style={{
          position:'fixed', bottom:90, right:24, width:60, height:60,
          borderRadius:'50%', background:'linear-gradient(135deg,#7c6af7,#a78bfa)',
          border:'none', cursor:'pointer', fontSize:26,
          boxShadow:'0 8px 24px rgba(124,106,247,.4)', zIndex:50 }}>
          📸
        </button>
      )}
    </div>
  );
}