export default function FeaturedBookCard({ book }) {
  if (!book) {
    return null
  }

  const title =
    book.title ||
    book.name ||
    'Untitled'

  const author =
    book.author ||
    book.creator ||
    ''

  const cover =
    book.coverUrl ||
    book.coverPath ||
    null

  const progress =
    Number(book.progress || 0)

  return (
    <div
      className="
        bg-[var(--bg)]
        border-2 border-[var(--on-surface)]
        rounded-[28px]
        p-4 md:p-6
        flex
        flex-col md:flex-row
        gap-4 md:gap-8
        min-h-[200px] md:h-[360px]
      "
    >
      {/* Cover */}
      <div
        className="
          w-[140px] md:w-[200px]
          shrink-0
          rounded-xl
          overflow-hidden
          border-2 border-[var(--on-surface)]
          mx-auto md:mx-0
        "
      >
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="
              w-full
              h-full
              object-cover
            "
          />
        ) : (
          <div
            className="
              w-full
              h-full
              flex
              items-center
              justify-center
            "
          >
            <span
              className="
                material-symbols-outlined
                text-6xl
              "
            >
              menu_book
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="
          flex
          flex-col
          flex-1
          h-full
        "
      >
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
              text-[28px] md:text-[44px]
              leading-tight
              font-bold
              font-body-reading
              text-center md:text-left
            "
          >
            {title}
          </h2>

          {author && (
            <p
              className="
                mt-2 md:mt-3
                text-base md:text-lg
                text-[var(--muted)]
                text-center md:text-left
              "
            >
              {author}
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="mt-auto">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">
              {book.currentChapter ||
                (book.currentPage
                  ? `Page ${book.currentPage}`
                  : 'Current Position')}
            </span>

            <span className="font-semibold">
              {progress}%
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
                width: `${progress}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}