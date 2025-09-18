import type { CryptoSearchResult } from '@/types'

let COINGECKO_CRYPTO_LIST: CryptoSearchResult[] = []

export async function fetchCoinGeckoList(): Promise<void> {
  if (COINGECKO_CRYPTO_LIST.length > 0) return

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=250&page=1'
    )
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const marketList = await response.json()
    const exclusionKeywords = ['etf', 'ishares', 'tokenized stock', 'leveraged', 'bull', 'bear', '3x', '5x', 'etn', 'short', 'long']
    
    COINGECKO_CRYPTO_LIST = marketList
      .filter((coin: any) => !exclusionKeywords.some(keyword => 
        coin.name.toLowerCase().includes(keyword)
      ))
      .map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image
      }))

    console.log(`CoinGecko list loaded: ${COINGECKO_CRYPTO_LIST.length} cryptocurrencies.`)
  } catch (error) {
    console.error("Could not load CoinGecko list:", error)
    throw error
  }
}

export function searchCrypto(query: string): CryptoSearchResult[] {
  if (!query || query.length < 2) return []
  
  const lowerQuery = query.toLowerCase()
  
  const results = COINGECKO_CRYPTO_LIST.filter(crypto => 
    crypto.name.toLowerCase().includes(lowerQuery) || 
    crypto.symbol.toLowerCase().includes(lowerQuery)
  )

  results.sort((a, b) => {
    const aName = a.name.toLowerCase()
    const aSymbol = a.symbol.toLowerCase()
    const bName = b.name.toLowerCase()
    const bSymbol = b.symbol.toLowerCase()

    if (aSymbol === lowerQuery && bSymbol !== lowerQuery) return -1
    if (bSymbol === lowerQuery && aSymbol !== lowerQuery) return 1

    if (aName === lowerQuery && bName !== lowerQuery) return -1
    if (bName === lowerQuery && aName !== lowerQuery) return 1

    return a.name.length - b.name.length
  })

  return results.slice(0, 50)
}

export async function updateCryptoPrices(
  cryptoAssetIds: string[], 
  vsCurrency: string = 'eur'
): Promise<Record<string, number>> {
  if (cryptoAssetIds.length === 0) return {}

  try {
    const idsString = cryptoAssetIds.join(',')
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=${vsCurrency}`
    )
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const prices = await response.json()
    const formattedPrices: Record<string, number> = {}
    
    for (const assetId in prices) {
      if (prices[assetId][vsCurrency]) {
        formattedPrices[assetId] = prices[assetId][vsCurrency]
      }
    }

    return formattedPrices
  } catch (error) {
    console.error("Could not update prices from CoinGecko:", error)
    throw error
  }
}

export async function update24hChanges(
  cryptoAssetIds: string[], 
  vsCurrency: string = 'eur'
): Promise<Record<string, { price_change_percentage_24h: number }>> {
  if (cryptoAssetIds.length === 0) return {}

  try {
    const idsString = cryptoAssetIds.join(',')
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vsCurrency}&ids=${idsString}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`
    )
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const marketData = await response.json()
    const changes: Record<string, { price_change_percentage_24h: number }> = {}
    
    marketData.forEach((coin: any) => {
      changes[coin.id] = { 
        price_change_percentage_24h: coin.price_change_percentage_24h || 0 
      }
    })

    return changes
  } catch (error) {
    console.error("Could not update 24h data:", error)
    throw error
  }
}

export function findCoinBySymbol(symbol: string): CryptoSearchResult | null {
  const lowerSymbol = symbol.toLowerCase()
  const priorityMap: Record<string, string> = {
    'btc': 'bitcoin',
    'eth': 'ethereum', 
    'usdc': 'usd-coin',
    'tao': 'bittensor'
  }

  const priorityId = priorityMap[lowerSymbol]
  if (priorityId) {
    const priorityCoin = COINGECKO_CRYPTO_LIST.find(c => c.id === priorityId)
    if (priorityCoin) return priorityCoin
  }
  
  const potentialMatches = COINGECKO_CRYPTO_LIST.filter(c => 
    c.symbol.toLowerCase() === lowerSymbol
  )
  
  if (potentialMatches.length === 0) return null
  if (potentialMatches.length === 1) return potentialMatches[0]
  
  let bestMatch = potentialMatches.find(c => c.id.toLowerCase() === lowerSymbol)
  if (bestMatch) return bestMatch
  
  potentialMatches.sort((a, b) => a.name.length - b.name.length)
  
  console.warn(`Multiple matches for symbol "${symbol}". Choosing "${potentialMatches[0].name}" (id: ${potentialMatches[0].id}) as the best guess.`)
  return potentialMatches[0]
}