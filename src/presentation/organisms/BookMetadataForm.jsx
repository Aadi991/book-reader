export default function BookMetadataForm({ title, author, onTitleChange, onAuthorChange, error }) {

return (<div className="md:col-span-7 flex flex-col gap-6">
            <div>
              <label className="block mb-2 font-semibold">
                Book Title
              </label>

              <input
                value={title}
                onChange={e =>
                  onTitleChange(e.target.value)
                }
                placeholder="Enter title"
                className="
                  w-full
                  rounded-2xl
                  border-2
                  border-black
                  p-5
                  text-2xl
                  font-semibold
                  bg-white
                "
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Author Name
              </label>

              <input
                value={author}
                onChange={e =>
                  onAuthorChange(e.target.value)
                }
                placeholder="Enter author"
                className="
                  w-full
                  rounded-2xl
                  border-2
                  border-black
                  p-5
                  bg-white
                "
              />
            </div>

           

            <div
              className="
                rounded-[28px]
                border-2
                border-black
                bg-[#d5efe6]
                p-6
              "
            >
              <div className="flex gap-4">
                <div className="text-xl">
                  ℹ️
                </div>

                <div>
                  <h4 className="font-bold">
                    Neo-Reader Enhancement
                  </h4>

                  <p className="text-sm text-gray-700 mt-1">
                    We’ve automatically scanned your PDF
                    for chapters. You can edit the table
                    of contents after finalizing the upload.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-600">
                {error}
              </div>
            )}
          </div>)

}