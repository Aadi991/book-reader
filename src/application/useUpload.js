import { useState } from 'react'
import { useAuth } from './AuthProvider'

import StorageService from '../application/StorageService'
import BookRepository from '../data/BookRepository'

import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url'
import { renderPdfCover } from './renderPdfCover'

let pdfJsPromise = null

import { loadPdfJs } from './utils/loadPdfJs'




function getBookName(fileName) {
  return fileName.replace(/\.[^/.]+$/, '')
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function useUpload() {
  const { user } = useAuth()

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')

  async function uploadBook(file) {
    if (!file) {
      throw new Error('No file selected')
    }

    if (!user?.uid) {
      throw new Error('User not authenticated')
    }

    setUploading(true)
    setProgress(0)
    setError(null)

    try {

      const slug = slugify(title)

      const timestamp = Date.now()

      const bookPath =
        `${title}/book.pdf`

      const coverPath =
        `${title}/cover.jpg`

      //
      // Generate cover from first page
      //
      const {
        blob: coverBlob,
        pageCount,
        coverPage
      } = await renderPdfCover(file)

      //
      // Upload cover (0% -> 25%)
      //
      await StorageService.uploadBookWithProgress(
        'Covers',
        coverPath,
        coverBlob,
        { upsert: true },
        (loaded, total) => {
          const pct = Math.round(
            (loaded / total) * 25
          )

          setProgress(pct)
        }
      )

      //
      // Upload PDF (25% -> 100%)
      //
      await StorageService.uploadBookWithProgress(
        'Books',
        bookPath,
        file,
        { upsert: true },
        (loaded, total) => {
          const pct = Math.round(
            (loaded / total) * 75
          )

          setProgress(25 + pct)
        }
      )

      const book = {
        title,
        ownerId: user.uid,

        fileName: file.name,
        fileSize: file.size,
        pageCount,

        storagePath: bookPath,
        coverPath,

        bookBucket: 'Books',
        coverBucket: 'Covers',

        coverPage,

        createdAt: new Date().toISOString()
      }

      const id = await BookRepository.add(book)

      setProgress(100)

      return {
        id,
        ...book
      }
    } catch (err) {
      console.error(err)

      setError(
        err?.message ||
          'Failed to upload book'
      )

      throw err
    } finally {
      setUploading(false)
    }
  }

  return {
    uploadBook,
    uploading,
    progress,
    error,
    title,
    setTitle,
    author,
    setAuthor
  }
}