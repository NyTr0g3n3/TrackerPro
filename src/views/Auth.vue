<template>
  <div class="flex items-start justify-center min-h-screen w-screen bg-light-bg dark:bg-dark-bg p-4 pt-16">
    <div class="w-full max-w-md p-8 space-y-6 bg-light-card dark:bg-dark-card rounded-2xl shadow-lg border border-light-border dark:border-dark-border">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-accent mb-2">TrackerPro</h1>
        <p class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Gérez votre portefeuille d'investissement
        </p>
      </div>
      
      <!-- Tab Navigation -->
      <div class="flex border-b border-light-border dark:border-dark-border">
        <button 
          @click="activeTab = 'login'"
          :class="[
            'flex-1 p-3 font-semibold border-b-2 transition-colors',
            activeTab === 'login' 
              ? 'border-accent text-accent' 
              : 'border-transparent text-light-text-secondary hover:text-light-text-main dark:hover:text-dark-text-main'
          ]"
        >
          Connexion
        </button>
        <button 
          @click="activeTab = 'signup'"
          :class="[
            'flex-1 p-3 font-semibold border-b-2 transition-colors',
            activeTab === 'signup' 
              ? 'border-accent text-accent' 
              : 'border-transparent text-light-text-secondary hover:text-light-text-main dark:hover:text-dark-text-main'
          ]"
        >
          Inscription
        </button>
      </div>

      <!-- Login Form -->
      <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="login-email" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
            Email
          </label>
          <input 
            type="email" 
            id="login-email" 
            v-model="loginForm.email"
            required 
            class="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
            placeholder="votre@email.com"
          >
        </div>
        
        <div>
          <label for="login-password" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
            Mot de passe
          </label>
          <div class="relative">
            <input 
              :type="showLoginPassword ? 'text' : 'password'" 
              id="login-password" 
              v-model="loginForm.password"
              required 
              class="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg shadow-sm py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
              placeholder="••••••••"
            >
            <button 
              type="button"
              @click="showLoginPassword = !showLoginPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-main dark:hover:text-dark-text-main"
            >
              <EyeIcon v-if="!showLoginPassword" class="w-5 h-5" />
              <EyeSlashIcon v-else class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>
        
        <div class="text-center">
          <button 
            type="button"
            @click="showForgotPasswordModal = true"
            class="text-sm text-accent hover:underline font-medium"
          >
            Mot de passe oublié ?
          </button>
        </div>
        
        <p class="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Pas encore de compte ? 
          <button 
            type="button"
            @click="activeTab = 'signup'"
            class="text-accent hover:underline font-medium"
          >
            Inscrivez-vous
          </button>
        </p>
      </form>

      <!-- Signup Form -->
      <form v-if="activeTab === 'signup'" @submit.prevent="handleSignup" class="space-y-4">
        <div>
          <label for="signup-email" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
            Email
          </label>
          <input 
            type="email" 
            id="signup-email" 
            v-model="signupForm.email"
            @blur="validateEmail"
            required 
            :class="[
              'w-full bg-light-bg dark:bg-dark-bg border rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-colors',
              emailError ? 'border-red-500 focus:border-red-500' : 'border-light-border dark:border-dark-border focus:border-accent'
            ]"
            placeholder="votre@email.com"
          >
          <p v-if="emailError" class="mt-1 text-sm text-red-500">{{ emailError }}</p>
        </div>
        
        <div>
          <label for="signup-password" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
            Mot de passe
          </label>
          <div class="relative">
            <input 
              :type="showSignupPassword ? 'text' : 'password'" 
              id="signup-password" 
              v-model="signupForm.password"
              @input="validatePassword"
              minlength="6"
              required 
              :class="[
                'w-full bg-light-bg dark:bg-dark-bg border rounded-lg shadow-sm py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-accent transition-colors',
                passwordError ? 'border-red-500 focus:border-red-500' : 'border-light-border dark:border-dark-border focus:border-accent'
              ]"
              placeholder="••••••••"
            >
            <button 
              type="button"
              @click="showSignupPassword = !showSignupPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-main dark:hover:text-dark-text-main"
            >
              <EyeIcon v-if="!showSignupPassword" class="w-5 h-5" />
              <EyeSlashIcon v-else class="w-5 h-5" />
            </button>
          </div>
          
          <!-- Password Strength Indicator -->
          <div v-if="signupForm.password" class="mt-2">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-light-text-secondary dark:text-dark-text-secondary">Force du mot de passe</span>
              <span :class="[
                'text-xs font-medium',
                passwordStrength.level === 'weak' ? 'text-red-500' :
                passwordStrength.level === 'medium' ? 'text-yellow-500' :
                'text-green-500'
              ]">
                {{ passwordStrength.text }}
              </span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                :class="[
                  'h-2 rounded-full transition-all duration-300',
                  passwordStrength.level === 'weak' ? 'bg-red-500' :
                  passwordStrength.level === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                ]"
                :style="{ width: `${passwordStrength.score}%` }"
              ></div>
            </div>
          </div>
          
          <p v-if="passwordError" class="mt-1 text-sm text-red-500">{{ passwordError }}</p>
        </div>
        
        <div>
          <label for="signup-confirm-password" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
            Confirmer le mot de passe
          </label>
          <div class="relative">
            <input 
              :type="showConfirmPassword ? 'text' : 'password'" 
              id="signup-confirm-password" 
              v-model="signupForm.confirmPassword"
              @blur="validatePasswordMatch"
              required 
              :class="[
                'w-full bg-light-bg dark:bg-dark-bg border rounded-lg shadow-sm py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-accent transition-colors',
                confirmPasswordError ? 'border-red-500 focus:border-red-500' : 'border-light-border dark:border-dark-border focus:border-accent'
              ]"
              placeholder="••••••••"
            >
            <button 
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-main dark:hover:text-dark-text-main"
            >
              <EyeIcon v-if="!showConfirmPassword" class="w-5 h-5" />
              <EyeSlashIcon v-else class="w-5 h-5" />
            </button>
          </div>
          <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-500">{{ confirmPasswordError }}</p>
        </div>

        <!-- Terms and Privacy Policy -->
        <div class="flex items-start space-x-3">
          <input 
            type="checkbox" 
            id="accept-terms"
            v-model="signupForm.acceptTerms"
            required
            class="mt-1 w-4 h-4 text-accent bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border rounded focus:ring-accent focus:ring-2"
          >
          <label for="accept-terms" class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            J'accepte les 
            <button type="button" @click.prevent="showTermsModal = true" class="text-accent hover:underline font-medium">Conditions Générales d'Utilisation</button>
            et la 
            <button type="button" @click.prevent="showPrivacyModal = true" class="text-accent hover:underline font-medium">Politique de Confidentialité</button>
          </label>
        </div>

        <!-- Simple Captcha -->
        <div class="p-4 bg-light-bg dark:bg-dark-bg rounded-lg border border-light-border dark:border-dark-border">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-6 h-6 border-2 border-light-border dark:border-dark-border rounded flex items-center justify-center">
                <input 
                  type="checkbox" 
                  id="captcha-check"
                  v-model="signupForm.captchaVerified"
                  @change="handleCaptchaChange"
                  class="w-4 h-4 text-accent bg-transparent border-0 rounded focus:ring-0"
                >
              </div>
              <span class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Je ne suis pas un robot
              </span>
            </div>
            <div class="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              <ShieldCheckIcon class="w-5 h-5" />
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          :disabled="loading || !isSignupFormValid"
          class="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {{ loading ? 'Création du compte...' : 'Créer mon compte' }}
        </button>
        
        <p class="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Déjà inscrit ? 
          <button 
            type="button"
            @click="activeTab = 'login'"
            class="text-accent hover:underline font-medium"
          >
            Connectez-vous
          </button>
        </p>
      </form>

      <!-- Error Message -->
      <div v-if="authStore.error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p class="text-sm text-red-600 dark:text-red-400 text-center">
          {{ authStore.error }}
        </p>
      </div>
    </div>

    <!-- Terms of Service Modal -->
    <div v-if="showTermsModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] border border-light-border dark:border-dark-border">
        <div class="p-6 border-b border-light-border dark:border-dark-border flex items-center justify-between">
          <h3 class="text-xl font-bold flex items-center">
            <span class="mr-2">📜</span>
            Conditions Générales d'Utilisation
          </h3>
          <button 
            @click="showTermsModal = false"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[70vh] prose dark:prose-invert max-w-none">
          <h4 class="text-lg font-semibold mb-4">1. Objet</h4>
          <p class="mb-4">
            Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et l'utilisation de l'application TrackerPro (ci-après « l'Application »), éditée par TrackerPro SRL.
            En créant un compte ou en utilisant l'Application, l'Utilisateur accepte sans réserve les présentes CGU.
          </p>
          
          <h4 class="text-lg font-semibold mb-4">2. Services proposés</h4>
          <p class="mb-2">L'Application permet à l'Utilisateur de :</p>
          <ul class="mb-4 list-disc pl-6">
            <li>Suivre ses placements financiers (crypto-monnaies, actions, obligations, comptes d'épargne, etc.) ;</li>
            <li>Centraliser ses transactions et actifs dans un tableau de bord ;</li>
            <li>Générer des statistiques et rapports ;</li>
            <li>Exporter/importer ses données au format JSON, CSV ou autre ;</li>
            <li>Bénéficier d'outils de sauvegarde et de restauration de ses données.</li>
          </ul>
          
          <h4 class="text-lg font-semibold mb-4">3. Inscription et compte utilisateur</h4>
          <ul class="mb-4 list-disc pl-6">
            <li>L'inscription nécessite la fourniture d'une adresse email valide et d'un mot de passe.</li>
            <li>L'Utilisateur est responsable de la confidentialité de ses identifiants. Toute connexion effectuée avec ses identifiants est réputée effectuée par lui.</li>
            <li>L'Utilisateur s'engage à fournir des informations exactes et à les maintenir à jour.</li>
          </ul>
          
          <h4 class="text-lg font-semibold mb-4">4. Utilisation de l'Application</h4>
          <p class="mb-2">L'Utilisateur s'engage à :</p>
          <ul class="mb-4 list-disc pl-6">
            <li>Utiliser l'Application dans le respect des lois et règlements applicables ;</li>
            <li>Ne pas tenter de contourner les systèmes de sécurité ;</li>
            <li>Ne pas utiliser l'Application à des fins frauduleuses ou illégales (blanchiment, fraude fiscale, etc.) ;</li>
            <li>Respecter les droits de propriété intellectuelle liés à l'Application.</li>
          </ul>
          
          <h4 class="text-lg font-semibold mb-4">5. Plans et abonnements</h4>
          <ul class="mb-4 list-disc pl-6">
            <li>L'Application propose un plan gratuit et des formules payantes avec des fonctionnalités supplémentaires.</li>
            <li>Les tarifs et modalités d'abonnement sont précisés dans l'Application et peuvent être modifiés à tout moment.</li>
            <li>Les abonnements payants sont facturés selon la périodicité choisie (mensuelle/annuelle).</li>
          </ul>
          
          <h4 class="text-lg font-semibold mb-4">6. Responsabilité</h4>
          <ul class="mb-4 list-disc pl-6">
            <li>L'éditeur met en œuvre tous les moyens raisonnables pour assurer un service fiable et sécurisé.</li>
            <li>L'Application fournit des outils de suivi et de simulation, mais ne constitue pas un conseil financier, fiscal ou juridique.</li>
            <li>L'éditeur ne pourra être tenu responsable de toute perte financière ou décision d'investissement prise sur la base des informations issues de l'Application.</li>
          </ul>
          
          <h5 class="text-md font-semibold mb-3">6.1 Recommandations générées par l'IA</h5>
          <p class="mb-2">L'Application peut proposer à l'Utilisateur des analyses ou recommandations générées automatiquement à l'aide d'algorithmes d'intelligence artificielle.</p>
          <p class="mb-2">Ces recommandations sont fournies à titre purement informatif et ne constituent en aucun cas :</p>
          <ul class="mb-4 list-disc pl-6">
            <li>un conseil financier, fiscal, patrimonial, juridique ou d'investissement personnalisé ;</li>
            <li>une garantie de performance ou de résultat.</li>
          </ul>
          <p class="mb-4">
            L'Utilisateur demeure seul responsable de ses décisions d'investissement, de gestion patrimoniale ou d'épargne.
            L'éditeur ne pourra en aucun cas être tenu responsable de toute perte directe ou indirecte, financière ou autre, résultant de l'utilisation des recommandations générées par l'IA.
          </p>
          
          <h4 class="text-lg font-semibold mb-4">7. Propriété intellectuelle</h4>
          <ul class="mb-4 list-disc pl-6">
            <li>L'Application, sa charte graphique, son logo et son code source sont protégés par les lois en vigueur sur la propriété intellectuelle.</li>
            <li>Toute reproduction, modification ou diffusion non autorisée est interdite.</li>
          </ul>
          
          <h4 class="text-lg font-semibold mb-4">8. Données personnelles</h4>
          <p class="mb-4">
            L'éditeur collecte et traite certaines données personnelles de l'Utilisateur dans le cadre du fonctionnement de l'Application, conformément à la Politique de Confidentialité.
          </p>
          
          <h4 class="text-lg font-semibold mb-4">9. Modification des CGU</h4>
          <p class="mb-4">
            L'éditeur se réserve le droit de modifier les présentes CGU. Les modifications entrent en vigueur dès leur mise en ligne.
          </p>
          
          <h4 class="text-lg font-semibold mb-4">10. Résiliation</h4>
          <ul class="mb-4 list-disc pl-6">
            <li>L'Utilisateur peut supprimer son compte à tout moment via l'interface prévue à cet effet.</li>
            <li>L'éditeur peut suspendre ou supprimer un compte en cas de non-respect des CGU.</li>
          </ul>
          
          <h4 class="text-lg font-semibold mb-4">11. Droit applicable</h4>
          <p class="mb-4">
            Les présentes CGU sont régies par le droit belge. Tout litige sera soumis aux juridictions de Bruxelles.
          </p>
        </div>
        
        <div class="p-6 border-t border-light-border dark:border-dark-border flex justify-end">
          <button 
            @click="showTermsModal = false"
            class="bg-accent hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
    <!-- Privacy Policy Modal -->
    <div v-if="showPrivacyModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] border border-light-border dark:border-dark-border">
        <div class="p-6 border-b border-light-border dark:border-dark-border flex items-center justify-between">
          <h3 class="text-xl font-bold flex items-center">
            <span class="mr-2">🔒</span>
            Politique de Confidentialité
          </h3>
          <button 
            @click="showPrivacyModal = false"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[70vh] prose dark:prose-invert max-w-none">
          <h4 class="text-lg font-semibold mb-4">1. Responsable du traitement</h4>
          <p class="mb-4">
            Le responsable du traitement des données est TrackerPro SRL, joignable à privacy@trackerpro.app.
          </p>
          
          <h4 class="text-lg font-semibold mb-4">2. Données collectées</h4>
          <p class="mb-2">L'Application collecte les catégories de données suivantes :</p>
          <ul class="mb-4 list-disc pl-6">
            <li><strong>Données de compte :</strong> email, mot de passe (chiffré).</li>
            <li><strong>Données d'utilisation :</strong> nombre d'actifs, transactions enregistrées, préférences (langue, devise, thème).</li>
            <li><strong>Données financières saisies par l'Utilisateur :</strong> informations sur ses placements (crypto, actions, obligations, épargne).</li>
            <li><strong>Données techniques :</strong> adresse IP, type de navigateur, logs de connexion.</li>
          </ul>
          
          <h4 class="text-lg font-semibold mb-4">3. Finalités du traitement</h4>
          <p class="mb-2">Les données sont collectées pour :</p>
          <ul class="mb-4 list-disc pl-6">
            <li>Permettre l'inscription et l'accès au service ;</li>
            <li>Assurer le suivi et la sauvegarde du portefeuille ;</li>
            <li>Améliorer l'Application (statistiques d'usage, débogage) ;</li>
            <li>Sécuriser les comptes utilisateurs (authentification, détection d'abus).</li>
          </ul>
          
          <h5 class="text-md font-semibold mb-3">3.1 Utilisation des données pour recommandations IA</h5>
          <p class="mb-4">
            L'Application peut analyser certaines données financières saisies par l'Utilisateur afin de générer des recommandations automatisées via un moteur d'intelligence artificielle.
            Ces recommandations sont fournies sans intervention humaine directe et ne doivent pas être considérées comme des conseils financiers professionnels.
            L'Utilisateur accepte que ses données soient traitées par des algorithmes dans ce but, conformément au RGPD.
          </p>
          
          <h4 class="text-lg font-semibold mb-4">4. Base légale</h4>
          <p class="mb-2">Le traitement est fondé sur :</p>
          <ul class="mb-4 list-disc pl-6">
            <li>L'exécution du contrat (CGU acceptées) ;</li>
            <li>Le respect des obligations légales (sécurité, lutte contre la fraude) ;</li>
            <li>L'intérêt légitime de l'éditeur (amélioration du service).</li>
          </ul>
          
          <h4 class="text-lg font-semibold mb-4">5. Conservation des données</h4>
          <ul class="mb-4 list-disc pl-6">
            <li>Les données du compte sont conservées tant que le compte est actif.</li>
            <li>Les données peuvent être supprimées à la demande de l'Utilisateur.</li>
            <li>Des sauvegardes techniques peuvent être conservées jusqu'à 12 mois.</li>
          </ul>
          
          <h4 class="text-lg font-semibold mb-4">6. Partage des données</h4>
          <p class="mb-2">Les données ne sont pas revendues. Elles peuvent être transmises à :</p>
          <ul class="mb-4 list-disc pl-6">
            <li>Des prestataires techniques (hébergement, sauvegarde cloud, analytics) ;</li>
            <li>Les autorités compétentes en cas d'obligation légale.</li>
          </ul>
          
          <h4 class="text-lg font-semibold mb-4">7. Sécurité</h4>
          <ul class="mb-4 list-disc pl-6">
            <li>Les mots de passe sont chiffrés (hash + sel).</li>
            <li>Les communications sont sécurisées (HTTPS, TLS).</li>
            <li>Des mesures anti-intrusion sont mises en place (pare-feu, surveillance).</li>
          </ul>
          
          <h4 class="text-lg font-semibold mb-4">8. Droits des utilisateurs (RGPD)</h4>
          <p class="mb-2">L'Utilisateur dispose de :</p>
          <ul class="mb-4 list-disc pl-6">
            <li>Droit d'accès à ses données ;</li>
            <li>Droit de rectification ;</li>
            <li>Droit à l'effacement (« droit à l'oubli ») ;</li>
            <li>Droit à la portabilité (export JSON/CSV) ;</li>
            <li>Droit d'opposition et de limitation du traitement.</li>
          </ul>
          <p class="mb-4">
            Il peut exercer ses droits en écrivant à privacy@trackerpro.app.
          </p>
          
          <h4 class="text-lg font-semibold mb-4">9. Cookies</h4>
          <p class="mb-2">L'Application peut utiliser des cookies et technologies similaires pour :</p>
          <ul class="mb-4 list-disc pl-6">
            <li>Authentifier les utilisateurs ;</li>
            <li>Mesurer l'audience ;</li>
            <li>Améliorer l'expérience de navigation.</li>
          </ul>
          <p class="mb-4">L'Utilisateur peut gérer ses préférences via son navigateur.</p>
          
          <h4 class="text-lg font-semibold mb-4">10. Modification de la politique</h4>
          <p class="mb-4">
            La présente politique peut être mise à jour. L'Utilisateur sera informé en cas de modification substantielle.
          </p>
        </div>
        
       <div class="p-6 border-t border-light-border dark:border-dark-border flex justify-end">
         <button 
           @click="showPrivacyModal = false"
           class="bg-accent hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg"
         >
           J'ai compris
         </button>
       </div>
      </div>
    </div>

    <!-- Email Sent Success Modal -->
    <div v-if="showEmailSentModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-md border border-light-border dark:border-dark-border">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold">Email envoyé !</h3>
            <button 
              @click="showEmailSentModal = false"
              class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <div class="space-y-4 text-center">
            <p class="text-light-text-secondary dark:text-dark-text-secondary">
              Un email de réinitialisation a été envoyé à<br>
              <strong>{{ forgotPasswordForm.email }}</strong>
            </p>
            
            <p class="text-sm text-light-text-secondary dark:text-dark-text-secondary bg-light-bg dark:bg-dark-bg p-3 rounded-lg">
              ⚠️ <strong>Vérifiez aussi votre dossier spam/courriers indésirables</strong>
            </p>
            
            <button 
              @click="showEmailSentModal = false"
              class="bg-accent hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg"
            >
              J'ai compris
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div v-if="showForgotPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-md border border-light-border dark:border-dark-border">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold flex items-center">
              <span class="mr-2">🔑</span>
              Mot de passe oublié
            </h3>
            <button 
              @click="showForgotPasswordModal = false"
              class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="handleForgotPassword" class="space-y-4">
            <p class="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
            
            <div>
              <label for="forgot-email" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                Adresse email
              </label>
              <input 
                type="email" 
                id="forgot-email" 
                v-model="forgotPasswordForm.email"
                required 
                :class="[
                  'w-full bg-light-bg dark:bg-dark-bg border rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-colors',
                  forgotPasswordError ? 'border-red-500 focus:border-red-500' : 'border-light-border dark:border-dark-border focus:border-accent'
                ]"
                placeholder="votre@email.com"
              >
              <p v-if="forgotPasswordError" class="mt-1 text-sm text-red-500">{{ forgotPasswordError }}</p>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button 
                type="button"
                @click="showForgotPasswordModal = false"
                class="px-4 py-2 bg-gray-200 dark:bg-slate-600 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500"
              >
                Annuler
              </button>
              <button 
                type="submit"
                :disabled="loading || !forgotPasswordForm.email"
                class="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {{ loading ? 'Envoi...' : 'Envoyer le lien' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <div v-if="showResetPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-md border border-light-border dark:border-dark-border">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold flex items-center">
              <span class="mr-2">🔐</span>
              Nouveau mot de passe
            </h3>
            <button 
              @click="showResetPasswordModal = false"
              class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="handleResetPassword" class="space-y-4">
            <p class="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
              Entrez le code de vérification reçu par email et votre nouveau mot de passe.
            </p>
            
            <div>
              <label for="reset-code" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                Code de vérification
              </label>
              <input 
                type="text" 
                id="reset-code" 
                v-model="resetPasswordForm.resetCode"
                required 
                :class="[
                  'w-full bg-light-bg dark:bg-dark-bg border rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-colors',
                  resetCodeError ? 'border-red-500 focus:border-red-500' : 'border-light-border dark:border-dark-border focus:border-accent'
                ]"
                placeholder="123456"
              >
              <p v-if="resetCodeError" class="mt-1 text-sm text-red-500">{{ resetCodeError }}</p>
            </div>
            
            <div>
              <label for="reset-new-password" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                Nouveau mot de passe
              </label>
              <input 
                type="password" 
                id="reset-new-password" 
                v-model="resetPasswordForm.newPassword"
                @input="validateResetPassword"
                minlength="6"
                required 
                :class="[
                  'w-full bg-light-bg dark:bg-dark-bg border rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-colors',
                  resetPasswordError ? 'border-red-500 focus:border-red-500' : 'border-light-border dark:border-dark-border focus:border-accent'
                ]"
                placeholder="••••••••"
              >
              <p v-if="resetPasswordError" class="mt-1 text-sm text-red-500">{{ resetPasswordError }}</p>
            </div>
            
            <div>
              <label for="reset-confirm-password" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                Confirmer le mot de passe
              </label>
              <input 
                type="password" 
                id="reset-confirm-password" 
                v-model="resetPasswordForm.confirmPassword"
                @blur="validateResetPasswordMatch"
                required 
                :class="[
                  'w-full bg-light-bg dark:bg-dark-bg border rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-colors',
                  resetConfirmPasswordError ? 'border-red-500 focus:border-red-500' : 'border-light-border dark:border-dark-border focus:border-accent'
                ]"
                placeholder="••••••••"
              >
              <p v-if="resetConfirmPasswordError" class="mt-1 text-sm text-red-500">{{ resetConfirmPasswordError }}</p>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button 
                type="button"
                @click="showResetPasswordModal = false"
                class="px-4 py-2 bg-gray-200 dark:bg-slate-600 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500"
              >
                Annuler
              </button>
              <button 
                type="submit"
                :disabled="loading || !isResetFormValid"
                class="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {{ loading ? 'Réinitialisation...' : 'Réinitialiser' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const { showToast } = useToast()

