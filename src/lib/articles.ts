export const ARTICLE_KINDS: Record<string, string> = {
  WRITEUP: "Shiur write up",
  ARTICLE: "Article",
  NEWSLETTER: "Newsletter",
};

export const ARTICLE_STATUS: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "Draft", cls: "" },
  PENDING: { label: "Waiting for the Rav", cls: "tag-navy" },
  APPROVED: { label: "Approved and posted", cls: "tag-ok" },
};
