export function Logo({ size = 22 }: { size?: number }) {
  return (
    <img
      src="/images/logo.png"
      alt="Senedoc"
      style={{ height: size * 1.8, width: "auto" }}
    />
  );
}