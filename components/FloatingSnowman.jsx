export default function FloatingSnowman() {
  return (
    <div
      className="pointer-events-none fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 z-[15]"
      aria-hidden
    >
      <img
        src="/snowman-90.gif"
        alt=""
        width={90}
        height={90}
        className="h-[4.5rem] w-auto sm:h-24"
        decoding="async"
      />
    </div>
  );
}
