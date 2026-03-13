import { PLACEHOLDER_WINES } from '../../wines/_lib/placeholder-wines'

export interface PlaceholderCollection {
  id: string
  title: string
  slug: string
  description: string
  cover_image_url: string | null
  curator_name: string
  display_order: number
  is_active: boolean
  start_date: string | null
  end_date: string | null
  items: Array<{
    id: string
    wine_id: string
    position: number
    curator_note: string | null
    wine: (typeof PLACEHOLDER_WINES)[number]
  }>
}

export const PLACEHOLDER_COLLECTIONS: PlaceholderCollection[] = [
  {
    id: 'col-1',
    title: 'Staff Picks',
    slug: 'staff-picks',
    description:
      'Our founding curators picked these bottles for their ability to surprise and delight. Each wine tells a story worth savoring.',
    cover_image_url: null,
    curator_name: 'Cru Editorial',
    display_order: 1,
    is_active: true,
    start_date: null,
    end_date: null,
    items: [
      { id: 'ci-1', wine_id: '1', position: 1, curator_note: 'A Napa classic that never disappoints.', wine: PLACEHOLDER_WINES[0]! },
      { id: 'ci-2', wine_id: '3', position: 2, curator_note: 'The depth here is extraordinary — give it time to breathe.', wine: PLACEHOLDER_WINES[2]! },
      { id: 'ci-3', wine_id: '5', position: 3, curator_note: 'Oregon Pinot at its absolute finest.', wine: PLACEHOLDER_WINES[4]! },
      { id: 'ci-4', wine_id: '7', position: 4, curator_note: null, wine: PLACEHOLDER_WINES[6]! },
      { id: 'ci-5', wine_id: '8', position: 5, curator_note: 'Pure Chablis — mineral and tension in every sip.', wine: PLACEHOLDER_WINES[7]! },
      { id: 'ci-6', wine_id: '2', position: 6, curator_note: null, wine: PLACEHOLDER_WINES[1]! },
    ],
  },
  {
    id: 'col-2',
    title: 'Under $25',
    slug: 'under-25',
    description:
      'Great wine does not need to break the bank. These are bottles that punch well above their price point.',
    cover_image_url: null,
    curator_name: 'Cru Editorial',
    display_order: 2,
    is_active: true,
    start_date: null,
    end_date: null,
    items: [
      { id: 'ci-7', wine_id: '4', position: 1, curator_note: 'Bright and refreshing — the quintessential summer white.', wine: PLACEHOLDER_WINES[3]! },
    ],
  },
  {
    id: 'col-3',
    title: 'Natural Wines',
    slug: 'natural-wines',
    description:
      'Minimal intervention, maximum character. These wines are made with little to no additives, showcasing terroir in its purest form.',
    cover_image_url: null,
    curator_name: 'Cru Editorial',
    display_order: 3,
    is_active: true,
    start_date: null,
    end_date: null,
    items: [
      { id: 'ci-8', wine_id: '5', position: 1, curator_note: 'Biodynamic farming meets Burgundian technique.', wine: PLACEHOLDER_WINES[4]! },
      { id: 'ci-9', wine_id: '3', position: 2, curator_note: null, wine: PLACEHOLDER_WINES[2]! },
      { id: 'ci-10', wine_id: '6', position: 3, curator_note: 'Single-vineyard Shiraz with incredible purity.', wine: PLACEHOLDER_WINES[5]! },
    ],
  },
  {
    id: 'col-4',
    title: 'New Arrivals',
    slug: 'new-arrivals',
    description:
      'Fresh additions to the Cru catalog. Be the first to discover these wines before they sell out.',
    cover_image_url: null,
    curator_name: 'Cru Editorial',
    display_order: 4,
    is_active: true,
    start_date: null,
    end_date: null,
    items: PLACEHOLDER_WINES.map((wine, i) => ({
      id: `ci-new-${i}`,
      wine_id: wine.id,
      position: i + 1,
      curator_note: null,
      wine,
    })),
  },
]
