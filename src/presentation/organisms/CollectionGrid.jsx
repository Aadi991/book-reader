import BookCard from '../atoms/BookCard'
import SeriesCard from '../atoms/SeriesCard'

export default function CollectionGrid({
  books,
  series,
  onSelectLibraryItem
    
}) {
  console.log('Books received', books)
  console.log('Series received', series)
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