const activeTab = ref<'login' | 'signup'>('login')
const loading = ref(false)

// Password visibility toggles
const showLoginPassword = ref(false)
const showSignupPassword = ref(false)
const showConfirmPassword = ref(false)
const showTermsModal = ref(false)
const showPrivacyModal = ref(false)
const showForgotPasswordModal = ref(false)
const showResetPasswordModal = ref(false)
const showEmailSentModal = ref(false)

// Form data
const loginForm = ref({
  email: '',
  password: ''
})

const signupForm = ref({
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
  captchaVerified: false
})

const forgotPasswordForm = ref({
  email: ''
})

const resetPasswordForm = ref({
  newPassword: '',
  confirmPassword: '',
  resetCode: ''
})

// Validation errors
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const forgotPasswordError = ref('')
const resetPasswordError = ref('')
const resetConfirmPasswordError = ref('')
const resetCodeError = ref('')

// Password strength calculation
const passwordStrength = computed(() => {
  const password = signupForm.value.password
  if (!password) return { level: 'weak', score: 0, text: 'Faible' }
  
  let score = 0
  let level = 'weak'
  let text = 'Faible'
  
  // Length check
  if (password.length >= 8) score += 25
  if (password.length >= 12) score += 15
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 15
  if (/[A-Z]/.test(password)) score += 15
  if (/[0-9]/.test(password)) score += 15
  if (/[^A-Za-z0-9]/.test(password)) score += 15
  
  if (score >= 70) {
    level = 'strong'
    text = 'Fort'
  } else if (score >= 40) {
    level = 'medium'
    text = 'Moyen'
  }
  
  return { level, score, text }
})

