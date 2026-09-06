/**
 * DealFlow 360 — Distinct Email Templates Module
 * 1. Customer Welcome & Temporary Credentials Email (Triggered by Admin / Sales Rep)
 * 2. Commercial Invoice Delivery Email (Triggered per specific Invoice)
 */

// =========================================================================
// EMAIL 1: CUSTOMER WELCOME & TEMPORARY CREDENTIALS
// =========================================================================
export const renderCustomerWelcomeEmailHTML = ({
  customerName,
  contactName,
  customerEmail,
  tempPassword,
  portalUrl = "http://localhost:5173/customer/login"
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to DealFlow 360 Customer Portal</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F3F4F6; color: #1F2937;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3F4F6; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);">
          
          <!-- Banner Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4F46E5 100%); padding: 36px 40px; text-align: left;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 800; tracking: -0.5px;">⚡ DEALFLOW 360</h1>
              <p style="margin: 6px 0 0 0; color: #C7D2FE; font-size: 14px;">Customer Portal Access Invitation</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 40px;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #111827;">
                Welcome, ${contactName || customerName}! 👋
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #4B5563;">
                Your customer account for <strong>${customerName}</strong> has been provisioned on the DealFlow 360 Enterprise Portal. You can now access your commercial quotations, track live order fulfillments, download invoices, and manage billing.
              </p>

              <!-- Credentials Card -->
              <div style="background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); border: 1px dashed #6366F1; border-radius: 14px; padding: 24px; margin-bottom: 28px;">
                <h3 style="margin: 0 0 14px 0; font-size: 14px; font-weight: 800; color: #312E81; text-transform: uppercase; letter-spacing: 0.5px;">
                  🔑 Your Login Credentials
                </h3>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 10px; padding: 16px; border: 1px solid #C7D2FE;">
                  <tr>
                    <td style="padding-bottom: 10px; font-size: 13px; color: #374151;">
                      <strong>Portal URL:</strong><br>
                      <a href="${portalUrl}" style="color: #4F46E5; font-weight: 700; text-decoration: none;">${portalUrl}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 10px; font-size: 13px; color: #374151;">
                      <strong>Login Username / Email:</strong><br>
                      <span style="font-family: monospace; font-size: 14px; color: #1F2937; font-weight: 600;">${customerEmail}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; color: #374151;">
                      <strong>Temporary Password:</strong><br>
                      <span style="display: inline-block; background-color: #FEF3C7; color: #92400E; font-family: monospace; font-size: 15px; font-weight: 800; padding: 6px 12px; border-radius: 6px; border: 1px solid #FCD34D; margin-top: 4px;">
                        ${tempPassword || 'TempPass#2026!'}
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 28px;">
                <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%); color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);">
                  Activate Account & Log In &rarr;
                </a>
              </div>

              <!-- Security Warning -->
              <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 12px 16px; font-size: 12px; color: #92400E;">
                <strong>⚠️ Security Notice:</strong> This temporary password is for your initial login only. For your account security, you will be prompted to set a new permanent password immediately after logging in.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 24px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0; font-size: 12px; color: #6B7280;">
                If you did not request this account or need help, contact support at <a href="mailto:support@dealflow.com" style="color: #4F46E5;">support@dealflow.com</a>.
              </p>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #9CA3AF;">
                &copy; 2026 DealFlow 360 Inc. Confidential B2B Document.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
};


