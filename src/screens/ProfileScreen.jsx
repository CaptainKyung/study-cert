import { useState } from 'react';
import { colors } from '../utils/theme';
import { formatDate } from '../utils/date';
import { changePassword, changeEmail, deleteAccount } from '../utils/firebase';

const AVATARS = ['😻','🧚','👸','🍀','🐻','🤯','🦄','🐸','🌷','💐'];

export default function ProfileScreen({ user, posts, onUpdateUser, onLogout }) {
  const [section, setSection] = useState(null); // null | 'edit' | 'password' | 'email' | 'delete'
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [deletePw, setDeletePw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const myPosts = posts.filter(p => p.userId === user.id);
  const today = formatDate();

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

  function reset() {
    setError('');
    setSuccess('');
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setNewEmail('');
    setDeletePw('');
  }

  function handleSectionChange(s) {
    reset();
    setSection(s);
  }

  async function handleSaveProfile() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onUpdateUser({ ...user, name: name.trim(), avatar });
      setSuccess('프로필이 저장됐어요!');
      setTimeout(() => { setSuccess(''); setSection(null); }, 1500);
    } catch(e) { setError('저장 실패. 다시 시도해주세요.'); }
    finally { setLoading(false); }
  }

  async function handleChangePassword() {
    if (!currentPw || !newPw || !confirmPw) { setError('모두 입력해주세요'); return; }
    if (newPw !== confirmPw) { setError('새 비밀번호가 일치하지 않아요'); return; }
    if (newPw.length < 6) { setError('비밀번호는 6자 이상이어야 해요'); return; }
    setLoading(true); setError('');
    try {
      await changePassword(currentPw, newPw);
      setSuccess('비밀번호가 변경됐어요!');
      setTimeout(() => { setSuccess(''); setSection(null); reset(); }, 1500);
    } catch(e) {
      if (e.code === 'auth/wrong-password') setError('현재 비밀번호가 틀렸어요');
      else setError('변경 실패. 다시 시도해주세요.');
    } finally { setLoading(false); }
  }

  async function handleChangeEmail() {
    if (!currentPw || !newEmail) { setError('모두 입력해주세요'); return; }
    setLoading(true); setError('');
    try {
      await changeEmail(currentPw, newEmail);
      setSuccess('이메일이 변경됐어요!');
      setTimeout(() => { setSuccess(''); setSection(null); reset(); }, 1500);
    } catch(e) {
      if (e.code === 'auth/wrong-password') setError('비밀번호가 틀렸어요');
      else if (e.code === 'auth/email-already-in-use') setError('이미 사용 중인 이메일이에요');
      else setError('변경 실패. 다시 시도해주세요.');
    } finally { setLoading(false); }
  }

  async function handleDeleteAccount() {
    if (!deletePw) { setError('비밀번호를 입력해주세요'); return; }
    if (!window.confirm('정말 계정을 삭제할까요? 모든 데이터가 사라져요.')) return;
    setLoading(true); setError('');
    try {
      await deleteAccount(deletePw);
      onLogout();
    } catch(e) {
      if (e.code === 'auth/wrong-password') setError('비밀번호가 틀렸어요');
      else setError('삭제 실패. 다시 시도해주세요.');
    } finally { setLoading(false); }
  }

  const inputStyle = {
    width:'100%', background:colors.bg, border:`1.5px solid ${colors.border}`,
    borderRadius:12, padding:'12px 16px', color:'#fff', fontSize:15,
    outline:'none', boxSizing:'border-box', marginBottom:12,
  };

  return (
    <div style={{ minHeight:'100vh', background:colors.bg,
      fontFamily:'sans-serif', paddingBottom:100 }}>

      {/* 헤더 */}
      <div style={{ padding:'20px 20px 0', display:'flex',
        alignItems:'center', justifyContent:'space-between' }}>
        <h1 style={{ color:'#fff', fontSize:22, fontWeight:900, margin:0 }}>프로필</h1>
      </div>

      {/* 프로필 카드 */}
      <div style={{ margin:'16px 20px', background:colors.card, borderRadius:20,
        padding:24, border:`1.5px solid ${colors.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:64, height:64, borderRadius:'50%',
            background:'#252535', display:'flex', alignItems:'center',
            justifyContent:'center', fontSize:36 }}>
            {user.avatar}
          </div>
          <div style={{ flex:1 }}>
            <p style={{ color:'#fff', fontWeight:900, fontSize:20, margin:0 }}>{user.name}</p>
            <p style={{ color:colors.textMuted, fontSize:12, marginTop:4 }}>{user.email}</p>
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div style={{ margin:'0 20px 16px', background:colors.card, borderRadius:16,
        padding:'14px 18px', border:`1.5px solid ${colors.border}`, display:'flex' }}>
        {[
          { icon:'📸', val:myPosts.length, label:'총 인증' },
          { icon:'🔥', val:calcStreak(), label:'스트릭' },
          { icon:'📅', val:myPosts.filter(p=>p.date===today).length, label:'오늘' },
        ].map((s, i) => (
          <div key={i} style={{ flex:1, textAlign:'center',
            borderRight: i<2?`1px solid ${colors.border}`:'none' }}>
            <p style={{ color:'#fff', fontWeight:900, fontSize:18, margin:0 }}>{s.icon} {s.val}</p>
            <p style={{ color:'#555', fontSize:11, margin:'3px 0 0' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* 계정 관리 메뉴 */}
      <div style={{ margin:'0 20px 16px', background:colors.card, borderRadius:20,
        border:`1.5px solid ${colors.border}`, overflow:'hidden' }}>
        <div style={{ padding:'14px 16px', borderBottom:`1px solid ${colors.border}` }}>
          <p style={{ color:'#fff', fontWeight:700, fontSize:15, margin:0 }}>계정 관리</p>
        </div>

        {[
          { id:'edit', icon:'👤', label:'프로필 편집', sub:'닉네임, 아바타 변경' },
          { id:'email', icon:'✉️', label:'이메일 변경', sub: user.email },
          { id:'password', icon:'🔒', label:'비밀번호 변경', sub:'현재 비밀번호 필요' },
        ].map((item, i) => (
          <button key={item.id} onClick={() => handleSectionChange(item.id)} style={{
            width:'100%', padding:'14px 16px', background:'none', border:'none',
            borderBottom:`1px solid ${colors.border}`, cursor:'pointer',
            display:'flex', alignItems:'center', gap:12, textAlign:'left' }}>
            <span style={{ fontSize:20 }}>{item.icon}</span>
            <div style={{ flex:1 }}>
              <p style={{ color:'#fff', fontWeight:600, fontSize:14, margin:0 }}>{item.label}</p>
              <p style={{ color:colors.textMuted, fontSize:12, margin:'2px 0 0' }}>{item.sub}</p>
            </div>
            <span style={{ color:colors.textMuted }}>›</span>
          </button>
        ))}

        <button onClick={onLogout} style={{
          width:'100%', padding:'14px 16px', background:'none', border:'none',
          borderBottom:`1px solid ${colors.border}`, cursor:'pointer',
          display:'flex', alignItems:'center', gap:12, textAlign:'left' }}>
          <span style={{ fontSize:20 }}>🚪</span>
          <p style={{ color:'#fff', fontWeight:600, fontSize:14, margin:0 }}>로그아웃</p>
        </button>

        <button onClick={() => handleSectionChange('delete')} style={{
          width:'100%', padding:'14px 16px', background:'none', border:'none',
          cursor:'pointer', display:'flex', alignItems:'center', gap:12, textAlign:'left' }}>
          <span style={{ fontSize:20 }}>🗑️</span>
          <p style={{ color:'#f87171', fontWeight:600, fontSize:14, margin:0 }}>계정 삭제</p>
        </button>
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

      {/* 모달 */}
      {section && (
        <div onClick={() => handleSectionChange(null)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.7)',
          display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:200 }}>
          <div onClick={e => e.stopPropagation()} style={{
            background:colors.card, borderRadius:'20px 20px 0 0',
            padding:'24px 24px 40px', width:'100%', maxWidth:480,
            border:`1.5px solid ${colors.border}` }}>

            {/* 프로필 편집 */}
            {section === 'edit' && (
              <>
                <p style={{ color:'#fff', fontWeight:700, fontSize:18, margin:'0 0 20px' }}>프로필 편집</p>
                <p style={{ color:colors.textSecondary, fontSize:13, marginBottom:8 }}>아바타</p>
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
                  placeholder="닉네임" maxLength={12} style={inputStyle} />
                {error && <p style={{ color:'#f87171', fontSize:13, margin:'0 0 8px' }}>{error}</p>}
                {success && <p style={{ color:colors.success, fontSize:13, margin:'0 0 8px' }}>{success}</p>}
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => handleSectionChange(null)} style={{
                    flex:1, padding:13, background:'#252535', border:'none',
                    borderRadius:12, color:colors.textSecondary, fontSize:14, cursor:'pointer' }}>
                    취소
                  </button>
                  <button onClick={handleSaveProfile} disabled={loading} style={{
                    flex:2, padding:13, background:'linear-gradient(135deg,#7c6af7,#a78bfa)',
                    border:'none', borderRadius:12, color:'#fff',
                    fontSize:14, fontWeight:700, cursor:'pointer' }}>
                    {loading ? '저장 중...' : '저장'}
                  </button>
                </div>
              </>
            )}

            {/* 비밀번호 변경 */}
            {section === 'password' && (
              <>
                <p style={{ color:'#fff', fontWeight:700, fontSize:18, margin:'0 0 20px' }}>비밀번호 변경</p>
                <input value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                  placeholder="현재 비밀번호" type="password" style={inputStyle} />
                <input value={newPw} onChange={e => setNewPw(e.target.value)}
                  placeholder="새 비밀번호 (6자 이상)" type="password" style={inputStyle} />
                <input value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  placeholder="새 비밀번호 확인" type="password" style={inputStyle} />
                {error && <p style={{ color:'#f87171', fontSize:13, margin:'0 0 8px' }}>{error}</p>}
                {success && <p style={{ color:colors.success, fontSize:13, margin:'0 0 8px' }}>{success}</p>}
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => handleSectionChange(null)} style={{
                    flex:1, padding:13, background:'#252535', border:'none',
                    borderRadius:12, color:colors.textSecondary, fontSize:14, cursor:'pointer' }}>
                    취소
                  </button>
                  <button onClick={handleChangePassword} disabled={loading} style={{
                    flex:2, padding:13, background:'linear-gradient(135deg,#7c6af7,#a78bfa)',
                    border:'none', borderRadius:12, color:'#fff',
                    fontSize:14, fontWeight:700, cursor:'pointer' }}>
                    {loading ? '변경 중...' : '변경'}
                  </button>
                </div>
              </>
            )}

            {/* 이메일 변경 */}
            {section === 'email' && (
              <>
                <p style={{ color:'#fff', fontWeight:700, fontSize:18, margin:'0 0 20px' }}>이메일 변경</p>
                <input value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                  placeholder="현재 비밀번호" type="password" style={inputStyle} />
                <input value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  placeholder="새 이메일" type="email" style={inputStyle} />
                {error && <p style={{ color:'#f87171', fontSize:13, margin:'0 0 8px' }}>{error}</p>}
                {success && <p style={{ color:colors.success, fontSize:13, margin:'0 0 8px' }}>{success}</p>}
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => handleSectionChange(null)} style={{
                    flex:1, padding:13, background:'#252535', border:'none',
                    borderRadius:12, color:colors.textSecondary, fontSize:14, cursor:'pointer' }}>
                    취소
                  </button>
                  <button onClick={handleChangeEmail} disabled={loading} style={{
                    flex:2, padding:13, background:'linear-gradient(135deg,#7c6af7,#a78bfa)',
                    border:'none', borderRadius:12, color:'#fff',
                    fontSize:14, fontWeight:700, cursor:'pointer' }}>
                    {loading ? '변경 중...' : '변경'}
                  </button>
                </div>
              </>
            )}

            {/* 계정 삭제 */}
            {section === 'delete' && (
              <>
                <p style={{ color:'#f87171', fontWeight:700, fontSize:18, margin:'0 0 8px' }}>계정 삭제</p>
                <p style={{ color:colors.textMuted, fontSize:13, margin:'0 0 20px' }}>
                  삭제하면 모든 데이터가 사라지고 복구할 수 없어요.
                </p>
                <input value={deletePw} onChange={e => setDeletePw(e.target.value)}
                  placeholder="비밀번호 입력" type="password" style={inputStyle} />
                {error && <p style={{ color:'#f87171', fontSize:13, margin:'0 0 8px' }}>{error}</p>}
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => handleSectionChange(null)} style={{
                    flex:1, padding:13, background:'#252535', border:'none',
                    borderRadius:12, color:colors.textSecondary, fontSize:14, cursor:'pointer' }}>
                    취소
                  </button>
                  <button onClick={handleDeleteAccount} disabled={loading} style={{
                    flex:2, padding:13, background:'#f87171',
                    border:'none', borderRadius:12, color:'#fff',
                    fontSize:14, fontWeight:700, cursor:'pointer' }}>
                    {loading ? '삭제 중...' : '계정 삭제'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
