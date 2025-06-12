import {NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function GET(request, context) {
  const fileId = context.params.fileId;

  if (!fileId) {
    return new NextResponse('File ID is required', { status: 400 });
  }

  try {
    const fileInfoRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
    );
    const fileInfo = await fileInfoRes.json();

    if (!fileInfo.ok || !fileInfo.result || !fileInfo.result.file_path) {
      throw new Error('Failed to get file info');
    }

    const filePath = fileInfo.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    const imageRes = await fetch(fileUrl);

    if (!imageRes.ok || !imageRes.body) {
      throw new Error('Failed to fetch image');
    }

    const headers = new Headers();
    headers.set('Content-Type', 'image/jpeg'); // Assuming JPEG thumbnails
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(imageRes.body, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('[Thumb Error]', error);
    return new NextResponse('Error fetching thumbnail', { status: 500 });
  }
}
