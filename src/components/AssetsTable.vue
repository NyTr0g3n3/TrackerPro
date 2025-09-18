<template>
  <div v-if="filteredAssets.length > 0" class="overflow-x-auto">
    <table class="w-full text-left">
      <thead class="bg-light-bg dark:bg-dark-bg">
        <tr>
          <th 
            @click="sort('name')"
            class="p-4 font-semibold w-1/4 sortable-header text-light-text-secondary dark:text-dark-text-secondary cursor-pointer"
          >
            Actif
            <SortIcon :direction="getSortDirection('name')" />
          </th>
          <th class="p-4 font-semibold text-right text-light-text-secondary dark:text-dark-text-secondary">
            Quantité Totale
          </th>
          <th class="p-4 font-semibold text-right text-light-text-secondary dark:text-dark-text-secondary">
            PRU Moyen
          </th>
          <th class="p-4 font-semibold text-right text-light-text-secondary dark:text-dark-text-secondary">
            Prix Actuel
          </th>
          <th 
            @click="sort('value')"
            class="p-4 font-semibold text-right sortable-header text-light-text-secondary dark:text-dark-text-secondary cursor-pointer"
          >
            Valeur Totale
            <SortIcon :direction="getSortDirection('value')" />
          </th>
          <th 
            @click="sort('pnl')"
            class="p-4 font-semibold text-right sortable-header text-light-text-secondary dark:text-dark-text-secondary cursor-pointer"
          >
            P&L Latent
            <SortIcon :direction="getSortDirection('pnl')" />
          </th>
          <th class="p-4 font-semibold text-center text-light-text-secondary dark:text-dark-text-secondary">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="assetId in sortedAssetIds" :key="assetId">
          <tr 
            @click="toggleAssetDetails(assetId)"
            class="asset-summary-row border-b border-light-border dark:border-dark-border hover:bg-light-bg dark:hover:bg-dark-bg cursor-pointer"
          >
            <td class="p-4">
              <div class="flex items-center">
                <ChevronRightIcon 
                  :class="[
                    'w-4 h-4 mr-2 text-light-text-secondary dark:text-dark-text-secondary transition-transform',
                    expandedAssets.has(assetId) ? 'rotate-90' : ''
                  ]"
                />
                <img 
                  :src="getAssetLogo(assetId)" 
                  :alt="portfolioStore.assets[assetId]?.name"
                  @error="handleImageError"
                  class="w-8 h-8 mr-3 rounded-full"
                />
                <div>
                  <div class="font-bold">{{ portfolioStore.assets[assetId]?.symbol.toUpperCase() }}</div>
                  <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {{ portfolioStore.assets[assetId]?.name }}
                  </div>
                </div>
              </div>
            </td>
            <td class="p-4 text-right tabular-nums">{{ getAssetSummary(assetId).totalQuantity.toFixed(5) }}</td>
            <td class="p-4 text-right tabular-nums">{{ formatCurrency(getAssetSummary(assetId).avgPRU) }}</td>
            <td class="p-4 text-right tabular-nums">{{ formatCurrency(getAssetSummary(assetId).currentPrice) }}</td>
            <td class="p-4 text-right font-semibold tabular-nums">{{ formatCurrency(getAssetSummary(assetId).totalValue) }}</td>
            <td 
              :class="[
                'p-4 text-right tabular-nums',
                getAssetSummary(assetId).totalPnl >= 0 
                  ? 'text-positive dark:text-positive-dark' 
                  : 'text-negative dark:text-negative-dark'
              ]"
            >
              {{ formatCurrency(getAssetSummary(assetId).totalPnl) }}
              <span class="text-xs">({{ getAssetSummary(assetId).totalPnlPercent.toFixed(2) }}%)</span>
            </td>
            <td class="p-4 text-center">
              <div class="flex items-center justify-center space-x-2">
                <button 
                  @click.stop="editAsset(assetId)"
                  class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600" 
                  title="Modifier la quantité"
                >
                  <PencilIcon class="w-5 h-5 text-gray-500 hover:text-accent transition-colors" />
                </button>
                <button 
                  @click.stop="deleteAsset(assetId)"
                  class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600" 
                  title="Supprimer l'actif"
                >
                  <TrashIcon class="w-5 h-5 text-gray-500 hover:text-negative transition-colors" />
                </button>
              </div>
            </td>
          </tr>
          
          <!-- Asset Details (Expanded) -->
          <tr v-if="expandedAssets.has(assetId)" class="asset-detail-row">
            <td colspan="7" class="p-0 bg-light-bg/50 dark:bg-dark-bg/50">
              <div class="p-4 mx-4">
                <table class="w-full text-left">
                  <thead>
                    <tr class="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                      <th class="p-2 font-medium">Plateforme</th>
                      <th class="p-2 font-medium text-right">Quantité</th>
                      <th class="p-2 font-medium text-right">PRU</th>
                      <th class="p-2 font-medium text-right">Valeur</th>
                      <th class="p-2 font-medium text-right">P&L Latent</th>
                      <th class="p-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="position in getAssetPositions(assetId)"
                      :key="`${position.assetId}_${position.platformId}`"
                      class="border-t border-light-border dark:border-dark-border"
                    >
                      <td class="p-2 w-1/6">{{ portfolioStore.platforms[position.platformId]?.name }}</td>
                      <td class="p-2 text-right tabular-nums w-1/6">{{ position.quantity.toFixed(5) }}</td>
                      <td class="p-2 text-right tabular-nums w-1/6">{{ formatCurrency(position.avgCost) }}</td>
                      <td class="p-2 text-right tabular-nums w-1/6">{{ formatCurrency(getPositionValue(position)) }}</td>
                      <td 
                        :class="[
                          'p-2 text-right tabular-nums w-1/6',
                          getPositionPnL(position) >= 0 
                            ? 'text-positive dark:text-positive-dark' 
                            : 'text-negative dark:text-negative-dark'
                        ]"
                      >
                        {{ formatCurrency(getPositionPnL(position)) }}
                        <span class="text-xs">({{ getPositionPnLPercent(position).toFixed(2) }}%)</span>
                      </td>
                      <td class="p-2 text-right w-1/6">
                        <div class="flex items-center justify-end space-x-2">
                          <button 
                            @click="quickAction('buy', position)"
                            class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600" 
                            title="Achat rapide"
                          >
                            <PlusIcon class="w-5 h-5 text-positive" />
                          </button>
                          <button 
                            @click="quickAction('sell', position)"
                            class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600" 
                            title="Vente rapide"
                          >
                            <MinusIcon class="w-5 h-5 text-negative" />
                          </button>
                          <button 
                            @click="openRepartitionModal(position.assetId, position.platformId)"
                            class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600" 
                            title="Répartir vers une autre plateforme"
                          >
                            <!-- Division/Share Icon -->
                            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                            </svg>
                          </button>
                          <button 
                            @click="openQuickSwapModal(position.assetId, position.platformId)"
                            class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600" 
                            title="Échanger contre un autre actif"
                          >
                            <!-- Swap Icon -->
                            <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
  
  <div v-else class="text-center p-12 text-light-text-secondary dark:text-dark-text-secondary">
    Aucun actif à afficher.
  </div>

  <!-- Quick Action Modal (Buy/Sell) -->
  <div v-if="showQuickActionModal" class="fixed inset-0 bg-black bg-opacity-50 z-40" @click="showQuickActionModal = false"></div>
  <div v-if="showQuickActionModal" class="fixed inset-0 flex items-center justify-center z-50 p-4">
    <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-md border border-light-border dark:border-dark-border">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">
            {{ quickActionData?.action === 'BUY' ? 'Achat Rapide' : 'Vente Rapide' }}
          </h2>
          <button @click="showQuickActionModal = false" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div v-if="quickActionData" class="space-y-4">
          <div class="p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
            <div class="flex items-center">
              <img 
                :src="getAssetLogo(quickActionData.assetId)" 
                class="w-8 h-8 mr-3 rounded-full"
                @error="handleImageError"
              />
              <div>
                <div class="font-bold">{{ portfolioStore.assets[quickActionData.assetId]?.symbol.toUpperCase() }}</div>
                <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {{ portfolioStore.platforms[quickActionData.platformId]?.name }}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
              Quantité
            </label>
            <input 
              type="number" 
              v-model.number="quickActionForm.quantity"
              step="any"
              class="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
              Prix par unité ({{ portfolioStore.settings.baseCurrency }})
            </label>
            <input 
              type="number" 
              v-model.number="quickActionForm.price"
              step="any"
              :placeholder="(portfolioStore.prices[quickActionData.assetId] || 0).toString()"
              class="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
            >
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button 
              @click="showQuickActionModal = false"
              class="bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 font-bold py-2 px-4 rounded-lg"
            >
              Annuler
            </button>
            <button 
              @click="handleQuickAction"
              :disabled="!quickActionForm.quantity || !quickActionForm.price"
              class="bg-accent hover:opacity-90 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg"
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Swap Modal -->
  <div v-if="showSwapModal" class="fixed inset-0 bg-black bg-opacity-50 z-40" @click="showSwapModal = false"></div>
  <div v-if="showSwapModal" class="fixed inset-0 flex items-center justify-center z-50 p-4">
    <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-md border border-light-border dark:border-dark-border">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">Échanger des Actifs</h2>
          <button @click="showSwapModal = false" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div v-if="swapData" class="space-y-4">
          <div class="p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
            <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">De:</div>
            <div class="flex items-center">
              <img 
                :src="getAssetLogo(swapData.fromAssetId)" 
                class="w-8 h-8 mr-3 rounded-full"
                @error="handleImageError"
              />
              <div>
                <div class="font-bold">{{ portfolioStore.assets[swapData.fromAssetId]?.symbol.toUpperCase() }}</div>
                <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {{ portfolioStore.platforms[swapData.platformId]?.name }}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
              Quantité à échanger
            </label>
            <input 
              type="number" 
              v-model.number="swapForm.fromQuantity"
              step="any"
              class="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
              Vers l'actif (ID CoinGecko)
            </label>
            <input 
              type="text" 
              v-model="swapForm.toAssetId"
              placeholder="ex: bitcoin, ethereum..."
              class="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
              Quantité reçue
            </label>
            <input 
              type="number" 
              v-model.number="swapForm.toQuantity"
              step="any"
              class="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
              Prix de référence ({{ portfolioStore.settings.baseCurrency }})
            </label>
            <input 
              type="number" 
              v-model.number="swapForm.price"
              step="any"
              class="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
            >
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button 
              @click="showSwapModal = false"
              class="bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 font-bold py-2 px-4 rounded-lg"
            >
              Annuler
            </button>
            <button 
              @click="handleSwap"
              :disabled="!swapForm.fromQuantity || !swapForm.toAssetId || !swapForm.toQuantity"
              class="bg-accent hover:opacity-90 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg"
            >
              Échanger
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Repartition Modal -->
  <div v-if="showRepartitionModal" class="fixed inset-0 bg-black bg-opacity-50 z-40" @click="showRepartitionModal = false"></div>
  <div v-if="showRepartitionModal" class="fixed inset-0 flex items-center justify-center z-50 p-4">
    <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-md border border-light-border dark:border-dark-border">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">Répartir l'Actif</h2>
          <button @click="showRepartitionModal = false" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div v-if="repartitionData" class="space-y-4">
          <div class="p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
            <div class="flex items-center">
              <img 
                :src="getAssetLogo(repartitionData.assetId)" 
                class="w-8 h-8 mr-3 rounded-full"
                @error="handleImageError"
              />
              <div>
                <div class="font-bold">{{ portfolioStore.assets[repartitionData.assetId]?.symbol.toUpperCase() }}</div>
                <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  De: {{ portfolioStore.platforms[repartitionData.platformId]?.name }}
                </div>
                <div class="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  Disponible: {{ getAssetPositions(repartitionData.assetId).find(p => p.platformId === repartitionData?.platformId)?.quantity.toFixed(8) }}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
              Quantité à transférer
            </label>
            <input 
              type="number" 
              v-model.number="repartitionForm.quantity"
              step="any"
              class="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
              Vers la plateforme
            </label>
            <input 
              list="platform-list-repartition" 
              v-model="repartitionForm.toPlatformName"
              placeholder="Nom de la plateforme de destination"
              class="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
            >
            <datalist id="platform-list-repartition">
              <option v-for="platform in Object.values(portfolioStore.platforms)" :key="platform.id" :value="platform.name" />
            </datalist>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button 
              @click="showRepartitionModal = false"
              class="bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 font-bold py-2 px-4 rounded-lg"
            >
              Annuler
            </button>
            <button 
              @click="handleRepartition"
              :disabled="!repartitionForm.quantity || !repartitionForm.toPlatformName"
              class="bg-accent hover:opacity-90 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg"
            >
              Transférer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Asset Modal -->
  <div v-if="showEditAssetModal" class="fixed inset-0 bg-black bg-opacity-50 z-40" @click="showEditAssetModal = false"></div>
  <div v-if="showEditAssetModal" class="fixed inset-0 flex items-center justify-center z-50 p-4">
    <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-md border border-light-border dark:border-dark-border">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">Ajuster l'Actif</h2>
          <button @click="showEditAssetModal = false" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div v-if="editAssetData" class="space-y-4">
          <div class="p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
            <div class="flex items-center">
              <img 
                :src="getAssetLogo(editAssetData.assetId)" 
                class="w-8 h-8 mr-3 rounded-full"
                @error="handleImageError"
              />
              <div>
                <div class="font-bold">{{ portfolioStore.assets[editAssetData.assetId]?.symbol.toUpperCase() }}</div>
                <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {{ portfolioStore.assets[editAssetData.assetId]?.name }}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
              Type d'opération
            </label>
            <select 
              v-model="editAssetForm.type"
              class="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="DEPOSIT">Transfert In (Dépôt)</option>
              <option value="WITHDRAW">Transfert Out (Retrait)</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
              Plateforme
            </label>
            <input 
              list="platform-list-edit" 
              v-model="editAssetForm.platformName"
              placeholder="Nom de la plateforme"
              required
              class="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
            >
            <datalist id="platform-list-edit">
              <option v-for="platform in Object.values(portfolioStore.platforms)" :key="platform.id" :value="platform.name" />
            </datalist>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
              Quantité
            </label>
            <input 
              type="number" 
              v-model.number="editAssetForm.quantity"
              step="any"
              required
              class="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
            >
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button 
              @click="showEditAssetModal = false"
              class="bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 font-bold py-2 px-4 rounded-lg"
            >
              Annuler
            </button>
            <button 
              @click="handleEditAsset"
              :disabled="!editAssetForm.platformName || !editAssetForm.quantity"
              class="bg-accent hover:opacity-90 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-md border border-light-border dark:border-dark-border">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-light-text-main dark:text-dark-text-main flex items-center">
            <svg class="w-6 h-6 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Confirmer la suppression
          </h2>
          <button 
            @click="showDeleteModal = false"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div v-if="deleteModalData" class="space-y-4">
          <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <p class="text-sm text-orange-800 dark:text-orange-200 mb-2">
              <strong>Cette action est irréversible</strong>
            </p>
            <p class="text-sm text-orange-700 dark:text-orange-300">
              Êtes-vous sûr de vouloir supprimer <strong>{{ deleteModalData.name }}</strong> ?
            </p>
            <p v-if="deleteModalData.type === 'asset'" class="text-xs text-orange-600 dark:text-orange-400 mt-2">
              Toutes les positions et transactions associées seront définitivement supprimées.
            </p>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button 
              @click="showDeleteModal = false"
              class="px-4 py-2 bg-gray-200 dark:bg-slate-600 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 font-medium"
            >
              Annuler
            </button>
            <button 
              @click="confirmDelete"
              class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Transaction Modal -->
  <TransactionModal 
    v-if="showEditTransactionModal && editingTransaction"
    :transaction="editingTransaction"
    @close="showEditTransactionModal = false"
    @submitted="onTransactionUpdated"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { formatCurrency } from '@/utils/formatters'
