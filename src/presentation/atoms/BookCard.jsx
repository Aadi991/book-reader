export default function BookCard({
  book,
  onClick
}) {
  return (
    <article
      onClick={() => onClick?.(book)}
      className="
        bg-surface
        rounded-xl
        border-2
        border-on-surface
        overflow-hidden
        cursor-pointer

        shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
        hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        active:shadow-none

        hover:translate-x-[2px]
        hover:translate-y-[2px]

        active:translate-x-[4px]
        active:translate-y-[4px]

        transition-all
        duration-150
      "
    >
      <div className="aspect-[2/3] overflow-hidden">
        {book.coverUrl || book.cover ? (
          <img
            src={book.coverUrl || book.cover}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error(
                'BOOK COVER FAILED:',
                e.target.src
              )
            }}
          />
        ) : (
          <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-outline-variant">
              menu_book
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h4 className="font-semibold line-clamp-2">
          {book.title}
        </h4>

        <p className="text-sm text-on-surface-variant">
          {book.author || 'Unknown Author'}
        </p>

        {typeof book.progress === 'number' && (
          <p className="text-sm text-on-surface-variant mt-1">
            {book.progress}% read
          </p>
        )}
      </div>
    </article>
  )
} 