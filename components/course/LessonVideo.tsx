interface LessonVideoProps {
  videoUrl?: string;
  title: string;
}

/**
 * Renders a lesson's video, or nothing at all.
 *
 * Every lesson is currently video-free: the 35 embeds this course shipped with
 * were third-party YouTube videos we had no licence to use, and they were
 * removed. Terry-owned recordings land here as they are produced (see
 * docs/VIDEO-RECORDING-PLAN.md).
 *
 * Returning null rather than a placeholder is deliberate — a "video coming
 * soon" box on every lesson reads as an unfinished product, whereas a written
 * lesson with no video slot just reads as a written lesson. The sales page and
 * FAQ tell buyers the truth about video status before they pay; the lesson does
 * not need to apologise for itself.
 */
export default function LessonVideo({ videoUrl, title }: LessonVideoProps) {
  const embedUrl = toEmbedUrl(videoUrl);
  if (!embedUrl) return null;

  return (
    <div className="mb-8 rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-800">
      <iframe
        src={embedUrl}
        title={`${title} — video walkthrough`}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

/**
 * Normalizes a hosting URL into an embeddable one. The old inline
 * `.replace("watch?v=", "embed/")` silently produced a broken iframe for every
 * URL shape except one; this returns null instead of embedding garbage.
 */
function toEmbedUrl(url?: string): string | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  // youtube.com/watch?v=ID
  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = parsed.searchParams.get("v");
    if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    if (parsed.pathname.startsWith("/embed/")) return url;
    return null;
  }

  // youtu.be/ID
  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1);
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  // vimeo.com/ID
  if (host === "vimeo.com") {
    const id = parsed.pathname.split("/").filter(Boolean)[0];
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }

  // Already an embed/player URL, or self-hosted — trust it as given.
  if (host === "player.vimeo.com" || host === "youtube-nocookie.com") return url;

  return null;
}
