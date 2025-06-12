import { NextResponse } from 'next/server';

export async function GET(request, context) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  if (!BOT_TOKEN) {
    console.error('Missing environment variable: TELEGRAM_BOT_TOKEN');
    return new NextResponse('Server configuration error: Bot token not set.', {
      status: 500,
    });
  }

  const fileId = context.params.fileId;

  try {
    // Step 1: Get file metadata from Telegram.
    const fileInfoRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
    );
    const fileInfo = await fileInfoRes.json();

    if (!fileInfo.ok || !fileInfo.result?.file_path) {
      console.error('Invalid file info from Telegram:', fileInfo);
      return new NextResponse('Invalid or expired file_id', { status: 400 });
    }

    // Step 2: Construct the file download URL.
    const filePath = fileInfo.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    // Step 3: Fetch the file, proxying the Range header for seeking.
    const range = request.headers.get('range');
    const telegramRes = await fetch(fileUrl, {
      headers: range ? { Range: range } : {},
    });

    if (!telegramRes.ok || !telegramRes.body) {
      throw new Error(`Failed to fetch file from Telegram: ${telegramRes.statusText}`);
    }

    // Step 4: Stream the response back to the client.
    const headers = new Headers();
    const telegramContentType = telegramRes.headers.get('content-type');
    if (telegramContentType) {
      headers.set('Content-Type', telegramContentType);
    }
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Accept-Ranges', 'bytes');

    const status = telegramRes.status;

    const contentLength = telegramRes.headers.get('content-length');
    if (contentLength) headers.set('Content-Length', contentLength);

    if (status === 206) {
      const contentRange = telegramRes.headers.get('content-range');
      if (contentRange) headers.set('Content-Range', contentRange);
    }

    return new NextResponse(telegramRes.body, {
      status,
      headers,
    });

  } catch (error) {
    console.error('[TELEGRAM_STREAM_ERROR]', error);
    return new NextResponse('Error streaming file from Telegram.', { status: 500 });
  }
}
