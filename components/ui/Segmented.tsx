'use client'

type Option<T extends string | number> = { value: T; label: string }

type Props<T extends string | number> = {
  label: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
}

export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: Props<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-ui text-label text-slate">{label}</span>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex gap-1.5 flex-wrap"
      >
        {options.map((opt) => {
          const selected = opt.value === value
          return (
            <button
              key={String(opt.value)}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={[
                'font-ui text-small rounded-button px-4 min-h-[44px] flex-1',
                'transition-all duration-button border',
                selected
                  ? 'bg-navy text-ivory border-navy'
                  : 'bg-ivory text-navy border-navy/15 hover:border-navy/40',
              ].join(' ')}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
