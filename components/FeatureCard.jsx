export default function FeatureCard({ children, className = "" }) {
  return (
    <div
      className={`mx-auto w-full max-w-xl rounded-3xl border border-white/55 bg-white/70 px-4 py-6 text-center shadow-md shadow-sky-200/25 backdrop-blur-md sm:px-7 sm:py-8 ${className}`}
    >
      {children}
    </div>
  );
}
