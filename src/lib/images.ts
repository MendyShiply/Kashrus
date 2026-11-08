// Stock photos from Unsplash (free to use, see unsplash.com/license). Swap in real photos of the Rav later.
const CATEGORY_IMAGES: Record<string, string> = {
  "bug-awareness": "/images/stock/bug-awareness.jpg",
  "home-checking": "/images/stock/home-checking.jpg",
  bakeries: "/images/stock/bakeries.jpg",
  "dairy-restaurants": "/images/stock/dairy-restaurants.jpg",
  "meat-restaurants": "/images/stock/meat-restaurants.jpg",
  supermarket: "/images/stock/supermarket.jpg",
  "catering-kitchens": "/images/stock/catering-kitchens.jpg",
  "off-site-events": "/images/stock/off-site-events.jpg",
};

export const HERO_IMAGE = "/images/stock/hero.jpg";
export const COURSE_IMAGE = "/images/stock/course.jpg";

export function categoryImage(slug?: string | null) {
  return slug ? CATEGORY_IMAGES[slug] ?? null : null;
}
