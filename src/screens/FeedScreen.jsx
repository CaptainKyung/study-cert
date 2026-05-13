import { useState } from 'react';
import PostCard from '../components/PostCard';
import { formatDate, getLast7Days } from '../utils/date';
import { colors } from '../utils/theme';

export default function FeedScreen({ user, posts, onRefresh, onLike, onDelete, onEdit, onOpenCamera, onLogout }) {
  const today = formatDate();
  const [selectedDay, setSelectedDay] = useState(today);
  const [refreshing, setRefreshing] = useState(false);
  const days = getLast7Days();

  const todayChecked = posts.some(p => p.date === today && p.userId === user.id);
  const filteredPosts = posts.filter(p => p.date === selectedDay);
  const uniqueUsers = new Set(posts.map(p => p.userId)).size;

  async function handleRefresh() {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }

  return (
    <div style={{ minHeight:'100vh', background:colors.bg,
      fontFamily:'sans-serif', paddingBottom:100 }}>

      {/* 헤더 */}
      <div style={{ padding:'20px 20px 0', display:'flex',
        alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ color:'#fff', fontSize:22, fontWeight:900, margin:0 }}>스터디 인증 🍀</h1>
          <p style={{ color:'#555', fontSize:12, margin:'4px 0 0' }}>
            {new Date().toLocaleDateString('ko-KR', {
              year:'numeric', month:'long', day:'numeric', weekday:'long' })}
          </p>
        </div>
        <button onClick={onLogout} style={{ background:colors.card, border:'none',
          borderRadius:'50%', width:44, height:44, fontSize:22, cursor:'pointer' }}>
          {user.avatar}
        </button>
      </div>

      {/* 오늘 인증 CTA */}
      <div style={{ margin:'16px 20px', background: todayChecked?colors.successBg
        :'linear-gradient(135deg,#1a1535,#251a45)',
        borderRadius:18, padding:'18px 20px',
        border:`1.5px solid ${todayChecked?colors.successBorder:'#3a2a6a'}`,
        display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        {todayChecked ? (
          <>
            <span style={{ fontSize:36 }}>✅</span>
            <div style={{ marginLeft:12 }}>
              <p style={{ color:colors.success, fontWeight:700, margin:0 }}>오늘 인증 완료!</p>
              <p style={{ color:'#4a8a4a', margin:'2px 0 0', fontSize:12 }}>내일도 함께 공부해요 💪</p>
            </div>
            <div style={{ flex:1 }} />
          </>
        ) : (
          <>
            <div>
              <p style={{ color:'#c4b5fd', fontWeight:700, margin:0 }}>오늘 아직 인증 안 했어요!</p>
              <p style={{ color:'#7c6af7', margin:'2px 0 0', fontSize:12 }}>사진 찍고 공부 인증하기 📸</p>
            </div>
            <button onClick={onOpenCamera} style={{
              background:'linear-gradient(135deg,#7c6af7,#a78bfa)', border:'none',
              borderRadius:14, padding:'11px 18px', color:'#fff',
              fontWeight:700, fontSize:14, cursor:'pointer', whiteSpace:'nowrap' }}>
              인증하기
            </button>
          </>
        )}
      </div>

      {/* 통계 */}
      {posts.length > 0 && (
        <div style={{ margin:'0 20px 16px', background:colors.card, borderRadius:16,
          padding:'14px 18px', border:`1.5px solid ${colors.border}`,
          display:'flex' }}>
          {[
            { icon:'📸', val:posts.length, label:'총 인증' },
            { icon:'🔥', val:posts.filter(p=>p.date===today).length, label:'오늘' },
            { icon:'👥', val:uniqueUsers, label:'참여자' },
          ].map((s, i) => (
            <div key={i} style={{ flex:1, textAlign:'center',
              borderRight: i<2?`1px solid ${colors.border}`:'none' }}>
              <p style={{ color:'#fff', fontWeight:900, fontSize:18, margin:0 }}>{s.icon} {s.val}</p>
              <p style={{ color:'#555', fontSize:11, margin:'3px 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* 날짜 캘린더 */}
      <p style={{ color:'#555', fontSize:12, fontWeight:600, padding:'0 20px',
        marginBottom:10, textTransform:'uppercase', letterSpacing:1 }}>날짜별 보기</p>
      <div style={{ display:'flex', gap:8, overflowX:'auto', padding:'0 20px 12px' }}>
        {days.map(d => {
          const hasPosts = posts.some(p => p.date === d.key);
          const active = selectedDay === d.key;
          return (
            <button key={d.key} onClick={() => setSelectedDay(d.key)} style={{
              minWidth:52, padding:'10px 8px', borderRadius:14,
              border:`1.5px solid ${active?'#7c6af7':colors.border}`,
              background: active?'#2a2040':colors.card, cursor:'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <span style={{ color:active?'#c4b5fd':'#555', fontSize:11, fontWeight:600 }}>{d.label}</span>
              <span style={{ color:active?'#fff':'#888', fontSize:16, fontWeight:700 }}>{d.num}</span>
              {hasPosts && <div style={{ width:5, height:5, borderRadius:'50%',
                background:active?'#c4b5fd':'#7c6af7' }} />}
            </button>
          );
        })}
      </div>

      {/* 새로고침 */}
      <div style={{ padding:'0 20px 12px', display:'flex', justifyContent:'flex-end' }}>
        <button onClick={handleRefresh} disabled={refreshing} style={{
          background:colors.card, border:`1.5px solid ${colors.border}`,
          borderRadius:10, padding:'6px 14px', color:'#a0a0c0',
          fontSize:12, cursor:'pointer' }}>
          {refreshing ? '로딩 중...' : '🔄 새로고침'}
        </button>
      </div>

      {/* 게시물 목록 */}
      <div style={{ padding:'0 20px' }}>
        {filteredPosts.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 0' }}>
            <div style={{ fontSize:48 }}>📭</div>
            <p style={{ color:'#444', fontSize:14, marginTop:12 }}>
              {selectedDay === today ? '아직 아무도 인증하지 않았어요' : '이날은 인증 기록이 없어요'}
            </p>
            {selectedDay === today && !todayChecked && (
              <button onClick={onOpenCamera} style={{
                marginTop:12, background:'linear-gradient(135deg,#7c6af7,#a78bfa)',
                border:'none', borderRadius:12, padding:'11px 20px',
                color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' }}>
                첫 번째로 인증하기 🌟
              </button>
            )}
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostCard key={post.id} post={post} currentUserId={user.id}
              onLike={onLike} onDelete={onDelete} onEdit={onEdit} />
          ))
        )}
      </div>

      {/* FAB */}
      {!todayChecked && (
        <button onClick={onOpenCamera} style={{
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