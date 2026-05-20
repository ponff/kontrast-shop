// src/components/ui/textarea.jsx
import * as React from 'react'

import { cn } from '@/lib/utils'

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[100px] w-full rounded-md border-2 border-[#C6A884] bg-white px-3 py-2 text-base font-bengaly text-black ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-[#4A382B] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
