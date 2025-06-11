// src/app/page.tsx
import fs from 'fs/promises';
import path from 'path';

// Define the type for our video object
type Video = {
  id: string;
  title: string;
  file_id: string;
  thumb_file_id: string | null;
  uploaded_at: string;
};

// This component runs on the server to fetch data
export default async function HomePage() {
  // Read the video data from our JSON file
  const dbPath = path.join(process.cwd(), 'videos.json');
  const fileContent = await fs.readFile(dbPath, 'utf8');
  const videos: Video[] = JSON.parse(fileContent);

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Telegram Video Storage</h1>
      
      {videos.length === 0 ? (
        <p className="text-center text-gray-400">No videos found. Use the `upload.js` script to add some!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="border rounded-lg overflow-hidden shadow-lg bg-slate-200">
              <div className="aspect-video bg-black">
                <video
                  controls
                  preload="metadata"
                  className="w-full h-full"
                  // The poster will show while the video is loading
                  poster={video.thumb_file_id ? `/api/video/thumb/${video.thumb_file_id}` : ''}
                >
                  {/* The src points to our proxy API route */}
                  <source src={`/api/video/stream/${video.file_id}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{video.title}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}