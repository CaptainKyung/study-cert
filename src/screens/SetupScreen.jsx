import { useState } from 'react';

const AVATARS = ['😻','🧚','👸','🍀','🐻','🤯','🦄','🐸','🌷','💐'];
const QUICK_NAMES = ['멋쟁이','똑쟁이','공주','귀요미','쪼','이쁘니'];

export default function SetupScreen({ onComplete }) {
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [name, setName] = useState('');

  return (
    <div style={{ minHeight:'100vh', background:'#0f0f14', display:'flex',
      alignItems:'center', justifyContent:'center', fontFamily:'sans-serif' }}>
      <div style={{ width:'100%', maxWidth:380, padding:'0 24px' }}>

        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:56 }}>📚</div>
          <h1 style={{ color:'#fff', fontSize:26, fontWeight:900 }}>스터디 인증</h1>
          <p style={{ color:'#666', fontSize:14 }}>매일 공부 인증하고 함께 힘내요</p>
        </div>

        <div style={{ background:'#1a1a24', borderRadius:20, padding:28,
          border:'1.5px solid #2a2a3a' }}>

          <p style={{ color:'#a0a0c0', fontSize:13, marginBottom:12 }}>아바타 선택</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginBottom:24 }}>
            {AVATARS.map(a => (
              <button key={a} onClick={() => setAvatar(a)} style={{
                fontSize:28, border:`2px solid ${avatar===a?'#7c6af7':'transparent'}`,
                background: avatar===a?'#2a2040':'transparent',
                borderRadius:12, padding:'8px 4px', cursor:'pointer'
              }}>{a}</button>
            ))}
          </div>

          <p style={{ color:'#a0a0c0', fontSize:13, marginBottom:8 }}>닉네임</p>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="닉네임을 입력하세요" maxLength={12}
            style={{ width:'100%', background:'#0f0f14', border:'1.5px solid #2a2a3a',
              borderRadius:12, padding:'12px 16px', color:'#fff', fontSize:15,
              outline:'none', boxSizing:'border-box' }} />

          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
            {QUICK_NAMES.map(n => (
              <button key={n} onClick={() => setName(n)} style={{
                background:'#252535', border:'none', color:'#a0a0c0',
                borderRadius:8, padding:'5px 10px', fontSize:12, cursor:'pointer'
              }}>{n}</button>
            ))}
          </div>

          <button onClick={() => name.trim() && onComplete({
              id: Date.now().toString(), name: name.trim(), avatar })}
            style={{ width:'100%', marginTop:24, padding:14,
              background: name.trim()?'linear-gradient(135deg,#7c6af7,#a78bfa)':'#2a2a3a',
              border:'none', borderRadius:14, color:'#fff', fontSize:16,
              fontWeight:700, cursor: name.trim()?'pointer':'default' }}>
            시작하기 🚀
          </button>
        </div>
      </div>
    </div>
  );
}