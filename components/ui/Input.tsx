'use client'

import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="font-ui text-label text-slate"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={[
            'rounded-input border bg-ivory px-4 font-ui text-body text-navy',
            'min-h-[44px] w-full outline-none transition-all duration-button',
            'placeholder:text-slate/50',
            error
              ? 'border-terracotta focus:border-terracotta focus:ring-1 focus:ring-terracotta/30'
              : 'border-navy/15 focus:border-brass focus:ring-1 focus:ring-brass/20',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <p className="font-ui text-label text-terracotta" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
