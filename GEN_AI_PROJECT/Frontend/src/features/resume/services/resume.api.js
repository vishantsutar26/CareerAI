import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
});

export const generateResume = async ({ selfDescription, targetRole, jobDescription, fullName, phone, location, links, resumeFile }) => {
    const formData = new FormData();
    formData.append('selfDescription', selfDescription);
    formData.append('targetRole', targetRole || '');
    formData.append('jobDescription', jobDescription || '');
    formData.append('fullName', fullName || '');
    formData.append('phone', phone || '');
    formData.append('location', location || '');
    formData.append('links', links || '');
    if (resumeFile) formData.append('resume', resumeFile);

    const response = await api.post('/api/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const getAllResumes = async () => (await api.get('/api/resume')).data;
export const getResumeById = async (id) => (await api.get(`/api/resume/${id}`)).data;
export const deleteResume = async (id) => (await api.delete(`/api/resume/${id}`)).data;

export const getAllInterviewReports = async () => (await api.get('/api/interview')).data;
export const deleteInterviewReport = async (id) => (await api.delete(`/api/interview/report/${id}`)).data;
