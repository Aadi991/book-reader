import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../application/AuthProvider'
import AvatarCard from '../molecules/AvatarCard'
import AvatarEditor from '../molecules/AvatarEditor'
import { navigate } from '../navigate'

export default function AccountSettings({ dangerActive }) {
  const { user, signOut } = useAuth()
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user?.photoURL || null)

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch(err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (user && user.photoURL) setAvatarUrl(user.photoURL)
  }, [user])

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <AvatarCard avatarUrl={avatarUrl} name={user?.displayName || 'Alex Reader'} plan={'Free Plan'} onEdit={() => setAvatarOpen(true)} />
        </div>

        <div className="md:col-span-2 bg-surface p-card-padding rounded-xl brutal-border flex flex-col justify-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed-dim rounded-full mix-blend-multiply filter blur-2xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface border-b-2 border-on-surface pb-2 border-dashed">Basic Information</h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="font-label-bold text-label-bold text-on-surface" htmlFor="displayName">Display Name</label>
              <input id="displayName" className="brutal-input p-3 rounded-lg w-full font-body-ui text-body-ui text-on-surface" defaultValue={user?.displayName || 'Alex Reader'} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-bold text-label-bold text-on-surface" htmlFor="emailAddress">Email Address</label>
              <input id="emailAddress" className="brutal-input p-3 rounded-lg w-full font-body-ui text-body-ui text-on-surface" defaultValue={user?.email || 'alex.reader@example.com'} />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button className="px-6 py-2 bg-primary text-on-primary font-label-bold text-label-bold rounded-xl brutal-border brutal-shadow">Save Changes</button>
          </div>
        </div>
      </section>

      <AvatarEditor open={avatarOpen} onClose={() => setAvatarOpen(false)} onUseGoogle={(url)=>{ if (url) setAvatarUrl(url) }} onUpload={(dataUrl)=>{ setAvatarUrl(dataUrl) }} onRemove={()=>{ setAvatarUrl(null) }} />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-surface p-card-padding rounded-xl brutal-border space-y-6 relative">
          <div className="flex items-center gap-2 border-b-2 border-on-surface pb-2 border-dashed">
            <span className="material-symbols-outlined text-primary">security</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Security</h3>
          </div>
          <div className="space-y-6">
            <div className="flex flex-col items-start gap-3">
              <div>
                <p className="font-label-bold text-label-bold text-on-surface">Password</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Last changed 3 months ago</p>
              </div>
              <button className="px-4 py-2 bg-secondary-container text-on-secondary-container font-label-bold text-label-bold rounded-xl brutal-border hover:bg-surface-container-highest transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">key</span>
                Change Password
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl brutal-border">
              <div>
                <p className="font-label-bold text-label-bold text-on-surface">Two-Factor Auth</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Add extra security</p>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                <input id="toggle2fa" checked={true} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-surface border-2 border-on-surface appearance-none cursor-pointer z-10 transition-transform duration-200 ease-in-out" name="toggle" type="checkbox" />
                <label htmlFor="toggle2fa" className="toggle-label block overflow-hidden h-6 rounded-full bg-primary-container border-2 border-on-surface cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface p-card-padding rounded-xl brutal-border space-y-6">
          <div className="flex items-center gap-2 border-b-2 border-on-surface pb-2 border-dashed">
            <span className="material-symbols-outlined text-primary">link</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Linked Accounts</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl brutal-border bg-surface-container-lowest">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-surface rounded-full brutal-border flex items-center justify-center">
                  <span className="font-label-bold text-label-bold">G</span>
                </div>
                <div>
                  <p className="font-label-bold text-label-bold text-on-surface">Google</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Connected</p>
                </div>
              </div>
              <button className="text-error font-label-bold text-label-bold hover:underline">Disconnect</button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl brutal-border bg-surface-container-low border-dashed">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-surface rounded-full brutal-border flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">mail</span>
                </div>
                <div>
                  <p className="font-label-bold text-label-bold text-on-surface">Alternative Email</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Not connected</p>
                </div>
              </div>
              <button className="text-primary font-label-bold text-label-bold hover:underline">Connect</button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 p-card-padding rounded-xl border-2 border-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-[#f4f3ec]">
        <div>
          <h3 className="font-plus font-bold text-xl text-ink-black flex items-center gap-2"><span className="material-symbols-outlined text-[#625f4f]">logout</span>Session</h3>
          <p className="font-plus text-base text-on-surface-variant mt-1 max-w-md">Sign out of your account on this device.</p>
        </div>
        <button onClick={handleLogout} className="px-6 py-3 bg-white text-ink-black font-plus font-bold text-sm rounded-xl border-2 border-black/10 hover:bg-[#f4f3ec] transition-colors whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-none hover:translate-y-0.5">Log Out</button>
      </section>

      <section className={`mt-6 p-card-padding rounded-xl brutal-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${dangerActive ? 'danger-active' : 'bg-error-container'}`}>
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-error-container flex items-center gap-2"><span className="material-symbols-outlined">warning</span>Danger Zone</h3>
          <p className="font-body-ui text-body-ui text-on-error-container mt-1 max-w-md">Once you delete your account, there is no going back. Please be certain.</p>
        </div>
        <button className="px-6 py-3 bg-error text-on-error font-label-bold text-label-bold rounded-xl brutal-border brutal-shadow hover:bg-on-error-container transition-colors whitespace-nowrap">Delete Account</button>
      </section>
    </>
  )
}
