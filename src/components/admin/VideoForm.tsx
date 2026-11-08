"use client";

import { useState } from "react";
import { saveVideo } from "@/app/actions/admin";

type Cat = { id: string; title: string };
type V = {
  id?: string; title?: string; description?: string | null; kind?: string; source?: string; embedUrl?: string | null;
  filePath?: string | null; thumbnail?: string | null; categoryId?: string | null; published?: boolean;
};

/** Uploads a file straight to the server with a progress bar and returns the stored name. */
function Uploader({ name, accept, initial, label }: { name: string; accept: string; initial?: string | null; label: string }) {
  const [value, setValue] = useState(initial || "");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  function upload(file: File) {
    setError("");
    setProgress(0);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
    xhr.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      setProgress(null);
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status === 200) setValue(res.name);
        else setError(res.error || "Upload failed");
      } catch {
        setError("Upload failed");
      }
    };
    xhr.onerror = () => { setProgress(null); setError("Upload failed. Check your connection."); };
    xhr.send(file);
  }

  return (
    <div className="field">
      <label>{label}</label>
      <input type="hidden" name={name} value={value} />
      <input type="file" accept={accept} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      {progress !== null && (
        <div style={{ marginTop: 8 }}>
          <div style={{ height: 8, background: "#e6e1d4", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "var(--gold)", transition: "width .2s" }} />
          </div>
          <div className="small muted">Uploading {progress}%... keep this page open.</div>
        </div>
      )}
      {value && progress === null && (
        <div className="small" style={{ marginTop: 6 }}>
          <span className="tag tag-ok">Uploaded</span>{" "}
          <button type="button" className="linklike small" style={{ color: "var(--bad)" }} onClick={() => setValue("")}>remove</button>
        </div>
      )}
      {error && <div className="alert alert-error" style={{ marginTop: 8 }}>{error}</div>}
    </div>
  );
}

export default function VideoForm({ video, categories }: { video?: V; categories: Cat[] }) {
  const [source, setSource] = useState(video?.source || "EMBED");
  return (
    <form action={saveVideo} className="card">
      {video?.id && <input type="hidden" name="id" value={video.id} />}
      <div className="field"><label htmlFor="title">Title</label><input id="title" name="title" type="text" required defaultValue={video?.title} /></div>
      <div className="grid grid-2" style={{ gap: 16 }}>
        <div className="field">
          <label htmlFor="kind">Type</label>
          <select id="kind" name="kind" defaultValue={video?.kind || "LONG"}>
            <option value="LONG">Long form video (horizontal)</option>
            <option value="SHORT">Short (vertical, under a minute or two)</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="categoryId">Category</label>
          <select id="categoryId" name="categoryId" defaultValue={video?.categoryId || ""}>
            <option value="">No category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
      </div>

      <div className="field">
        <label>Where is the video?</label>
        <div className="row">
          <label className="checkbox"><input type="radio" name="source" value="EMBED" checked={source === "EMBED"} onChange={() => setSource("EMBED")} /> Link (YouTube unlisted, Vimeo, Google Drive, Zoom recording)</label>
          <label className="checkbox"><input type="radio" name="source" value="UPLOAD" checked={source === "UPLOAD"} onChange={() => setSource("UPLOAD")} /> Upload a file from my computer or phone</label>
        </div>
      </div>

      {source === "EMBED" ? (
        <div className="field">
          <label htmlFor="embedUrl">Video link</label>
          <input id="embedUrl" name="embedUrl" type="url" placeholder="https://youtu.be/..." defaultValue={video?.embedUrl || ""} />
          <div className="small muted">Tip: on YouTube choose “Unlisted” so only members of this site can find it.</div>
        </div>
      ) : (
        <Uploader name="filePath" accept="video/mp4,video/webm,video/quicktime,.mov,.m4v" initial={video?.filePath} label="Video file (MP4 or MOV)" />
      )}

      <Uploader name="thumbnail" accept="image/*" initial={video?.thumbnail} label="Cover image (optional)" />

      <div className="field"><label htmlFor="description">Description</label><textarea id="description" name="description" defaultValue={video?.description || ""} /></div>
      <div className="field"><label className="checkbox"><input type="checkbox" name="published" defaultChecked={video?.published ?? true} /> Published (visible to members)</label></div>
      <button className="btn btn-gold">{video?.id ? "Save changes" : "Post video"}</button>
    </form>
  );
}
