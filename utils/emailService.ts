import { Resend } from 'resend';

// Initialize Resend with API key
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || 're_Ty7bSfpJ_ARKzPiC2EteMx3AdYqh55N4T';
console.log('🔑 Resend API Key loaded:', RESEND_API_KEY ? 'YES' : 'NO');
console.log('🌐 Environment check:', {
  hasEnvVar: !!import.meta.env.VITE_RESEND_API_KEY,
  fallbackUsed: !import.meta.env.VITE_RESEND_API_KEY
});

const resend = new Resend(RESEND_API_KEY);

/**
 * Add contact to Resend audience for newsletter
 */
export async function addContactToAudience(email: string, name?: string): Promise<boolean> {
  console.log('👥 Adding contact to audience:', email, name);
  try {
    const audienceId = import.meta.env.VITE_RESEND_AUDIENCE_ID || '808e9617-60a8-4628-af7a-e67f1d65ce99';
    console.log('👥 Audience ID:', audienceId);

    const { data, error } = await resend.contacts.create({
      email: email,
      first_name: name?.split(' ')[0] || '',
      last_name: name?.split(' ').slice(1).join(' ') || '',
      unsubscribed: false,
      audience_id: audienceId
    });

    if (error) {
      console.error('Error adding contact to audience:', error);
      return false;
    }

    console.log('Contact added to audience successfully:', data);
    return true;
  } catch (error) {
    console.error('Failed to add contact to audience:', error);
    return false;
  }
}

export interface OrderData {
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
  status: 'pending' | 'in-preparation' | 'ready-for-pickup' | 'completed' | 'rejected';
  createdAt: string;
  note?: string;
}

/**
 * Send order notification email to admin
 */
