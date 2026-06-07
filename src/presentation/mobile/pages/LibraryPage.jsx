import React from 'react'
import useLibrary from '../../../application/useLibrary'
import useRecentlyOpened from '../../../application/useRecentlyOpened'
import { navigate } from '../../navigate'
import CollectionGrid from '../../desktop/organisms/CollectionGrid'
import FeaturedBookCard from '../../desktop/molecules/FeaturedBookCard'

export default function LibraryPage({userId}) {
  const { books = [], series = [], loading } = useLibrary(userId)
  const { featuredItem, loading: historyLoading } = useRecentlyOpened(userId)

  function handleSelectLibraryItem(item, type) {
    if (type === 'book') navigate(`/reader/book/${item.id}`)
    else if (type === 'series') navigate(`/reader/series/${item.id}`)
  }

  if (loading || historyLoading) {
    return <div className="p-section-gap text-center">Loading library...</div>
  }

  return (
    <main className="flex-1 p-section-gap flex flex-col gap-section-gap pb-20 w-full overflow-x-hidden">
      
      <div className="flex flex-col gap-4">
        <h2 className="text-[32px] font-bold">Library</h2>
        {featuredItem && (
          <div className="mb-2">
            <h3 className="text-lg font-semibold mb-3">Continue Reading</h3>
            <FeaturedBookCard book={featuredItem} />
          </div>
        )}
      </div>

      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-end border-b border-[var(--border)] pb-2">
          <h2 className="text-[24px] font-bold">Your Collection</h2>
          <span className="text-sm font-medium px-3 py-1 border border-[var(--border)] rounded-full">{books.length + series.length} Books</span>
        </div>

        <CollectionGrid
          books={books}
          series={series}
          onSelectLibraryItem={handleSelectLibraryItem}
        />
      </section>
    </main>
  )
}
