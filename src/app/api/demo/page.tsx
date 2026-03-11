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
 
  const handleClientError = () => {
    throw new Error("Client error: Something went wrong in the browser!")
  }

  const handleApiError = () => {
    fetch('/api/demo/error', { method: 'POST' })
  }

  const handleInngestError = () => {
    fetch('/api/demo/inngest-error', { method: 'POST' })
  }

  return (
    <div className='h-screen'>
        <Button onClick={handleBlocking}>{loading ? "Loading..." : "Block"}</Button>
        <Button onClick={handleClientError}>Client Error</Button>
        <Button onClick={handleApiError}>API Error</Button>
        <Button onClick={handleInngestError}>Inngest Error</Button>
    </div>
  )
}
