'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// Stub for CheckboxPrimitive when Radix is not available
const CheckboxRoot = React.forwardRef<HTMLButtonElement, any>(({ className, ...props }, ref) => (
  <button ref={ref} className={className} {...props} />
))
CheckboxRoot.displayName = "CheckboxRoot"

const CheckboxIndicator = React.forwardRef<HTMLSpanElement, any>(({ className, ...props }, ref) => (
  <span ref={ref} className={className} {...props} />
))
CheckboxIndicator.displayName = "CheckboxIndicator"

const CheckboxPrimitive = {
  Root: CheckboxRoot,
  Indicator: CheckboxIndicator
}

const Checkbox: React.FC<
  {
    ref?: React.Ref<HTMLButtonElement>
  } & React.ComponentProps<typeof CheckboxPrimitive.Root>
> = ({ className, ref, ...props }) => (
  <CheckboxPrimitive.Root
    className={cn(
      'peer h-4 w-4 shrink-0 rounded border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className,
    )}
    ref={ref}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
)

export { Checkbox }
