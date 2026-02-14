import { useEffect } from "react";

export function useTorqueTenant() {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = "TORQUE — Shop Management OS";

    const metaUpdates: { selector: string; attr: string; value: string }[] = [
      { selector: 'meta[name="description"]', attr: "content", value: "Professional shop management OS for all vehicle types. Repair orders, scheduling, estimates, payments, and inventory — powered by Trust Layer." },
      { selector: 'meta[name="theme-color"]', attr: "content", value: "#00D9FF" },
      { selector: 'meta[name="application-name"]', attr: "content", value: "TORQUE" },
      { selector: 'meta[name="apple-mobile-web-app-title"]', attr: "content", value: "TORQUE" },
      { selector: 'meta[property="og:title"]', attr: "content", value: "TORQUE — Shop Management OS" },
      { selector: 'meta[property="og:description"]', attr: "content", value: "Professional shop management for all vehicle types. Powered by Trust Layer." },
      { selector: 'meta[property="og:site_name"]', attr: "content", value: "TORQUE" },
      { selector: 'meta[name="twitter:title"]', attr: "content", value: "TORQUE — Shop Management OS" },
      { selector: 'meta[name="twitter:description"]', attr: "content", value: "Professional shop management for all vehicle types. Powered by Trust Layer." },
    ];

    const originals: { el: Element; attr: string; value: string | null }[] = [];
    metaUpdates.forEach(({ selector, attr, value }) => {
      const el = document.querySelector(selector);
      if (el) {
        originals.push({ el, attr, value: el.getAttribute(attr) });
        el.setAttribute(attr, value);
      }
    });

    const manifestLink = document.createElement("link");
    manifestLink.rel = "manifest";
    manifestLink.href = "/torque-manifest.json";

    const existingManifest = document.querySelector('link[rel="manifest"]');
    const existingHref = existingManifest?.getAttribute("href") || null;
    if (existingManifest) {
      existingManifest.setAttribute("href", "/torque-manifest.json");
    } else {
      document.head.appendChild(manifestLink);
    }

    const appleTouchLink = document.querySelector('link[rel="apple-touch-icon"]');
    const originalAppleIcon = appleTouchLink?.getAttribute("href") || null;
    if (appleTouchLink) {
      appleTouchLink.setAttribute("href", "/torque-icon-192.png");
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/torque-sw.js", { scope: "/torque" })
        .then((reg) => console.log("[TORQUE] SW registered:", reg.scope))
        .catch((err) => console.log("[TORQUE] SW registration failed:", err));
    }

    return () => {
      document.title = originalTitle;
      originals.forEach(({ el, attr, value }) => {
        if (value !== null) el.setAttribute(attr, value);
      });
      if (existingManifest && existingHref) {
        existingManifest.setAttribute("href", existingHref);
      }
      if (appleTouchLink && originalAppleIcon) {
        appleTouchLink.setAttribute("href", originalAppleIcon);
      }
    };
  }, []);
}
