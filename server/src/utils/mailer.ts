import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    },
});

export async function sendResetEmail(to: string, token: string) {
    const origin = process.env.FRONTEND_ORIGIN?.split(',')[0] || 'http://localhost:4200';
    const resetUrl = `${origin}/reset-password?token=${token}`;

    await transporter.sendMail({
        from: `"Perla Support" <${process.env.MAIL_USER}>`,
        to,
        subject: 'Reset Your Password',
        html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Arial', sans-serif; color: #333; border-radius: 16px; border: 1px solid #f9a8d4; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.1);">
            <!-- Logo Section -->
            <div style="text-align: center; margin-bottom: 24px; padding: 16px;">
                <img src="https://i.imgur.com/OCx0yq0.png" alt="Perla Accessories" style="max-height: 80px; width: auto;" />
            </div>
            
            <!-- Divider -->
            <div style="height: 1px; background: linear-gradient(to right, transparent, #f9a8d4, transparent); margin: 16px 0;"></div>
            
            <!-- Content -->
            <div style="background: linear-gradient(to bottom right, rgba(252, 231, 243, 0.5), rgba(255, 255, 255, 1)); padding: 32px; border-radius: 12px;">
                <h2 style="color: #db2777; font-size: 24px; margin-bottom: 16px; text-align: center;">Password Reset</h2>
                
                <p style="margin-bottom: 24px; line-height: 1.6; font-size: 16px; color: #4b5563;">We received a request to reset your password for your Perla Accessories account. Click the button below to create a new password:</p>
                
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(to right, #ec4899, #db2777); color: white; text-decoration: none; padding: 12px 32px; border-radius: 50px; font-weight: bold; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3); transition: all 0.3s ease;" target="_blank">Reset Password</a>
                </div>
                
                <p style="margin-bottom: 8px; font-size: 14px; color: #6b7280;">If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="margin-bottom: 24px; word-break: break-all; font-size: 14px; color: #6b7280;"><a href="${resetUrl}" style="color: #db2777; text-decoration: none;" target="_blank">${resetUrl}</a></p>
                
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">This link will expire in 1 hour.</p>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px; font-size: 14px; color: #9ca3af;">
                <p>© ${new Date().getFullYear()} Perla Accessories. All rights reserved.</p>
                <p style="margin-top: 8px;">If you didn't request this password reset, please ignore this email.</p>
            </div>
        </div>
      `,
    });
}

export async function sendOrderConfirmationEmail(to: string, order: any) {
    const origin = process.env.FRONTEND_ORIGIN?.split(',')[0] || 'http://localhost:4200';
    const orderUrl = `${origin}/order-confirmation/${order.id}?from=email`;
    const items = order.items || [];

    // Format the payment method for display
    let paymentMethod = 'Cash on Delivery';
    if (order.payment_method === 'vodafone_cash') {
        paymentMethod = 'Vodafone Cash';
    } else if (order.payment_method === 'instapay') {
        paymentMethod = 'InstaPay';
    }

    // Calculate order summary
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0);
    const deliveryFee = Number(order.delivery_fee) || 0;
    const discount = subtotal - Number(order.total);
    const formattedDiscount = discount > 0 ? discount.toFixed(2) : '0.00';
    const grandTotal = Number(order.total) + deliveryFee;

    // Generate product items HTML
    const itemsHtml = items.map((item: any) => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">
                <div style="display: flex; align-items: center;">
                    <img src="${item.product_image || 'https://i.imgur.com/FqLYY0I.png'}" alt="${item.product_name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; margin-right: 12px;" />
                    <div>
                        <p style="margin: 0; font-weight: 500; color: #374151;">${item.product_name}</p>
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">Qty: ${item.quantity}</p>
                    </div>
                </div>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 500; color: #374151;">
                EGP ${(item.unit_price * item.quantity).toFixed(2)}
            </td>
        </tr>
    `).join('');

    await transporter.sendMail({
        from: `"Perla Accessories" <${process.env.MAIL_USER}>`,
        to,
        subject: `Order Confirmation #${order.id}`,
        html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Arial', sans-serif; color: #333; border-radius: 16px; border: 1px solid #f9a8d4; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.1);">
            <!-- Logo Section -->
            <div style="text-align: center; margin-bottom: 24px; padding: 16px;">
                <img src="https://i.imgur.com/OCx0yq0.png" alt="Perla Accessories" style="max-height: 80px; width: auto;" />
            </div>
            
            <!-- Divider -->
            <div style="height: 1px; background: linear-gradient(to right, transparent, #f9a8d4, transparent); margin: 16px 0;"></div>
            
            <!-- Order Confirmation Header -->
            <div style="background: linear-gradient(to bottom right, rgba(252, 231, 243, 0.5), rgba(255, 255, 255, 1)); padding: 32px; border-radius: 12px;">
                <h2 style="color: #db2777; font-size: 24px; margin-bottom: 16px; text-align: center;">Thank You for Your Order!</h2>
                
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="display: inline-block; background-color: #ecfdf5; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 13L9 17L19 7" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                
                <p style="margin-bottom: 24px; line-height: 1.6; font-size: 16px; color: #4b5563; text-align: center;">
                    We're processing your order and will notify you when it ships. Your order details are below:
                </p>
                
                <!-- Order Information -->
                <div style="background-color: white; border-radius: 8px; padding: 16px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f3f4f6; padding-bottom: 12px; margin-bottom: 12px;">
                        <div>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Order Number:</p>
                            <p style="margin: 0; font-weight: 600; color: #111827;">#${order.id}</p>
                        </div>
                        <div>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Date:</p>
                            <p style="margin: 0; font-weight: 500; color: #111827;">${new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Payment Method:</p>
                            <p style="margin: 0; font-weight: 500; color: #111827;">${paymentMethod}</p>
                        </div>
                    </div>
                    
                    <!-- Shipping Details -->
                    <div style="margin-bottom: 20px;">
                        <h3 style="font-size: 16px; margin-bottom: 8px; color: #111827;">Shipping Details</h3>
                        <p style="margin: 0 0 4px 0; font-size: 14px; color: #4b5563;"><strong>Name:</strong> ${order.shipping_name}</p>
                        <p style="margin: 0 0 4px 0; font-size: 14px; color: #4b5563;"><strong>Address:</strong> ${order.shipping_address}</p>
                        <p style="margin: 0 0 4px 0; font-size: 14px; color: #4b5563;"><strong>City:</strong> ${order.shipping_city}</p>
                        <p style="margin: 0 0 4px 0; font-size: 14px; color: #4b5563;"><strong>Phone:</strong> ${order.shipping_phone}</p>
                    </div>
                </div>
                
                <!-- Order Items -->
                <div style="background-color: white; border-radius: 8px; padding: 16px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h3 style="font-size: 16px; margin-bottom: 16px; color: #111827;">Order Summary</h3>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="text-align: left; padding: 12px 12px 12px 0; border-bottom: 2px solid #f3f4f6; font-size: 14px; color: #6b7280;">Product</th>
                                <th style="text-align: right; padding: 12px 0 12px 12px; border-bottom: 2px solid #f3f4f6; font-size: 14px; color: #6b7280;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    
                    <!-- Order Totals -->
                    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #f3f4f6;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Subtotal:</p>
                            <p style="margin: 0; font-weight: 500; color: #374151;">EGP ${subtotal.toFixed(2)}</p>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Shipping:</p>
                            <p style="margin: 0; font-weight: 500; color: #374151;">EGP ${deliveryFee.toFixed(2)}</p>
                        </div>
                        
                        ${discount > 0 ? `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <p style="margin: 0; font-size: 14px; color: #10b981;">Discount:</p>
                            <p style="margin: 0; font-weight: 500; color: #10b981;">- EGP ${formattedDiscount}</p>
                        </div>
                        ` : ''}
                        
                        <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f3f4f6;">
                            <p style="margin: 0; font-weight: 600; color: #111827;">Total:</p>
                            <p style="margin: 0; font-weight: 600; color: #db2777;">EGP ${grandTotal.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${orderUrl}" style="display: inline-block; background: linear-gradient(to right, #ec4899, #db2777); color: white; text-decoration: none; padding: 12px 32px; border-radius: 50px; font-weight: bold; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3); transition: all 0.3s ease;" target="_blank">View Order</a>
                </div>
                
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 0; text-align: center;">If you have any questions, please contact our customer service at support@perla.com</p>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px; font-size: 14px; color: #9ca3af;">
                <p>© ${new Date().getFullYear()} Perla Accessories. All rights reserved.</p>
                <p style="margin-top: 8px;">This email was sent to you as a registered user of Perla Accessories.</p>
            </div>
        </div>
        `,
    });
}


