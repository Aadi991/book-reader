import React, { useEffect, useState } from 'react'
import BookTitle from '../atoms/BookTitle'
import BookRepository from '../../packages/shared/src/repositories/BookRepository'
import ProgressRepository from '../../packages/shared/src/repositories/ProgressRepository'

export default function BookListItem({ book = {}, variant = 'large' }) {
  const [percent, setPercent] = useState(book.progressPercent || 0)
  const [coverUrl, setCoverUrl] = useState(null)
  const [prevBlobUrl, setPrevBlobUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      try {
        // fetch cover or file URL
        const url = await BookRepository.getFileUrlForBook(book)
        if (mounted && url) {
          // revoke previous blob url if necessary
          if (prevBlobUrl && prevBlobUrl !== url) {
            try { URL.revokeObjectURL(prevBlobUrl) } catch (e) {}
            setPrevBlobUrl(null)
          }
          setCoverUrl(url)
          if (url && url.startsWith('blob:')) setPrevBlobUrl(url)
        }

        // fetch progress if available
        if (book.ownerId && book.id) {
          const p = await ProgressRepository.getProgress(book.ownerId, book.id)
          if (mounted && p && p.progressPercent != null) setPercent(p.progressPercent)
        }
      } catch (e) {
        console.error('Error loading book assets', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
      if (prevBlobUrl) {
        try { URL.revokeObjectURL(prevBlobUrl) } catch (e) {}
      }
    }
  }, [book])

  async function handleDownload() {
    try {
      setLoading(true)
      await BookRepository.downloadBookFile(book, { fileName: `${book.title || 'book'}.pdf` })
    } catch (e) {
      console.error('Download failed', e)
      alert('Download failed: ' + (e.message || e))
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'small') {
    return (
      <article className="group relative flex flex-col bg-surface rounded-xl border-2 border-on-surface overflow-hidden hover:shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] hover:-translate-y-1 transition-all duration-200 cursor-pointer w-40 flex-shrink-0">
        <div className="relative aspect-[2/3] w-full bg-surface-container-high border-b-2 border-on-surface overflow-hidden">
          {coverUrl ? <img src={coverUrl} alt="cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full bg-surface flex items-center justify-center"><span className="material-symbols-outlined text-3xl text-on-surface-variant">menu_book</span></div>}

          {percent >= 100 ? (
            <div className="absolute top-2 right-2 bg-surface border-2 border-on-surface rounded-full w-8 h-8 flex items-center justify-center z-10 shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: `'FILL' 1` }}>check_circle</span>
            </div>
          ) : null}
        </div>

        <div className="p-3 flex flex-col flex-1 bg-surface">
          <div className="text-sm font-semibold text-on-surface truncate"><BookTitle>{book.title || 'Untitled'}</BookTitle></div>
          <div className="text-xs text-on-surface-variant">{book.author || 'Unknown'}</div>
        </div>

        <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300" style={{ width: `${percent}%` }} />
      </article>
    )
  }

  return (
    <li className="flex gap-4 items-start p-5 rounded-xl border-2 border-ink-black bg-surface-container shadow-[0_10px_0_rgba(0,0,0,0.06)]">
      <div className="w-36 h-48 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden" aria-hidden>
        {coverUrl ? (
          <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
        ) : null}
      </div>

      <div className="flex-1">
        <h3 className="text-xl"><BookTitle>{book.title || 'Untitled'}</BookTitle></h3>
        <p className="text-sm text-gray-500 mt-1">{book.author || 'Unknown author'}</p>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <i style={{ width: `${percent}%` }} className="block h-full bg-gradient-to-r from-emerald-200 to-emerald-300" />
            </div>
            <div className="text-sm text-gray-600 mt-1">{percent}% read</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold border-2 border-ink-black"
              onClick={() => { /* open reader - placeholder */ window.alert('Open reader for ' + (book.title || 'book')) }}
            >
              Read
            </button>

            <button
              className="px-3 py-2 rounded-lg bg-surface-container text-ink-black font-bold border-2 border-ink-black"
              onClick={handleDownload}
              disabled={loading}
            >
              {loading ? '...' : 'Download'}
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}
