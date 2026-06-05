export default function FeaturedBookCard({ book }) {
  if (!book) return null

  return (
    <div
      className="
        bg-surface
        border-2 border-on-surface
        rounded-[28px]
        p-6
        flex
        gap-8
        h-[360px]
      "
    >
      {/* Cover */}
      <div
        className="
          w-[200px]
          shrink-0
          rounded-xl
          overflow-hidden
          border-2 border-on-surface
        "
      >
        {book.coverUrl || book.coverPath ? (
          <img
            src={book.coverUrl || book.coverPath}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl">
              menu_book
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 h-full">

        <div>
          <div
            className="
              inline-flex
              px-4 py-1
              rounded-full
              border
              border-on-surface
              text-sm
              mb-6
            "
          >
            Reading Now
          </div>

          <h2
            className="
              text-[44px]
              leading-tight
              font-bold
              font-body-reading
            "
          >
            {book.title}
          </h2>

          <p
            className="
              mt-3
              text-lg
              text-on-surface-variant
            "
          >
            {book.author}
          </p>
        </div>

        {/* Push progress to bottom */}
        <div className="mt-auto">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">
              {book.currentChapter || 'Current Chapter'}
            </span>

            <span className="font-semibold">
              {book.progress || 0}%
            </span>
          </div>

          <div
            className="
              h-4
              border-2 border-on-surface
              rounded-full
              overflow-hidden
              bg-surface-container
            "
          >
            <div
              className="h-full bg-primary"
              style={{
                width: `${book.progress || 0}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}