// Form validation
const isSignupFormValid = computed(() => {
  return signupForm.value.email &&
         signupForm.value.password &&
         signupForm.value.confirmPassword &&
         signupForm.value.acceptTerms &&
         signupForm.value.captchaVerified &&
         !emailError.value &&
         !passwordError.value &&
         !confirmPasswordError.value &&
         signupForm.value.password === signupForm.value.confirmPassword
})

// Validation functions
const validateEmail = () => {
  const email = signupForm.value.email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email) {
    emailError.value = ''
  } else if (!emailRegex.test(email)) {
    emailError.value = 'Format d\'email invalide'
  } else {
    emailError.value = ''
  }
}

const validatePassword = () => {
  const password = signupForm.value.password
  
  if (!password) {
    passwordError.value = ''
  } else if (password.length < 6) {
    passwordError.value = 'Le mot de passe doit contenir au moins 6 caractères'
  } else {
    passwordError.value = ''
  }
  
  // Also validate password match if confirm password is filled
  if (signupForm.value.confirmPassword) {
    validatePasswordMatch()
  }
}

const validatePasswordMatch = () => {
  if (signupForm.value.password !== signupForm.value.confirmPassword) {
    confirmPasswordError.value = 'Les mots de passe ne correspondent pas'
  } else {
    confirmPasswordError.value = ''
  }
}

