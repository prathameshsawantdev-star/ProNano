'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@clerk/nextjs';
import React, { useState } from 'react'
import * as Sentry from "@sentry/nextjs";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const { userId } = useAuth();

  const handleBlocking = async() => {
    setLoading(true);
    Sentry.logger.info("User initiated blocking request", { userId });
    await fetch('/api/demo/blocking', { method: 'POST' })
    setLoading(false);
  }
 
  const handleClientError = () => {
    Sentry.logger.warn("User got a client error", { userId });
    throw new Error("Client error: Something went wrong in the browser!")
  }

  const handleApiError = () => {
    Sentry.logger.error("User triggered API error", { userId });
    fetch('/api/demo/error', { method: 'POST' })
  }

  const handleInngestError = () => {
    Sentry.logger.fatal("User triggered Inngest function error", { userId });
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