import { useToast } from '@/composables/useToast'
import TransactionModal from './TransactionModal.vue'
import type { Position } from '@/types'

// Icons
import { 
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/vue/24/outline'

import SortIcon from './SortIcon.vue'

interface Props {
  category: string
  searchTerm: string
}

const props = defineProps<Props>()
const portfolioStore = usePortfolioStore()
const { showToast } = useToast()

const expandedAssets = ref(new Set<string>())

// Group positions by asset
const groupedByAsset = computed(() => {
  return Object.values(portfolioStore.positions).reduce((acc, pos) => {
    const asset = portfolioStore.assets[pos.assetId]
    if (!asset || asset.category !== props.category) return acc
    
    if (!acc[pos.assetId]) acc[pos.assetId] = []
    acc[pos.assetId].push(pos)
    return acc
  }, {} as Record<string, Position[]>)
})

// Filter assets based on search term
const filteredAssets = computed(() => {
  const assetIds = Object.keys(groupedByAsset.value)
  
  if (!props.searchTerm) return assetIds
  
  const searchLower = props.searchTerm.toLowerCase()
  return assetIds.filter(assetId => {
    const asset = portfolioStore.assets[assetId]
    return asset.name.toLowerCase().includes(searchLower) ||
           asset.symbol.toLowerCase().includes(searchLower)
  })
})

// Sort assets
const sortedAssetIds = computed(() => {
  const { key, direction } = portfolioStore.ui.assetsSort
  
  return [...filteredAssets.value].sort((a, b) => {
    const assetA = portfolioStore.assets[a]
    const assetB = portfolioStore.assets[b]
    
    let valA: any, valB: any
    
    if (key === 'name') {
      valA = assetA.name.toLowerCase()
      valB = assetB.name.toLowerCase()
    } else {
      const summaryA = getAssetSummary(a)
      const summaryB = getAssetSummary(b)
      
      if (key === 'value') {
        valA = summaryA.totalValue
        valB = summaryB.totalValue
      } else {
        valA = summaryA.totalPnl
        valB = summaryB.totalPnl
      }
    }
    
    if (valA < valB) return direction === 'asc' ? -1 : 1
    if (valA > valB) return direction === 'asc' ? 1 : -1
    return 0
  })
})

// Methods
const getAssetSummary = (assetId: string) => {
  const positions = groupedByAsset.value[assetId] || []
  
  const totalQuantity = positions.reduce((sum, p) => sum + p.quantity, 0)
  const totalCost = positions.reduce((sum, p) => sum + p.totalCost, 0)
  const avgPRU = totalQuantity > 0 ? totalCost / totalQuantity : 0
  const currentPrice = portfolioStore.prices[assetId] || avgPRU
  const totalValue = totalQuantity * currentPrice
  const totalPnl = totalValue - totalCost
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0
  
  return {
    totalQuantity,
    avgPRU,
    currentPrice,
    totalValue,
    totalPnl,
    totalPnlPercent
  }
}

const getAssetPositions = (assetId: string) => {
  return groupedByAsset.value[assetId] || []
}

const getPositionValue = (position: Position) => {
  const currentPrice = portfolioStore.prices[position.assetId] || position.avgCost
  return position.quantity * currentPrice
}

const getPositionPnL = (position: Position) => {
  return getPositionValue(position) - position.totalCost
}

const getPositionPnLPercent = (position: Position) => {
  return position.totalCost > 0 ? (getPositionPnL(position) / position.totalCost) * 100 : 0
}

const getAssetLogo = (assetId: string) => {
  const asset = portfolioStore.assets[assetId]
  return asset?.image || `https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/${asset?.symbol.toLowerCase()}.png`
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQxIDAtOC0zLjU5LTgtOHMzLjU5LTggOC04IDggMy41OSA4IDgtMy41OSA4LTggOHoiLz48cGF0aCBkPSJNMTEgN2gzdjZoLTN6bTAgOGgydjJoLTJ6Ii8+PC9zdmc+'
}

const toggleAssetDetails = (assetId: string) => {
  if (expandedAssets.value.has(assetId)) {
    expandedAssets.value.delete(assetId)
  } else {
    expandedAssets.value.add(assetId)
  }
}

const sort = (key: string) => {
  const currentSort = portfolioStore.ui.assetsSort
  if (currentSort.key === key) {
    portfolioStore.ui.assetsSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc'
  } else {
    portfolioStore.ui.assetsSort.key = key
    portfolioStore.ui.assetsSort.direction = 'desc'
  }
  portfolioStore.saveState()
}

const getSortDirection = (key: string): 'asc' | 'desc' | null => {
  const currentSort = portfolioStore.ui.assetsSort
  return currentSort.key === key ? currentSort.direction : null
}

const editAsset = (assetId: string) => {
  const asset = portfolioStore.assets[assetId]
  if (!asset) return
  
  editAssetData.value = { assetId }
  editAssetForm.value = {
    type: 'DEPOSIT',
    platformName: '',
    quantity: 0
  }
  showEditAssetModal.value = true
}

const deleteAsset = (assetId: string) => {
  handleDeleteAsset(assetId)
}

const quickAction = (action: 'buy' | 'sell', position: Position) => {
  if (action === 'buy' || action === 'sell') {
    openQuickBuySellModal(position.assetId, position.platformId, action.toUpperCase())
  }
}

const openAdjustAssetModal = (assetId: string) => {
  editAsset(assetId)
}

const handleDeleteAsset = (assetId: string) => {
  const asset = portfolioStore.assets[assetId]
  if (!asset) return
  
  deleteModalData.value = {
    type: 'asset',
    id: assetId,
    name: `${asset.name} (${asset.symbol})`
  }
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!deleteModalData.value) return
  
  const { type, id } = deleteModalData.value
  
  if (type === 'asset') {
    const asset = portfolioStore.assets[id]
    if (!asset) return
    
    // Remove all transactions for this asset
    const newTransactions = portfolioStore.transactions.filter(tx => 
      tx.assetId !== id && tx.fromAssetId !== id && tx.toAssetId !== id
    )
    
    // Update store
    portfolioStore.transactions.splice(0, portfolioStore.transactions.length, ...newTransactions)
    delete portfolioStore.assets[id]
    delete portfolioStore.prices[id]
    
    portfolioStore.calculatePositions()
    portfolioStore.saveState()
    showToast(`Actif ${asset.symbol} supprimé avec succès`)
  }
  
  showDeleteModal.value = false
  deleteModalData.value = null
}

