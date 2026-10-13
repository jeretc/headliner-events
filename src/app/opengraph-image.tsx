import { ImageResponse } from "next/og";

export const alt = "Headliner: fame fills a poster, fit fills a festival";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const bars = [
    { w: 860, h: 120, o: 1 },
    { w: 600, h: 84, o: 1 },
    { w: 300, h: 44, o: 0.5 },
  ];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#E8412A",
          color: "#0E0E0E",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, fontWeight: 700 }}>FOR FESTIVALS, CONFERENCES AND BRAND EVENTS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {bars.map((b, i) => (
            <div key={i} style={{ width: b.w, height: b.h, background: "#0E0E0E", opacity: b.o }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 132, fontWeight: 900, lineHeight: 1 }}>HEADLINER</div>
          <div style={{ fontSize: 40, fontWeight: 700, marginTop: 12 }}>Fame fills a poster. Fit fills a festival.</div>
        </div>
      </div>
    ),
    size,
  );
}
