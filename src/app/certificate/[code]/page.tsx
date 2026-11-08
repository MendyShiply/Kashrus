import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { site } from "@/lib/site";
import { TRACKS } from "@/lib/course";
import { getSettings } from "@/lib/settings";
import PrintButton from "@/components/PrintButton";

export const metadata = { title: "Certificate" };
export const dynamic = "force-dynamic";

// Public: anyone with the code can verify the certificate is genuine.
export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const e = await db.enrollment.findUnique({ where: { certificateCode: code.toUpperCase() }, include: { user: true } });
  if (!e || e.status !== "COMPLETED") notFound();
  const [rabbis, s] = await Promise.all([db.rabbi.findMany({ where: { onCertificate: true }, orderBy: { order: "asc" } }), getSettings()]);
  const track = TRACKS[e.track] || TRACKS.HOME;
  const date = (e.completedAt || new Date()).toLocaleDateString("en-US", { dateStyle: "long" });
  const founderSig = s.founderSignature;

  return (
    <div className="cert-page">
      <div className="no-print center" style={{ marginBottom: 16 }}>
        <span className="tag tag-ok">Verified certificate #{e.certificateCode}</span>{" "}
        <PrintButton />
      </div>
      <div className="certificate">
        <div className="c-bsd">בס״ד</div>
        <div>
          <div className="c-he">{site.hebrewName}</div>
          <div style={{ fontSize: "clamp(0.8rem,1.6vw,1.1rem)", letterSpacing: "0.2em", textTransform: "uppercase" }}>{site.name}</div>
        </div>
        <div>
          <p className="c-title">Certificate of Completion</p>
          <div style={{ fontFamily: "var(--sans)", fontSize: "clamp(0.75rem,1.4vw,1rem)", marginTop: 8 }}>This is to certify that</div>
          <div className="c-name">{e.user.name}</div>
          <div className="c-body">{track.certLine}, under the guidance of {site.founder.name}.</div>
        </div>
        <div className="sigs">
          <div className="sig">
            <div className="sig-mark">{founderSig ? <img src={`/media/${founderSig}`} alt="" /> : site.founder.name}</div>
            <div className="sig-line">
              {site.founder.name}<br /><span className="he">{site.founder.hebrewName}</span><br />Course Director
            </div>
          </div>
          {rabbis.map((r) => (
            <div key={r.id} className="sig">
              <div className="sig-mark">{r.signaturePath ? <img src={`/media/${r.signaturePath}`} alt="" /> : r.name}</div>
              <div className="sig-line">
                {r.name}
                {r.hebrewName && <><br /><span className="he">{r.hebrewName}</span></>}
                {r.title && <><br />{r.title}</>}
              </div>
            </div>
          ))}
        </div>
        <div className="c-foot">Awarded {date} · Certificate #{e.certificateCode} · Verify at {(process.env.SITE_URL || "").replace(/^https?:\/\//, "")}/certificate/{e.certificateCode}</div>
      </div>
    </div>
  );
}
