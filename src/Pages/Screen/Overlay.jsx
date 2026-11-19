import useAvatarStore from '../../store/avatarStore';

export default function Overlay() {
  const started = useAvatarStore((state) => state.started);
  const setStarted = useAvatarStore((state) => state.setStarted);
  const setAnimation = useAvatarStore((state) => state.setAnimation);

  if (started) return null;

  const handleStart = () => {
    setAnimation('Sitting');
    setStarted(true);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      zIndex: 10,
    }}>
      <button
        onClick={handleStart}
        style={{
          padding: '16px 48px',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          borderRadius: '8px',
          border: 'none',
          background: '#fff',
          cursor: 'pointer',
          letterSpacing: '0.05em',
        }}
      >
        Start
      </button>
    </div>
  );
}