const openQuickBuySellModal = (assetId: string, platformId: string, action: string) => {
  const asset = portfolioStore.assets[assetId]
  const platform = portfolioStore.platforms[platformId]
  if (!asset || !platform) return
  
  // Store the action data for the modal
  quickActionData.value = { assetId, platformId, action }
  
  // Prefill with current price
  const currentPrice = portfolioStore.prices[assetId] || 0
  quickActionForm.value = { 
    quantity: 0, 
    price: currentPrice 
  }
  
  showQuickActionModal.value = true
}

const openQuickSwapModal = (assetId: string, platformId: string) => {
  const asset = portfolioStore.assets[assetId]
  const platform = portfolioStore.platforms[platformId]
  if (!asset || !platform) return
  
  swapData.value = { fromAssetId: assetId, platformId }
  
  // Prefill with current price
  const currentPrice = portfolioStore.prices[assetId] || 0
  swapForm.value = { 
    fromQuantity: 0, 
    toAssetId: '', 
    toQuantity: 0, 
    price: currentPrice 
  }
  
  showSwapModal.value = true
}

const openRepartitionModal = (assetId: string, platformId: string) => {
  const asset = portfolioStore.assets[assetId]
  const platform = portfolioStore.platforms[platformId]
  if (!asset || !platform) return
  
  repartitionData.value = { assetId, platformId }
  showRepartitionModal.value = true
}

