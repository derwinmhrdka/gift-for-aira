export default function SectionShell({
  children,
  className = "",
  background,
  id,
}) {
  return (
    <section
      id={id}
      className={`relative isolate overflow-hidden rounded-3xl px-2 py-6 sm:px-4 sm:py-8 ${className}`}
    >
      {background}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
