export default function SeriesCard({ series, onClick }) {
  return (
    <article onClick={() => onClick?.(series)} className="bg-surface rounded-xl border-2 border-on-surface overflow-hidden cursor-pointer shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all duration-150">
      <div className="aspect-[2/3] overflow-hidden">

      <img
        src={series.coverUrl}
        alt={series.name}
        className="w-full h-full object-cover"
        onLoad={() => console.log('IMAGE LOADED')}
        onError={(e) => {
          console.error('IMAGE FAILED:', e.target.src)
        }}
      />
      </div>

      <div className="p-4">
        <h4 className="font-semibold">
          {series.name}
        </h4>

        <p className="text-sm text-on-surface-variant">
          {series.volumeCount} volumes
        </p>
      </div>
    </article>
  )
}