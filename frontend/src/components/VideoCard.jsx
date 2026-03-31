import { useVideos } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import ProgressBar from './ProgressBar';

const VideoCard = ({ video, onPlay, onDelete }) => {
  const { processingProgress } = useVideos();
  const { user } = useAuth();

  const progress = processingProgress[video._id];
  const isProcessing = video.status !== 'READY' && video.status !== 'FAILED' && video.status !== 'UPLOADED';
  const isReady = video.status === 'READY';

  const statusLabels = {
    UPLOADED: '📤 Uploaded',
    VALIDATING: '🔍 Validating',
    PROCESSING: '⚙️ Processing',
    ANALYZED: '🧠 Analyzed',
    READY: '✅ Ready',
    FAILED: '❌ Failed',
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const canDelete = user?.role === 'admin' ||
    (user?.role === 'editor' && video.userId === user?.id);

  return (
    <div className="video-card" id={`video-card-${video._id}`}>
      <div
        className="video-card-thumbnail"
        onClick={() => isReady && onPlay && onPlay(video)}
      >
        <span className="video-card-thumbnail-icon">🎬</span>
        {isReady && (
          <div className="video-card-play-overlay">
            <div className="video-card-play-btn">▶</div>
          </div>
        )}
      </div>

      <div className="video-card-body">
        <div className="video-card-title" title={video.title}>{video.title}</div>

        <div className="video-card-meta">
          <span className={`badge badge-${video.status?.toLowerCase()}`}>
            {statusLabels[video.status] || video.status}
          </span>

          {video.sensitivity && (
            <span className={`badge badge-${video.sensitivity?.toLowerCase()}`}>
              {video.sensitivity === 'SAFE' ? '🛡️' : '🚩'} {video.sensitivity}
            </span>
          )}

          <span className="video-card-date">{formatDate(video.createdAt)}</span>
        </div>

        {(isProcessing && progress) && (
          <ProgressBar
            progress={progress.progress}
            stage={progress.stage}
            complete={progress.progress >= 100}
          />
        )}
      </div>

      <div className="video-card-actions">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => isReady && onPlay && onPlay(video)}
          disabled={!isReady}
        >
          {isReady ? '▶ Play' : statusLabels[video.status]?.split(' ')[0] || '⏳'}
        </button>

        {canDelete && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete && onDelete(video._id)}
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