export async function sendOrderNotificationToAdmin(orderData: OrderData): Promise<boolean> {
  console.log('📧 Sending admin notification email for order:', orderData.orderNumber);
  try {
    const adminEmail = 'biodinamicnakmetijacernelic@gmail.com';
    console.log('📧 Admin email:', adminEmail);

    const { data, error } = await resend.emails.send({
      from: 'Biodinamična kmetija Černelič <info@biodinamicnakmetija-cernelic.si>',
      to: [adminEmail],
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

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(orderData: OrderData): Promise<boolean> {
  console.log('📧 Sending customer confirmation email for order:', orderData.orderNumber);
  try {
    console.log('📧 Customer email:', orderData.customer.email);
    const { data, error } = await resend.emails.send({
      from: 'Biodinamična kmetija Černelič <info@biodinamicnakmetija-cernelic.si>',
      to: [orderData.customer.email],
      subject: `Potrditev naročila #${orderData.orderNumber}`,
      html: generateOrderConfirmationHTML(orderData),
    });

    if (error) {
      console.error('Error sending order confirmation email:', error);
      return false;
    }

    console.log('Order confirmation email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return false;
  }
}

/**
 * Send order status update email to customer
 */
export async function sendOrderStatusUpdateEmail(
  orderData: OrderData,
  oldStatus: string,
  newStatus: string
): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Biodinamična kmetija Černelič <info@biodinamicnakmetija-cernelic.si>',
      to: [orderData.customer.email],
      subject: `Posodobitev naročila #${orderData.orderNumber}`,
      html: generateOrderStatusUpdateHTML(orderData, oldStatus, newStatus),
    });

    if (error) {
      console.error('Error sending order status update email:', error);
      return false;
    }

    console.log('Order status update email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Failed to send order status update email:', error);
    return false;
  }
}

/**
 * Generate HTML for order confirmation email
 */
/**
 * Generate HTML for admin notification email
 */
function generateAdminNotificationHTML(order: OrderData): string {
  const itemsHTML = order.items.map(item => `
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

  return `
    <!DOCTYPE html>
    <html lang="sl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Novo povpraševanje</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #6b8e23 0%, #8fbc8f 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Novo povpraševanje!</h1>
        <p style="color: #f0f9f0; margin: 10px 0 0 0; font-size: 16px;">Prejeli ste novo povpraševanje</p>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0 0 16px 16px; padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; background: #fef3c7; color: #92400e; padding: 12px 24px; border-radius: 50px; font-weight: bold;">
            ⚠️ Potrebna akcija: Kontaktirajte stranko
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #374151; margin: 0 0 20px 0; font-size: 20px;">Podatki o povpraševanju #${order.orderNumber}</h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Ime:</strong> ${order.customer.name}</p>
            <p style="margin: 5px 0;"><strong>Telefon:</strong> ${order.customer.phone}</p>
            <p style="margin: 5px 0;"><strong>E-mail:</strong> ${order.customer.email}</p>
            <p style="margin: 5px 0;"><strong>Datum:</strong> ${new Date(order.createdAt).toLocaleDateString('sl-SI')}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${order.status}</p>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Zahtevani izdelki</h3>
          <table style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 15px; text-align: left; font-weight: bold; color: #374151;">izdelek</th>
                <th style="padding: 15px; text-align: center; font-weight: bold; color: #374151;">količina</th>
                <th style="padding: 15px; text-align: right; font-weight: bold; color: #374151;">cena</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
              <tr style="background: #f3f4f6; font-weight: bold;">
                <td colspan="2" style="padding: 15px; text-align: right;">SKUPAJ:</td>
                <td style="padding: 15px; text-align: right; font-size: 18px; color: #dc2626;">${order.total.toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>
        </div>

        ${order.note ? `
          <div style="margin-bottom: 30px;">
            <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">Dodatne opombe</h3>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #6b8e23;">
              ${order.note.replace(/\n/g, '<br>')}
            </div>
          </div>
        ` : ''}

        <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">📞 Naslednji koraki:</h3>
          <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
            <li>Pokličite stranko na ${order.customer.phone}</li>
            <li>Potrjujete dostopnost izdelkov</li>
            <li>Dogovorite termin prevzema</li>
            <li>Posodobite status v admin panelu</li>
          </ul>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0;">
            <a href="https://biodinamicnakmetija-cernelic.si/admin" style="color: #6b8e23; text-decoration: none;">📊 Odprite admin panel</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateOrderConfirmationHTML(order: OrderData): string {
  const itemsHTML = order.items.map(item => `
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

  return `
    <!DOCTYPE html>
    <html lang="sl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Potrditev naročila</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #6b8e23 0%, #8fbc8f 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Biodinamična kmetija Černelič</h1>
        <p style="color: #f0f9f0; margin: 10px 0 0 0; font-size: 16px;">Hvala za vaše naročilo!</p>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0 0 16px 16px; padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; background: #dcfce7; color: #166534; padding: 12px 24px; border-radius: 50px; font-weight: bold;">
            ✓ Naročilo #${order.orderNumber} je bilo uspešno oddano
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #374151; margin: 0 0 20px 0; font-size: 20px;">Podatki o naročilu</h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Ime:</strong> ${order.customer.name}</p>
            <p style="margin: 5px 0;"><strong>Telefon:</strong> ${order.customer.phone}</p>
            <p style="margin: 5px 0;"><strong>E-mail:</strong> ${order.customer.email}</p>
            <p style="margin: 5px 0;"><strong>Datum naročila:</strong> ${new Date(order.createdAt).toLocaleDateString('sl-SI')}</p>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Naročeni izdelki</h3>
          <table style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 15px; text-align: left; font-weight: bold; color: #374151;">izdelek</th>
                <th style="padding: 15px; text-align: center; font-weight: bold; color: #374151;">količina</th>
                <th style="padding: 15px; text-align: right; font-weight: bold; color: #374151;">cena</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
              <tr style="background: #f3f4f6; font-weight: bold;">
                <td colspan="2" style="padding: 15px; text-align: right;">SKUPAJ:</td>
                <td style="padding: 15px; text-align: right; font-size: 18px; color: #dc2626;">${order.total.toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>
        </div>

        ${order.note ? `
          <div style="margin-bottom: 30px;">
            <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">Dodatne opombe</h3>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #6b8e23;">
              ${order.note.replace(/\n/g, '<br>')}
            </div>
          </div>
        ` : ''}

        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">⚠️ Pomembne informacije</h3>
          <ul style="color: #92400e; margin: 0; padding-left: 20px;">
            <li>Plačilo se izvede ob prevzemu izdelkov</li>
            <li>Cene vključujejo DDV</li>
            <li>Kontaktirali vas bomo glede termina prevzema</li>
            <li>Prevzem je možen na kmetiji ali na tržnici</li>
          </ul>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0;">
            Za vprašanja nas kontaktirajte na <a href="tel:+38651363447" style="color: #6b8e23;">051 363 447</a>
            ali <a href="mailto:info@biodinamicnakmetija-cernelic.si" style="color: #6b8e23;">info@biodinamicnakmetija-cernelic.si</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate HTML for order status update email
 */
function generateOrderStatusUpdateHTML(order: OrderData, oldStatus: string, newStatus: string): string {
  const statusMessages = {
    pending: {
      title: '⏳ Povpraševanje v čakanju',
      message: 'Prejeli smo vaše povpraševanje in ga pregledamo. Kontaktirali vas bomo v najkrajšem možnem času z informacijami o dostopnosti izdelkov in plačilu.',
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    'in-preparation': {
      title: '✅ Naročilo v pripravi',
      message: 'Vaše naročilo smo pregledali in sprejeli. Trenutno pripravljamo vaše izdelke. Kontaktirali vas bomo glede termina prevzema.',
      color: '#16a34a',
      bgColor: '#dcfce7'
    },
    rejected: {
      title: '❌ Naročilo zavrnjeno',
      message: 'Žal trenutno ne moremo izpolniti vašega naročila. Kontaktirali vas bomo za dodatne informacije.',
      color: '#dc2626',
      bgColor: '#fef2f2'
    },
    'ready-for-pickup': {
      title: '📦 Naročilo pripravljeno - čaka na prevzem',
      message: 'Vaše naročilo je pripravljeno in čaka na vas! Pridelke lahko prevzamete na kmetiji: Torek & Petek (ob mraku - 22:00) ali na tržnici Ljubljana: Sreda & Sobota (07:30 - 14:00). Prosimo, kontaktirajte nas za dogovor.',
      color: '#0891b2',
      bgColor: '#cffafe'
    },
    completed: {
      title: '✅ Naročilo zaključeno',
      message: 'Hvala za vaše naročilo! Upamo, da ste zadovoljni z našimi izdelki.',
      color: '#059669',
      bgColor: '#d1fae5'
    }
  };

  const statusInfo = statusMessages[newStatus as keyof typeof statusMessages] || {
    title: 'Posodobitev statusa naročila',
    message: `Status vašega naročila se je spremenil iz "${oldStatus}" v "${newStatus}".`,
    color: '#6b8e23',
    bgColor: '#f0fdf4'
  };

  return `
    <!DOCTYPE html>
    <html lang="sl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Posodobitev naročila</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #6b8e23 0%, #8fbc8f 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Biodinamična kmetija Černelič</h1>
        <p style="color: #f0f9f0; margin: 10px 0 0 0; font-size: 16px;">Posodobitev naročila</p>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0 0 16px 16px; padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; background: ${statusInfo.bgColor}; color: ${statusInfo.color}; padding: 12px 24px; border-radius: 50px; font-weight: bold; font-size: 16px;">
            ${statusInfo.title}
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #374151; margin: 0 0 20px 0; font-size: 20px;">Naročilo #${order.orderNumber}</h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
            <p style="margin: 5px 0;"><strong>Ime:</strong> ${order.customer.name}</p>
            <p style="margin: 5px 0;"><strong>Telefon:</strong> ${order.customer.phone}</p>
            <p style="margin: 5px 0;"><strong>E-mail:</strong> ${order.customer.email}</p>
            <p style="margin: 5px 0;"><strong>Datum naročila:</strong> ${new Date(order.createdAt).toLocaleDateString('sl-SI')}</p>
          </div>
        </div>

        <div style="background: ${statusInfo.bgColor}; border: 1px solid ${statusInfo.color}20; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <p style="color: ${statusInfo.color}; margin: 0; font-weight: 500;">
            ${statusInfo.message}
          </p>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0;">
            Za vprašanja nas kontaktirajte na <a href="tel:+38651363447" style="color: #6b8e23;">051 363 447</a>
            ali <a href="mailto:info@biodinamicnakmetija-cernelic.si" style="color: #6b8e23;">info@biodinamicnakmetija-cernelic.si</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
