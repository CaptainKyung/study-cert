import { colors } from '../utils/theme';

export default function BottomTab({ screen, onChange }) {
  const tabs = [
    { id: 'feed', icon: '🏠', label: '홈' },
    { id: 'group', icon: '👥', label: '그룹' },
    { id: 'profile', icon: '👤', label: '프로필' },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: colors.card, borderTop: `1.5px solid ${colors.border}`,
      display: 'flex', zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {tabs.map(tab => {
        const active = screen === tab.id;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            flex: 1, padding: '12px 0', background: 'none', border: 'none',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 4,
          }}>
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <span style={{
              fontSize: 11, fontWeight: active ? 700 : 400,
              color: active ? colors.accent : colors.textMuted,
            }}>{tab.label}</span>
            {active && (
              <div style={{
                position: 'absolute', bottom: 0,
                width: 40, height: 2,
                background: colors.accent, borderRadius: 2,
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}