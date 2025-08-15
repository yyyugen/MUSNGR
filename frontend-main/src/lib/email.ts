import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface VideoUploadEmailData {
  userEmail: string;
  userName: string;
  videoTitle: string;
  videoUrl: string;
  videoId: string;
  uploadDate: string;
}

export async function sendVideoUploadNotification(data: VideoUploadEmailData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Musngr <notifications@musngr.com>',
      to: [data.userEmail],
      subject: `🎵 Your video "${data.videoTitle}" is ready!`,
      html: generateVideoUploadEmailHTML(data),
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

function generateVideoUploadEmailHTML(data: VideoUploadEmailData): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Video is Ready!</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .video-info {
          background: #f1f5f9;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .video-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .video-details {
          color: #64748b;
          font-size: 14px;
        }
        .cta-button {
          display: inline-block;
          background: #dc2626;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
        .success-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎵 Musngr</div>
          <div class="success-icon">✅</div>
          <h1 class="title">Your video is ready!</h1>
        </div>
        
        <p>Hi ${data.userName},</p>
        
        <p>Great news! Your video has been successfully uploaded to YouTube and is ready to share with the world.</p>
        
        <div class="video-info">
          <div class="video-title">${data.videoTitle}</div>
          <div class="video-details">
            <strong>Video ID:</strong> ${data.videoId}<br>
            <strong>Uploaded:</strong> ${data.uploadDate}
          </div>
        </div>
        
        <div style="text-align: center;">
          <a href="${data.videoUrl}" class="cta-button">🎬 Watch Your Video</a>
        </div>
        
        <p>You can now:</p>
        <ul>
          <li>Share your video link with friends and family</li>
          <li>Embed it on your website or blog</li>
          <li>Promote it on social media</li>
          <li>Add it to playlists</li>
        </ul>
        
        <p>Thank you for using Musngr to bring your audio content to life!</p>
        
        <div class="footer">
          <p>This email was sent by Musngr. If you have any questions, please contact our support team.</p>
          <p>© 2024 Musngr. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateVideoUploadEmailText(data: VideoUploadEmailData): string {
  return `
Hi ${data.userName},

Great news! Your video "${data.videoTitle}" has been successfully uploaded to YouTube and is ready to share.

Video Details:
- Title: ${data.videoTitle}
- Video ID: ${data.videoId}
- Uploaded: ${data.uploadDate}

Watch your video: ${data.videoUrl}

You can now share your video link, embed it on your website, promote it on social media, or add it to playlists.

Thank you for using Musngr!

---
This email was sent by Musngr. If you have any questions, please contact our support team.
© 2024 Musngr. All rights reserved.
  `.trim();
}
