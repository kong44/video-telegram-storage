export const dynamic = 'force-dynamic';

import fs from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";

export default async function HomePage({ searchParams }) {
  const dbPath = path.join(process.cwd(), "videos.json");
  const fileContent = await fs.readFile(dbPath, "utf8");
  const videos = JSON.parse(fileContent);

  const rawPage = searchParams?.page;
  const page = parseInt(Array.isArray(rawPage) ? rawPage[0] : rawPage || "1");
  const perPage = 12;
  const totalPages = Math.ceil(videos.length / perPage);

  if (page < 1 || page > totalPages) {
    redirect("?page=1");
  }

  const paginatedVideos = videos.slice((page - 1) * perPage, page * perPage);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <header className="py-10 bg-slate-800 shadow-md border-b border-slate-700">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-sky-400">
          TMovie
        </h1>
        <p className="text-center mt-2 text-slate-400 text-lg">
          Browse your videos
        </p>
      </header>

      <section className="container mx-auto px-6 py-12">
        {paginatedVideos.length === 0 ? (
          <p className="text-center text-slate-400">
            No videos found on this page.
          </p>
        ) : (
          <>
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-md transition hover:scale-105 hover:shadow-sky-400/20"
                >
                  <div className="aspect-video bg-black">
                    <video
                      controls
                      preload="metadata"
                      className="w-full h-full object-cover"
                      poster={
                        video.thumb_file_id
                          ? `/api/video/thumb/${video.thumb_file_id}`
                          : ""
                      }
                    >
                      <source
                        src={`/api/video/stream/${video.file_id}`}
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-sky-300 truncate">
                      {video.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Uploaded: {new Date(video.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center items-center gap-4 text-sm">
              {Array.from({ length: totalPages }, (_, i) => (
                <a
                  key={i + 1}
                  href={`?page=${i + 1}`}
                  className={`px-3 py-1 rounded border border-slate-600 ${
                    i + 1 === page
                      ? "bg-sky-500 text-black font-semibold"
                      : "hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  {i + 1}
                </a>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
