import * as React from 'react';

interface BetterCardProps {
  title: string
  description?: string
  icon?: React.ReactNode
  href?: string
  disabled?: boolean
  badge?: string
  className?: string
  children?: React.ReactNode
}

export function BetterCard({
  title,
  description,
  icon,
  href,
  disabled = false,
  badge,
  className = "",
  children,
}: BetterCardProps) {
  const isClickable = !!href && !disabled

  const Wrapper = isClickable ? "a" : "div"

  return (
    <Wrapper
      {...(isClickable ? { href } : {})}
      className={`
        group relative block rounded-2xl border border-neutral-200 
        bg-gradient-to-b from-white to-neutral-50
        dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950
        p-6 transition-all duration-200
        ${isClickable ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer" : ""}
        ${disabled ? "opacity-60 pointer-events-none cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {/* Badge */}
      {(badge || disabled) && (
        <div className="
          absolute top-4 right-4
          text-[10px] font-semibold
          bg-amber-500/10 text-amber-500
          px-2 py-1 rounded-full
        ">
          {badge || "Coming Soon"}
        </div>
      )}

      {/* Icon */}
      {icon && (
        <div className="mb-4 text-2xl">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-base font-semibold tracking-tight">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      )}

      {children}
    </Wrapper>
  )
}
