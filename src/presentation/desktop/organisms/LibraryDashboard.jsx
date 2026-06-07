import useLibrary from '../../../application/useLibrary'
import useRecentlyOpened from '../../../application/useRecentlyOpened'
import TopBar from '../atoms/TopBar'
import RecentlyOpenedSection from './RecentlyOpenedSection'
import CollectionHeader from '../molecules/CollectionHeader'
import CollectionGrid from './CollectionGrid'
import { navigate } from '../../navigate'

export default function LibraryDashboard({userId}) {

  const {
    books = [],
    series = [],
    loading
  } = useLibrary(userId)

  const {
    featuredItem,
    loading: historyLoading
  } = useRecentlyOpened(userId)


console.log(
  '[dashboard featuredItem]',
  featuredItem
)

  function handleSelectLibraryItem(item, type) {
    console.log('Selected item:', item, 'type:', type)

    if (type === 'book') {
      navigate(`/reader/book/${item.id}`)
    } else if (type === 'series') {
      navigate(`/reader/series/${item.id}`)
    }
  }

  if (loading || historyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading library...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />

      <main className="flex-1 p-section-gap flex flex-col gap-section-gap overflow-x-hidden">
        <RecentlyOpenedSection
          featuredItem={featuredItem}
          loading={historyLoading}
        />

        <section className="flex flex-col gap-6">
          <CollectionHeader totalBooks={books.length + series.length} />

          <CollectionGrid
            books={books}
            series={series}
            onSelectLibraryItem={handleSelectLibraryItem}
          />
        </section>
      </main>
    </div>
  )
}