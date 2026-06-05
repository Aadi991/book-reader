export default function CollectionHeader({
  totalBooks
}) {
  return (
    <div className="flex items-end justify-between border-b-2 border-on-surface pb-4">

      <div className="flex items-center gap-4">
        <h2 className="font-headline-md text-headline-md">
          Your Collection
        </h2>

        <span className="px-2 py-1 border-2 border-on-surface rounded-md text-sm">
          {totalBooks} Books
        </span>
      </div>

      <div className="flex gap-2">

        <button className="px-4 py-2 rounded-full border-2 border-on-surface">
          Recent
        </button>

        <button className="px-4 py-2 rounded-full border-2 border-on-surface">
          Filter
        </button>

      </div>

    </div>
  )
}