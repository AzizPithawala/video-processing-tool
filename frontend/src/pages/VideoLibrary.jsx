import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVideos } from '../context/VideoContext';
import VideoCard from '../components/VideoCard';
import VideoPlayer from '../components/VideoPlayer';

const VideoLibrary = () => {
  const { user } = useAuth();
  const {
    videos,
    pagination,
    loading,
    filters,
    setFilters,
    fetchVideos,
    deleteVideo,
    currentPage,
  } = useVideos();
  const [playingVideo, setPlayingVideo] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchVideos(1, newFilters);
  }, [filters, setFilters, fetchVideos]);

  const handlePageChange = useCallback((page) => {
    fetchVideos(page);
  }, [fetchVideos]);

  const handleDelete = async (videoId) => {
    try {
      await deleteVideo(videoId);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(pagination.totalPages, start + maxButtons - 1);
    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          ‹
        </button>

        {start > 1 && (
          <>
            <button className="pagination-btn" onClick={() => handlePageChange(1)}>1</button>
            {start > 2 && <span className="pagination-info">…</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}

        {end < pagination.totalPages && (
          <>
            {end < pagination.totalPages - 1 && <span className="pagination-info">…</span>}
            <button className="pagination-btn" onClick={() => handlePageChange(pagination.totalPages)}>
              {pagination.totalPages}
            </button>
          </>
        )}

        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= pagination.totalPages}
        >
          ›
        </button>

        <span className="pagination-info">
          Page {currentPage} of {pagination.totalPages} ({pagination.total} videos)
        </span>
      </div>
    );
  };

  return (
    <>
      <div className="page-header">
        <h2>Video Library</h2>
        <p>Browse, filter, and manage all your videos</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select
          id="filter-status"
          className="form-input"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="UPLOADED">Uploaded</option>
          <option value="VALIDATING">Validating</option>
          <option value="PROCESSING">Processing</option>
          <option value="ANALYZED">Analyzed</option>
          <option value="READY">Ready</option>
          <option value="FAILED">Failed</option>
        </select>

        <select
          id="filter-sensitivity"
          className="form-input"
          value={filters.sensitivity}
          onChange={(e) => handleFilterChange('sensitivity', e.target.value)}
        >
          <option value="">All Sensitivity</option>
          <option value="SAFE">Safe</option>
          <option value="FLAGGED">Flagged</option>
        </select>

        <button className="btn btn-secondary btn-sm" onClick={() => {
          setFilters({ status: '', sensitivity: '' });
          fetchVideos(1, { status: '', sensitivity: '' });
        }}>
          ✕ Clear Filters
        </button>

        <div style={{ flex: 1 }} />

        <button className="btn btn-secondary btn-sm" onClick={() => fetchVideos(currentPage)}>
          🔄 Refresh
        </button>
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="loading-page">
          <div className="loading-spinner lg" />
          <p>Loading videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎬</div>
          <h3>No videos found</h3>
          <p>
            {filters.status || filters.sensitivity
              ? 'Try adjusting your filters'
              : 'Upload your first video from the Dashboard'}
          </p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              onPlay={(v) => setPlayingVideo(v)}
              onDelete={(videoId) => setDeleteConfirm(videoId)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}

      {/* Video Player Modal */}
      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3>Delete Video</h3>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🗑️</div>
              <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
                Are you sure you want to delete this video? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                  Delete Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoLibrary;
