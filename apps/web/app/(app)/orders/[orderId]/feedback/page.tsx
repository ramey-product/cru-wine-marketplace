import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { TasteFeedbackForm } from '@/components/features/orders/TasteFeedbackForm'

// TODO: Replace with real data from DAL calls
// In production: getOrderById + getFeedbackByOrder to check if already submitted

interface FeedbackPageProps {
  params: Promise<{ orderId: string }>
}

// Mock data — matches the order detail page mock
const MOCK_ORDER = {
  id: 'order-1',
  status: 'completed' as const,
  items: [
    {
      orderItemId: 'item-1',
      wineId: 'wine-1',
      wineName: 'Estate Reserve Cabernet 2021',
      producer: 'Opus One',
      varietal: 'Cabernet Sauvignon',
      vintage: '2021',
      imageUrl: null,
    },
    {
      orderItemId: 'item-2',
      wineId: 'wine-2',
      wineName: 'Les Forts de Latour 2019',
      producer: 'Chateau Latour',
      varietal: 'Merlot',
      vintage: '2019',
      imageUrl: null,
    },
    {
      orderItemId: 'item-3',
      wineId: 'wine-3',
      wineName: 'Barbaresco DOCG 2020',
      producer: 'Gaja',
      varietal: 'Nebbiolo',
      vintage: '2020',
      imageUrl: null,
    },
  ],
}

// Mock: whether feedback was already submitted
const MOCK_FEEDBACK_SUBMITTED = false

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { orderId } = await params

  // TODO: Replace with real auth check + DAL calls
  const order = MOCK_ORDER
  const alreadySubmitted = MOCK_FEEDBACK_SUBMITTED

  if (order.status !== 'completed') {
    return (
      <div className="space-y-4">
        <Link
          href={`/orders/${orderId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to order
        </Link>
        <div className="flex flex-col items-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Feedback is only available for completed orders.
          </p>
        </div>
      </div>
    )
  }

  if (alreadySubmitted) {
    return (
      <div className="space-y-4">
        <Link
          href={`/orders/${orderId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to order
        </Link>
        <div className="flex flex-col items-center py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-medium">Feedback already submitted</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Thank you — your taste preferences are helping us find better wines for you.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/orders/${orderId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to order
      </Link>

      <TasteFeedbackForm orderId={orderId} items={order.items} />
    </div>
  )
}
