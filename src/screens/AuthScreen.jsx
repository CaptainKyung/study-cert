import { useState } from 'react';
import { registerUser, loginUser } from '../utils/firebase';

const AVATARS = ['😻','🧚','👸','🍀','🐻','🤯','🦄','🐸','🌷','💐'];

const glass = {
  background: 'rgba(255,255,255,0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1.5px solid rgba(180,220,150,0.4)',
};

export default function AuthScreen({ onComplete }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputStyle = {
    width:'100%', background:'rgba(255,255,255,0.6)',
    border:'1.5px solid rgba(180,220,150,0.5)',
    borderRadius:12, padding:'12px 16px', color:'#3a5a3a', fontSize:15,
    outline:'none', boxSizing:'border-box', marginBottom:12,
  };

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) return;
    if (mode === 'register' && !name.trim()) return;
    setLoading(true); setError('');
    try {
      if (mode === 'register') {
        const firebaseUser = await registerUser({ email, password, name, avatar });
        onComplete({ id: firebaseUser.uid, name, avatar, email });
      } else {
        const firebaseUser = await loginUser({ email, password });
        onComplete({ id: firebaseUser.uid, email });
      }
    } catch(e) {
      if (e.code === 'auth/email-already-in-use') setError('이미 사용 중인 이메일이에요');
      else if (e.code === 'auth/wrong-password') setError('비밀번호가 틀렸어요');
      else if (e.code === 'auth/user-not-found') setError('존재하지 않는 계정이에요');
      else if (e.code === 'auth/weak-password') setError('비밀번호는 6자 이상이어야 해요');
      else if (e.code === 'auth/invalid-email') setError('올바른 이메일 형식이 아니에요');
      else setError('오류가 발생했어요. 다시 시도해주세요.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f0f7e6', display:'flex',
      alignItems:'center', justifyContent:'center', fontFamily:'sans-serif' }}>
      <div style={{ width:'100%', maxWidth:380, padding:'0 24px' }}>

        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:56 }}>🍀</div>
          <h1 style={{ color:'#3a5a3a', fontSize:26, fontWeight:900, margin:0 }}>스터디 인증</h1>
          <p style={{ color:'#8aaa8a', fontSize:14, marginTop:8 }}>매일 공부 인증하고 함께 성장해요</p>
        </div>

        <div style={{ ...glass, borderRadius:20, padding:28 }}>
          {/* 탭 */}
          <div style={{ display:'flex', background:'rgba(180,220,150,0.2)', borderRadius:12,
            padding:4, marginBottom:24 }}>
            {['login','register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                flex:1, padding:'10px', border:'none', borderRadius:10,
                background: mode===m?'#fff':'transparent',
                color: mode===m?'#7bc67e':'#8aaa8a',
                fontWeight: mode===m?700:400, fontSize:14, cursor:'pointer',
              }}>
                {m === 'login' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>

          {mode === 'register' && (
            <>
              <p style={{ color:'#5a8a5a', fontSize:13, marginBottom:8 }}>아바타 선택</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)',
                gap:8, marginBottom:16 }}>
                {AVATARS.map(a => (
                  <button key={a} onClick={() => setAvatar(a)} style={{
                    fontSize:26, border:`2px solid ${avatar===a?'#7bc67e':'transparent'}`,
                    background: avatar===a?'rgba(123,198,126,0.2)':'transparent',
                    borderRadius:12, padding:'6px 4px', cursor:'pointer' }}>
                    {a}
                  </button>
                ))}
              </div>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="닉네임" maxLength={12} style={inputStyle} />
            </>
          )}

          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="이메일" type="email" style={inputStyle} />
          <input value={password} onChange={e => setPassword(e.target.value)}
            placeholder="비밀번호 (6자 이상)" type="password"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={inputStyle} />

          {error && <p style={{ color:'#e88080', fontSize:13, margin:'0 0 12px' }}>{error}</p>}

          <button onClick={handleSubmit} disabled={loading} style={{
            width:'100%', padding:14,
            background:'linear-gradient(135deg,#7bc67e,#a8d9a8)',
            border:'none', borderRadius:14, color:'#fff',
            fontSize:16, fontWeight:700, cursor:'pointer' }}>
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </div>
      </div>
    </div>
  );
}