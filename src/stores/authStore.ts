import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail as _sendPasswordResetEmail,
  confirmPasswordReset,
  type User
} from 'firebase/auth'
import { auth } from '@/firebase'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref('')

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userId = computed(() => user.value?.uid || null)

  // Actions
  const initAuth = () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser
        loading.value = false
        resolve(firebaseUser)
        unsubscribe()
      })
    })
  }

  const login = async (email: string, password: string) => {
    try {
      error.value = ''
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      error.value = 'Email ou mot de passe incorrect.'
      throw err
    }
  }

  const register = async (email: string, password: string) => {
    try {
      error.value = ''
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      error.value = "Erreur: L'email est peut-être déjà utilisé."
      throw err
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const clearError = () => {
    error.value = ''
  }

  const sendPasswordResetEmail = async (email: string) => {
    try {
      error.value = ''
      await _sendPasswordResetEmail(auth, email)
      console.log('Password reset email sent successfully')
    } catch (err: any) {
      console.error('Password reset email error:', err.code, err.message)
      if (err.code === 'auth/user-not-found') {
        error.value = 'Aucun compte trouvé avec cette adresse email.'
      } else if (err.code === 'auth/invalid-email') {
        error.value = 'Adresse email invalide.'
      } else if (err.code === 'auth/too-many-requests') {
        error.value = 'Trop de tentatives. Veuillez réessayer plus tard.'
      } else {
        error.value = 'Erreur lors de l\'envoi de l\'email de réinitialisation.'
      }
      throw err
    }
  }

  const confirmPasswordReset = async (code: string, newPassword: string) => {
    try {
      error.value = ''
      await confirmPasswordReset(auth, code, newPassword)
    } catch (err: any) {
      console.error('Password reset confirmation error:', err)
      if (err.code === 'auth/invalid-action-code') {
        error.value = 'Code de vérification invalide ou expiré.'
      } else if (err.code === 'auth/expired-action-code') {
        error.value = 'Le code de vérification a expiré.'
      } else if (err.code === 'auth/weak-password') {
        error.value = 'Le mot de passe est trop faible.'
      } else {
        error.value = 'Erreur lors de la réinitialisation du mot de passe.'
      }
      throw err
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser
  })

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userId,
    initAuth,
    login,
    register,
    logout,
    clearError,
    sendPasswordResetEmail,
    confirmPasswordReset
  }
})