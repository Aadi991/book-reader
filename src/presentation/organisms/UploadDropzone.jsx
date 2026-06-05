export default function UploadDropzone({ onFileSelect }) {
return (<label className="block mt-8 cursor-pointer">
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={e =>
              onFileSelect(e.target.files?.[0] || null)
            }
          />

          <div className="h-[260px] rounded-[32px] border-[4px] border-dashed border-black bg-[#e7e3d1] flex flex-col justify-center items-center">
            <div className="w-20 h-20 rounded-full border-2 border-black bg-[#d5efe6] flex items-center justify-center text-3xl">
              📄
            </div>

            <h3 className="mt-5 text-3xl font-bold">
              Drop your PDF here
            </h3>

            <p className="text-gray-600">
              or click to browse your local storage
            </p>
          </div>
        </label>)
}