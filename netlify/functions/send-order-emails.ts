import { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
  pickupLocation?: 'home' | 'market';
  isStatusUpdate?: boolean;
  oldStatus?: string;
  newStatus?: string;
}

export const handler: Handler = async (event) => {
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

    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        customerEmail: customerEmailResult,
        adminEmail: adminEmailResult,
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
    const { data, error } = await resend.emails.send({
      from: 'Biodinamična kmetija Černelič <info@biodinamicnakmetija-cernelic.si>',
      to: [orderData.customer.email],
      subject: `Potrditev naročila #${orderData.orderNumber}`,
      html: generateOrderConfirmationHTML(orderData),
    });

    if (error) {
      console.error('Error sending customer confirmation email:', error);
      return false;
    }

    console.log('Customer confirmation email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Failed to send customer confirmation email:', error);
    return false;
  }
}

async function sendCustomerStatusUpdateEmail(orderData: OrderData, oldStatus: string, newStatus: string): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Biodinamična kmetija Černelič <info@biodinamicnakmetija-cernelic.si>',
      to: [orderData.customer.email],
      subject: `Posodobitev naročila #${orderData.orderNumber}`,
      html: generateOrderStatusUpdateHTML(orderData, oldStatus, newStatus),
    });

    if (error) {
      console.error('Error sending customer status update email:', error);
      return false;
    }

    console.log('Customer status update email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Failed to send customer status update email:', error);
    return false;
  }
}

async function sendAdminNotificationEmail(orderData: OrderData): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Biodinamična kmetija Černelič <info@biodinamicnakmetija-cernelic.si>',
      to: ['biodinamicnakmetijacernelic@gmail.com'],
      subject: `Novo povpraševanje #${orderData.orderNumber}`,
      html: generateAdminNotificationHTML(orderData),
    });

    if (error) {
      console.error('Error sending admin notification email:', error);
      return false;
    }

    console.log('Admin notification email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    return false;
  }
}

