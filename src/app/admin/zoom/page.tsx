import Link from "next/link";
import { db } from "@/lib/db";
import { listRecordings, zoomApiEnabled, zoomEmbedEnabled } from "@/lib/zoom";
import { importZoomRecording } from "@/app/actions/zoom";
import ImportButton from "@/components/admin/ImportButton";

export const dynamic = "force-dynamic";

export default async function ZoomAdmin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const api = zoomApiEnabled();
  let meetings: Awaited<ReturnType<typeof listRecordings>> = [];
  let loadError = "";
  if (api) {
    try {
      meetings = await listRecordings(30);
    } catch (e) {
      loadError = e instanceof Error ? e.message : "Could not reach Zoom";
    }
  }
  const imported = new Map(
    (await db.video.findMany({ where: { zoomMeetingUuid: { not: null } }, select: { id: true, zoomMeetingUuid: true } })).map((v) => [v.zoomMeetingUuid!, v.id]),
  );

  return (
    <div className="stack">
      <h1>Zoom recordings</h1>
      <div className="grid grid-2">
        <div className="card">
          <h3>Watch inside the site</h3>
          {zoomEmbedEnabled() ? <span className="tag tag-ok">Connected</span> : <span className="tag">Not connected yet</span>}
          <p className="small muted" style={{ marginTop: 8 }}>Members join the live Zoom shiur right on the Live page.</p>
        </div>
        <div className="card">
          <h3>Import recordings</h3>
          {api ? <span className="tag tag-ok">Connected</span> : <span className="tag">Not connected yet</span>}
          <p className="small muted" style={{ marginTop: 8 }}>Brings in the video, the word for word transcript and the AI summary with one click.</p>
        </div>
      </div>
      {(error || loadError) && <div className="alert alert-error">{error || loadError}</div>}

      {!api ? (
        <div className="alert alert-info">
          Zoom isn&apos;t connected yet, so recordings can&apos;t be imported automatically. Until then, download the recording and
          transcript from zoom.us → Recordings and use <Link href="/admin/videos/new">Post a video</Link>: it has a place to upload the
          transcript file and paste the summary. The README explains how to connect Zoom.
        </div>
      ) : meetings.length === 0 && !loadError ? (
        <p className="muted">No cloud recordings in the last 30 days.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Shiur</th><th>Files</th><th></th></tr></thead>
            <tbody>
              {meetings.map((m) => {
                const types = new Set((m.recording_files || []).map((f) => f.file_type));
                const done = imported.get(m.uuid);
                return (
                  <tr key={m.uuid}>
                    <td><strong>{m.topic}</strong><div className="small muted">{new Date(m.start_time).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })} · {m.duration} min</div></td>
                    <td className="small">
                      {types.has("MP4") && <span className="tag tag-navy">Video</span>}{" "}
                      {types.has("TRANSCRIPT") && <span className="tag tag-navy">Transcript</span>}
                    </td>
                    <td>
                      {done ? (
                        <Link className="btn btn-outline btn-sm" href={`/admin/videos/${done}`}>Imported, edit</Link>
                      ) : (
                        <form action={importZoomRecording}>
                          <input type="hidden" name="uuid" value={m.uuid} />
                          <ImportButton />
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
