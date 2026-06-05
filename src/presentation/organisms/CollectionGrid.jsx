import BookCard from '../atoms/BookCard'
import SeriesCard from '../atoms/SeriesCard'

export default function CollectionGrid({
  books,
  series,
  onSelectLibraryItem
    
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-gutter-md">

      {series.map(item => (
        <SeriesCard
          onClick={() => onSelectLibraryItem?.(item,"series")}
          key={item.id}
          series={item}
        />
      ))}

      {books.map(book => (
        <BookCard
          onClick={() => onSelectLibraryItem?.(book,"book")}
          key={book.id}
          book={book}
        />
      ))}

    </div>
  )
}