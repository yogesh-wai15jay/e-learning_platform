const nodemailer = require('nodemailer');

// Create transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      // e.g., smtp.gmail.com
  port: process.env.SMTP_PORT,      // 587 for TLS, 465 for SSL
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate the HTML email body (welcome version)
const buildWelcomeEmailHtml = (userName, userEmail) => {
  return `
    <table style='border-collapse: collapse; width: 100%; max-width: 600px; margin: 0 auto; font-family: Verdana, Arial, sans-serif;'>
      <!-- Top Color Strip -->
      <tr><td>
        <table style='width:100%; border-collapse:collapse;'>
          <tr>
            <td style='background-color:#00d4ff;height:3px;width:16%;'></td>
            <td style='background-color:#29c4f2;height:3px;width:17%;'></td>
            <td style='background-color:#6a9fd6;height:3px;width:17%;'></td>
            <td style='background-color:#a872b8;height:3px;width:17%;'></td>
            <td style='background-color:#d44a8a;height:3px;width:17%;'></td>
            <td style='background-color:#e91e63;height:3px;width:16%;'></td>
          </tr>
        </table>
      </td></tr>
      <!-- Logo -->
      <tr>
        <td style='background-color:#ffffff; padding:25px 20px; text-align:center;'>
          <img src='https://dbp.com.sg/wp-content/uploads/2020/09/dbp-logo.svg' width='115' height='40' />
          <p style='margin:10px 0 0 0; font-size:15px; font-weight:bold; color:#333; letter-spacing:1px;'>
            DIGITAL BUSINESS PEOPLE
          </p>
        </td>
      </tr>
      <!-- Content -->
      <tr>
        <td style='background-color:#f9f9f9; padding:30px 25px;'>
          <table style='width:100%; background-color:#ffffff; border-collapse:collapse;'>
            <tr>
              <td style='padding:18px 25px; border-bottom:1px solid #eeeeee;'>
                <table style='width:100%;'>
                  <tr>
                    <td style='width:4px; background-color:#d44a8a;'></td>
                    <td style='padding-left:15px;'>
                      <p style='margin:0; font-size:15px; font-weight:bold; color:#333;'>Welcome to Digital Business People</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style='padding:25px;'>
                <p style='font-size:12px; color:#333;'>Dear <b>${userName}</b>,</p>
                <p style='font-size:12px; color:#555;'>Welcome to the Digital Business People e‑learning platform!</p>
                <p style='font-size:12px; color:#555; line-height:1.8;'>
                  Your account has been successfully created with email: <b>${userEmail}</b>.
                </p>
                <p style='font-size:12px; color:#555; line-height:1.8;'>
                  You can now log in and start your learning journey.
                </p>
                <p style='font-size:12px; color:#555;'>
                  Should you require any assistance, please feel free to reach out to HR.
                </p>
                <p style='font-size:12px; color:#555;'>Thank you,<br/>Digital Business People Team</p>
              </td>
            </tr>
            <tr>
              <td style='padding:0 25px 25px 25px;'>
                <table style='width:100%; background-color:#f9f9f9;'>
                  <tr><td style='padding:12px 15px;'><p style='font-size:10px; color:#888;'>This is a system-generated email. Please do not reply directly.</p></td></tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Bottom Strip -->
      <tr>
        <td>
          <table style='width:100%;'>
            <tr>
              <td style='background-color:#00d4ff;height:2px;width:16%;'></td>
              <td style='background-color:#29c4f2;height:2px;width:17%;'></td>
              <td style='background-color:#6a9fd6;height:2px;width:17%;'></td>
              <td style='background-color:#a872b8;height:2px;width:17%;'></td>
              <td style='background-color:#d44a8a;height:2px;width:17%;'></td>
              <td style='background-color:#e91e63;height:2px;width:16%;'></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

// New user notification email for admin/others
const buildNewUserNotificationHtml = (userName, userEmail, createdAt) => {
  return `
    <table style='border-collapse: collapse; width: 100%; max-width: 600px; margin: 0 auto; font-family: Verdana, Arial, sans-serif;'>
      <tr><td>
        <table style='width:100%; border-collapse:collapse;'>
          <tr>
            <td style='background-color:#00d4ff;height:3px;width:16%;'></td>
            <td style='background-color:#29c4f2;height:3px;width:17%;'></td>
            <td style='background-color:#6a9fd6;height:3px;width:17%;'></td>
            <td style='background-color:#a872b8;height:3px;width:17%;'></td>
            <td style='background-color:#d44a8a;height:3px;width:17%;'></td>
            <td style='background-color:#e91e63;height:3px;width:16%;'></td>
          </tr>
        </table>
      </td></tr>
      <tr><td style='background-color:#ffffff; padding:25px 20px; text-align:center;'>
        <img src='https://dbp.com.sg/wp-content/uploads/2020/09/dbp-logo.svg' width='115' height='40' />
        <p style='margin:10px 0 0 0; font-size:15px; font-weight:bold; color:#333;'>DIGITAL BUSINESS PEOPLE</p>
      </td></tr>
      <tr><td style='background-color:#f9f9f9; padding:30px 25px;'>
        <table style='width:100%; background-color:#ffffff; border-collapse:collapse;'>
          <tr><td style='padding:18px 25px; border-bottom:1px solid #eeeeee;'>
            <table style='width:100%;'><tr><td style='width:4px; background-color:#d44a8a;'></td>
            <td style='padding-left:15px;'><p style='margin:0; font-size:15px; font-weight:bold; color:#333;'>New User Registration</p></td></tr></table>
          </td></tr>
          <tr><td style='padding:25px;'>
            <p style='font-size:12px; color:#555;'>A new user has registered on the e‑learning platform.</p>
            <p style='font-size:12px; color:#555;'><b>Name:</b> ${userName}</p>
            <p style='font-size:12px; color:#555;'><b>Email:</b> ${userEmail}</p>
            <p style='font-size:12px; color:#555;'><b>Registered on:</b> ${new Date(createdAt).toLocaleString()}</p>
          </td></tr>
          <tr><td style='padding:0 25px 25px 25px;'>
            <table style='width:100%; background-color:#f9f9f9;'><tr><td style='padding:12px 15px;'><p style='font-size:10px; color:#888;'>System generated email.</p></td></tr></table>
          </td></tr>
        </table>
      </td></tr>
      <tr><td><table style='width:100%;'><tr>
        <td style='background-color:#00d4ff;height:2px;width:16%;'></td>
        <td style='background-color:#29c4f2;height:2px;width:17%;'></td>
        <td style='background-color:#6a9fd6;height:2px;width:17%;'></td>
        <td style='background-color:#a872b8;height:2px;width:17%;'></td>
        <td style='background-color:#d44a8a;height:2px;width:17%;'></td>
        <td style='background-color:#e91e63;height:2px;width:16%;'></td>
      </tr></table></td></tr>
    </table>
  `;
};

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Digital Business People" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return false;
  }
};

// Welcome email for the new user
const sendWelcomeEmail = async (userName, userEmail) => {
  const html = buildWelcomeEmailHtml(userName, userEmail);
  return sendEmail(userEmail, 'Welcome to Digital Business People', html);
};

// Notification to additional recipients
const sendNewUserNotification = async (userName, userEmail, createdAt) => {
  const html = buildNewUserNotificationHtml(userName, userEmail, createdAt);
  const recipients = ['prashant.verma@dbppl.com', 'joshiyogesh1011@gmail.com'];
  const results = await Promise.all(recipients.map(recipient => sendEmail(recipient, 'New User Registration on E‑Learning Platform', html)));
  return results.every(r => r === true);
};

module.exports = { sendWelcomeEmail, sendNewUserNotification };

// ... inside emailService.js, add:

const buildAcknowledgementHtml = (userName, topicName, score, total) => {
  return `
    <table style='border-collapse: collapse; width: 100%; max-width: 600px; margin: 0 auto; font-family: Verdana, Arial, sans-serif;'>
      <!-- same top color strip as before -->
      <tr><td>...</td></tr>
      <tr><td style='background-color:#ffffff; padding:25px 20px; text-align:center;'>
        <img src='https://dbp.com.sg/wp-content/uploads/2020/09/dbp-logo.svg' width='115' height='40' />
        <p style='margin:10px 0 0 0; font-size:15px; font-weight:bold; color:#333;'>DIGITAL BUSINESS PEOPLE</p>
      </td></tr>
      <tr><td style='background-color:#f9f9f9; padding:30px 25px;'>
        <table style='width:100%; background-color:#ffffff;'>
          <tr><td style='padding:18px 25px; border-bottom:1px solid #eeeeee;'>
            <p style='margin:0; font-size:15px; font-weight:bold; color:#333;'>Course Completion Acknowledgement</p>
          </td></tr>
          <tr><td style='padding:25px;'>
            <p style='font-size:12px;'>Dear <b>${userName}</b>,</p>
            <p style='font-size:12px;'>Congratulations on successfully completing the course: <b>${topicName}</b>!</p>
            <p style='font-size:12px;'>Your final score: <b>${score}/${total}</b> (${Math.round((score/total)*100)}%).</p>
            <p style='font-size:12px;'>This achievement has been recorded. Keep learning!</p>
            <p style='font-size:12px;'>Thank you,<br/>Digital Business People Team</p>
          </td></tr>
        </table>
      </td></tr>
      <!-- bottom strip -->
    </table>
  `;
};

const sendAcknowledgementEmail = async (userName, userEmail, topicName, score, total) => {
  const html = buildAcknowledgementHtml(userName, topicName, score, total);
  return sendEmail(userEmail, `Course Completion Acknowledgement: ${topicName}`, html);
};

module.exports = { sendWelcomeEmail, sendNewUserNotification, sendAcknowledgementEmail };