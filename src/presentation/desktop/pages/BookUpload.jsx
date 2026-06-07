import React, { useEffect, useMemo, useState } from 'react'
import { navigate } from '../../navigate'
import useUpload from '../../../application/useUpload'

import UploadDropzone from '../organisms/UploadDropzone'
import BookPreviewCard from '../organisms/BookPreviewCard'
import BookMetadataForm from '../organisms/BookMetadataForm'

import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export default function BookUpload() {
  const [file, setFile] = useState(null)


  const [coverUrl, setCoverUrl] = useState(null)

  const {
    uploadBook,
    uploading,
    progress,
    error,
    title,
    setTitle,
    author,
    setAuthor
  } = useUpload()

  useEffect(() => {
    if (!file) return

    const filename = file.name.replace(/\.[^/.]+$/, '')

    if (!title) {
      setTitle(filename)
    }

    generateCover(file)
  }, [file])

  async function generateCover(pdfFile) {
    try {
      const url = URL.createObjectURL(pdfFile)

      const pdf = await pdfjsLib
        .getDocument(url)
        .promise

      const page = await pdf.getPage(1)

      const viewport = page.getViewport({
        scale: 1.5
      })

      const canvas =
        document.createElement('canvas')

      const context =
        canvas.getContext('2d')

      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({
        canvasContext: context,
        viewport
      }).promise

      setCoverUrl(canvas.toDataURL('image/jpeg'))
    } catch (err) {
      console.error(
        'Failed to generate PDF cover',
        err
      )
    }
  }

  const fileSize = useMemo(() => {
    if (!file) return null

    return (
      file.size /
      1024 /
      1024
    ).toFixed(1)
  }, [file])

  async function handleUpload() {
    if (!file) return

    try {
      await uploadBook(file)

      navigate('/library')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <main className="max-w-6xl mx-auto py-10">
        <section className="border-b-2 border-black pb-6">
          <h2 className="text-5xl font-black mb-2">
            Upload Standalone Book
          </h2>

          <p className="text-gray-600">
            Add a single volume to your personal
            library. Supported format: PDF.
          </p>
        </section>

        <UploadDropzone
          onFileSelect={setFile}
        />

        <section className="grid md:grid-cols-12 gap-10 mt-10">
          <BookPreviewCard
            file={file}
            progress={progress}
            fileSize={fileSize}
            coverUrl={coverUrl}
          />

          <BookMetadataForm
            title={title}
            author={author}
            onTitleChange={setTitle}
            onAuthorChange={setAuthor}
            error={error}
          />
        </section>

        <section className="border-t-2 border-dashed border-black mt-12 pt-8 flex justify-end gap-4">
          <button
            type="button"
            className="
              px-10
              py-4
              border-2
              border-black
              rounded-2xl
              font-semibold
            "
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!file || uploading}
            onClick={handleUpload}
            className="
              px-12
              py-4
              rounded-2xl
              border-2
              border-black
              bg-primary
              text-white
              font-bold
              shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
              disabled:opacity-50
            "
          >
            {uploading
              ? `Uploading ${progress}%`
              : 'Finish Uploading Book'}
          </button>
        </section>
      </main>
    </div>
  )
}