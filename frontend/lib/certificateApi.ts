import api from './api';

export interface IssueCertificateData {
    studentName: string;
    studentEmail: string;
    hobbyName: string;
    teacherName?: string;
}

export async function issueCertificate(data: IssueCertificateData) {
    const response = await api.post('/certificates/issue', data);
    return response.data;
}