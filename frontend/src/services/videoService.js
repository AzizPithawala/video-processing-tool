import api from './api';

export const videoService = {
  upload: async (formData, onProgress) => {
    const { data } = await api.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percent);
      },
    });
    return data;
  },

  getVideos: async (params = {}) => {
    const { data } = await api.get('/videos', { params });
    return data;
  },

  getVideo: async (videoId) => {
    const { data } = await api.get(`/videos/${videoId}`);
    return data;
  },

  deleteVideo: async (videoId) => {
    const { data } = await api.delete(`/videos/${videoId}`);
    return data;
  },

  getStreamUrl: (videoId) => {
    const token = localStorage.getItem('accessToken');
    return `/api/v1/videos/stream/${videoId}?token=${token}`;
  },
};
