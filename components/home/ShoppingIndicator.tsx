import { ShoppingBasket } from 'lucide-react'

export function ShoppingIndicator() {
  return (
    <span
      aria-label="Has shopping items"
      className="ml-auto flex-shrink-0 text-brass"
    >
      <ShoppingBasket size={14} strokeWidth={1.75} />
    </span>
  )
}
