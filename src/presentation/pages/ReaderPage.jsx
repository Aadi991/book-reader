import useBook from '../../application/useBook'
import useReadingHistory from '../../application/useReadingHistory'

import PdfReader from '../organisms/PdfReader'

export default function ReaderPage({
  bookId,
  userId
}) {
  const {
    book,
    bookUrl,
    loading,
    error
  } = useBook(bookId)

  const {
    progress,
    saveReadingHistory
  } = useReadingHistory({
    userId,
    bookId
  })

  function handlePageChange(page) {
    saveReadingHistory({
      page
    })
  }

  if (loading) {
    return (
      <div>
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div>
        {error.message}
      </div>
    )
  }

  return (
    <PdfReader
      url={bookUrl}
      title={book.title}
      initialPage={
        progress?.page || 1
      }
      onPageChange={
        handlePageChange
      }
    />
  )
}