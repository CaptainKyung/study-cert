import { useRef, useState } from 'react';

export default function CameraScreen({ user, date, onSubmit, onBack }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [captured, setCaptured] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 4096 },
          height: { ideal: 2160 },
        },
        audio: false
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      setStarted(true);
    } catch {
      alert('카메라 접근 권한이 필요합니다.');
    }
  }

  function stopStream() {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
  }

  function capture() {
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    setCaptured(c.toDataURL('image/jpeg', 1.0));
    stopStream();
  }

  function handleGallerySelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCaptured(ev.target.result);
      stopStream();
      setStarted(false);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      await onSubmit({ imageBase64: captured, caption, date });
    } catch { alert('업로드 실패. 다시 시도해주세요.'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#000', display:'flex',
      flexDirection:'column', fontFamily:'sans-serif' }}>

      <div style={{ display:'flex', alignItems:'center', padding:'16px 20px',
        position:'fixed', top:0, left:0, right:0, zIndex:10 }}>
        <button onClick={() => { stopStream(); onBack(); }} style={{
          background:'rgba(0,0,0,.6)', border:'none', color:'#fff',
          borderRadius:'50%', width:40, height:40, fontSize:20, cursor:'pointer' }}>←</button>
        <span style={{ color:'#fff', fontWeight:700, fontSize:16, marginLeft:12 }}>
          {date} 공부 인증
        </span>
      </div>

      {!captured ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', paddingTop:60, gap:16 }}>
          <video ref={videoRef} autoPlay playsInline
            style={{ width:'100%', maxHeight:'70vh', objectFit:'cover',
              display: started?'block':'none' }} />
          <canvas ref={canvasRef} style={{ display:'none' }} />
          <input ref={fileInputRef} type="file" accept="image/*"
            onChange={handleGallerySelect} style={{ display:'none' }} />

          {!started ? (
            <div style={{ display:'flex', flexDirection:'column', gap:12, alignItems:'center' }}>
              <button onClick={startCamera} style={{
                background:'linear-gradient(135deg,#7c6af7,#a78bfa)', border:'none',
                borderRadius:16, padding:'16px 32px', color:'#fff',
                fontSize:16, fontWeight:700, cursor:'pointer', width:220 }}>
                📸 카메라로 찍기
              </button>
              <button onClick={() => fileInputRef.current.click()} style={{
                background:'#1a1a24', border:'1.5px solid #2a2a3a',
                borderRadius:16, padding:'16px 32px', color:'#fff',
                fontSize:16, fontWeight:700, cursor:'pointer', width:220 }}>
                🖼️ 갤러리에서 선택
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
              <button onClick={capture} style={{
                width:76, height:76, borderRadius:'50%',
                background:'#fff', border:'4px solid rgba(255,255,255,.4)', cursor:'pointer' }} />
              <button onClick={() => fileInputRef.current.click()} style={{
                background:'rgba(0,0,0,.5)', border:'1.5px solid rgba(255,255,255,.3)',
                borderRadius:12, padding:'8px 20px', color:'#fff',
                fontSize:13, cursor:'pointer' }}>
                🖼️ 갤러리에서 선택
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
          <img src={captured} style={{ width:'100%', flex:1, objectFit:'cover' }} alt="" />
          <div style={{ background:'#0f0f14', padding:'20px 24px 40px' }}>
            <textarea value={caption} onChange={e => setCaption(e.target.value)}
              placeholder="오늘 공부한 내용을 간단히 적어봐요... (선택)"
              rows={2} maxLength={200}
              style={{ width:'100%', background:'#1a1a24', border:'1.5px solid #2a2a3a',
                borderRadius:12, padding:'12px 14px', color:'#fff', fontSize:14,
                resize:'none', outline:'none', boxSizing:'border-box', lineHeight:1.5 }} />
            <div style={{ display:'flex', gap:12, marginTop:14 }}>
              <button onClick={() => { setCaptured(null); setStarted(false); }} style={{
                flex:1, padding:13, background:'#1a1a24', border:'1.5px solid #2a2a3a',
                borderRadius:14, color:'#a0a0c0', fontSize:15, fontWeight:600, cursor:'pointer' }}>
                다시 선택
              </button>
              <button onClick={handleSubmit} disabled={loading} style={{
                flex:2, padding:13,
                background:'linear-gradient(135deg,#7c6af7,#a78bfa)',
                border:'none', borderRadius:14, color:'#fff',
                fontSize:15, fontWeight:700, cursor:'pointer' }}>
                {loading ? '올리는 중...' : '인증 완료! 🎉'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}