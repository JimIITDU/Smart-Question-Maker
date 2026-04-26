import aiClient from './aiClient';

export const uploadDocument = (formData, onUploadProgress) =>
  aiClient.post('/documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

export const generateQuestions = (data) =>
  aiClient.post('/questions/sessions/generate/', data);

export const getSession = (sessionId) =>
  aiClient.get(`/questions/sessions/${sessionId}/`);

export const getSessions = () =>
  aiClient.get('/questions/sessions/');

export const deleteSession = (sessionId) =>
  aiClient.delete(`/questions/sessions/${sessionId}/delete/`);

export const submitAllAnswers = (answersArray) =>
  aiClient.post('/evaluation/submit-all/', { answers: answersArray });

export const getResults = (sessionId) =>
  aiClient.get(`/evaluation/results/${sessionId}/`);

export const downloadQuestionsPDF = async (sessionId) => {
  const res = await aiClient.get(
    `/questions/sessions/${sessionId}/download_pdf/`,
    { responseType: 'blob' }
  );
  const url = window.URL.createObjectURL(
    new Blob([res.data], { type: 'application/pdf' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `questions_session_${sessionId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};