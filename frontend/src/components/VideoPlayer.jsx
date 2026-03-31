import { useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const VideoPlayer = ({ video, onClose }) => {
  const { token } = useAuth();
  const videoRef = useRef(null);

  const streamUrl = `/api/v1/videos/stream/${video._id}`;

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '960px' }}>
        <div className="modal-header">
          <h3>{video.title}</h3>
          <button className="modal-close" onClick={onClose} id="video-player-close">✕</button>
        </div>

        <div className="video-player-wrapper" style={{ borderRadius: 0 }}>
          <video
            id="video-player-element"
            ref={videoRef}
            controls
            autoPlay
            style={{ width: '100%', display: 'block' }}
          >
            <source
              src={streamUrl}
              type="video/mp4"
            />
            Your browser doesn't support video playback.
          </video>
        </div>

        <div className="video-player-info" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            {video.sensitivity && (
              <span className={`badge badge-${video.sensitivity?.toLowerCase()}`}>
                {video.sensitivity === 'SAFE' ? '🛡️ Safe' : '🚩 Flagged'}
              </span>
            )}
            <span className="badge badge-ready">✅ Ready</span>
          </div>

          {video.description && (
            <p className="video-player-description">{video.description}</p>
          )}

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Uploaded on {formatDate(video.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
