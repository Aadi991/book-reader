import React from 'react'

export default function AppearanceSettings({ darkMode, setDarkMode, accent, setAccent, readingFont, setReadingFont, fontSize, setFontSize }) {
  return (
    <section className="bg-surface rounded-2xl border-2 border-on-surface p-card-padding shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2 border-b-2 border-on-surface pb-4">
        <span className="material-symbols-outlined text-primary">palette</span>
        Appearance
      </h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-label-bold text-label-bold text-on-surface">Dark Mode</h3>
            <p className="font-body-ui text-body-ui text-on-surface-variant text-sm mt-1">Switch between light and dark themes.</p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
            <div className="w-12 h-6 bg-surface-container-high rounded-full border-2 border-on-surface relative transition-colors" aria-hidden>
              <div className={`absolute top-0 left-0 w-6 h-6 bg-white border-2 border-on-surface rounded-full transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </label>
        </div>

        <div>
          <h3 className="font-label-bold text-label-bold text-on-surface mb-2">Accent Color</h3>
          <div className="flex items-center gap-3">
            <button onClick={() => setAccent('green')} className={`w-8 h-8 rounded-full ${accent==='green' ? 'ring-2 ring-on-surface' : ''}`} style={{background:'#44655b'}} />
            <button onClick={() => setAccent('pink')} className={`w-8 h-8 rounded-full ${accent==='pink' ? 'ring-2 ring-on-surface' : ''}`} style={{background:'#f4a4a4'}} />
            <button onClick={() => setAccent('beige')} className={`w-8 h-8 rounded-full ${accent==='beige' ? 'ring-2 ring-on-surface' : ''}`} style={{background:'#e8e2cf'}} />
            <button onClick={() => setAccent('blue')} className={`w-8 h-8 rounded-full ${accent==='blue' ? 'ring-2 ring-on-surface' : ''}`} style={{background:'#9fb7f2'}} />
          </div>
        </div>

        <div>
          <h3 className="font-label-bold text-label-bold text-on-surface mb-2">Typography</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-container-high border-2 border-on-surface rounded-xl p-4">
              <label className="block font-label-sm mb-2">Reading Font</label>
              <select value={readingFont} onChange={e=>setReadingFont(e.target.value)} className="w-full rounded-md border-2 border-on-surface p-2">
                <option value="literata">Literata (Serif)</option>
                <option value="plus">Plus Jakarta Sans (Sans)</option>
              </select>
            </div>

            <div className="bg-surface-container-high border-2 border-on-surface rounded-xl p-4">
              <label className="block font-label-sm mb-2">Font Size</label>
              <input type="range" min="14" max="22" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} className="w-full slider-thumb" />
              <div className="text-sm text-on-surface-variant mt-2">{fontSize}px</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
