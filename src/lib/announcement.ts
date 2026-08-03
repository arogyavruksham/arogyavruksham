'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface AnnouncementConfig {
  id: string
  text: string
  mobile_text: string
  link_text: string
  link_url: string
  bg_color: string
  text_color: string
  is_active: boolean
}

export const DEFAULT_ANNOUNCEMENT: AnnouncementConfig = {
  id: 'main',
  text: 'Free Shipping Every Day, Every Order Over ₹999',
  mobile_text: 'Free Shipping Every Day Over ₹999',
  link_text: 'Shop Now',
  link_url: '/shop',
  bg_color: '#689f38',
  text_color: '#ffffff',
  is_active: true
}

export function getStoredAnnouncement(): AnnouncementConfig {
  if (typeof window === 'undefined') return DEFAULT_ANNOUNCEMENT
  try {
    const stored = localStorage.getItem('arogyavruksham_announcement')
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_ANNOUNCEMENT, ...parsed }
    }
  } catch (e) {
    console.error('Error reading announcement from localStorage:', e)
  }
  return DEFAULT_ANNOUNCEMENT
}

export function saveStoredAnnouncement(config: AnnouncementConfig) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('arogyavruksham_announcement', JSON.stringify(config))
    window.dispatchEvent(new Event('announcement_updated'))
  } catch (e) {
    console.error('Error saving announcement to localStorage:', e)
  }
}

export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState<AnnouncementConfig>(DEFAULT_ANNOUNCEMENT)

  useEffect(() => {
    // Load from local storage initially for instant display
    function load() {
      const data = getStoredAnnouncement()
      setAnnouncement(data)
    }
    load()

    // Try syncing from Supabase if table and row exist
    async function syncFromSupabase() {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('id', 'main')
          .maybeSingle()

        if (data && !error) {
          const remoteConfig: AnnouncementConfig = {
            id: data.id || 'main',
            text: data.text || DEFAULT_ANNOUNCEMENT.text,
            mobile_text: data.mobile_text || data.text || DEFAULT_ANNOUNCEMENT.mobile_text,
            link_text: data.link_text !== undefined ? data.link_text : DEFAULT_ANNOUNCEMENT.link_text,
            link_url: data.link_url !== undefined ? data.link_url : DEFAULT_ANNOUNCEMENT.link_url,
            bg_color: data.bg_color || DEFAULT_ANNOUNCEMENT.bg_color,
            text_color: data.text_color || DEFAULT_ANNOUNCEMENT.text_color,
            is_active: data.is_active !== undefined ? data.is_active : true,
          }
          saveStoredAnnouncement(remoteConfig)
          setAnnouncement(remoteConfig)
        }
      } catch (e) {
        // Silently ignore if announcements table is not created in DB yet
        console.warn('Could not sync announcement from Supabase, using fallback/local settings:', e)
      }
    }
    syncFromSupabase()

    const handleUpdate = () => load()
    window.addEventListener('announcement_updated', handleUpdate)
    return () => window.removeEventListener('announcement_updated', handleUpdate)
  }, [])

  return announcement
}
