import axiosClient from './axiosClient';

export const uploadDocument = (formData, onUploadProgress) =>
  axiosClient.post('/documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });

export const getDocuments = () =>
  axiosClient.get('/documents/');

export const getDocument = (id) =>
  axiosClient.get(`/documents/${id}/`);

export const deleteDocument = (id) =>
  axiosClient.delete(`/documents/${id}/`);

export const pollDocument = async (id, maxRetries = 30, intervalMs = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(r => setTimeout(r, intervalMs));
    const { data } = await axiosClient.get(`/documents/${id}/`);
    if (data.status === 'completed') return data;
    if (data.status === 'failed') throw new Error('Document processing failed');
  }
  throw new Error('Document processing timed out');
};