import React, { useState, useEffect } from 'react'
import StorageService from '../../../data/StorageService'

function VolumeItem({ volume, selectedVolume, setSelectedVolume }) {
  const [coverUrl, setCoverUrl] = useState(volume.coverUrl || null)

  useEffect(() => {
    // If we already have a cover URL, use it
    if (volume.coverUrl) {
      setCoverUrl(volume.coverUrl)
      return
    }

    if (!volume.coverPath) return

    let active = true
    async function loadCover() {
      try {
        const url = await StorageService.getCoverUrl(volume.coverPath)
        if (active) {
          setCoverUrl(url)
        }
      } catch (err) {
        console.error('[VolumeSidebar] Failed to load volume cover:', err)
      }
    }
    loadCover()

    return () => {
      active = false
    }
  }, [volume])

  return (
    <button
      onClick={() => setSelectedVolume(volume)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: 12,
        border: 'none',
        borderBottom: '1px solid #eee',
        cursor: 'pointer',
        background: selectedVolume?.id === volume.id ? '#f5f5f5' : '#fff',
        textAlign: 'left'
      }}
    >
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={volume.title}
          style={{
            width: 60,
            height: 90,
            objectFit: 'cover',
            borderRadius: 6,
            flexShrink: 0
          }}
        />
      ) : (
        <div
          style={{
            width: 60,
            height: 90,
            background: '#eee',
            borderRadius: 6,
            flexShrink: 0
          }}
        />
      )}

      <div>
        <div style={{ fontWeight: 600 }}>
          Volume {volume.volumeNo}
        </div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
          {volume.title}
        </div>
      </div>
    </button>
  )
}

export default function VolumeSidebar({ sortedVolumes, series, selectedVolume, setSelectedVolume }) {
  return (
    <aside
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 320,
        background: '#fff',
        overflowY: 'auto',
        borderRight: '1px solid #ddd',
        zIndex: 1000,
        boxShadow: '0 0 20px rgba(0,0,0,.15)'
      }}
    >
      <div
        style={{
          padding: 16,
          borderBottom: '1px solid #ddd',
          fontWeight: 600,
          fontSize: 18
        }}
      >
        {series.title}
      </div>

      {sortedVolumes.map(volume => (
        <VolumeItem
          key={volume.id}
          volume={volume}
          selectedVolume={selectedVolume}
          setSelectedVolume={setSelectedVolume}
        />
      ))}
    </aside>
  )
}