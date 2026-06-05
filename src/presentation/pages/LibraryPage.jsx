import React from 'react'
import LibraryDashboard from '../organisms/LibraryDashboard'

export default function LibraryPage({userId}) {
  return (
    <main className="p-section-gap w-full">
      <LibraryDashboard userId={userId}/>
    </main>
  )
}
