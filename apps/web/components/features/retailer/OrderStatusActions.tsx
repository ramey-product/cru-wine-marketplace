'use client'

import { useTransition, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

interface OrderStatusActionsProps {
  orderId: string
  status: string
  fulfillmentType: 'pickup' | 'delivery'
  onAction?: () => void
}

function getPrimaryAction(
  status: string,
  fulfillmentType: 'pickup' | 'delivery'
): { label: string; actionName: string } | null {
  switch (status) {
    case 'pending':
      return { label: 'Confirm Order', actionName: 'confirmOrder' }
    case 'confirmed':
      return fulfillmentType === 'pickup'
        ? { label: 'Mark Ready for Pickup', actionName: 'markReadyForPickup' }
        : { label: 'Mark Out for Delivery', actionName: 'markOutForDelivery' }
    case 'ready_for_pickup':
    case 'out_for_delivery':
      return { label: 'Mark Complete', actionName: 'markComplete' }
    default:
      return null
  }
}

function isActiveStatus(status: string): boolean {
  return ['pending', 'confirmed', 'ready_for_pickup', 'out_for_delivery'].includes(status)
}

export function OrderStatusActions({
  orderId,
  status,
  fulfillmentType,
  onAction,
}: OrderStatusActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  const primaryAction = getPrimaryAction(status, fulfillmentType)

  function handlePrimaryAction() {
    startTransition(async () => {
      // TODO: Call server action based on primaryAction.actionName
      // e.g., await confirmOrder(orderId) or await markReadyForPickup(orderId)
      console.log(`Action: ${primaryAction?.actionName} for order ${orderId}`)
      onAction?.()
    })
  }

  function handleCancel() {
    startTransition(async () => {
      // TODO: Call cancelOrder server action
      console.log(`Cancel order ${orderId}`)
      setCancelDialogOpen(false)
      onAction?.()
    })
  }

  if (!primaryAction && !isActiveStatus(status)) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {primaryAction && (
        <Button
          size="sm"
          onClick={handlePrimaryAction}
          disabled={isPending}
          aria-label={`${primaryAction.label} for order ${orderId}`}
        >
          {isPending && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
          {primaryAction.label}
        </Button>
      )}

      {isActiveStatus(status) && (
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending}
                aria-label={`Cancel order ${orderId}`}
              />
            }
          >
            Cancel
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel this order?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. The customer will be notified that their order has been cancelled.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Keep Order
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isPending}
                aria-label="Confirm order cancellation"
              >
                {isPending && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
                Yes, Cancel Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
