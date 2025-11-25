// import { Handler } from '@netlify/functions';

const SENDFOX_API_KEY = process.env.SENDFOX_API_KEY;
const SENDFOX_API_URL = 'https://api.sendfox.com/messages';

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

export const handler = async (event: any) => {
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
  try {
    const itemsHTML = orderData.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.name}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${item.quantity} × ${item.price.toFixed(2)} € / ${item.unit}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">
          ${(item.quantity * item.price).toFixed(2)} €
        </td>
      </tr>
    `).join('');

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
        html: '<!DOCTYPE html>' +
        '<html>' +
        '<body>' +
        '<div style="background: white; border: 1px solid #e5e7eb; border-radius: 0 0 16px 16px; padding: 40px 30px;">' +
          '<div style="text-align: center; margin-bottom: 30px;">' +
            '<div style="display: inline-block; background: #dcfce7; color: #166534; padding: 12px 24px; border-radius: 50px; font-weight: bold;">' +
              '✓ Naročilo #' + orderData.orderNumber + ' je bilo uspešno oddano' +
            '</div>' +
          '</div>' +
          '<div style="margin-bottom: 30px;">' +
            '<h2 style="color: #374151; margin: 0 0 20px 0; font-size: 20px;">Podatki o naročilu</h2>' +
            '<div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">' +
              '<p style="margin: 5px 0;"><strong>Ime:</strong> ' + orderData.customer.name + '</p>' +
              '<p style="margin: 5px 0;"><strong>Telefon:</strong> ' + orderData.customer.phone + '</p>' +
              '<p style="margin: 5px 0;"><strong>E-mail:</strong> ' + orderData.customer.email + '</p>' +
              '<p style="margin: 5px 0;"><strong>Datum naročila:</strong> ' + new Date(orderData.createdAt).toLocaleDateString('sl-SI') + '</p>' +
            '</div>' +
          '</div>' +
          '<div style="margin-bottom: 30px;">' +
            '<h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Naročeni izdelki</h3>' +
            '<table style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px; overflow: hidden;">' +
              '<thead>' +
                '<tr style="background: #f3f4f6;">' +
                  '<th style="padding: 15px; text-align: left; font-weight: bold; color: #374151;">izdelek</th>' +
                  '<th style="padding: 15px; text-align: center; font-weight: bold; color: #374151;">količina</th>' +
                  '<th style="padding: 15px; text-align: right; font-weight: bold; color: #374151;">cena</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' +
                itemsHTML +
                '<tr style="background: #f3f4f6; font-weight: bold;">' +
                  '<td colspan="2" style="padding: 15px; text-align: right;">SKUPAJ:</td>' +
                  '<td style="padding: 15px; text-align: right; font-size: 18px; color: #dc2626;">' + orderData.total.toFixed(2) + ' €</td>' +
                '</tr>' +
              '</tbody>' +
            '</table>' +
          '</div>' +
          (orderData.note ? (
            '<div style="margin-bottom: 30px;">' +
              '<h3 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">Dodatne opombe</h3>' +
              '<div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #6b8e23;">' +
                orderData.note.replace(/\n/g, '<br>') +
              '</div>' +
            '</div>'
          ) : '') +
          '<div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 30px;">' +
            '<h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">⚠️ Pomembne informacije</h3>' +
            '<ul style="color: #92400e; margin: 0; padding-left: 20px;">' +
              '<li>Plačilo se izvede ob prevzemu izdelkov</li>' +
              '<li>Cene vključujejo DDV</li>' +
              '<li>Kontaktirali vas bomo glede termina prevzema</li>' +
              '<li>Prevzem je možen na kmetiji ali na tržnici</li>' +
            '</ul>' +
          '</div>' +
          '<div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">' +
            '<p style="color: #6b7280; margin: 0;">' +
              'Za vprašanja nas kontaktirajte na <a href="mailto:biodinamicnakmetijacernelic@gmail.com" style="color: #6b8e23;">biodinamicnakmetijacernelic@gmail.com</a>' +
            '</p>' +
          '</div>' +
        '</div>' +
        '</body>' +
        '</html>'
      });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error sending customer confirmation email:', errorData);
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
        html: '<!DOCTYPE html>' +
        '<html>' +
        '<body style="font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">' +
          '<div style="background: linear-gradient(135deg, #6b8e23 0%, #8fbc8f 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">' +
            '<h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Biodinamična kmetija Černelič</h1>' +
            '<p style="color: #f0f9f0; margin: 10px 0 0 0; font-size: 16px;">Posodobitev naročila</p>' +
          '</div>' +
          '<div style="background: white; border: 1px solid #e5e7eb; border-radius: 0 0 16px 16px; padding: 40px 30px;">' +
            '<div style="text-align: center; margin-bottom: 30px;">' +
              '<div style="display: inline-block; background: ' + statusInfo.bgColor + '; color: ' + statusInfo.color + '; padding: 12px 24px; border-radius: 50px; font-weight: bold; font-size: 16px;">' +
                statusInfo.title +
              '</div>' +
            '</div>' +
            '<div style="margin-bottom: 30px;">' +
              '<h2 style="color: #374151; margin: 0 0 20px 0; font-size: 20px;">Naročilo #' + orderData.orderNumber + '</h2>' +
              '<div style="background: #f9fafb; padding: 20px; border-radius: 8px;">' +
                '<p style="margin: 5px 0;"><strong>Ime:</strong> ' + orderData.customer.name + '</p>' +
                '<p style="margin: 5px 0;"><strong>Telefon:</strong> ' + orderData.customer.phone + '</p>' +
                '<p style="margin: 5px 0;"><strong>E-mail:</strong> ' + orderData.customer.email + '</p>' +
                '<p style="margin: 5px 0;"><strong>Datum naročila:</strong> ' + new Date(orderData.createdAt).toLocaleDateString('sl-SI') + '</p>' +
              '</div>' +
            '</div>' +
            '<div style="background: ' + statusInfo.bgColor + '; border: 1px solid ' + statusInfo.color + '20; border-radius: 8px; padding: 20px; margin-bottom: 30px;">' +
              '<p style="color: ' + statusInfo.color + '; margin: 0; font-weight: 500;">' +
                statusInfo.message +
              '</p>' +
            '</div>' +
            '<div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">' +
              '<p style="color: #6b7280; margin: 0;">' +
                'Za vprašanja nas kontaktirajte na <a href="mailto:biodinamicnakmetijacernelic@gmail.com" style="color: #6b8e23;">biodinamicnakmetijacernelic@gmail.com</a>' +
              '</p>' +
            '</div>' +
          '</div>' +
        '</body>' +
        '</html>'
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
    const itemsHTML = orderData.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.name}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${item.quantity} × ${item.price.toFixed(2)} € / ${item.unit}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">
          ${(item.quantity * item.price).toFixed(2)} €
        </td>
      </tr>
    `).join('');

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
        html: '<!DOCTYPE html>' +
        '<html>' +
        '<body style="font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">' +
          '<div style="background: linear-gradient(135deg, #6b8e23 0%, #8fbc8f 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">' +
            '<h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Novo povpraševanje!</h1>' +
            '<p style="color: #f0f9f0; margin: 10px 0 0 0; font-size: 16px;">Prejeli ste novo povpraševanje</p>' +
          '</div>' +
          '<div style="background: white; border: 1px solid #e5e7eb; border-radius: 0 0 16px 16px; padding: 40px 30px;">' +
            '<div style="text-align: center; margin-bottom: 30px;">' +
              '<div style="display: inline-block; background: #fef3c7; color: #92400e; padding: 12px 24px; border-radius: 50px; font-weight: bold;">' +
                '⚠️ Potrebna akcija: Kontaktirajte stranko' +
              '</div>' +
            '</div>' +
            '<div style="margin-bottom: 30px;">' +
              '<h2 style="color: #374151; margin: 0 0 20px 0; font-size: 20px;">Podatki o povpraševanju #' + orderData.orderNumber + '</h2>' +
              '<div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">' +
                '<p style="margin: 5px 0;"><strong>Ime:</strong> ' + orderData.customer.name + '</p>' +
                '<p style="margin: 5px 0;"><strong>Telefon:</strong> ' + orderData.customer.phone + '</p>' +
                '<p style="margin: 5px 0;"><strong>E-mail:</strong> ' + orderData.customer.email + '</p>' +
                '<p style="margin: 5px 0;"><strong>Datum:</strong> ' + new Date(orderData.createdAt).toLocaleDateString('sl-SI') + '</p>' +
                '<p style="margin: 5px 0;"><strong>Status:</strong> ' + orderData.status + '</p>' +
              '</div>' +
            '</div>' +
            '<div style="margin-bottom: 30px;">' +
              '<h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Zahtevani izdelki</h3>' +
              '<table style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px; overflow: hidden;">' +
                '<thead>' +
                  '<tr style="background: #f3f4f6;">' +
                    '<th style="padding: 15px; text-align: left; font-weight: bold; color: #374151;">izdelek</th>' +
                    '<th style="padding: 15px; text-align: center; font-weight: bold; color: #374151;">količina</th>' +
                    '<th style="padding: 15px; text-align: right; font-weight: bold; color: #374151;">cena</th>' +
                  '</tr>' +
                '</thead>' +
                '<tbody>' +
                  itemsHTML +
                  '<tr style="background: #f3f4f6; font-weight: bold;">' +
                    '<td colspan="2" style="padding: 15px; text-align: right;">SKUPAJ:</td>' +
                    '<td style="padding: 15px; text-align: right; font-size: 18px; color: #dc2626;">' + orderData.total.toFixed(2) + ' €</td>' +
                  '</tr>' +
                '</tbody>' +
              '</table>' +
            '</div>' +
            (orderData.note ? (
              '<div style="margin-bottom: 30px;">' +
                '<h3 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">Dodatne opombe</h3>' +
                '<div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #6b8e23;">' +
                  orderData.note.replace(/\n/g, '<br>') +
                '</div>' +
              '</div>'
            ) : '') +
            '<div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">' +
              '<h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">📞 Naslednji koraki:</h3>' +
              '<ul style="color: #1e40af; margin: 0; padding-left: 20px;">' +
                '<li>Pokličite stranko na ' + orderData.customer.phone + '</li>' +
                '<li>Potrjujete dostopnost izdelkov</li>' +
                '<li>Dogovorite termin prevzema</li>' +
                '<li>Posodobite status v admin panelu</li>' +
              '</ul>' +
            '</div>' +
            '<div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">' +
              '<p style="color: #6b7280; margin: 0;">' +
                '<a href="https://biocernelic.netlify.app/admin" style="color: #6b8e23; text-decoration: none;">📊 Odprite admin panel</a>' +
              '</p>' +
            '</div>' +
          '</div>' +
        '</body>' +
        '</html>'
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
