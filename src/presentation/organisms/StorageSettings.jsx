import React from 'react'

export default function StorageSettings() {
  return (
    <section className="bg-surface rounded-2xl border-2 border-on-surface p-card-padding shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2 border-b-2 border-on-surface pb-4">
        <span className="material-symbols-outlined text-primary">sd_storage</span>
        Storage Management
      </h2>

      <div className="space-y-6">
        <div className="bg-surface-container-high rounded-xl p-6 border-2 border-on-surface flex items-center justify-between">
          <div>
            <div className="text-label-sm text-label-sm font-label-sm">Device Storage</div>
            <div className="font-display-lg text-[28px] font-bold mt-2">45 GB used of 128 GB</div>
          </div>
          <div className="text-2xl font-bold text-primary">35%</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border-2 border-on-surface p-4">Downloaded books list (static)</div>
          <div className="bg-white rounded-xl border-2 border-on-surface p-4">Cache controls and network preferences</div>
        </div>
      </div>
    </section>
  )
}
