// src/app/api/video/stream/[fileId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const fileId = params.fileId;

  if (!fileId) {
    return new NextResponse('File ID is required', { status: 400 });
  }

  try {
    // 1. Use the getFile method to get file metadata, including the file_path
    const fileInfoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`;
    const fileInfoRes = await fetch(fileInfoUrl);
    const fileInfo = await fileInfoRes.json();

    if (!fileInfo.ok) {
      throw new Error('Failed to get file info from Telegram');
    }

    const filePath = fileInfo.result.file_path;

    // 2. Construct the full file URL
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    // 3. Fetch the actual video file as a stream
    const videoRes = await fetch(fileUrl);
    
    if (!videoRes.ok || !videoRes.body) {
         throw new Error('Failed to fetch video file from Telegram');
    }

    // 4. Stream the video back to the client
    const headers = new Headers(videoRes.headers);
    headers.set('Content-Type', 'video/mp4');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // Cache for 1 year

    return new NextResponse(videoRes.body, {
        status: 200,
        headers: headers
    });

  } catch (error) {
    console.error(error);
    return new NextResponse('Error fetching video', { status: 500 });
  }
}