import { useState, useEffect } from 'react';
import { createGroup, joinGroup, fetchMyGroups, leaveGroup } from '../utils/firebase';
import PostCard from '../components/PostCard';

const glass = {
  background: 'rgba(255,255,255,0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1.5px solid rgba(180,220,150,0.4)',
};

export default function GroupScreen({ user, posts, onLike, onDelete, onEdit }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [mode, setMode] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCode, setShowCode] = useState(null);

  useEffect(() => { loadGroups(); }, []);

  async function loadGroups() {
    const data = await fetchMyGroups(user.id);
    setGroups(data);
  }

  async function handleCreate() {
    if (!groupName.trim()) return;
    setLoading(true); setError('');
    try {
      await createGroup({ name: groupName.trim(), userId: user.id,
        userName: user.name, userAvatar: user.avatar });
      await loadGroups();
      setMode(null); setGroupName('');
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleJoin() {
    if (!inviteCode.trim()) return;
    setLoading(true); setError('');
    try {
      await joinGroup({ code: inviteCode.trim(), userId: user.id,
        userName: user.name, userAvatar: user.avatar });
      await loadGroups();
      setMode(null); setInviteCode('');
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleLeave(groupId) {
    if (!window.confirm('그룹에서 나가시겠어요?')) return;
    await leaveGroup(groupId, user.id);
    await loadGroups();
    setSelectedGroup(null);
  }

  const inputStyle = {
    width:'100%', background:'rgba(255,255,255,0.6)',
    border:'1.5px solid rgba(180,220,150,0.5)',
    borderRadius:12, padding:'12px 16px', color:'#3a5a3a', fontSize:15,
    outline:'none', boxSizing:'border-box', marginBottom:12,
  };

  if (selectedGroup) {
    const memberIds = selectedGroup.members.map(m => m.userId);
    const groupPosts = posts.filter(p => memberIds.includes(p.userId));
    return (
      <div style={{ minHeight:'100vh', background:'#f0f7e6',
        fontFamily:'sans-serif', paddingBottom:100 }}>
        <div style={{ padding:'20px 20px 0', display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => setSelectedGroup(null)} style={{
            ...glass, border:'none', borderRadius:50,
            width:40, height:40, fontSize:20, cursor:'pointer', color:'#3a5a3a' }}>←</button>
          <div style={{ flex:1 }}>
            <h1 style={{ color:'#3a5a3a', fontSize:20, fontWeight:900, margin:0 }}>
              {selectedGroup.name}
            </h1>
            <p style={{ color:'#8aaa8a', fontSize:12, margin:'2px 0 0' }}>
              멤버 {selectedGroup.members.length}명
            </p>
          </div>
          <button onClick={() => setShowCode(selectedGroup.code)} style={{
            background:'rgba(123,198,126,0.2)', border:'1.5px solid rgba(123,198,126,0.4)',
            borderRadius:10, padding:'7px 12px', color:'#5a8a5a', fontSize:12,
            fontWeight:700, cursor:'pointer' }}>
            초대코드
          </button>
        </div>

        {showCode && (
          <div onClick={() => setShowCode(null)} style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,.4)',
            display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
            <div onClick={e => e.stopPropagation()} style={{
              background:'#fff', borderRadius:20, padding:28,
              border:'1.5px solid rgba(180,220,150,0.4)', textAlign:'center', width:280 }}>
              <p style={{ color:'#8aaa8a', fontSize:13, margin:'0 0 8px' }}>초대 코드</p>
              <p style={{ color:'#3a5a3a', fontSize:36, fontWeight:900,
                letterSpacing:8, margin:'0 0 16px' }}>{showCode}</p>
              <p style={{ color:'#8aaa8a', fontSize:12, margin:'0 0 20px' }}>
                이 코드를 친구에게 공유하세요
              </p>
              <button onClick={() => setShowCode(null)} style={{
                width:'100%', padding:12, background:'rgba(123,198,126,0.2)',
                border:'none', borderRadius:12, color:'#5a8a5a',
                fontWeight:700, cursor:'pointer' }}>닫기</button>
            </div>
          </div>
        )}

        <div style={{ margin:'16px 20px', ...glass, borderRadius:16, padding:'14px 18px' }}>
          <p style={{ color:'#8aaa8a', fontSize:12, fontWeight:600,
            margin:'0 0 12px', textTransform:'uppercase', letterSpacing:1 }}>멤버</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
            {selectedGroup.members.map(m => (
              <div key={m.userId} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:36, height:36, borderRadius:'50%',
                  background:'rgba(180,220,150,0.3)', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:18 }}>{m.userAvatar}</div>
                <span style={{ color:'#3a5a3a', fontSize:13, fontWeight:600 }}>{m.userName}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding:'0 20px' }}>
          {groupPosts.length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px 0' }}>
              <div style={{ fontSize:48 }}>📭</div>
              <p style={{ color:'#8aaa8a', fontSize:14, marginTop:12 }}>
                아직 그룹원 인증이 없어요
              </p>
            </div>
          ) : (
            groupPosts.map(post => (
              <PostCard key={post.id} post={post} currentUserId={user.id}
                currentUser={user} onLike={onLike} onDelete={onDelete} onEdit={onEdit} />
            ))
          )}
        </div>

        <div style={{ padding:'0 20px', marginTop:8 }}>
          <button onClick={() => handleLeave(selectedGroup.id)} style={{
            width:'100%', padding:13, background:'transparent',
            border:'1.5px solid #e88080', borderRadius:14,
            color:'#e88080', fontSize:14, fontWeight:600, cursor:'pointer' }}>
            그룹 나가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f0f7e6',
      fontFamily:'sans-serif', paddingBottom:100 }}>

      <div style={{ padding:'20px 20px 0', display:'flex',
        alignItems:'center', justifyContent:'space-between' }}>
        <h1 style={{ color:'#3a5a3a', fontSize:22, fontWeight:900, margin:0 }}>그룹 👥</h1>
      </div>

      <div style={{ display:'flex', gap:12, padding:'16px 20px' }}>
        <button onClick={() => { setMode('create'); setError(''); }} style={{
          flex:1, padding:13, background:'rgba(123,198,126,0.2)',
          border:'1.5px solid rgba(123,198,126,0.4)', borderRadius:14,
          color:'#5a8a5a', fontSize:14, fontWeight:700, cursor:'pointer' }}>
          + 그룹 만들기
        </button>
        <button onClick={() => { setMode('join'); setError(''); }} style={{
          flex:1, padding:13, ...glass, borderRadius:14,
          color:'#3a5a3a', fontSize:14, fontWeight:700, cursor:'pointer',
          border:'1.5px solid rgba(180,220,150,0.4)' }}>
          코드로 참여
        </button>
      </div>

      {mode === 'create' && (
        <div style={{ margin:'0 20px 16px', ...glass, borderRadius:16, padding:20 }}>
          <p style={{ color:'#5a8a5a', fontSize:13, margin:'0 0 8px' }}>그룹 이름</p>
          <input value={groupName} onChange={e => setGroupName(e.target.value)}
            placeholder="예: 수능 D-100 스터디" maxLength={20} style={inputStyle} />
          {error && <p style={{ color:'#e88080', fontSize:12, margin:'0 0 8px' }}>{error}</p>}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setMode(null)} style={{
              flex:1, padding:11, background:'#f0f7e6', border:'none',
              borderRadius:12, color:'#8aaa8a', fontSize:14, cursor:'pointer' }}>취소</button>
            <button onClick={handleCreate} disabled={loading} style={{
              flex:2, padding:11, background:'linear-gradient(135deg,#7bc67e,#a8d9a8)',
              border:'none', borderRadius:12, color:'#fff',
              fontSize:14, fontWeight:700, cursor:'pointer' }}>
              {loading ? '만드는 중...' : '만들기'}
            </button>
          </div>
        </div>
      )}

      {mode === 'join' && (
        <div style={{ margin:'0 20px 16px', ...glass, borderRadius:16, padding:20 }}>
          <p style={{ color:'#5a8a5a', fontSize:13, margin:'0 0 8px' }}>초대 코드</p>
          <input value={inviteCode} onChange={e => setInviteCode(e.target.value)}
            placeholder="6자리 코드 입력" maxLength={6}
            style={{ ...inputStyle, textTransform:'uppercase', letterSpacing:4 }} />
          {error && <p style={{ color:'#e88080', fontSize:12, margin:'0 0 8px' }}>{error}</p>}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setMode(null)} style={{
              flex:1, padding:11, background:'#f0f7e6', border:'none',
              borderRadius:12, color:'#8aaa8a', fontSize:14, cursor:'pointer' }}>취소</button>
            <button onClick={handleJoin} disabled={loading} style={{
              flex:2, padding:11, background:'linear-gradient(135deg,#7bc67e,#a8d9a8)',
              border:'none', borderRadius:12, color:'#fff',
              fontSize:14, fontWeight:700, cursor:'pointer' }}>
              {loading ? '참여 중...' : '참여하기'}
            </button>
          </div>
        </div>
      )}

      <p style={{ color:'#8aaa8a', fontSize:12, fontWeight:600,
        padding:'0 20px', marginBottom:10, textTransform:'uppercase', letterSpacing:1 }}>
        내 그룹
      </p>

      {groups.length === 0 ? (
        <div style={{ textAlign:'center', padding:'48px 0' }}>
          <div style={{ fontSize:48 }}>👥</div>
          <p style={{ color:'#8aaa8a', fontSize:14, marginTop:12 }}>
            아직 참여한 그룹이 없어요
          </p>
        </div>
      ) : (
        <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:12 }}>
          {groups.map(group => (
            <button key={group.id} onClick={() => setSelectedGroup(group)} style={{
              ...glass, borderRadius:16, padding:'16px 18px', cursor:'pointer',
              display:'flex', alignItems:'center', gap:12, textAlign:'left',
              border:'1.5px solid rgba(180,220,150,0.4)' }}>
              <div style={{ width:44, height:44, borderRadius:12,
                background:'rgba(123,198,126,0.2)', display:'flex',
                alignItems:'center', justifyContent:'center', fontSize:22 }}>
                👥
              </div>
              <div style={{ flex:1 }}>
                <p style={{ color:'#3a5a3a', fontWeight:700, fontSize:15, margin:0 }}>
                  {group.name}
                </p>
                <p style={{ color:'#8aaa8a', fontSize:12, margin:'3px 0 0' }}>
                  멤버 {group.members.length}명
                </p>
              </div>
              <span style={{ color:'#8aaa8a', fontSize:18 }}>›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}