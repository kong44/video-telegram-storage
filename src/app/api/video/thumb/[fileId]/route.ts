// src/app/api/video/thumb/[fileId]/route.ts
// This is almost identical to the video stream route, but for images.
import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const fileId = params.fileId;
  
  try {
    const fileInfoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`;
    const fileInfoRes = await fetch(fileInfoUrl);
    const fileInfo = await fileInfoRes.json();
    
    if (!fileInfo.ok) throw new Error('Failed to get file info');
    
    const filePath = fileInfo.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
    
    const imageRes = await fetch(fileUrl);
    if (!imageRes.ok || !imageRes.body) throw new Error('Failed to fetch image');

    const headers = new Headers(imageRes.headers);
    headers.set('Content-Type', 'image/jpeg'); // Assuming thumbnail is JPEG
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(imageRes.body, {
        status: 200,
        headers: headers
    });

  } catch (error) {
    console.error(error);
    return new NextResponse('Error fetching thumbnail', { status: 500 });
  }
}