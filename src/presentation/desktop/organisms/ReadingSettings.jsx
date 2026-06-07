import React from 'react'

export default function ReadingSettings({ readingFont, fontSize, lineSpacing, setLineSpacing, readingWidth, setReadingWidth }) {
  return (
    <section className="bg-surface rounded-2xl border-2 border-on-surface p-card-padding shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2 border-b-2 border-on-surface pb-4">
        <span className="material-symbols-outlined text-primary">menu_book</span>
        Reading
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border-2 border-on-surface rounded-xl p-6">
          <div className={`prose`} style={{fontFamily: readingFont==='literata' ? 'Literata, Georgia, serif' : 'Plus Jakarta Sans, system-ui', fontSize}}>
            <h3 className="font-bold">Live Preview</h3>
            <p>This is a quick preview of how your reading settings will look. Font size, line height and font family are applied here.</p>
            <p style={{lineHeight: lineSpacing==='tight' ? '1.1' : lineSpacing==='cozy' ? '1.6' : '1.9'}}>It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-surface-container-high border-2 border-on-surface rounded-xl p-4">
            <label className="block font-label-sm mb-2">Line Spacing</label>
            <div className="flex gap-2">
              <button onClick={()=>setLineSpacing('tight')} className={`px-3 py-2 rounded-md border ${lineSpacing==='tight'?'border-on-surface bg-primary-container text-on-primary-container':'border-transparent bg-white'}`}>Tight</button>
              <button onClick={()=>setLineSpacing('cozy')} className={`px-3 py-2 rounded-md border ${lineSpacing==='cozy'?'border-on-surface bg-primary-container text-on-primary-container':'border-transparent bg-white'}`}>Cozy</button>
              <button onClick={()=>setLineSpacing('loose')} className={`px-3 py-2 rounded-md border ${lineSpacing==='loose'?'border-on-surface bg-primary-container text-on-primary-container':'border-transparent bg-white'}`}>Loose</button>
            </div>
          </div>

          <div className="bg-surface-container-high border-2 border-on-surface rounded-xl p-4">
            <label className="block font-label-sm mb-2">Reading Well Width</label>
            <div className="flex flex-col gap-2">
              <button onClick={()=>setReadingWidth('narrow')} className={`text-left px-3 py-2 rounded-md border ${readingWidth==='narrow'?'border-on-surface bg-primary-container text-on-primary-container':'border-transparent bg-white'}`}>Narrow</button>
              <button onClick={()=>setReadingWidth('medium')} className={`text-left px-3 py-2 rounded-md border ${readingWidth==='medium'?'border-on-surface bg-primary-container text-on-primary-container':'border-transparent bg-white'}`}>Medium (Optimal)</button>
              <button onClick={()=>setReadingWidth('wide')} className={`text-left px-3 py-2 rounded-md border ${readingWidth==='wide'?'border-on-surface bg-primary-container text-on-primary-container':'border-transparent bg-white'}`}>Wide</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
