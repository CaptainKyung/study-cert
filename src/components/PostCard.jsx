import { formatRelative, formatTime } from '../utils/date';
import { colors } from '../utils/theme';

export default function PostCard({ post, currentUserId, onLike }) {
  const liked = post.likes?.includes(currentUserId);
  const isOwn = post.userId === currentUserId;
  const ts = post.createdAt?.toMillis?.() ?? post.createdAt ?? Date.now();

  return (
    <div style={{ background:colors.card, borderRadius:20, overflow:'hidden',
      border:`1.5px solid ${colors.border}`, marginBottom:16 }}>

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
          <div style={{ background:'#2a2040', borderRadius:8, padding:'3px 10px' }}>
            <span style={{ color:'#7c6af7', fontSize:11, fontWeight:700 }}>나의 인증</span>
          </div>
        )}
      </div>

      <img src={post.imageUrl ?? post.image} alt=""
        style={{ width:'100%', maxHeight:360, objectFit:'cover', display:'block' }} />

      <div style={{ padding:'12px 16px 14px' }}>
        {post.caption && (
          <p style={{ color:'#ccc', fontSize:14, margin:'0 0 10px', lineHeight:1.5 }}>
            {post.caption}
          </p>
        )}
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
          <span style={{ color:'#555', fontSize:12 }}>{liked ? '응원했어요!' : '응원하기'}</span>
        </div>
      </div>
    </div>
  );
}