const handleCaptchaChange = () => {
  // Simple captcha simulation - in real app, use reCAPTCHA
  if (signupForm.value.captchaVerified) {
    setTimeout(() => {
      showToast('Vérification captcha réussie', 'success')
    }, 500)
  }
}

// Clear error when switching tabs
watch(activeTab, () => {
  authStore.clearError()
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
  forgotPasswordError.value = ''
  resetPasswordError.value = ''
  resetConfirmPasswordError.value = ''
  resetCodeError.value = ''
})

// Reset form validation
const isResetFormValid = computed(() => {
  return resetPasswordForm.value.resetCode &&
         resetPasswordForm.value.newPassword &&
         resetPasswordForm.value.confirmPassword &&
         !resetPasswordError.value &&
         !resetConfirmPasswordError.value &&
         !resetCodeError.value &&
         resetPasswordForm.value.newPassword === resetPasswordForm.value.confirmPassword
})

const validateResetPassword = () => {
  const password = resetPasswordForm.value.newPassword
  
  if (!password) {
    resetPasswordError.value = ''
  } else if (password.length < 6) {
    resetPasswordError.value = 'Le mot de passe doit contenir au moins 6 caractères'
  } else {
    resetPasswordError.value = ''
  }
  
  // Also validate password match if confirm password is filled
  if (resetPasswordForm.value.confirmPassword) {
    validateResetPasswordMatch()
  }
}

