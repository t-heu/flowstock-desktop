export default function LoadingSpinner({ size = 32 }) {
  return (
    <div
      className="animate-spin rounded-full border-4 border-neutral-400 border-t-black"
      style={{ width: size, height: size }}
    />
  );
}
