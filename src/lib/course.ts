export const TRACKS: Record<string, { label: string; certLine: string }> = {
  HOME: {
    label: "Home Kashrus (for your own kitchen)",
    certLine: "has successfully completed the course in home kashrus and is qualified to supervise the kashrus of a private home",
  },
  PRO: {
    label: "Professional Mashgiach (restaurants and establishments)",
    certLine: "has successfully completed the mashgiach training course and has demonstrated the knowledge required to serve as a mashgiach in food establishments",
  },
};

export function stripeEnabled() {
  return !!process.env.STRIPE_SECRET_KEY;
}
