import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { 
  doc, 
  setDoc, 
  onSnapshot,
  type Unsubscribe 
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from './authStore'
import { updateCryptoPrices, update24hChanges } from '@/services/coinGecko'
import { useNotifications } from '@/composables/useNotifications'
import type { 
  Portfolio, 
  Asset, 
  Transaction, 
  Position, 
  Platform, 
  LiquidityAccount,
  Settings,
  UIState
} from '@/types'

export const usePortfolioStore = defineStore('portfolio', () => {
  // State
  const settings = ref<Settings>({
    baseCurrency: 'EUR',
    theme: 'dark'
  })
  
  const assets = ref<Record<string, Asset>>({})
  const platforms = ref<Record<string, Platform>>({
    'default-bank': {
      id: 'default-bank',
      name: 'Compte Bancaire',
      type: 'bank'
    }
  })
  
  const transactions = ref<Transaction[]>([])
  const positions = ref<Record<string, Position>>({})
  const liquidity = ref<Record<string, LiquidityAccount>>({
    'default-bank-eur': {
      id: 'default-bank-eur',
      platformId: 'default-bank',
      currency: 'EUR',
      balance: 0
    }
  })
  
  const prices = ref<Record<string, number>>({})
  const marketData24h = ref<Record<string, { price_change_percentage_24h: number }>>({})
  
  const ui = ref<UIState>({
    assetsSort: { key: 'value', direction: 'desc' }
  })

  const loading = ref(false)
  const error = ref('')

  // Firebase listener
  let unsubscribePortfolioListener: Unsubscribe | null = null

  // Getters
  const totalValue = computed(() => {
    let total = 0
    
    // Add positions value
    Object.values(positions.value).forEach(pos => {
      const currentPrice = prices.value[pos.assetId] || pos.avgCost
      total += pos.quantity * currentPrice
    })
    
    // Add liquidity
    Object.values(liquidity.value).forEach(acc => {
      if (acc.currency.toLowerCase() === settings.value.baseCurrency.toLowerCase()) {
        total += acc.balance
      }
    })
    
    return total
  })

  const totalPnL = computed(() => {
    let pnl = 0
    Object.values(positions.value).forEach(pos => {
      const currentPrice = prices.value[pos.assetId] || pos.avgCost
      const value = pos.quantity * currentPrice
      pnl += value - pos.totalCost
    })
    return pnl
  })

  const totalPnL24h = computed(() => {
    let pnl24h = 0
    Object.values(positions.value).forEach(pos => {
      const marketData = marketData24h.value[pos.assetId]
      if (marketData && marketData.price_change_percentage_24h !== undefined) {
        const currentPrice = prices.value[pos.assetId] || pos.avgCost
        const currentValue = pos.quantity * currentPrice
        const changePercent = marketData.price_change_percentage_24h / 100
        const pnl24hForPosition = currentValue * changePercent
        pnl24h += pnl24hForPosition
      }
    })
    return pnl24h
  })

  // Actions
  const initDemoData = (): Portfolio => {
    return {
      settings: { baseCurrency: 'EUR', theme: 'dark' },
      assets: {},
      platforms: { 
        'default-bank': { 
          id: 'default-bank', 
          name: 'Compte Bancaire', 
          type: 'bank' 
        } 
      },
      transactions: [],
      positions: {},
      liquidity: { 
        'default-bank-eur': { 
          id: 'default-bank-eur', 
          platformId: 'default-bank', 
          currency: 'EUR', 
          balance: 0 
        } 
      },
      prices: {},
      ui: { assetsSort: { key: 'value', direction: 'desc' } }
    }
  }

  const saveState = async () => {
    const authStore = useAuthStore()
    if (!authStore.userId) return

    try {
      const portfolioData: Portfolio = {
        settings: settings.value,
        assets: assets.value,
        platforms: platforms.value,
        transactions: transactions.value,
        positions: positions.value,
        liquidity: liquidity.value,
        prices: prices.value,
        ui: ui.value
      }

      const userDocRef = doc(db, 'portfolios', authStore.userId)
      await setDoc(userDocRef, portfolioData)
    } catch (err) {
      console.error("Error saving to Firestore:", err)
      error.value = "Error saving data."
    }
  }

  // Debounced save
  let saveTimeout: NodeJS.Timeout
  const debouncedSave = () => {
    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      saveState()
    }, 1000)
  }

  const setupPortfolioListener = (userId: string) => {
    if (unsubscribePortfolioListener) {
      unsubscribePortfolioListener()
    }

    const userDocRef = doc(db, 'portfolios', userId)
    
    unsubscribePortfolioListener = onSnapshot(userDocRef, (docSnap) => {
      const defaultState = initDemoData()
      
      if (docSnap.exists()) {
        const firestoreState = docSnap.data() as Portfolio
        
        // Safely merge properties from Firestore
        settings.value = { ...defaultState.settings, ...(firestoreState.settings || {}) }
        assets.value = firestoreState.assets || {}
        platforms.value = { ...defaultState.platforms, ...(firestoreState.platforms || {}) }
        transactions.value = firestoreState.transactions || []
        positions.value = firestoreState.positions || {}
        liquidity.value = { ...defaultState.liquidity, ...(firestoreState.liquidity || {}) }
        prices.value = firestoreState.prices || {}
        ui.value = { ...defaultState.ui, ...(firestoreState.ui || {}) }

        console.log("Data loaded from Firestore.")
      } else {
        console.log("No document found, creating a new portfolio.")
        const defaultData = initDemoData()
        settings.value = defaultData.settings
        assets.value = defaultData.assets
        platforms.value = defaultData.platforms
        transactions.value = defaultData.transactions
        positions.value = defaultData.positions
        liquidity.value = defaultData.liquidity
        prices.value = defaultData.prices
        ui.value = defaultData.ui
        
        saveState()
      }

      calculatePositions()
    }, (error) => {
      console.error("Firestore listener error:", error)
      error.value = "Database connection error."
    })
  }

  const calculatePositions = () => {
    const newPositions: Record<string, Position> = {}
    const tempLiquidity = JSON.parse(JSON.stringify(liquidity.value))
    
    const sortedTransactions = [...transactions.value].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    const getPosId = (assetId: string, platformId: string) => `${assetId}_${platformId}`
    const getLiqId = (currency: string, platformId: string) => `${platformId}-${currency.toLowerCase()}`
    
    const ensurePosition = (assetId: string, platformId: string) => {
      const posId = getPosId(assetId, platformId)
      if (!newPositions[posId]) {
        newPositions[posId] = { 
          assetId, 
          platformId, 
          quantity: 0, 
          totalCost: 0, 
          avgCost: 0 
        }
      }
      return newPositions[posId]
    }

    sortedTransactions.forEach(tx => {
      switch (tx.type) {
        case 'BUY': {
          const position = ensurePosition(tx.assetId, tx.platformId)
          const cost = tx.quantity * tx.price
          const fee = tx.fee || 0
          position.totalCost += cost + fee
          position.quantity += tx.quantity
          position.avgCost = position.quantity > 0 ? position.totalCost / position.quantity : 0
          
          const liqId = getLiqId(settings.value.baseCurrency.toLowerCase(), tx.platformId)
          if (tempLiquidity[liqId]) {
            tempLiquidity[liqId].balance -= (cost + fee)
          }
          break
        }
        case 'SELL': {
          const posId = getPosId(tx.assetId, tx.platformId)
          if (newPositions[posId]) {
            const position = newPositions[posId]
            const proceeds = tx.quantity * tx.price
            const fee = tx.fee || 0
            const costOfSold = tx.quantity * position.avgCost
            
            position.totalCost -= costOfSold
            position.quantity -= tx.quantity
            
            const liqId = getLiqId(settings.value.baseCurrency.toLowerCase(), tx.platformId)
            if (tempLiquidity[liqId]) {
              tempLiquidity[liqId].balance += (proceeds - fee)
            }
          }
          break
        }
        case 'DEPOSIT': {
          if (assets.value[tx.assetId] && assets.value[tx.assetId].category !== 'stablecoin') {
            const position = ensurePosition(tx.assetId, tx.platformId)
            const cost = tx.quantity * tx.price
            position.totalCost += cost
            position.quantity += tx.quantity
            position.avgCost = position.quantity > 0 ? position.totalCost / position.quantity : 0
          } else {
            const liqId = getLiqId(tx.assetId, tx.platformId)
            if (!tempLiquidity[liqId]) {
              tempLiquidity[liqId] = { 
                id: liqId,
                platformId: tx.platformId,
                currency: tx.assetId,
                balance: 0 
              }
            }
            tempLiquidity[liqId].balance += tx.quantity
          }
          break
        }
        case 'WITHDRAW': {
          if (assets.value[tx.assetId] && assets.value[tx.assetId].category !== 'stablecoin') {
            const position = ensurePosition(tx.assetId, tx.platformId)
            const costOfWithdrawn = tx.quantity * position.avgCost
            position.quantity -= tx.quantity
            position.totalCost -= costOfWithdrawn
            position.avgCost = position.quantity > 0 ? position.totalCost / position.quantity : 0
          } else {
            const liqId = getLiqId(tx.assetId, tx.platformId)
            if (tempLiquidity[liqId]) {
              tempLiquidity[liqId].balance -= tx.quantity
            }
          }
          break
        }
      }
    })

    // Remove positions with negligible quantities
    Object.keys(newPositions).forEach(posId => {
      if (newPositions[posId].quantity <= 1e-9) {
        delete newPositions[posId]
      }
    })

    positions.value = newPositions
  }

  const addTransaction = async (txData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...txData,
      id: `tx_${Date.now()}`,
      timestamp: txData.timestamp || new Date().toISOString()
    }

    transactions.value.push(newTransaction)
    calculatePositions()
    
    // Add notification for new transaction
    const { addNotification } = useNotifications()
    const asset = assets.value[txData.assetId]
    const assetName = asset ? asset.symbol.toUpperCase() : txData.assetId
    
    addNotification({
      title: 'Transaction ajoutée',
      message: `${txData.type} de ${txData.quantity} ${assetName} enregistré avec succès`,
      type: 'success'
    })
    
    await debouncedSave()
  }

  const updateTransaction = async (txId: string, updates: Partial<Transaction>) => {
    const index = transactions.value.findIndex(tx => tx.id === txId)
    if (index > -1) {
      transactions.value[index] = { ...transactions.value[index], ...updates }
      calculatePositions()
      await debouncedSave()
    }
  }

  const deleteTransaction = async (txId: string) => {
    transactions.value = transactions.value.filter(tx => tx.id !== txId)
    calculatePositions()
    await debouncedSave()
  }

  const addAsset = (asset: Asset) => {
    assets.value[asset.id] = asset
    debouncedSave()
  }

  const updatePrices = (newPrices: Record<string, number>) => {
    let hasNewPrices = false
    for (const [assetId, price] of Object.entries(newPrices)) {
      if (prices.value[assetId] !== price) {
        hasNewPrices = true
        prices.value[assetId] = price
      }
    }
    if (hasNewPrices) {
      debouncedSave()
    }
  }

  const updateMarketData24h = (newData: Record<string, { price_change_percentage_24h: number }>) => {
    marketData24h.value = newData
  }

  const updateSettings = (newSettings: Partial<Settings>) => {
    settings.value = { ...settings.value, ...newSettings }
    debouncedSave()
  }

  const updateAllCryptoPrices = async () => {
    const cryptoAssetIds = Object.values(assets.value)
      .filter(a => a.category === 'crypto')
      .map(a => a.id)
    
    if (cryptoAssetIds.length === 0) return

    try {
      const vsCurrency = settings.value.baseCurrency.toLowerCase()
      const newPrices = await updateCryptoPrices(cryptoAssetIds, vsCurrency)
      updatePrices(newPrices)
      
      // Also update 24h market data with new currency
      const newMarketData = await update24hChanges(cryptoAssetIds, vsCurrency)
      updateMarketData24h(newMarketData)
      
      // Add notification for price update
      const { addNotification } = useNotifications()
      addNotification({
        title: 'Prix mis à jour',
        message: `Prix de ${cryptoAssetIds.length} cryptomonnaie${cryptoAssetIds.length > 1 ? 's' : ''} mis à jour`,
        type: 'info'
      })
    } catch (error) {
      console.error('Error updating crypto prices:', error)
      
      // Add error notification
      const { addNotification } = useNotifications()
      addNotification({
        title: 'Erreur de mise à jour',
        message: 'Impossible de mettre à jour les prix des cryptomonnaies',
        type: 'error'
      })
    }
  }

  const cleanup = () => {
    if (unsubscribePortfolioListener) {
      unsubscribePortfolioListener()
      unsubscribePortfolioListener = null
    }
  }

  // Watch for auth changes
  const authStore = useAuthStore()
  watch(() => authStore.userId, (newUserId) => {
    if (newUserId) {
      setupPortfolioListener(newUserId)
    } else {
      cleanup()
    }
  })

  return {
    // State
    settings,
    assets,
    platforms,
    transactions,
    positions,
    liquidity,
    prices,
    marketData24h,
    ui,
    loading,
    error,
    
    // Getters
    totalValue,
    totalPnL,
    totalPnL24h,
    
    // Actions
    setupPortfolioListener,
    calculatePositions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addAsset,
    updatePrices,
    updateMarketData24h,
    updateSettings,
    updateAllCryptoPrices,
    saveState,
    cleanup
  }
})