// =========================================================================
// EMAIL 2: COMMERCIAL INVOICE DELIVERY EMAIL
// =========================================================================
export const renderInvoiceEmailHTML = ({
  customerName,
  customerEmail,
  invoiceNumber,
  orderNumber,
  issuedDate,
  dueDate,
  items = [],
  subtotal = 0,
  discountAmount = 0,
  taxAmount = 0,
  totalAmount = 0,
  portalUrl = "http://localhost:5173/customer/login"
}) => {
  const formattedSubtotal = Number(subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const formattedDiscount = Number(discountAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const formattedTax = Number(taxAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const formattedTotal = Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const itemsHTML = items.map(item => `
    <tr style="border-bottom: 1px solid #E5E7EB;">
      <td style="padding: 12px 16px; font-size: 14px; color: #1F2937; font-weight: 600;">
        ${item.description || item.product_name || 'Item'}
        ${item.product_sku ? `<br><span style="font-size: 12px; color: #6B7280; font-family: monospace;">SKU: ${item.product_sku}</span>` : ''}
      </td>
      <td style="padding: 12px 16px; font-size: 14px; color: #4B5563; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 16px; font-size: 14px; color: #4B5563; text-align: right;">₹${Number(item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      <td style="padding: 12px 16px; font-size: 14px; color: #059669; text-align: right;">${item.discount_percent ? item.discount_percent + '%' : '0%'}</td>
      <td style="padding: 12px 16px; font-size: 14px; color: #1F2937; font-weight: 700; text-align: right;">₹${Number(item.line_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Commercial Invoice ${invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F3F4F6; color: #1F2937;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3F4F6; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table width="640" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);">
          
          <!-- Banner Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%); padding: 32px 40px; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 800;">⚡ DEALFLOW 360</h1>
                    <p style="margin: 4px 0 0 0; color: #94A3B8; font-size: 13px;">Commercial Tax Invoice</p>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background-color: #4F46E5; color: #FFFFFF; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase;">
                      INVOICE # ${invoiceNumber}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Metadata Section -->
          <tr>
            <td style="padding: 32px 40px 16px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" valign="top">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase;">Billed To</p>
                    <p style="margin: 0; font-size: 16px; font-weight: 700; color: #111827;">${customerName}</p>
                    <p style="margin: 2px 0 0 0; font-size: 13px; color: #4B5563;">${Array.isArray(customerEmail) ? customerEmail.join(', ') : customerEmail}</p>
                  </td>
                  <td width="50%" valign="top" align="right">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase;">Invoice Details</p>
                    <p style="margin: 0; font-size: 13px; color: #374151;"><strong>Issued Date:</strong> ${issuedDate || new Date().toLocaleDateString('en-IN')}</p>
                    <p style="margin: 2px 0 0 0; font-size: 13px; color: #DC2626;"><strong>Payment Due:</strong> ${dueDate || 'Net 30 Days'}</p>
                    ${orderNumber ? `<p style="margin: 2px 0 0 0; font-size: 13px; color: #4B5563;"><strong>Ref Sales Order:</strong> ${orderNumber}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Line Items Table -->
          <tr>
            <td style="padding: 16px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0;">
                    <th style="padding: 10px 16px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: left;">Product / Service</th>
                    <th style="padding: 10px 16px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: center;">Qty</th>
                    <th style="padding: 10px 16px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">Unit Price</th>
                    <th style="padding: 10px 16px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">Discount</th>
                    <th style="padding: 10px 16px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Summary & Bank Details -->
          <tr>
            <td style="padding: 16px 40px 32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="55%" valign="top">
                    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px;">
                      <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase;">Bank Transfer Details</p>
                      <p style="margin: 2px 0; font-size: 12px; color: #475569;"><strong>Bank Name:</strong> HDFC Bank Ltd</p>
                      <p style="margin: 2px 0; font-size: 12px; color: #475569;"><strong>Account Name:</strong> DealFlow 360 Operations India</p>
                      <p style="margin: 2px 0; font-size: 12px; color: #475569;"><strong>A/C Number:</strong> 50200012345678</p>
                      <p style="margin: 2px 0; font-size: 12px; color: #475569;"><strong>IFSC Code:</strong> HDFC0000123 (BKC Branch)</p>
                    </div>
                  </td>
                  <td width="45%" valign="top" align="right">
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                      <tr>
                        <td style="padding: 4px 0; color: #64748B;">Subtotal:</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #0F172A;">₹${formattedSubtotal}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #059669;">Discount Savings:</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #059669;">-₹${formattedDiscount}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748B;">GST Tax (18%):</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #0F172A;">+₹${formattedTax}</td>
                      </tr>
                      <tr style="border-top: 2px solid #E2E8F0;">
                        <td style="padding: 12px 0 4px 0; font-size: 15px; font-weight: 800; color: #0F172A;">Total Amount Due:</td>
                        <td style="padding: 12px 0 4px 0; text-align: right; font-size: 16px; font-weight: 800; color: #4F46E5;">₹${formattedTotal}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action CTA -->
          <tr>
            <td style="padding: 0 40px 32px 40px; text-align: center;">
              <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%); color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);">
                View Invoice &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 24px 40px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0; font-size: 12px; color: #64748B;">
                Thank you for your business. For billing queries, please contact <a href="mailto:finance@dealflow.com" style="color: #4F46E5;">finance@dealflow.com</a>.
              </p>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #94A3B8;">
                &copy; 2026 DealFlow 360 Inc. Tax Invoice Document.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
};
