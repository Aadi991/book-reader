import FeaturedBookCard from '../molecules/FeaturedBookCard'
import ReadingStatsCard from '../atoms/ReadingStatsCard'
import useRecentlyOpened from '../../application/useRecentlyOpened'

export default function RecentlyOpenedSection({
  userId
}) {
  const {
    featuredItem,
    loading
  } = useRecentlyOpened(userId)

  if (loading) {
    return <div>Loading...</div>
  }

  if (!featuredItem) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[48px] font-bold">
          Recently Opened
        </h2>
      </div>

      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          gap-4
          min-h-[320px]
          rounded-3xl
          border
          border-neutral-200
          bg-white
          text-center
          p-10
        "
      >
        <div className="text-6xl">📚</div>

        <h3 className="text-2xl font-semibold">
          You haven't read anything yet
        </h3>

        <p className="text-neutral-500 max-w-md">
          Start reading your first book and it will appear here so
          you can quickly jump back in where you left off.
        </p>

        <button
          className="
            mt-2
            px-6
            py-3
            rounded-xl
            bg-primary
            text-white
            font-medium
          "
        >
          Get to Reading
        </button>
      </div>
    </section>
  )
}

  return (
    <section className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[48px] font-bold">
          Recently Opened
        </h2>

        <button className="text-primary font-medium">
          View History
        </button>
      </div>

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-[2.2fr_1fr]
          gap-6
          items-stretch
        "
      >
        <FeaturedBookCard
          book={featuredItem}
        />

        <ReadingStatsCard
          streak={12}
          hoursRead={14}
          booksFinished={3}
        />
      </div>
    </section>
  )
}