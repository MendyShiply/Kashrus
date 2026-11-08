import ArticleList from "@/components/ArticleList";

export const metadata = { title: "Newsletter" };
export const dynamic = "force-dynamic";

export default function NewsletterPage() {
  return (
    <ArticleList
      kinds={["NEWSLETTER"]}
      eyebrow="Community"
      title="Newsletter"
      intro="A regular roundup of the shiurim, common questions and practical tips. Approved by the Rav."
      empty="The first newsletter is on its way."
    />
  );
}