// Modal state
const showQuickActionModal = ref(false)
const showSwapModal = ref(false)
const showRepartitionModal = ref(false)
const showEditAssetModal = ref(false)
const showDeleteModal = ref(false)
const showEditTransactionModal = ref(false)
const editingTransaction = ref(null)
const deleteModalData = ref<{ type: 'asset' | 'transaction', id: string, name: string } | null>(null)
const quickActionData = ref<{ assetId: string, platformId: string, action: string } | null>(null)
const swapData = ref<{ fromAssetId: string, platformId: string } | null>(null)
const repartitionData = ref<{ assetId: string, platformId: string } | null>(null)
const editAssetData = ref<{ assetId: string } | null>(null)

// Quick action form
const quickActionForm = ref({
  quantity: 0,
  price: 0
})

// Swap form
const swapForm = ref({
  fromQuantity: 0,
  toAssetId: '',
  toQuantity: 0,
  price: 0
})

// Repartition form
const repartitionForm = ref({
  quantity: 0,
  toPlatformName: ''
})

// Edit asset form
const editAssetForm = ref({
  type: 'DEPOSIT' as 'DEPOSIT' | 'WITHDRAW',
  platformName: '',
  quantity: 0
})

const handleQuickAction = async () => {
  if (!quickActionData.value) return
  
  const { assetId, platformId, action } = quickActionData.value
  
  const txData = {
    type: action as 'BUY' | 'SELL',
    assetId,
    platformId,
    quantity: quickActionForm.value.quantity,
    price: quickActionForm.value.price,
    fee: 0
  }
  
  await portfolioStore.addTransaction(txData)
  showToast(`${action} de ${portfolioStore.assets[assetId]?.symbol} enregistré`)
  showQuickActionModal.value = false
  quickActionForm.value = { quantity: 0, price: 0 }
}

