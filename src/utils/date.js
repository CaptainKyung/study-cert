export function formatDate(d) {
  const date = d ? new Date(d) : new Date();
  if (date.getHours() < 3) {
    date.setDate(date.getDate() - 1);
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatTime(ts) {
  const d = new Date(ts && ts.toMillis ? ts.toMillis() : ts);
  const h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${min}`;
}

export function formatRelative(ts) {
  const time = ts && ts.toMillis ? ts.toMillis() : ts;
  const diff = Date.now() - time;
  if (diff < 60000) return '방금 전';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
  return `${Math.floor(diff / 86400000)}일 전`;
}

export function getLast7Days() {
  const DAY_LABELS = ['일','월','화','수','목','금','토'];
  return Array.from({ length: 7 }, function(_, i) {
    const d = new Date();
    if (d.getHours() < 3) d.setDate(d.getDate() - 1);
    d.setDate(d.getDate() - (6 - i));
    return { key: formatDate(d), label: DAY_LABELS[d.getDay()], num: d.getDate() };
  });
}