import ArticleList from "@/components/ArticleList";

export const metadata = { title: "Articles" };
export const dynamic = "force-dynamic";

export default function ArticlesPage() {
  return (
    <ArticleList
      kinds={["ARTICLE", "WRITEUP"]}
      eyebrow="Read"
      title="Articles and write ups"
      intro="Written versions of the shiurim and articles on practical kashrus. Every piece is approved by the Rav before it is posted."
      empty="The first articles are on their way."
    />
  );
}
