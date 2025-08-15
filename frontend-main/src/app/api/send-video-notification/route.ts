import { NextRequest, NextResponse } from 'next/server';
import { sendVideoUploadNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { userEmail, userName, videoTitle, videoUrl, videoId } = body;

    // Validate required fields
    if (!userEmail || !userName || !videoTitle || !videoUrl || !videoId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Send the email notification
    const result = await sendVideoUploadNotification({
      userEmail,
      userName,
      videoTitle,
      videoUrl,
      videoId,
      uploadDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email notification sent successfully',
        data: result.data,
      });
    } else {
      console.error('Failed to send email:', result.error);
      return NextResponse.json(
        { 
          error: 'Failed to send email notification',
          details: result.error 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send-video-notification API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
