import React, { useState } from 'react'
import useBook from '../../../application/useBook'
import useReadingHistory from '../../../application/useReadingHistory'
import { navigate } from '../../navigate'
import PdfReader from '../../desktop/organisms/PdfReader'

export default function ReaderPage({ bookId, userId }) {
  const { book, bookUrl, loading, error } = useBook(bookId)
  const { progress, saveReadingHistory } = useReadingHistory({ userId, bookId })
  const [showUi, setShowUi] = useState(false)

  function handlePageChange(page) {
    saveReadingHistory({ page })
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-surface text-on-surface">Loading...</div>
  }

  if (error) {
    return <div className="flex h-screen items-center justify-center bg-surface text-on-surface">{error.message}</div>
  }

  return (
    <div className="relative h-screen w-full bg-surface overflow-hidden" onClick={() => setShowUi(!showUi)}>
      {showUi && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent text-white z-50 flex items-center justify-between">
          <button onClick={(e) => { e.stopPropagation(); navigate('/library'); }} className="p-2">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="font-medium truncate px-4">{book.title}</span>
          <div className="w-10"></div>
        </div>
      )}

      <PdfReader
        url={bookUrl}
        title={book.title}
        initialPage={progress?.page || 1}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
