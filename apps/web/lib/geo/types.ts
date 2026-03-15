export interface UserLocation {
  lat: number
  lng: number
  source: 'browser' | 'ip' | 'manual'
  displayName: string | null
  zip: string | null
  accuracy: number | null // meters, from browser API
  timestamp: number // Date.now()
}

export interface LocationCookie {
  lat: number
  lng: number
  dn: string | null // displayName abbreviated
}
