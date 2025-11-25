// import { Handler } from '@netlify/functions';

const SENDFOX_API_KEY = process.env.SENDFOX_API_KEY;
const SENDFOX_API_URL = 'https://api.sendfox.com/messages';

console.log('SENDFOX_API_KEY loaded:', SENDFOX_API_KEY ? 'YES' : 'NO');
console.log('SENDFOX_API_URL:', SENDFOX_API_URL);

interface OrderData {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    unit: string;
  }>;
  total: number;
  status: string;
  createdAt: string;
  note?: string;
  newsletterSubscribe?: boolean;
  pickupLocation?: 'home' | 'market';
  isStatusUpdate?: boolean;
  oldStatus?: string;
  newStatus?: string;
}

export const handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const orderData: OrderData = JSON.parse(event.body || '{}');

    console.log('📧 Processing order emails for:', orderData.orderNumber);

    let customerEmailResult = null;
    let adminEmailResult = null;
    let audienceResult = null;

    if (orderData.isStatusUpdate) {
      // This is a status update - send status update email
      console.log('📧 Sending status update email for status change:', orderData.oldStatus, '→', orderData.newStatus);
      customerEmailResult = await sendCustomerStatusUpdateEmail(orderData, orderData.oldStatus || '', orderData.newStatus || '');
      console.log('📧 Status update email result:', customerEmailResult);
    } else {
      // This is a new order - send confirmation emails
      // Send customer confirmation email
      customerEmailResult = await sendCustomerConfirmationEmail(orderData);
      console.log('📧 Customer confirmation email result:', customerEmailResult);

      // Send admin notification email
      adminEmailResult = await sendAdminNotificationEmail(orderData);
      console.log('📧 Admin email result:', adminEmailResult);

      // Add to newsletter audience if subscribed
      if (orderData.newsletterSubscribe && orderData.customer.email) {
        audienceResult = await addContactToAudience(orderData.customer.email, orderData.customer.name);
        console.log('👥 Audience result:', audienceResult);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        customerEmail: customerEmailResult,
        adminEmail: adminEmailResult,
        audience: audienceResult,
      }),
    };
  } catch (error) {
    console.error('❌ Error in send-order-emails function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send emails',
        details: error.message,
      }),
    };
  }
};

async function sendCustomerConfirmationEmail(orderData: OrderData): Promise<boolean> {
  console.log('📧 Sending customer confirmation email for order:', orderData.orderNumber);
  try {

    console.log('📧 Making request to:', SENDFOX_API_URL);
    console.log('📧 Request data:', {
      to: orderData.customer.email,
      subject: `Potrditev naročila #${orderData.orderNumber}`
    });

    const response = await fetch(SENDFOX_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDFOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: orderData.customer.email,
        from: 'Biodinamična kmetija Černelič <info@biodinamicnakmetija-cernelic.si>',
        subject: `Potrditev naročila #${orderData.orderNumber}`,
        html: '<!DOCTYPE html><html><body><h1>Test Email</h1><p>Order received successfully</p></body></html>'
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error sending customer confirmation email - Status:', response.status);
      console.error('Error response:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('Customer confirmation email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Failed to send customer confirmation email:', error);
    return false;
  }
}

async function sendCustomerStatusUpdateEmail(orderData: OrderData, oldStatus: string, newStatus: string): Promise<boolean> {
  try {
    const statusMessages = {
      'in-preparation': {
        title: '👨‍🍳 Naročilo v pripravi',
        message: 'Vaše naročilo smo pregledali in sprejeli. Trenutno pripravljamo vaše izdelke. Kontaktirali vas bomo glede termina prevzema.',
        color: '#16a34a',
        bgColor: '#dcfce7'
      },
      'ready-for-pickup': {
        title: '📦 Naročilo pripravljeno - čaka na prevzem',
        message: orderData.pickupLocation === 'home'
          ? 'Vaše naročilo je pripravljeno in vas čaka na kmetiji! Pridelke lahko prevzamete: Torek & Petek (ob mraku - 22:00).'
          : 'Vaše naročilo je pripravljeno in vas čaka na tržnici Ljubljana! Pridelke lahko prevzamete: Sreda & Sobota (07:30 - 14:00) na Pogačarjevem trgu.',
        color: '#0891b2',
        bgColor: '#cffafe'
      },
      rejected: {
        title: '❌ Naročilo zavrnjeno',
        message: 'Žal trenutno ne moremo izpolniti vašega naročila. Kontaktirali vas bomo za dodatne informacije.',
        color: '#dc2626',
        bgColor: '#fef2f2'
      }
    };

    const statusInfo = statusMessages[newStatus as keyof typeof statusMessages] || {
      title: 'Posodobitev statusa naročila',
      message: `Status vašega naročila se je spremenil iz "${oldStatus}" v "${newStatus}".`,
      color: '#6b8e23',
      bgColor: '#f0fdf4'
    };

    const response = await fetch(SENDFOX_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDFOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: orderData.customer.email,
        from: 'Biodinamična kmetija Černelič <info@biodinamicnakmetija-cernelic.si>',
        subject: `Posodobitev naročila #${orderData.orderNumber}`,
        html: '<!DOCTYPE html><html><body><h1>Status Update</h1><p>Order status changed</p></body></html>'
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error sending customer status update email:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('Customer status update email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Failed to send customer status update email:', error);
    return false;
  }
}

async function sendAdminNotificationEmail(orderData: OrderData): Promise<boolean> {
  try {

    const response = await fetch(SENDFOX_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDFOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'biodinamicnakmetijacernelic@gmail.com',
        from: 'Biodinamična kmetija Černelič <info@biodinamicnakmetija-cernelic.si>',
        subject: `Novo povpraševanje #${orderData.orderNumber}`,
        html: '<!DOCTYPE html><html><body><h1>Admin Notification</h1><p>New order received</p></body></html>'
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error sending admin notification email:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('Admin notification email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    return false;
  }
}

// TODO: Implement Sendfox contact addition
// Sendfox API for adding contacts may be different
async function addContactToAudience(email: string, name?: string): Promise<boolean> {
  console.log('TODO: Implement Sendfox contact addition for:', email, name);
  // For now, skip adding to audience
  return true;
}
