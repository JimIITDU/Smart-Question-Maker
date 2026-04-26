import axiosClient from './axiosClient';

// ========== Documents ==========
export const uploadDocument = (data) =>
  axiosClient.post('/documents/', data);

// ========== Questions ==========
export const generateQuestions = (data) =>
  axiosClient.post('/questions/generate/', data);

export const getSession = (sessionId) =>
  axiosClient.get(`/questions/sessions/${sessionId}/`);

export const getSessions = () =>
  axiosClient.get('/questions/sessions/');

export const deleteSession = (sessionId) =>
  axiosClient.delete(`/questions/sessions/${sessionId}/delete/`);

// ========== PDF Download ==========
export const downloadQuestionsPDF = async (sessionId) => {
  const res = await axiosClient.get(
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

// ========== Submit All Answers ==========
// ✅ evaluation/submit-all/ এ array format পাঠাতে হবে
export const submitAllAnswers = (answersArray) =>
  axiosClient.post('/evaluation/submit-all/', { answers: answersArray });

// ========== Results ==========
export const getResults = (sessionId) =>
  axiosClient.get(`/evaluation/results/${sessionId}/`);