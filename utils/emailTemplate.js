exports.otpTemplate = (name, otp) => {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    
    <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background: #4f46e5; padding: 15px; text-align: center; color: white; font-size: 20px; font-weight: bold;">
        Your OTP Code
      </div>

      <!-- Body -->
      <div style="padding: 20px; color: #333;">
        <p>Hello <strong>${name}</strong>,</p>

        <p>Your One-Time Password (OTP) for account verification is:</p>

        <!-- OTP Box -->
        <div style="background: #f1f5f9; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; color: #4f46e5; letter-spacing: 3px;">
            ${otp}
          </span>
        </div>

        <p style="font-size: 14px;">
          This OTP is valid for <strong>5 minutes</strong>. Please do not share this code with anyone.
        </p>

        <p style="font-size: 14px; color: #666;">
          If you didn’t request this code, you can safely ignore this email.
        </p>

        <p>Thank you for using our service!</p>
      </div>

      <!-- Footer -->
      <div style="background: #f9fafb; padding: 10px; text-align: center; font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} Logistics App. All rights reserved.
      </div>

    </div>
  </div>
  `;
};
