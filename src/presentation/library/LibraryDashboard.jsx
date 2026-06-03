import React from 'react'

function Topbar() {
  return (
    <header className="bg-surface flex justify-between items-center w-full px-section-gap sticky top-0 z-30 h-20 border-b-2 border-on-surface">
      <div className="relative w-96 group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none group-focus-within:text-primary transition-colors">search</span>
        <input className="w-full bg-surface-container-low border-2 border-on-surface rounded-full py-2.5 pl-12 pr-4 font-body-ui text-body-ui text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-0 transition-colors shadow-sm" placeholder="Search library, authors, tags..." type="text" />
      </div>

      <div className="flex items-center gap-4">
        <button aria-label="notifications" className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button aria-label="cloud_upload" className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined">cloud_upload</span>
        </button>
        <button className="bg-primary text-on-primary font-label-bold text-label-bold px-6 py-2.5 rounded-full border-2 border-on-surface hover:shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add
        </button>
      </div>
    </header>
  )
}

function BookCard({ book }) {
  return (
    <article className="group relative flex flex-col bg-surface rounded-xl border-2 border-on-surface overflow-hidden hover:shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] hover:-translate-y-1 transition-all duration-200 cursor-pointer">
      <div className="relative aspect-[2/3] w-full bg-surface-container-high border-b-2 border-on-surface overflow-hidden">
        {book.cover ? (
          <img alt="Book Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={book.cover} />
        ) : (
          <div className="text-center p-4">
            <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">menu_book</span>
            <p className="font-label-bold text-sm text-on-surface-variant">Cover Preview</p>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 bg-surface">
        <h4 className="font-body-reading font-semibold text-on-surface text-[16px] leading-snug line-clamp-2 mb-1">{book.title}</h4>
        <p className="font-body-ui text-sm text-on-surface-variant line-clamp-1 mb-3">{book.author}</p>
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-1">
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Progress</span>
            <span className="font-label-bold text-label-sm text-on-surface">{book.progress}%</span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300" style={{ width: `${book.progress}%` }} />
    </article>
  )
}

export default function LibraryDashboard() {
  const books = [
    { id: 1, title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', progress: 32, cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArHW218F8WJpdCaIB8PpyB8TPcoUSEvuUJI2FUiBbOIQiuCjclLNAdHYIf_ORMzjqZq5dKJxgLBJGW_lQ8A2ca52KJZeZo8O9DzzYBI7dB9f1cYkdGOyfNn1nxKjRsIQRzDyKNNL5ISTjlHvtMdz9pzO2ufnO90G8K9JOkIDLVQaHtL-ouNaZRlo50Mu6twIQ-3v0c7pssdeLgPsuuIkNAfwDTxiudvPSeg0PpZ7BQELepAThsGUNliTJf-1sEftbJ8-evILOFmuDB' },
    { id: 2, title: 'Meditations', author: 'Marcus Aurelius', progress: 100, cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpUjZ6I31T3MWuW8B0MiBu3yuxxvlY7ObWa52flj2ziIPFyeoZU12DRcSRD1RPVHbAc-T-QwD4MIpikPlP38rtXsWx8525Oazf6cCEX9NlNC-DEv4SKx6ugG3bncwK_sXn2mFxJYkY6B7fKEO8441Vczc0tj-fDl3w7RuynZyxn7nZRW0-naITSfaTYqtt20PnWc5cozA56wVlKP25wihl97EQjbS_rF9fJ0f7OwV8i7K262AX4ticXclv5H17PC32evMRxig-JACa' },
    { id: 3, title: 'Design of Everyday Things', author: 'Don Norman', progress: 12 },
    { id: 4, title: 'Typography Handbook', author: 'Ellen Lupton', progress: 89, cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIcj3l-DzFjGlHqC4IOUSwKLouvD9jRptEG9Er-4GUzh1npWDKluf9TQR4y3gD0YHeC5tOuZs1zJRYjzNa5stDR0FGsWRi_ARmirGgJB8cYRHoSYt3krWvNoAtjwxN7Tt57E2D6Pjga4MBHNKVieuYvWrB7X5DejxFRTrQEBzInmo9NJdoF3Rz8kMY3CufVW5uHfIcPiC9Psv_rhtnabz-1c7rDOKDPhmbMtvuWM2ugg9eI9FM9p7PdMuxUgObnFJ82_kJ6IHaHbxw' },
    { id: 5, title: 'Invisible Cities', author: 'Italo Calvino', progress: 0, cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1AP4wymJfXC7RyfWKbnE94FvvG9MXWvPGanRzBvNViPGZW5aPZEow8KH8Q5o0E0F1LDe5e1nmOhNvHvK5j18B0DhSjp_SeG0pULrdp-rGzgsVzRt6QS0d4parqQNBGiudnnQvztRHTukNCX6KS-q3nNBruBFo4cnRYjC1YEjPLE8k0WM_aQBHACpvpslhXkSEr7-I0YdQVZtGYncQN90pfEQtrk7ZkqUPoEA4SCrJz3jtjA3ADBvPAskQZ370LZEXQe-eqj0vjFcC' },
  ]

  const featured = books[0]
  const stats = { hoursRead: 14, booksFinished: 3, streak: 12 }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Topbar />
        <main className="flex-1 p-section-gap flex flex-col gap-section-gap overflow-x-hidden">
        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between">
            <h2 className="font-headline-md text-headline-md text-on-surface">Recently Opened</h2>
            <a className="font-label-bold text-label-bold text-primary hover:underline underline-offset-4" href="#">View History</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-md">
            <div className="col-span-1 md:col-span-2 bg-surface border-2 border-on-surface rounded-[24px] p-6 flex flex-col sm:flex-row gap-8 items-center sm:items-stretch group">
              <div className="w-32 sm:w-48 shrink-0 aspect-[2/3] rounded-lg border-2 border-on-surface overflow-hidden shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] relative">
                <img alt="Book Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={featured.cover} />
              </div>
              <div className="flex flex-col justify-center flex-1 w-full text-center sm:text-left">
                <span className="inline-block px-3 py-1 bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm rounded-full border border-on-surface w-fit mb-4 mx-auto sm:mx-0">Reading Now</span>
                <h3 className="font-body-reading text-[28px] leading-[36px] font-bold text-on-surface mb-2">{featured.title}</h3>
                <p className="font-body-ui text-body-ui text-on-surface-variant mb-6">{featured.author}</p>
                <div className="mt-auto space-y-2">
                  <div className="flex justify-between font-label-bold text-label-bold text-on-surface text-sm">
                    <span>Chapter {featured.currentChapter || 4}</span>
                    <span>{featured.progress || 0}%</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container-high rounded-full border-2 border-on-surface overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${featured.progress}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1 bg-surface-container-low border-2 border-on-surface rounded-[24px] p-6 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-fixed rounded-full opacity-50 blur-2xl" />
              <div>
                <div className="w-12 h-12 bg-primary text-on-primary rounded-xl border-2 border-on-surface flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)]">
                  <span className="material-symbols-outlined">insights</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Reading Stats</h3>
                <p className="font-body-ui text-body-ui text-on-surface-variant">You're on a {stats.streak}-day streak!</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-surface border-2 border-on-surface rounded-xl p-3 text-center">
                  <span className="block font-display-lg text-[24px] leading-none text-on-surface mb-1">{stats.hoursRead}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Hours read</span>
                </div>
                <div className="bg-surface border-2 border-on-surface rounded-xl p-3 text-center">
                  <span className="block font-display-lg text-[24px] leading-none text-on-surface mb-1">{stats.booksFinished}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Books finished</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6 mt-4">
          <div className="flex items-end justify-between border-b-2 border-on-surface pb-4">
            <div className="flex items-center gap-4">
              <h2 className="font-headline-md text-headline-md text-on-surface">Your Collection</h2>
              <span className="px-2 py-1 bg-surface border-2 border-on-surface rounded-md font-label-sm text-label-sm text-on-surface-variant">{books.length} Books</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-surface rounded-full border-2 border-on-surface">Recent</button>
              <button className="px-4 py-2 bg-surface rounded-full border-2 border-on-surface">Filter</button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-gutter-md">
            {books.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      </main>
    </div>
    
  )
}
