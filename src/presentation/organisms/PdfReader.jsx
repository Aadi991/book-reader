import { usePdfReader } from '../../application/usePdfReader'
import { navigate } from '../navigate'

export default function PdfReader({ url, title, onPageChange, initialPage }) {
  const {
    pdf,
    containerRef,
    pagesRef,
    pageInput,
    setPageInput,
    jumpToPage
  } = usePdfReader({ url, onPageChange, initialPage })

  if (!url) return <div>No PDF selected</div>

  return (
    <div className="flex flex-col h-screen">
      <header className="h-[68px] flex items-center px-6 border-b">

  {/* HOME BUTTON */}
  <button
    onClick={() => navigate('/')}
    style={{
      padding: '8px 14px',
      borderRadius: 10,
      border: '1px solid #ddd',
      background: '#fff',
      cursor: 'pointer',
      fontWeight: 600,
      boxShadow: '0 4px 12px rgba(0,0,0,.1)'
    }}
  >
    🏠 Home
  </button>

  <h1 className="truncate ml-4">{title}</h1>

  <div className="ml-auto flex gap-2">
    <span>Page</span>

    <input
      type="number"
      value={pageInput}
      min={1}
      max={pdf?.numPages || 1}
      onChange={e => setPageInput(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          jumpToPage(Number(pageInput))
        }
      }}
      className="w-14 text-center"
    />

    <span>/ {pdf?.numPages || 0}</span>
  </div>
</header>

      <main ref={containerRef} className="flex-1 overflow-y-auto px-6 py-8">
        <div ref={pagesRef} className="flex flex-col items-center" />
      </main>
    </div>
  )
}