import React, { useRef } from 'react'
import { useAuth } from '../../../application/AuthProvider'

export default function AvatarEditor({ open, onClose, onUseGoogle, onUpload, onRemove }) {
  const fileRef = useRef(null)
  const { user } = useAuth()

  if (!open) return null

  function handleFileChange(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => onUpload(reader.result)
    reader.readAsDataURL(f)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="bg-surface rounded-xl p-6 brutal-border z-10 w-full max-w-md">
        <h3 className="font-label-bold text-label-bold mb-4">Edit Profile Photo</h3>
        <div className="space-y-3">
          <button onClick={() => { onUseGoogle(user?.photoURL); onClose() }} className="w-full px-4 py-2 rounded-md border-2 border-on-surface">Use Google profile photo</button>
          <div className="flex items-center gap-2">
            <input ref={fileRef} onChange={handleFileChange} type="file" accept="image/*" className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-md border-2 border-on-surface">Upload photo</button>
            <button onClick={() => { onRemove(); onClose() }} className="px-4 py-2 rounded-md border-2 border-on-surface text-error">Remove photo</button>
          </div>
          <div className="flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-md">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
