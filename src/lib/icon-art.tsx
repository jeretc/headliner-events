// Lineup-poster motif: stacked bars that shrink like a festival billing.
export function iconArt(size: number) {
  const bars = [0.74, 0.58, 0.42, 0.26];
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#E8412A",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: size * 0.05,
      }}
    >
      {bars.map((w, i) => (
        <div
          key={i}
          style={{
            width: size * w,
            height: size * (0.2 - i * 0.03),
            background: "#0E0E0E",
          }}
        />
      ))}
    </div>
  );
}
