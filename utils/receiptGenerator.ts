import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface ReceiptData {
  orderId: string;
  customerName: string;
  phoneNumber: string;
  items: Array<{
    id: string;
    name: string;
    image: string | null;
    unitPrice: number;
    quantity: number;
  }>;
  total: number;
}

export const generateOrderReceipt = async (data: ReceiptData) => {
  const orderCode = `25SEP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  const currentDate = new Date().toLocaleDateString();
  
  const itemsHtml = data.items.map((item, index) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">
        <div style="width: 40px; height: 40px; background-color: #4285f4; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin: 0 auto;">
          Item Img
        </div>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Rs. ${item.unitPrice.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Rs. ${(item.unitPrice * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Receipt</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          background-color: #f5f5f5;
        }
        .receipt {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #ddd;
        }
        .logo {
          width: 60px;
          height: 40px;
          background-color: #4285f4;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 15px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background-color: #f8f9fa;
          padding: 12px 8px;
          text-align: left;
          font-weight: bold;
          border-bottom: 2px solid #ddd;
        }
        .total-row {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        .customer-info {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
        }
        .customer-details {
          flex: 1;
        }
        .order-code-box {
          border: 2px solid #333;
          padding: 10px;
          text-align: center;
          min-width: 120px;
        }
        .order-code {
          font-weight: bold;
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="logo">Logo</div>
          <div class="company-name">The Feathers</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="text-align: center;">Item Img</th>
              <th>Items</th>
              <th style="text-align: center;">Qty.</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr class="total-row">
              <td colspan="4" style="padding: 12px 8px; text-align: right; font-weight: bold;">Total Price</td>
              <td style="padding: 12px 8px; text-align: right; font-weight: bold;">Rs. ${data.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="customer-info">
          <div class="customer-details">
            <strong>Customer Name:</strong> ${data.customerName}<br>
            <strong>Date Order Received:</strong> ${currentDate}<br>
            <strong>Phone Number:</strong> ${data.phoneNumber}
          </div>
          <div class="order-code-box">
            <div><strong>Order Code</strong></div>
            <div class="order-code">${orderCode}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Order Receipt',
      });
    }
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw error;
  }
};