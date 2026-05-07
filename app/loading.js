export default function Loading() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-aira-snow via-white to-aira-iceLight [overflow-x:clip]">
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <header className="mb-12 rounded-3xl bg-white/55 px-4 py-10 text-center shadow-sm backdrop-blur-sm sm:px-6">
          <div className="mx-auto h-5 w-40 animate-pulse rounded-full bg-sky-100" />
          <div className="mx-auto mt-4 h-12 w-72 animate-pulse rounded-2xl bg-sky-100 sm:h-14 sm:w-96" />
          <div className="mx-auto mt-5 h-5 w-80 animate-pulse rounded-full bg-slate-100 sm:w-[30rem]" />
        </header>

        <div className="mx-auto mb-6 h-14 max-w-2xl animate-pulse rounded-3xl bg-white/70 shadow-sm sm:mb-8" />
        <div className="mx-auto mb-4 flex max-w-3xl flex-wrap justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-24 animate-pulse rounded-full bg-white/70 shadow-sm"
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-3xl border border-sky-100/50 bg-white/70 shadow-sm"
            >
              <div className="aspect-square animate-pulse bg-sky-100/70" />
              <div className="space-y-2 p-3 sm:p-4">
                <div className="h-4 w-10/12 animate-pulse rounded bg-sky-100/80" />
                <div className="h-3 w-7/12 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-5/12 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-sky-100/80" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
