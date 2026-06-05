import useLibrary from '../../application/useLibrary'

import Topbar from '../atoms/Topbar'

import Sidebar from '../organisms/Sidebar'
import RecentlyOpenedSection from '../organisms/RecentlyOpenedSection'
import CollectionGrid from '../organisms/CollectionGrid'

import CollectionHeader from '../molecules/CollectionHeader'

import { navigate } from '../navigate'

export default function LibraryDashboard() {
  const {
    books = [],
    series = [],
    loading
  } = useLibrary()

  const libraryItems = [
  ...books.map(book => ({
    type: 'book',
    ...book
  })),
  ...series.map(series => ({
    type: 'series',
    ...series
  }))
]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading library...
      </div>
    )
  }

  const featuredItem =
    libraryItems.find(
      book =>
        book.progress > 0 &&
        book.progress < 100
    ) || libraryItems[0]

  console.log('books', books)
  console.log('featuredItem', featuredItem)

  function handleSelectLibraryItem(item, type) {
    console.log('Selected item:', item, 'of type:', type)
    if (type === 'book') {
      navigate(`/reader/book/${item.id}`)
    } else if (type === 'series') {
      navigate(`/reader/series/${item.id}`)
    }
  }

  return (
  <div className="min-h-screen bg-background flex flex-col">
      <Topbar />

      <main className="flex-1 p-section-gap flex flex-col gap-section-gap overflow-x-hidden">
        <RecentlyOpenedSection
          featuredItem={featuredItem}
        />

        <section className="flex flex-col gap-6">
          <CollectionHeader
            totalBooks={libraryItems.length}
          />

          <CollectionGrid
            books={books}
            series={series}
            onSelectLibraryItem={(item, type) => handleSelectLibraryItem(item, type)}
          />
        </section>
      </main>
    </div>
)}