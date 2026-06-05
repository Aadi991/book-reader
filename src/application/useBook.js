import { useEffect, useState } from 'react'
import BookRepository from '../data/BookRepository'
import StorageService from '../application/StorageService'

export default function useBook(bookId) {
  const [book, setBook] = useState(null)
  const [bookUrl, setBookUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
  console.log('bookId:', bookId)

  if (!bookId) {
    console.log('No bookId provided')
    return
  }

  async function loadBook() {
    try {
      console.log('Loading book...')
      setLoading(true)

      const bookData = await BookRepository.get(bookId)

      console.log('bookData:', bookData)

      if (!bookData) {
        throw new Error('Book not found')
      }

      setBook(bookData)

      if (bookData.storagePath) {
        const url = await StorageService.getBookUrl(
          bookData.bookBucket,
          bookData.storagePath
        )

        console.log('Book URL:', url)

        setBookUrl(url)
      }
    } catch (err) {
      console.error('loadBook error:', err)
      setError(err)
    } finally {
      console.log('Finished loading')
      setLoading(false)
    }
  }

  loadBook()
}, [bookId])

  return {
    book,
    bookUrl,
    loading,
    error
  }
}