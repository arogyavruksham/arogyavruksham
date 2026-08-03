'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAnnouncement } from '@/lib/announcement'
import { useState, useEffect } from 'react'

export function AnnouncementBar() {
  const announcement = useAnnouncement()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !announcement.is_active) return null

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }} 
      animate={{ height: 'auto', opacity: 1 }} 
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ backgroundColor: announcement.bg_color, color: announcement.text_color }}
      className="text-center py-1.5 px-4 text-[12px] font-bold tracking-wider uppercase overflow-hidden block shadow-2xs transition-colors duration-300"
    >
      <div className="flex items-center justify-center gap-2">
        <span>{announcement.text}</span>
        {announcement.link_text && announcement.link_url && (
          <>
            <span className="opacity-50">|</span>
            <Link href={announcement.link_url} className="underline hover:opacity-80 transition-opacity font-extrabold">
              {announcement.link_text}
            </Link>
          </>
        )}
      </div>
    </motion.div>
  )
}
