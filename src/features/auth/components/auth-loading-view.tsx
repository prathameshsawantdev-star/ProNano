import { Spinner } from '@/components/ui/spinner'
import React from 'react'

const AuthLoadingView = () => {
  return (
    <div className='h-screen flex items-center justify-center bg-background'>
        <Spinner className='size-6 text-ring' />
    </div>
  )
}

export default AuthLoadingView