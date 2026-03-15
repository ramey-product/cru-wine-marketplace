'use client'

import { useState, useTransition } from 'react'
import { QuantityStepper } from '@/components/features/cart/QuantityStepper'

interface CartItemProps {
  item: {
    id: string
    wineId: string
    wineName: string
    producer: string
    price: number
    quantity: number
    imageUrl: string | null
  }
  onUpdateQuantity: (lineItemId: string, quantity: number) => Promise<void>
  onRemove: (lineItemId: string) => Promise<void>
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticQty, setOptimisticQty] = useState(item.quantity)

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1 || newQty > 24) return

    setOptimisticQty(newQty)
    startTransition(async () => {
      try {
        await onUpdateQuantity(item.id, newQty)
      } catch {
        setOptimisticQty(item.quantity)
      }
    })
  }

  const handleRemove = () => {
    startTransition(async () => {
      await onRemove(item.id)
    })
  }

  const lineTotal = item.price * optimisticQty

  return (
    <div className={`flex gap-4 py-4 ${isPending ? 'opacity-60' : ''}`}>
      {/* Wine thumbnail */}
      <div className="h-20 w-14 flex-shrink-0 rounded-md bg-muted flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
          aria-hidden="true"
        >
          <path d="M8 22h8" />
          <path d="M7 10h10" />
          <path d="M12 15v7" />
          <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {item.producer}
        </p>
        <p className="text-sm font-medium truncate">{item.wineName}</p>
        <p className="text-sm font-mono text-muted-foreground mt-0.5">
          ${item.price.toFixed(2)} each
        </p>

        {/* Quantity stepper */}
        <div className="mt-2">
          <QuantityStepper
            quantity={optimisticQty}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
            wineName={item.wineName}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Line total */}
      <div className="text-right">
        <p className="text-sm font-semibold font-mono">${lineTotal.toFixed(2)}</p>
      </div>
    </div>
  )
}
