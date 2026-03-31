import { useState, useRef } from 'react';
import { useVideos } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';

const UploadForm = ({ onClose }) => {
  const { uploadVideo } = useVideos();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
  const MAX_SIZE = 200 * 1024 * 1024; // 200MB

  const validateFile = (f) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('Invalid file type. Allowed: MP4, MOV, AVI');
      return false;
    }
    if (f.size > MAX_SIZE) {
      setError('File size exceeds 200MB limit');
      return false;
    }
    return true;
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected && validateFile(selected)) {
      setFile(selected);
      setError(null);
      if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && validateFile(dropped)) {
      setFile(dropped);
      setError(null);
      if (!title) setTitle(dropped.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a video file');
    if (!title.trim()) return setError('Title is required');

    setUploading(true);
    setError(null);
    setUploadPercent(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      if (description.trim()) formData.append('description', description.trim());

      await uploadVideo(formData);
      setSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
    return (bytes / 1e3).toFixed(1) + ' KB';
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
        <h3 style={{ marginBottom: '8px' }}>Upload Successful!</h3>
        <p style={{ color: 'var(--text-muted)' }}>Your video is now being processed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {!file ? (
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="upload-zone-icon">🎬</div>
          <h3>Drop your video here or click to browse</h3>
          <p>Select a video file to upload and process</p>
          <div className="upload-zone-formats">
            Supported: MP4, MOV, AVI — Max 200MB
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,.mov,.avi,video/mp4,video/quicktime,video/x-msvideo"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="video-file-input"
          />
        </div>
      ) : (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '2rem' }}>🎥</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {file.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {formatFileSize(file.size)}
              </div>
            </div>
            {!uploading && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setFile(null); setError(null); }}
              >
                Change
              </button>
            )}
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="video-title" className="form-label">Title *</label>
        <input
          id="video-title"
          type="text"
          className="form-input"
          placeholder="Enter video title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={uploading}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="video-description" className="form-label">Description (optional)</label>
        <textarea
          id="video-description"
          className="form-input"
          placeholder="Describe your video..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={uploading}
          rows={3}
        />
      </div>

      {uploading && (
        <div className="progress-bar-container">
          <div className="progress-bar-label">
            <span className="progress-bar-label-text">Uploading...</span>
            <span className="progress-bar-label-value">{uploadPercent}%</span>
          </div>
          <div className="progress-bar-track">
            <div
              className={`progress-bar-fill ${uploadPercent === 100 ? 'complete' : ''}`}
              style={{ width: `${uploadPercent}%` }}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
        {onClose && !uploading && (
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        )}
        <button
          id="upload-submit-btn"
          type="submit"
          className="btn btn-primary"
          disabled={!file || !title.trim() || uploading}
        >
          {uploading ? (
            <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Uploading...</>
          ) : (
            <>📤 Upload Video</>
          )}
        </button>
      </div>
    </form>
  );
};

export default UploadForm;