const handleSwap = async () => {
  if (!swapData.value) return
  
  const { fromAssetId, platformId } = swapData.value
  
  // Create sell transaction
  const sellTx = {
    type: 'SELL' as const,
    assetId: fromAssetId,
    platformId,
    quantity: swapForm.value.fromQuantity,
    price: swapForm.value.price,
    fee: 0
  }
  
  // Create buy transaction
  const buyTx = {
    type: 'BUY' as const,
    assetId: swapForm.value.toAssetId,
    platformId,
    quantity: swapForm.value.toQuantity,
    price: swapForm.value.price,
    fee: 0
  }
  
  await portfolioStore.addTransaction(sellTx)
  await portfolioStore.addTransaction(buyTx)
  
  const fromAsset = portfolioStore.assets[fromAssetId]
  const toAsset = portfolioStore.assets[swapForm.value.toAssetId]
  showToast(`Swap ${fromAsset?.symbol} → ${toAsset?.symbol} enregistré`)
  showSwapModal.value = false
  swapForm.value = { fromQuantity: 0, toAssetId: '', toQuantity: 0, price: 0 }
}

const handleRepartition = async () => {
  if (!repartitionData.value) return
  
  const { assetId, platformId } = repartitionData.value
  
  // Get current position
  const position = Object.values(portfolioStore.positions).find(p => 
    p.assetId === assetId && p.platformId === platformId
  )
  if (!position) return
  
  if (repartitionForm.value.quantity > position.quantity) {
    showToast('Quantité insuffisante', 'error')
    return
  }
  
  // Find or create target platform
  let toPlatform = Object.values(portfolioStore.platforms).find(p => 
    p.name.toLowerCase() === repartitionForm.value.toPlatformName.toLowerCase().trim()
  )
  
  if (!toPlatform) {
    const newPlatformId = repartitionForm.value.toPlatformName.toLowerCase().trim().replace(/\s+/g, '-')
    toPlatform = {
      id: newPlatformId,
      name: repartitionForm.value.toPlatformName,
      type: 'exchange' as const
    }
    portfolioStore.platforms[newPlatformId] = toPlatform
  }
  
  // Create transfer transactions
  const withdrawTx = {
    type: 'WITHDRAW' as const,
    assetId,
    platformId,
    quantity: repartitionForm.value.quantity,
    price: 0,
    fee: 0
  }
  
  const depositTx = {
    type: 'DEPOSIT' as const,
    assetId,
    platformId: toPlatform.id,
    quantity: repartitionForm.value.quantity,
    price: portfolioStore.prices[assetId] || position.avgCost,
    fee: 0
  }
  
  await portfolioStore.addTransaction(withdrawTx)
  await portfolioStore.addTransaction(depositTx)
  
  const asset = portfolioStore.assets[assetId]
  showToast(`Transfert de ${asset?.symbol} vers ${toPlatform.name} enregistré`)
  showRepartitionModal.value = false
  repartitionForm.value = { quantity: 0, toPlatformName: '' }
}

