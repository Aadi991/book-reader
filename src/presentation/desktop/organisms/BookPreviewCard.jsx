export default function BookPreviewCard({
  file,
  progress,
  fileSize,
  coverUrl
}) {
  return (
    <div className="md:col-span-5">
      <div
        className="
          rounded-[32px]
          border-2
          border-black
          bg-white
          p-6
          shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
        "
      >
        <div className="aspect-[2/3] rounded-2xl overflow-hidden border-2 border-black bg-slate-100">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt="Book Cover"
              className="w-full h-full object-cover"
            />
          ) : file ? (
            <div className="w-full h-full flex items-center justify-center text-8xl">
              📚
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Preview
            </div>
          )}
        </div>

        {progress > 0 && (
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500"
              style={{
                width: `${progress}%`
              }}
            />
          </div>
        )}

        <div className="mt-5">
          <div className="flex justify-between items-start">
            <p className="font-semibold truncate">
              {file?.name ||
                'No file selected'}
            </p>

            {file && (
              <span className="px-2 py-1 text-xs border rounded bg-green-100">
                UPLOADED
              </span>
            )}
          </div>

          {file && (
            <p className="text-sm text-gray-500 mt-1">
              {fileSize} MB
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            className="
              border-2 border-black
              rounded-xl
              py-3
              font-semibold
            "
          >
            Change Page
          </button>

          <button
            type="button"
            className="
              border-2 border-black
              rounded-xl
              py-3
              font-semibold
            "
          >
            Set Cover
          </button>
        </div>
      </div>
    </div>
  )
}