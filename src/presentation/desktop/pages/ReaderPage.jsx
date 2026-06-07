import useBook from '../../../application/useBook'
import useReadingHistory from '../../../application/useReadingHistory'
import { navigate } from '../../navigate'
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

    
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      
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
    </div>
  )
}