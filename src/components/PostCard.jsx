import { useState, useEffect } from 'react';
import { formatRelative, formatTime } from '../utils/date';
import { colors } from '../utils/theme';
import { fetchComments, addComment, deleteComment } from '../utils/firebase';

export default function PostCard({ post, currentUserId, currentUser, onLike, onDelete, onEdit }) {
  const liked = post.likes?.includes(currentUserId);
  const isOwn = post.userId === currentUserId;
  const ts = post.createdAt?.toMillis?.() ?? post.createdAt ?? Date.now();
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption ?? '');
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (showComments) loadComments();
  }, [showComments]);

  async function loadComments() {
    setLoadingComments(true);
    try {
      const data = await fetchComments(post.id);
      setComments(data);
    } catch(e) { console.error(e); }
    finally { setLoadingComments(false); }
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;
    const comment = await addComment(
      post.id, currentUserId,
      currentUser.name, currentUser.avatar,
      newComment.trim()
    );
    setComments(prev => [...prev, comment]);
    setNewComment('');
  }

  async function handleDeleteComment(commentId) {
    await deleteComment(commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
  }

  function handleEdit() {
    setShowMenu(false);
    setEditing(true);
  }

  function handleEditSubmit() {
    onEdit(post.id, editCaption);
    setEditing(false);
  }

  function handleDelete() {
    if (window.confirm('정말 삭제할까요?')) {
      onDelete(post.id, post.imageUrl);
    }
    setShowMenu(false);
  }

  return (
    <div style={{ background:colors.card, borderRadius:20, overflow:'hidden',
      border:`1.5px solid ${colors.border}`, marginBottom:16, position:'relative' }}>

      {/* 헤더 */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 16px 10px' }}>
        <div style={{ width:40, height:40, borderRadius:'50%', background:'#252535',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
          {post.userAvatar}
        </div>
        <div style={{ flex:1 }}>
          <p style={{ color:'#fff', fontWeight:700, margin:0, fontSize:14 }}>{post.userName}</p>
          <p style={{ color:'#555', fontSize:11, margin:'2px 0 0' }}>
            {formatRelative(ts)} · {formatTime(ts)}
          </p>
        </div>
        {isOwn && (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ background:'#2a2040', borderRadius:8, padding:'3px 10px' }}>
              <span style={{ color:'#7c6af7', fontSize:11, fontWeight:700 }}>나의 인증</span>
            </div>
            <button onClick={() => setShowMenu(!showMenu)} style={{
              background:'none', border:'none', color:'#a0a0c0',
              fontSize:20, cursor:'pointer', padding:'0 4px', lineHeight:1 }}>
              ⋯
            </button>
          </div>
        )}
      </div>

      {/* 드롭다운 메뉴 */}
      {showMenu && (
        <div style={{ position:'absolute', top:52, right:16, background:'#252535',
          borderRadius:12, border:`1.5px solid ${colors.border}`,
          zIndex:100, overflow:'hidden', boxShadow:'0 8px 24px rgba(0,0,0,.4)' }}>
          <button onClick={handleEdit} style={{
            display:'block', width:'100%', padding:'12px 20px',
            background:'none', border:'none', color:'#fff',
            fontSize:14, cursor:'pointer', textAlign:'left' }}>
            ✏️ 편집
          </button>
          <div style={{ height:1, background:colors.border }} />
          <button onClick={handleDelete} style={{
            display:'block', width:'100%', padding:'12px 20px',
            background:'none', border:'none', color:'#f87171',
            fontSize:14, cursor:'pointer', textAlign:'left' }}>
            🗑️ 삭제
          </button>
        </div>
      )}

      {/* 이미지 */}
      <img src={post.imageUrl ?? post.image} alt=""
        style={{ width:'100%', maxHeight:360, objectFit:'cover', display:'block' }} />

      {/* 캡션 + 좋아요 + 댓글 */}
      <div style={{ padding:'12px 16px 14px' }}>
        {editing ? (
          <div style={{ marginBottom:10 }}>
            <textarea value={editCaption} onChange={e => setEditCaption(e.target.value)}
              rows={2} maxLength={200}
              style={{ width:'100%', background:'#0f0f14', border:`1.5px solid ${colors.accent}`,
                borderRadius:10, padding:'10px 12px', color:'#fff', fontSize:14,
                resize:'none', outline:'none', boxSizing:'border-box', lineHeight:1.5 }} />
            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <button onClick={() => setEditing(false)} style={{
                flex:1, padding:'9px', background:'#252535', border:'none',
                borderRadius:10, color:'#a0a0c0', fontSize:13, cursor:'pointer' }}>
                취소
              </button>
              <button onClick={handleEditSubmit} style={{
                flex:2, padding:'9px',
                background:'linear-gradient(135deg,#7c6af7,#a78bfa)',
                border:'none', borderRadius:10, color:'#fff',
                fontSize:13, fontWeight:700, cursor:'pointer' }}>
                저장
              </button>
            </div>
          </div>
        ) : (
          post.caption && (
            <p style={{ color:'#ccc', fontSize:14, margin:'0 0 10px', lineHeight:1.5 }}>
              {post.caption}
            </p>
          )
        )}

        {/* 좋아요 + 댓글 버튼 */}
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <button onClick={() => onLike(post.id, post.likes ?? [])} style={{
              background:'none', border:'none', cursor:'pointer', fontSize:22, padding:0 }}>
              {liked ? '❤️' : '🤍'}
            </button>
            {post.likes?.length > 0 && (
              <span style={{ color: liked?'#f87171':'#666', fontSize:13, fontWeight:600 }}>
                {post.likes.length}
              </span>
            )}
          </div>
          <button onClick={() => setShowComments(!showComments)} style={{
            background:'none', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', gap:6, padding:0 }}>
            <span style={{ fontSize:20 }}>💬</span>
            {comments.length > 0 && (
              <span style={{ color:'#666', fontSize:13, fontWeight:600 }}>
                {comments.length}
              </span>
            )}
          </button>
        </div>

        {/* 댓글 섹션 */}
        {showComments && (
          <div style={{ marginTop:12, borderTop:`1px solid ${colors.border}`, paddingTop:12 }}>
            {loadingComments ? (
              <p style={{ color:colors.textMuted, fontSize:13, textAlign:'center' }}>로딩 중...</p>
            ) : (
              <>
                {comments.length === 0 && (
                  <p style={{ color:'#444', fontSize:13, textAlign:'center', marginBottom:8 }}>
                    첫 댓글을 남겨보세요!
                  </p>
                )}
                {comments.map(comment => (
                  <div key={comment.id} style={{ display:'flex', alignItems:'flex-start',
                    gap:8, marginBottom:10 }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:'#252535',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:14, flexShrink:0 }}>
                      {comment.userAvatar}
                    </div>
                   <div style={{ flex:1, background:'#252535', borderRadius:10,
                      padding:'8px 10px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ color:colors.accent, fontSize:12, fontWeight:700 }}>
                          {comment.userName}
                        </span>
                        <span style={{ color:'#fff', fontSize:13, lineHeight:1.4 }}>
                          {comment.text}
                        </span>
                      </div>
                    </div>
                    {comment.userId === currentUserId && (
                      <button onClick={() => handleDeleteComment(comment.id)} style={{
                        background:'none', border:'none', color:'#444',
                        fontSize:14, cursor:'pointer', padding:'4px', flexShrink:0 }}>✕</button>
                    )}
                  </div>
                ))}

                {/* 댓글 입력 */}
                <div style={{ display:'flex', gap:8, marginTop:8 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'#252535',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:14, flexShrink:0 }}>
                    {currentUser?.avatar}
                  </div>
                  <input value={newComment} onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                    placeholder="댓글 달기..."
                    style={{ flex:1, background:'#252535', border:'none',
                      borderRadius:20, padding:'8px 14px', color:'#fff',
                      fontSize:13, outline:'none' }} />
                  <button onClick={handleAddComment} style={{
                    background:colors.accent, border:'none', borderRadius:'50%',
                    width:32, height:32, color:'#fff', fontWeight:700,
                    fontSize:16, cursor:'pointer', flexShrink:0 }}>↑</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}