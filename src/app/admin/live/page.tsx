import { getSettings } from "@/lib/settings";
import { saveSettings } from "@/app/actions/admin";

export default async function LiveAdmin() {
  const s = await getSettings();
  return (
    <div className="stack">
      <h1>Live on Zoom</h1>
      <form action={saveSettings} className="card">
        <input type="hidden" name="liveIsOn__present" value="1" />
        <div className="field"><label className="checkbox"><input type="checkbox" name="liveIsOn" defaultChecked={s.liveIsOn === "true"} /> Show “Live now” on the live page</label></div>
        <div className="field"><label>Session title</label><input name="liveTitle" type="text" defaultValue={s.liveTitle} /></div>
        <div className="field"><label>Schedule / announcement</label><textarea name="liveSchedule" style={{ minHeight: 70 }} placeholder="Every Sunday at 8:30pm Eastern" defaultValue={s.liveSchedule} /></div>
        <div className="field">
          <label>Zoom meeting link</label>
          <input name="liveJoinUrl" type="url" placeholder="https://us02web.zoom.us/j/..." defaultValue={s.liveJoinUrl} />
          <div className="small muted">Only approved members can see this link.</div>
        </div>
        <div className="grid grid-2" style={{ gap: 12 }}>
          <div className="field"><label>Meeting ID (optional)</label><input name="liveMeetingId" type="text" defaultValue={s.liveMeetingId} /></div>
          <div className="field"><label>Passcode (optional)</label><input name="livePasscode" type="text" defaultValue={s.livePasscode} /></div>
        </div>
        <button className="btn btn-gold">Save</button>
      </form>
      <div className="card small">
        <h3>Zoom setup (one time)</h3>
        <ul>
          <li><strong>Record automatically:</strong> Zoom website → Settings → Recording → turn on “Automatic recording” and choose “Record in the cloud”.</li>
          <li><strong>Background:</strong> Settings → Background &amp; Effects → upload a background image so every session looks the same.</li>
          <li><strong>Keep it private:</strong> turn on the Waiting Room or a passcode so only members get in.</li>
          <li><strong>After the shiur:</strong> copy the recording&apos;s share link from Zoom and post it under <a href="/admin/videos/new">Post a video</a>.</li>
        </ul>
      </div>
    </div>
  );
}
