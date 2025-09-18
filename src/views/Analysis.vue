<template>
  <AppLayout>
    <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-lg p-6 border border-light-border dark:border-dark-border">
      <div class="flex items-center mb-4">
        <svg class="w-8 h-8 mr-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l-3 3m6 0l-3 3m0 6l3 3m-6 0l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 class="text-xl font-semibold">Analyse du Portefeuille par IA</h2>
      </div>
      
      <p class="text-light-text-secondary dark:text-dark-text-secondary mb-6">
        Obtenez une analyse de votre portefeuille générée par l'IA de Gemini. L'analyse se base sur vos positions actuelles pour identifier la répartition, les points de vigilance et des suggestions générales.
      </p>
      
      <button 
        @click="generateAnalysis"
        :disabled="loading"
        class="bg-accent hover:opacity-90 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg flex items-center"
      >
        {{ loading ? 'Analyse en cours...' : 'Lancer l\'analyse' }}
      </button>
      
      <div class="mt-6 p-4 border border-light-border dark:border-dark-border rounded-lg min-h-[200px] whitespace-pre-wrap">
        <p v-if="!analysis" class="text-light-text-secondary dark:text-dark-text-secondary">
          L'analyse apparaîtra ici...
        </p>
        <div v-else class="prose dark:prose-invert max-w-none">
          {{ analysis }}
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/utils/formatters'

const portfolioStore = usePortfolioStore()
const { showToast } = useToast()

const loading = ref(false)
const analysis = ref('')

const generateAnalysis = async () => {
  loading.value = true
  
  try {
    // Simulate AI analysis (in real implementation, this would call an AI service)
    const portfolioSummary = generatePortfolioSummary()
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    analysis.value = `Analyse du Portefeuille - ${new Date().toLocaleDateString('fr-FR')}

RÉSUMÉ GÉNÉRAL:
Votre portefeuille présente une valeur totale de ${formatCurrency(portfolioStore.totalValue, portfolioStore.settings.baseCurrency)} avec un P&L latent de ${formatCurrency(portfolioStore.totalPnL, portfolioStore.settings.baseCurrency)}.

RÉPARTITION DES ACTIFS:
${portfolioSummary.assetBreakdown}

POINTS D'ATTENTION:
• Diversification: ${portfolioSummary.diversificationNote}
• Volatilité: Votre portefeuille présente une exposition significative aux cryptomonnaies
• Liquidités: ${portfolioSummary.liquidityNote}

RECOMMANDATIONS:
• Considérez une diversification géographique et sectorielle
• Maintenez une réserve de liquidités adaptée à votre profil de risque
• Surveillez les corrélations entre vos positions

Cette analyse est fournie à titre informatif uniquement et ne constitue pas un conseil en investissement.`
    
    showToast('Analyse générée avec succès!', 'success')
  } catch (error) {
    console.error('Erreur lors de la génération de l\'analyse:', error)
    showToast('Erreur lors de la génération de l\'analyse', 'error')
  } finally {
    loading.value = false
  }
}

const generatePortfolioSummary = () => {
  const positions = Object.values(portfolioStore.positions)
  const totalAssets = positions.length
  const liquidityTotal = Object.values(portfolioStore.liquidity).reduce((sum, acc) => sum + acc.balance, 0)
  
  let assetBreakdown = ''
  positions.forEach(pos => {
    const asset = portfolioStore.assets[pos.assetId]
    if (asset) {
      const currentPrice = portfolioStore.prices[pos.assetId] || pos.avgCost
      const value = pos.quantity * currentPrice
      const percentage = ((value / portfolioStore.totalValue) * 100).toFixed(1)
      assetBreakdown += `• ${asset.name} (${asset.symbol}): ${percentage}% - ${formatCurrency(value, portfolioStore.settings.baseCurrency)}\n`
    }
  })
  
  if (liquidityTotal > 0) {
    const liquidityPercentage = ((liquidityTotal / portfolioStore.totalValue) * 100).toFixed(1)
    assetBreakdown += `• Liquidités: ${liquidityPercentage}% - ${formatCurrency(liquidityTotal, portfolioStore.settings.baseCurrency)}\n`
  }
  
  const diversificationNote = totalAssets < 5 
    ? 'Votre portefeuille pourrait bénéficier d\'une meilleure diversification.'
    : 'Bonne diversification avec ' + totalAssets + ' actifs différents.'
    
  const liquidityNote = liquidityTotal > 0 
    ? `Vous disposez de ${formatCurrency(liquidityTotal, portfolioStore.settings.baseCurrency)} en liquidités.`
    : 'Aucune liquidité détectée, considérez maintenir une réserve de sécurité.'
  
  return {
    assetBreakdown,
    diversificationNote,
    liquidityNote
  }
}
</script>