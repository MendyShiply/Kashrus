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
          <div className="small muted">Only approved members can see this link. When the Zoom Meeting SDK is connected, members watch inside the Live page.</div>
        </div>
        <div className="grid grid-2" style={{ gap: 12 }}>
          <div className="field"><label>Meeting ID (optional)</label><input name="liveMeetingId" type="text" defaultValue={s.liveMeetingId} /></div>
          <div className="field"><label>Passcode (optional)</label><input name="livePasscode" type="text" defaultValue={s.livePasscode} /></div>
        </div>
        <button className="btn btn-gold">Save</button>
      </form>
      <div className="card small">
        <h3>Zoom setup (one time, on zoom.us → Settings)</h3>
        <ul>
          <li><strong>Record automatically:</strong> Recording → turn on “Cloud recording” and “Automatic recording”, set to the cloud.</li>
          <li><strong>Word for word transcript:</strong> Recording → Cloud recording → tick “Create audio transcript”. Also turn on “Full transcript” under In Meeting (Advanced) so people can read live captions during the shiur.</li>
          <li><strong>Summary:</strong> AI Companion → turn on “Meeting summary with AI Companion” and choose to start it automatically.</li>
          <li><strong>Background:</strong> Background &amp; Effects → upload a background image so every shiur looks the same.</li>
          <li><strong>Keep it private:</strong> turn on the Waiting Room or a passcode.</li>
          <li><strong>After the shiur:</strong> go to <a href="/admin/zoom">Zoom recordings</a> and click Import. The video, transcript and summary arrive together as a draft.</li>
        </ul>
        <p className="muted" style={{ margin: 0 }}>Cloud recording, transcripts and AI summaries need a paid Zoom plan (Pro or higher).</p>
      </div>
    </div>
  );
}
