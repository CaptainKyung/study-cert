import { useState } from 'react';
import { colors } from '../utils/theme';
import { formatDate } from '../utils/date';

const AVATARS = ['😻','🧚','👸','🍀','🐻','🤯','🦄','🐸','🌷','💐'];

export default function ProfileScreen({ user, posts, onUpdateUser, onLogout }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);

  const myPosts = posts.filter(p => p.userId === user.id);
  const today = formatDate();

  // 스트릭 계산
  function calcStreak() {
    const dates = [...new Set(myPosts.map(p => p.date))].sort().reverse();
    if (dates.length === 0) return 0;
    let streak = 0;
    let current = new Date();
    for (let i = 0; i < 30; i++) {
      const d = formatDate(current);
      if (dates.includes(d)) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else if (i === 0) {
        current.setDate(current.getDate() - 1);
      } else break;
    }
    return streak;
  }

  const streak = calcStreak();

  function handleSave() {
    if (!name.trim()) return;
    onUpdateUser({ ...user, name: name.trim(), avatar });
    setEditing(false);
  }

  return (
    <div style={{ minHeight:'100vh', background:colors.bg,
      fontFamily:'sans-serif', paddingBottom:100 }}>

      {/* 헤더 */}
      <div style={{ padding:'20px 20px 0', display:'flex',
        alignItems:'center', justifyContent:'space-between' }}>
        <h1 style={{ color:'#fff', fontSize:22, fontWeight:900, margin:0 }}>프로필</h1>
        <button onClick={onLogout} style={{ background:'#252535', border:'none',
          borderRadius:10, padding:'7px 14px', color:'#a0a0c0',
          fontSize:12, cursor:'pointer' }}>
          로그아웃
        </button>
      </div>

      {/* 프로필 카드 */}
      <div style={{ margin:'16px 20px', background:colors.card, borderRadius:20,
        padding:24, border:`1.5px solid ${colors.border}` }}>
        {!editing ? (
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:64, height:64, borderRadius:'50%',
              background:'#252535', display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:36 }}>
              {user.avatar}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ color:'#fff', fontWeight:900, fontSize:20, margin:0 }}>{user.name}</p>
              <p style={{ color:colors.textMuted, fontSize:12, marginTop:4 }}>
                가입일 · {today}
              </p>
            </div>
            <button onClick={() => setEditing(true)} style={{
              background:colors.accentMuted, border:'none', borderRadius:10,
              padding:'8px 14px', color:colors.accent, fontSize:13,
              fontWeight:700, cursor:'pointer' }}>
              편집
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color:colors.textSecondary, fontSize:13, marginBottom:12 }}>아바타 선택</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginBottom:16 }}>
              {AVATARS.map(a => (
                <button key={a} onClick={() => setAvatar(a)} style={{
                  fontSize:26, border:`2px solid ${avatar===a?'#7c6af7':'transparent'}`,
                  background: avatar===a?'#2a2040':'transparent',
                  borderRadius:12, padding:'6px 4px', cursor:'pointer' }}>
                  {a}
                </button>
              ))}
            </div>
            <input value={name} onChange={e => setName(e.target.value)}
              maxLength={12}
              style={{ width:'100%', background:colors.bg, border:`1.5px solid ${colors.border}`,
                borderRadius:12, padding:'12px 16px', color:'#fff', fontSize:15,
                outline:'none', boxSizing:'border-box', marginBottom:12 }} />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setEditing(false)} style={{
                flex:1, padding:11, background:'#252535', border:'none',
                borderRadius:12, color:colors.textSecondary, fontSize:14, cursor:'pointer' }}>
                취소
              </button>
              <button onClick={handleSave} style={{
                flex:2, padding:11,
                background:'linear-gradient(135deg,#7c6af7,#a78bfa)',
                border:'none', borderRadius:12, color:'#fff',
                fontSize:14, fontWeight:700, cursor:'pointer' }}>
                저장
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 통계 */}
      <div style={{ margin:'0 20px 16px', background:colors.card, borderRadius:16,
        padding:'14px 18px', border:`1.5px solid ${colors.border}`, display:'flex' }}>
        {[
          { icon:'📸', val:myPosts.length, label:'총 인증' },
          { icon:'🔥', val:streak, label:'스트릭' },
          { icon:'📅', val:myPosts.filter(p=>p.date===today).length ? '✅' : '❌', label:'오늘' },
        ].map((s, i) => (
          <div key={i} style={{ flex:1, textAlign:'center',
            borderRight: i<2?`1px solid ${colors.border}`:'none' }}>
            <p style={{ color:'#fff', fontWeight:900, fontSize:18, margin:0 }}>{s.icon} {s.val}</p>
            <p style={{ color:'#555', fontSize:11, margin:'3px 0 0' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* 내 인증 모아보기 */}
      <p style={{ color:colors.textMuted, fontSize:12, fontWeight:600,
        padding:'0 20px', marginBottom:10, textTransform:'uppercase', letterSpacing:1 }}>
        내 인증 기록
      </p>

      {myPosts.length === 0 ? (
        <div style={{ textAlign:'center', padding:'48px 0' }}>
          <div style={{ fontSize:48 }}>📭</div>
          <p style={{ color:'#444', fontSize:14, marginTop:12 }}>아직 인증 기록이 없어요</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)',
          gap:2, padding:'0 20px' }}>
          {myPosts.map(post => (
            <div key={post.id} style={{ aspectRatio:'1', overflow:'hidden', borderRadius:8 }}>
              <img src={post.imageUrl ?? post.image} alt=""
                style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}