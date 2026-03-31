import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { videoService } from '../services/videoService';
import { onProcessingProgress, onStatusUpdate, onSensitivityResult, removeAllListeners } from '../sockets/socket';
import { useAuth } from './AuthContext';

const VideoContext = createContext(null);

export const useVideos = () => {
  const context = useContext(VideoContext);
  if (!context) throw new Error('useVideos must be used within VideoProvider');
  return context;
};

export const VideoProvider = ({ children }) => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [processingProgress, setProcessingProgress] = useState({});
  const [filters, setFilters] = useState({ status: '', sensitivity: '' });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch videos
  const fetchVideos = useCallback(async (page = 1, customFilters = null) => {
    if (!user) return;
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      const activeFilters = customFilters || filters;
      if (activeFilters.status) params.status = activeFilters.status;
      if (activeFilters.sensitivity) params.sensitivity = activeFilters.sensitivity;

      const result = await videoService.getVideos(params);
      if (result.success) {
        setVideos(result.data.videos || []);
        setPagination(result.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Failed to fetch videos:', err);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  // Upload video
  const uploadVideo = useCallback(async (formData) => {
    const tempId = Date.now().toString();
    setUploadProgress((prev) => ({ ...prev, [tempId]: 0 }));

    try {
      const result = await videoService.upload(formData, (percent) => {
        setUploadProgress((prev) => ({ ...prev, [tempId]: percent }));
      });

      if (result.success) {
        setUploadProgress((prev) => {
          const updated = { ...prev };
          delete updated[tempId];
          // Track by actual videoId
          updated[result.data.videoId] = 100;
          return updated;
        });
        // Refresh video list
        await fetchVideos(1);
        return result;
      }
    } catch (err) {
      setUploadProgress((prev) => {
        const updated = { ...prev };
        delete updated[tempId];
        return updated;
      });
      throw err;
    }
  }, [fetchVideos]);

  // Delete video
  const deleteVideo = useCallback(async (videoId) => {
    try {
      const result = await videoService.deleteVideo(videoId);
      if (result.success) {
        await fetchVideos(currentPage);
        return result;
      }
    } catch (err) {
      throw err;
    }
  }, [fetchVideos, currentPage]);

  // Socket event listeners
  useEffect(() => {
    if (!user) return;

    onProcessingProgress((data) => {
      setProcessingProgress((prev) => ({
        ...prev,
        [data.videoId]: { progress: data.progress, stage: data.stage },
      }));

      // Update video status in local state
      setVideos((prev) =>
        prev.map((v) =>
          v._id === data.videoId ? { ...v, status: data.stage !== 'COMPLETE' ? data.stage : v.status } : v
        )
      );
    });

    onStatusUpdate((data) => {
      setVideos((prev) =>
        prev.map((v) =>
          v._id === data.videoId ? { ...v, status: data.status } : v
        )
      );

      // Clear processing progress on completion
      if (data.status === 'READY' || data.status === 'FAILED') {
        setProcessingProgress((prev) => {
          const updated = { ...prev };
          delete updated[data.videoId];
          return updated;
        });
        setUploadProgress((prev) => {
          const updated = { ...prev };
          delete updated[data.videoId];
          return updated;
        });
      }
    });

    onSensitivityResult((data) => {
      setVideos((prev) =>
        prev.map((v) =>
          v._id === data.videoId ? { ...v, sensitivity: data.result } : v
        )
      );
    });

    return () => {
      removeAllListeners();
    };
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchVideos(1);
    }
  }, [user]);

  return (
    <VideoContext.Provider
      value={{
        videos,
        pagination,
        loading,
        uploadProgress,
        processingProgress,
        filters,
        currentPage,
        setFilters,
        fetchVideos,
        uploadVideo,
        deleteVideo,
        setCurrentPage,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};
