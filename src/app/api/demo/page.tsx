'use client'

import { Button } from '@/components/ui/button'
import React, { useState } from 'react'

export default function Page() {
  const [loading, setLoading] = useState(false);
  const handleBlocking = async() => {
    setLoading(true);
    await fetch('/api/demo/blocking', { method: 'POST' })
    setLoading(false);
  }
  return (
    <div className='h-screen'>
        <Button onClick={handleBlocking}>{loading ? "Loading..." : "Block"}</Button>
    </div>
  )
}
