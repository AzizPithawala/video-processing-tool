import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVideos } from '../context/VideoContext';
import UploadForm from '../components/UploadForm';
import VideoCard from '../components/VideoCard';
import VideoPlayer from '../components/VideoPlayer';
import ProgressBar from '../components/ProgressBar';

const Dashboard = () => {
  const { user } = useAuth();
  const { videos, uploadProgress, processingProgress, loading, fetchVideos } = useVideos();
  const [showUpload, setShowUpload] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);

  const canUpload = user?.role === 'editor' || user?.role === 'admin';

  // Compute stats
  const stats = useMemo(() => {
    const total = videos.length;
    const ready = videos.filter((v) => v.status === 'READY').length;
    const processing = videos.filter((v) =>
      ['VALIDATING', 'PROCESSING', 'ANALYZED', 'UPLOADED'].includes(v.status)
    ).length;
    const flagged = videos.filter((v) => v.sensitivity === 'FLAGGED').length;
    return { total, ready, processing, flagged };
  }, [videos]);

  // Active processing jobs
  const activeJobs = Object.entries(processingProgress);

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Welcome back, {user?.name}. Here's your video processing overview.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">📁</div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Total Videos</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-value">{stats.ready}</div>
          <div className="stat-card-label">Ready to Stream</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">⚙️</div>
          <div className="stat-card-value">{stats.processing}</div>
          <div className="stat-card-label">Processing</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🚩</div>
          <div className="stat-card-value">{stats.flagged}</div>
          <div className="stat-card-label">Flagged Content</div>
        </div>
      </div>

      {/* Active Processing */}
      {activeJobs.length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>🔄 Active Processing</h3>
          {activeJobs.map(([videoId, data]) => {
            const video = videos.find((v) => v._id === videoId);
            return (
              <div key={videoId} style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px' }}>
                  {video?.title || videoId}
                </div>
                <ProgressBar
                  progress={data.progress}
                  stage={data.stage}
                  complete={data.progress >= 100}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Section */}
      {canUpload && (
        <div style={{ marginBottom: '32px' }}>
          {!showUpload ? (
            <button
              id="open-upload-btn"
              className="btn btn-primary btn-lg"
              onClick={() => setShowUpload(true)}
            >
              📤 Upload New Video
            </button>
          ) : (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Upload Video</h3>
              </div>
              <UploadForm onClose={() => { setShowUpload(false); fetchVideos(1); }} />
            </div>
          )}
        </div>
      )}

      {/* Recent Videos */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.1rem' }}>Recent Videos</h3>
        <button className="btn btn-secondary btn-sm" onClick={() => fetchVideos(1)}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="loading-spinner lg" />
          <p>Loading videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎬</div>
          <h3>No videos yet</h3>
          <p>{canUpload ? 'Upload your first video to get started!' : 'No videos have been assigned to you yet.'}</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              onPlay={(v) => setPlayingVideo(v)}
              onDelete={() => {}}
            />
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
        />
      )}
    </>
  );
};

export default Dashboard;
