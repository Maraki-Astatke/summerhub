
import axios from 'axios';

const CHAPA_API = 'https://api.chapa.co/v1';
const CHAPA_SECRET = process.env.CHAPA_SECRET_KEY;

const USE_MOCK_PAYMENT = true;

export async function initializePayment(email: string, amount: number, orderId: number, firstName: string, lastName: string) {
  
  if (USE_MOCK_PAYMENT) {
    console.log('🔧 MOCK PAYMENT MODE - Chapa bypassed');
    const tx_ref = `mock-${orderId}-${Date.now()}`;
    
    setTimeout(async () => {
      try {
        const { default: prisma } = await import('../lib/prisma.js');
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'paid', paymentId: tx_ref }
        });
        console.log(`✅ Mock: Order ${orderId} marked as paid`);
      } catch (err) {
        console.error('Mock payment update error:', err);
      }
    }, 1000);
    
    return {
      checkoutUrl: `http://localhost:3000/orders/${orderId}?payment=success&mock=true`,
      tx_ref: tx_ref
    };
  }

  try {
    const tx_ref = `hobbyhub-${orderId}-${Date.now()}`;
    
    console.log('📤 Sending to Chapa:', {
      amount: amount.toString(),
      email,
      orderId,
      tx_ref
    });
    
    const response = await axios.post(
      `${CHAPA_API}/transaction/initialize`,
      {
        amount: amount.toString(),
        currency: 'ETB',
        email: email,
        first_name: firstName,
        last_name: lastName,
        tx_ref: tx_ref,
        callback_url: `https://yourdomain.com/api/payment/verify/${tx_ref}`,
        return_url: `https://yourdomain.com/orders/${orderId}`,
        customization: {
          title: 'HobbyHub Payment',
          description: `Order #${orderId}`,
          logo: 'https://hobbyhub.com/logo.png'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Chapa response:', response.data);
    
    if (response.data.status === 'success') {
      return {
        checkoutUrl: response.data.data.checkout_url,
        tx_ref: tx_ref
      };
    }
    
    throw new Error(response.data.message || 'Payment initialization failed');
    
  } catch (error: any) {
    console.error('❌ Chapa Error Details:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      
      const chapaError = error.response.data;
      if (chapaError.message) {
        if (typeof chapaError.message === 'object') {
          const errorMessages = Object.entries(chapaError.message)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          throw new Error(errorMessages);
        } else {
          throw new Error(chapaError.message);
        }
      }
    }
    
    throw new Error(`Payment initialization failed: ${error.message}`);
  }
}

export async function verifyPayment(tx_ref: string) {
  if (USE_MOCK_PAYMENT && tx_ref.startsWith('mock-')) {
    console.log('🔧 Mock verification for:', tx_ref);
    return {
      data: {
        status: 'success',
        tx_ref: tx_ref
      }
    };
  }
  
  try {
    const response = await axios.get(
      `${CHAPA_API}/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Verify payment error:', error.response?.data || error.message);
    throw new Error('Payment verification failed');
  }
}
