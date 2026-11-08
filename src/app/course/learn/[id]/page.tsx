import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { VideoPlayer } from "@/components/Video";
import { completeLesson } from "@/app/actions/course";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireMember();
  const { id } = await params;
  const enrollment = await db.enrollment.findFirst({ where: { userId: user.id } });
  if (user.role !== "ADMIN" && (!enrollment || enrollment.status === "PENDING_PAYMENT")) redirect("/course");
  const lesson = await db.lesson.findUnique({ where: { id } });
  if (!lesson) notFound();
  const video = lesson.videoId ? await db.video.findUnique({ where: { id: lesson.videoId } }) : null;
  const done = await db.lessonProgress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } } });
  return (
    <div className="container section" style={{ maxWidth: 960 }}>
      <Link href="/course/learn" className="small">← All lessons</Link>
      <h1 style={{ marginTop: 10 }}>{lesson.title}</h1>
      {video ? (
        <VideoPlayer v={video} />
      ) : lesson.embedUrl ? (
        <VideoPlayer v={{ id: lesson.id, title: lesson.title, kind: "LONG", source: "EMBED", embedUrl: lesson.embedUrl }} />
      ) : null}
      {lesson.description && <p style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>{lesson.description}</p>}
      <form action={completeLesson} style={{ marginTop: 24 }}>
        <input type="hidden" name="lessonId" value={lesson.id} />
        {done ? <span className="tag tag-ok">Completed</span> : <button className="btn btn-gold">Mark as complete and continue</button>}
      </form>
    </div>
  );
}
