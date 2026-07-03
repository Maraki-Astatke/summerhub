import axios from 'axios';
import dns from 'dns';
import http from 'http';
import https from 'https';


dns.setDefaultResultOrder('ipv4first');

const CERTIFIER_API_URL = 'https://api.certifier.io/v1';

// ✅ FIX: Create instance dynamically so env vars are loaded AFTER dotenv.config()
function getCertifierApi() {
    const CERTIFIER_API_KEY = process.env.CERTIFIER_API_KEY;
    if (!CERTIFIER_API_KEY) {
        throw new Error('CERTIFIER_API_KEY is not set in environment variables');
    }
    return axios.create({
        baseURL: CERTIFIER_API_URL,
        headers: {
            'Authorization': `Bearer ${CERTIFIER_API_KEY}`,
            'Content-Type': 'application/json',
            'Certifier-Version': '2022-10-26'
        },
        timeout: 10000,
        httpAgent: new http.Agent({ family: 4 }),
        httpsAgent: new https.Agent({ family: 4 })
    });
}

// ============================================
// GENERATE CERTIFICATE - MAIN FUNCTION
// ============================================
export async function generateCertificate({
    studentName,
    studentEmail,
    hobbyName,
    teacherName,
    credentialGroupId
}: {
    studentName: string;
    studentEmail: string;
    hobbyName: string;
    teacherName: string;
    credentialGroupId: string;
}) {
    try {
        console.log('📤 Creating certificate for:', studentName);
        console.log('📤 Data:', { studentName, studentEmail, hobbyName, teacherName, credentialGroupId });

        // ✅ FIXED: Using metadata instead of customAttributes
        const requestData = {
            groupId: credentialGroupId,
            recipient: {
                name: studentName,
                email: studentEmail
            },
            issuedOn: new Date().toISOString().split('T')[0],
            status: 'issued',
            metadata: {
                hobby: hobbyName,
                teacher: teacherName
            }
        };

        console.log('📤 Request Data:', JSON.stringify(requestData, null, 2));

        const response = await getCertifierApi().post('/credentials', requestData);

        console.log('✅ Certificate created:', response.data.id);
        console.log('✅ Full response:', JSON.stringify(response.data, null, 2));

        // Try sending email (optional)
        try {
            await getCertifierApi().post(`/credentials/${response.data.id}/send`);
            console.log('✅ Email sent to student');
        } catch (emailError: any) {
            console.log('⚠️ Email sending failed, but certificate was created');
            console.log('Email error:', emailError.response?.data);
        }

        return {
            success: true,
            credentialId: response.data.id,
            message: `Certificate generated for ${studentName} (${studentEmail})`
        };

    } catch (error: any) {
        console.error('❌ Certifier API Error:');
        console.error('Status:', error.response?.status);
        console.error('Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Message:', error.message);
        throw error;
    }
}

// ============================================
// CREATE CERTIFIER CREDENTIAL (DRAFT)
// ============================================
export async function createCertifierCredential(credentialData: {
    groupId: string;
    recipient: {
        name: string;
        email: string;
    };
    issuedOn: string;
    status: 'draft' | 'issued';
    metadata?: {
        hobby?: string;
        teacher?: string;
        [key: string]: any;
    };
}) {
    try {
        const response = await getCertifierApi().post('/credentials', credentialData);
        return response.data;
    } catch (error: any) {
        console.error('❌ Create credential error:', error.response?.data || error.message);
        throw error;
    }
}

// ============================================
// ISSUE CREDENTIAL
// ============================================
export async function issueCertifierCredential(credentialId: string) {
    try {
        const response = await getCertifierApi().put(`/credentials/${credentialId}`, {
            status: 'issued'
        });
        return response.data;
    } catch (error: any) {
        console.error('❌ Issue credential error:', error.response?.data || error.message);
        throw error;
    }
}

// ============================================
// SEND CREDENTIAL VIA EMAIL
// ============================================
export async function sendCredentialByEmail(credentialId: string) {
    try {
        const response = await getCertifierApi().post(`/credentials/${credentialId}/send`);
        return response.data;
    } catch (error: any) {
        console.error('❌ Send email error:', error.response?.data || error.message);
        throw error;
    }
}

// ============================================
// GET ALL CREDENTIALS (Optional - for testing)
// ============================================
export async function getAllCredentials() {
    try {
        const response = await getCertifierApi().get('/credentials');
        return response.data;
    } catch (error: any) {
        console.error('❌ Get credentials error:', error.response?.data || error.message);
        throw error;
    }
}

// ============================================
// GET CREDENTIAL BY ID (Optional - for testing)
// ============================================
export async function getCredentialById(credentialId: string) {
    try {
        const response = await getCertifierApi().get(`/credentials/${credentialId}`);
        return response.data;
    } catch (error: any) {
        console.error('❌ Get credential error:', error.response?.data || error.message);
        throw error;
    }
}

// ============================================
// ALTERNATIVE: GENERATE CERTIFICATE WITHOUT METADATA
// (Use this if metadata causes validation errors)
// ============================================
export async function generateCertificateSimple({
    studentName,
    studentEmail,
    credentialGroupId
}: {
    studentName: string;
    studentEmail: string;
    credentialGroupId: string;
}) {
    try {
        console.log('📤 Creating certificate for:', studentName);

        const requestData = {
            groupId: credentialGroupId,
            recipient: {
                name: studentName,
                email: studentEmail
            },
            issuedOn: new Date().toISOString().split('T')[0],
            status: 'issued'
        };

        console.log('📤 Request Data:', JSON.stringify(requestData, null, 2));

        const response = await getCertifierApi().post('/credentials', requestData);

        console.log('✅ Certificate created:', response.data.id);

        return {
            success: true,
            credentialId: response.data.id,
            message: `Certificate generated for ${studentName} (${studentEmail})`
        };

    } catch (error: any) {
        console.error('❌ Certifier API Error:');
        console.error('Status:', error.response?.status);
        console.error('Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Message:', error.message);
        throw error;
    }
}