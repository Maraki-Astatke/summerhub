import axios from 'axios';

const CHAPA_API = 'https://api.chapa.co/v1';
const CHAPA_SECRET = process.env.CHAPA_SECRET_KEY;

export async function initializePayment(email: string, amount: number, orderId: number, firstName: string, lastName: string) {
  const tx_ref = `hobbyhub-${orderId}-${Date.now()}`;
  
  const response = await axios.post(
    `${CHAPA_API}/transaction/initialize`,
    {
      amount: amount.toString(),
      currency: 'ETB',
      email: email,
      first_name: firstName,
      last_name: lastName,
      tx_ref: tx_ref,
      callback_url: `http://localhost:5001/api/payment/verify/${tx_ref}`,
      return_url: `http://localhost:3000/orders/${orderId}`,
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
  
  return {
    checkoutUrl: response.data.data.checkout_url,
    tx_ref: tx_ref
  };
}

export async function verifyPayment(tx_ref: string) {
  const response = await axios.get(
    `${CHAPA_API}/transaction/verify/${tx_ref}`,
    {
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET}`
      }
    }
  );
  
  return response.data;
}