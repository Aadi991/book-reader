import React from 'react'
import BookUpload from '../molecules/BookUpload'
import BookRepository from '../../packages/shared/src/repositories/BookRepository'

export default function UploadPage({ user }) {
  return (
    <main className="p-6 w-[92vw] max-w-6xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">Upload PDF</h1>
        </div>
      </header>

      <section>
        <div className="max-w-3xl mx-auto">
          <BookUpload user={user} onUploaded={async () => {
            try {
              await BookRepository.listByUser(user.uid)
            } catch (e) { console.error(e) }
          }} />
        </div>
      </section>
    </main>
  )
}