const validateResetPasswordMatch = () => {
  if (resetPasswordForm.value.newPassword !== resetPasswordForm.value.confirmPassword) {
    resetConfirmPasswordError.value = 'Les mots de passe ne correspondent pas'
  } else {
    resetConfirmPasswordError.value = ''
  }
}

const handleLogin = async () => {
  loading.value = true
  try {
    await authStore.login(loginForm.value.email, loginForm.value.password)
    showToast('Connexion réussie!', 'success')
    router.push('/dashboard')
  } catch (error) {
    // Error is handled in the store
  } finally {
    loading.value = false
  }
}

const handleSignup = async () => {
  // Final validation
  validateEmail()
  validatePassword()
  validatePasswordMatch()
  
  if (!isSignupFormValid.value) {
    showToast('Veuillez corriger les erreurs du formulaire', 'error')
    return
  }
  
  loading.value = true
  try {
    await authStore.register(signupForm.value.email, signupForm.value.password)
    showToast('Compte créé avec succès!', 'success')
    router.push('/dashboard')
  } catch (error) {
    // Error is handled in the store
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = async () => {
  // Clear previous errors
  forgotPasswordError.value = ''
  authStore.clearError()
  
  // Validate email
  if (!forgotPasswordForm.value.email) {
    forgotPasswordError.value = 'Veuillez entrer votre adresse email'
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(forgotPasswordForm.value.email)) {
    forgotPasswordError.value = 'Format d\'email invalide'
    return
  }
  
  loading.value = true
  
  try {
    await authStore.sendPasswordResetEmail(forgotPasswordForm.value.email)
    showToast('Email envoyé! Vérifiez votre boîte mail ET vos spams/courriers indésirables.', 'success')
    showForgotPasswordModal.value = false
    showEmailSentModal.value = true
    forgotPasswordForm.value.email = ''
  } catch (error) {
    console.error('Forgot password error:', error)
    if (authStore.error) {
      forgotPasswordError.value = authStore.error
    } else {
      forgotPasswordError.value = 'Erreur lors de l\'envoi de l\'email'
    }
  } finally {
    loading.value = false
  }
}

const handleResetPassword = async () => {
  // Final validation
  validateResetPassword()
  validateResetPasswordMatch()
  
  if (!isResetFormValid.value) {
    showToast('Veuillez corriger les erreurs du formulaire', 'error')
    return
  }
  
  loading.value = true
  try {
    await authStore.confirmPasswordReset(
      resetPasswordForm.value.resetCode,
      resetPasswordForm.value.newPassword
    )
    showToast('Mot de passe réinitialisé avec succès!', 'success')
    showResetPasswordModal.value = false
    
    // Reset form
    resetPasswordForm.value = {
      newPassword: '',
      confirmPassword: '',
      resetCode: ''
    }
    
    // Switch to login tab
    activeTab.value = 'login'
  } catch (error) {
    resetCodeError.value = 'Code de vérification invalide ou expiré'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Custom checkbox styling for better visual consistency */
input[type="checkbox"]:checked {
  background-color: #14B8A6;
  border-color: #14B8A6;
}

/* Smooth transitions for all interactive elements */
button, input, label {
  transition: all 0.2s ease-in-out;
}

/* Focus ring improvements */
input:focus, button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

/* Hover effects for links */
a:hover {
  text-decoration: underline;
}
</style>