import Link from "next/link";
import { toEmbedUrl, youTubeThumb } from "@/lib/embed";

type V = {
  id: string;
  title: string;
  description?: string | null;
  kind: string;
  source: string;
  embedUrl?: string | null;
  filePath?: string | null;
  thumbnail?: string | null;
  category?: { title: string } | null;
};

export function thumbFor(v: V) {
  if (v.thumbnail) return `/media/${v.thumbnail}`;
  if (v.source === "EMBED") return youTubeThumb(v.embedUrl);
  return null;
}

export function VideoCard({ v }: { v: V }) {
  const t = thumbFor(v);
  const vertical = v.kind === "SHORT";
  return (
    <Link href={`/videos/${v.id}`} className="video-card">
      <div className={`thumb${vertical ? " vertical" : ""}`}>
        {t && <img src={t} alt="" loading="lazy" />}
        <span className="play">▶</span>
      </div>
      <div className="meta">
        <h3>{v.title}</h3>
        <div className="row small">
          {v.category && <span className="tag">{v.category.title}</span>}
          {vertical && <span className="tag tag-navy">Short</span>}
        </div>
      </div>
    </Link>
  );
}

export function VideoPlayer({ v, autoPlay = false }: { v: V; autoPlay?: boolean }) {
  const vertical = v.kind === "SHORT";
  const cls = `player${vertical ? " vertical" : ""}`;
  if (v.source === "UPLOAD" && v.filePath) {
    return (
      <div className={cls}>
        <video
          src={`/media/${v.filePath}`}
          controls
          playsInline
          preload="metadata"
          autoPlay={autoPlay}
          controlsList="nodownload"
          poster={v.thumbnail ? `/media/${v.thumbnail}` : undefined}
        />
      </div>
    );
  }
  const src = toEmbedUrl(v.embedUrl);
  if (!src) return <div className={cls} />;
  return (
    <div className={cls}>
      <iframe
        src={src}
        title={v.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
