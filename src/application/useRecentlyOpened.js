// hooks/useRecentlyOpened.js

import { useEffect, useState } from 'react'
import ProgressRepository from '../data/ProgressRepository'

export default function useRecentlyOpened(userId) {
  const [featuredItem, setFeaturedItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function load() {
      try {
        const progressList = await ProgressRepository.listForUser(userId)

        const userProgress = progressList
          .filter(item => item.userId === userId)
          .sort(
            (a, b) =>
              new Date(b.lastOpenedAt || 0) -
              new Date(a.lastOpenedAt || 0)
          )

        if (userProgress.length > 0) {
          setFeaturedItem(userProgress[0])
        }
      } catch (error) {
        console.error('Failed to load recently opened book', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [userId])

  return {
    featuredItem,
    loading
  }
}