const handleEditAsset = async () => {
  if (!editAssetData.value) return
  
  const { assetId } = editAssetData.value
  
  // Find or create platform
  let platform = Object.values(portfolioStore.platforms).find(p => 
    p.name.toLowerCase() === editAssetForm.value.platformName.toLowerCase().trim()
  )
  
  if (!platform) {
    const newPlatformId = editAssetForm.value.platformName.toLowerCase().trim().replace(/\s+/g, '-')
    platform = {
      id: newPlatformId,
      name: editAssetForm.value.platformName,
      type: 'exchange' as const
    }
    portfolioStore.platforms[newPlatformId] = platform
  }
  
  // Create transaction
  const txData = {
    type: editAssetForm.value.type,
    assetId,
    platformId: platform.id,
    quantity: editAssetForm.value.quantity,
    price: editAssetForm.value.type === 'DEPOSIT' ? (portfolioStore.prices[assetId] || 0) : 0,
    fee: 0
  }
  
  await portfolioStore.addTransaction(txData)
  
  const asset = portfolioStore.assets[assetId]
  const actionText = editAssetForm.value.type === 'DEPOSIT' ? 'Dépôt' : 'Retrait'
  showToast(`${actionText} de ${asset?.symbol} enregistré`)
  
  showEditAssetModal.value = false
  editAssetForm.value = { type: 'DEPOSIT', platformName: '', quantity: 0 }
}

const onTransactionUpdated = () => {
  showEditTransactionModal.value = false
  editingTransaction.value = null
  showToast('Transaction modifiée avec succès!')
}
</script>