import ReadingStatsCard from '../atoms/ReadingStatsCard'
import FeaturedBookCard from '../molecules/FeaturedBookCard'

export default function RecentlyOpenedSection({
  featuredItem,
  loading
}) {
  if (loading) return <div>Loading...</div>

  if (!featuredItem) {
    return (
      <section className="flex flex-col gap-6">
        <h2 className="text-[48px] font-bold">
          Recently Opened
        </h2>

        <div className="min-h-[320px] flex items-center justify-center border rounded-3xl">
          No reading history yet
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-[48px] font-bold">
        Recently Opened
      </h2>

      <div className="grid grid-cols-1 xl:grid-cols-[2.2fr_1fr] gap-6">
        <FeaturedBookCard book={featuredItem} />

        <ReadingStatsCard
          streak={12}
          hoursRead={14}
          booksFinished={3}
        />
      </div>
    </section>
  )
}