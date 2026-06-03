import React from 'react'
import { navigate } from '../../navigate'

export default function UploadSelect() {
  function goStandalone() {
    navigate('/upload')
  }

  function goSeries() {
    navigate('/upload/series')
  }

  return (
    <main className="flex-1 flex flex-col p-margin-mobile md:p-section-gap relative">
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full py-12 md:py-20">
        <div className="w-full mb-12 flex flex-col items-center justify-center text-center">
          <h1 className="font-plus font-bold text-2xl md:text-4xl text-ink-black mb-3">Add to Library</h1>
          <p className="font-plus text-base md:text-lg text-on-surface-variant mx-auto max-w-2xl text-center w-full">Choose how you want to organize your new addition.</p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-black z-10 transform translate-x-1 translate-y-1.5 pointer-events-none transition-all" />
            <button
              type="button"
              onClick={goStandalone}
              className="relative z-20 group text-left bg-white rounded-xl p-8 border-2 border-black/10 hover:shadow-none transition-all hover:-translate-x-1 hover:-translate-y-1.5 flex flex-col h-full items-start overflow-hidden focus:outline-none focus:ring-4 focus:ring-primary-container ring-offset-2"
            >
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#d1f5e8] rounded-full opacity-50 blur-3xl z-0 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-[#d1f5e8] border-2 border-black/10 flex items-center justify-center mb-8 shrink-0 relative z-30 group-hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined text-[#44655b] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>book</span>
              </div>
              <h2 className="font-plus text-2xl md:text-3xl text-ink-black mb-4 relative z-30">Standalone Book</h2>
              <p className="font-plus text-base md:text-lg text-on-surface-variant relative z-30">
                Add a single PDF or EPUB file. Ideal for novels, textbooks, or independent documents that don't belong to a larger collection.
              </p>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-black z-10 transform translate-x-1 translate-y-1.5 pointer-events-none transition-all" />
            <button
              type="button"
              onClick={goSeries}
              className="relative z-20 group text-left bg-white rounded-xl p-8 border-2 border-black/10 hover:shadow-none transition-all hover:-translate-x-1 hover:-translate-y-1.5 flex flex-col h-full items-start overflow-hidden focus:outline-none focus:ring-4 focus:ring-secondary-container ring-offset-2"
            >
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#e5e0cc] rounded-full opacity-50 blur-3xl z-0 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-[#e5e0cc] border-2 border-black/10 flex items-center justify-center mb-8 shrink-0 relative z-30 group-hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined text-[#625f4f] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>library_books</span>
              </div>
              <h2 className="font-plus text-2xl md:text-3xl text-ink-black mb-4 relative z-30">Book Series</h2>
              <p className="font-plus text-base md:text-lg text-on-surface-variant relative z-30">
                Create a new folder to group multiple related files. Perfect for trilogies, research papers, or comic book collections.
              </p>
            </button>
          </div>
        </div>

        <div className="w-full flex justify-center pb-8">
          <button type="button" className="font-label-bold text-label-bold text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-2 group" onClick={() => navigate('/library')}>
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Cancel and go back
          </button>
        </div>
      </div>
    </main>
  )
}
