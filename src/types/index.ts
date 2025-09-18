export interface Settings {
  baseCurrency: string
  theme: string
}

export interface Asset {
  id: string
  symbol: string
  name: string
  image: string
  category: 'crypto' | 'action' | 'obligation' | 'epargne'
}

export interface Platform {
  id: string
  name: string
  type: 'exchange' | 'bank' | 'broker'
}

export interface Transaction {
  id: string
  type: 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'SWAP'
  assetId: string
  platformId: string
  quantity: number
  price: number
  fee?: number
  timestamp: string
  // For transfers
  fromPlatformId?: string
  toPlatformId?: string
  // For swaps
  fromAssetId?: string
  toAssetId?: string
  fromQuantity?: number
  toQuantity?: number
}

export interface Position {
  assetId: string
  platformId: string
  quantity: number
  totalCost: number
  avgCost: number
}

export interface LiquidityAccount {
  id: string
  platformId: string
  currency: string
  balance: number
}

export interface UIState {
  assetsSort: {
    key: string
    direction: 'asc' | 'desc'
  }
}

export interface Portfolio {
  settings: Settings
  assets: Record<string, Asset>
  platforms: Record<string, Platform>
  transactions: Transaction[]
  positions: Record<string, Position>
  liquidity: Record<string, LiquidityAccount>
  prices: Record<string, number>
  ui: UIState
}

export interface CryptoSearchResult {
  id: string
  symbol: string
  name: string
  image: string
}