import { useEffect, useRef } from "react";

interface TrustLayerReviewsProps {
  siteId?: string;
  apiKey?: string;
  primaryColor?: string;
  layout?: "carousel" | "grid";
  maxReviews?: number;
  className?: string;
}

export default function TrustLayerReviews({
  siteId = "garagebot",
  apiKey = "",
  primaryColor = "#00d4ff",
  layout = "carousel",
  maxReviews = 5,
  className = ""
}: TrustLayerReviewsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !containerRef.current) return;
    initialized.current = true;

    const SAMPLE_REVIEWS = [
      { name: "Marcus T.", rating: 5, text: "Finally! One place to search all the parts sites. Found brake pads $40 cheaper than my usual go-to. Buddy even suggested a better brand.", date: "1 week ago", source: "google" },
      { name: "Jennifer R.", rating: 5, text: "I manage a small fleet of work trucks. GarageBot saves me hours every week on parts hunting. The AI recommendations are spot-on.", date: "2 weeks ago", source: "facebook" },
      { name: "Carlos M.", rating: 5, text: "As a shade tree mechanic, this is exactly what I needed. Search once, see everything. The DIY guides are a nice bonus too.", date: "3 weeks ago", source: "google" },
      { name: "David K.", rating: 4, text: "Great concept, works well for common parts. Still building out some of the specialty retailers but getting better every week.", date: "1 month ago", source: "trustpilot" },
      { name: "Amanda S.", rating: 5, text: "Used it to find parts for my boat AND my ATV. Didn't know one site could do both. Impressed!", date: "1 month ago", source: "facebook" },
      { name: "Robert H.", rating: 5, text: "The Buddy AI is legit helpful. Asked about a weird noise my truck was making and it walked me through diagnosis. Found the part in seconds.", date: "2 weeks ago", source: "trustpilot" }
    ];

    const renderStars = (rating: number) => {
      return Array(5).fill(0).map((_, i) => i < rating ? "★" : "☆").join("");
    };

    const getInitials = (name: string) => {
      return name.split(" ").map(n => n[0]).join("").toUpperCase();
    };

    const reviews = SAMPLE_REVIEWS.slice(0, maxReviews);
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    const reviewsHtml = reviews.map(review => `
      <div class="tl-rev-card">
        <div class="tl-rev-card-header">
          <div class="tl-rev-avatar">${getInitials(review.name)}</div>
          <div>
            <div class="tl-rev-name">${review.name}</div>
            <div class="tl-rev-date">${review.date}</div>
          </div>
        </div>
        <div class="tl-rev-rating">${renderStars(review.rating)}</div>
        <div class="tl-rev-text">${review.text}</div>
        <div class="tl-rev-source">
          ${review.source === 'google' ? '<span class="tl-rev-google">G</span> Google' : 
            review.source === 'facebook' ? '<span class="tl-rev-facebook">f</span> Facebook' : 
            '<span class="tl-rev-trustpilot">★</span> Trustpilot'}
        </div>
      </div>
    `).join("");

    const layoutClass = layout === "grid" ? "tl-rev-grid" : "tl-rev-carousel";

    containerRef.current.innerHTML = `
      <div class="tl-rev-container">
        <div class="tl-rev-header">
          <div class="tl-rev-score">${avgRating.toFixed(1)}</div>
          <div class="tl-rev-meta">
            <div class="tl-rev-stars">${renderStars(Math.round(avgRating))}</div>
            <div class="tl-rev-count">Based on ${reviews.length} reviews</div>
          </div>
        </div>
        <div class="${layoutClass}">${reviewsHtml}</div>
        <div class="tl-rev-powered">Powered by <a href="https://tlid.io" target="_blank" rel="noopener">TrustLayer</a></div>
      </div>
    `;
  }, [siteId, apiKey, primaryColor, layout, maxReviews]);

  return (
    <>
      <style>{`
        .tl-rev-container { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .tl-rev-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .tl-rev-score { font-size: 48px; font-weight: 700; color: #fff; }
        .tl-rev-meta { display: flex; flex-direction: column; }
        .tl-rev-stars { color: #fbbf24; font-size: 24px; letter-spacing: 2px; }
        .tl-rev-count { font-size: 14px; color: #9ca3af; }
        .tl-rev-carousel { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; padding: 8px 0; }
        .tl-rev-carousel::-webkit-scrollbar { display: none; }
        .tl-rev-card { flex: 0 0 300px; scroll-snap-align: start; background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.1); }
        .tl-rev-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .tl-rev-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .tl-rev-avatar { width: 40px; height: 40px; border-radius: 50%; background: ${primaryColor}; color: #000; display: flex; align-items: center; justify-content: center; font-weight: 600; }
        .tl-rev-name { font-weight: 600; color: #fff; }
        .tl-rev-date { font-size: 12px; color: #9ca3af; }
        .tl-rev-rating { color: #fbbf24; margin-bottom: 8px; }
        .tl-rev-text { font-size: 14px; color: #d1d5db; line-height: 1.5; }
        .tl-rev-source { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #9ca3af; margin-top: 12px; }
        .tl-rev-google { color: #4285f4; font-weight: bold; }
        .tl-rev-facebook { color: #1877f2; font-weight: bold; }
        .tl-rev-trustpilot { color: #00b67a; }
        .tl-rev-powered { text-align: center; font-size: 12px; color: #6b7280; margin-top: 16px; }
        .tl-rev-powered a { color: ${primaryColor}; text-decoration: none; }
        .tl-rev-powered a:hover { text-decoration: underline; }
      `}</style>
      <div ref={containerRef} className={className} data-testid="trustlayer-reviews" />
    </>
  );
}
