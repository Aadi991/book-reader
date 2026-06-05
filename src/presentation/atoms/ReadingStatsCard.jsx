export default function ReadingStatsCard({
  streak = 0,
  hoursRead = 0,
  booksFinished = 0
}) {
  return (
    <div className="bg-surface-container-low border-2 border-on-surface rounded-[24px] p-6 flex flex-col justify-between">

      <div>
        <div className="w-12 h-12 bg-primary text-on-primary rounded-xl border-2 border-on-surface flex items-center justify-center mb-6">
          <span className="material-symbols-outlined">
            insights
          </span>
        </div>

        <h3 className="font-headline-sm text-headline-sm text-on-surface">
          Reading Stats
        </h3>

        <p className="text-on-surface-variant mt-1">
          You're on a {streak}-day streak!
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="bg-surface border-2 border-on-surface rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">
            {hoursRead}
          </div>
          <div className="text-sm text-on-surface-variant">
            Hours read
          </div>
        </div>

        <div className="bg-surface border-2 border-on-surface rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">
            {booksFinished}
          </div>
          <div className="text-sm text-on-surface-variant">
            Books finished
          </div>
        </div>
      </div>
    </div>
  )
}