import { getSettings } from "@/lib/settings";
import { saveSettings } from "@/app/actions/admin";

export default async function LiveAdmin() {
  const s = await getSettings();
  return (
    <div className="stack">
      <h1>Live settings</h1>
      <form action={saveSettings} className="card">
        <input type="hidden" name="liveIsOn__present" value="1" />
        <div className="field"><label className="checkbox"><input type="checkbox" name="liveIsOn" defaultChecked={s.liveIsOn === "true"} /> Show “Live now” on the live page</label></div>
        <div className="field"><label>Session title</label><input name="liveTitle" type="text" defaultValue={s.liveTitle} /></div>
        <div className="field"><label>Schedule / announcement</label><textarea name="liveSchedule" style={{ minHeight: 70 }} placeholder="Every Sunday at 8:30pm Eastern" defaultValue={s.liveSchedule} /></div>
        <div className="field">
          <label>Zoom or Google Meet link (members click “Join now”)</label>
          <input name="liveJoinUrl" type="url" placeholder="https://us02web.zoom.us/j/..." defaultValue={s.liveJoinUrl} />
        </div>
        <div className="field">
          <label>Live stream to show on the page (optional)</label>
          <input name="liveEmbedUrl" type="url" placeholder="https://youtube.com/live/..." defaultValue={s.liveEmbedUrl} />
          <div className="small muted">A YouTube Live (unlisted) or Vimeo live link plays right on the site. Zoom and Google Meet cannot be shown inside another website, so they open in a new tab with the button above.</div>
        </div>
        <button className="btn btn-gold">Save</button>
      </form>
      <div className="card small">
        <h3>Recording automatically</h3>
        <ul>
          <li><strong>Zoom:</strong> Settings → Recording → turn on “Automatic recording” and choose “Record in the cloud”. Also turn on a virtual background under Settings → Background &amp; Effects so every session looks consistent.</li>
          <li><strong>Google Meet:</strong> start Recording from Activities → Recording (needs a Google Workspace plan). Recordings are saved to Google Drive.</li>
          <li><strong>YouTube Live:</strong> every stream is saved automatically. Set it to Unlisted.</li>
          <li>After the session, post the recording under <a href="/admin/videos/new">Post a video</a> using the share link.</li>
        </ul>
      </div>
    </div>
  );
}
