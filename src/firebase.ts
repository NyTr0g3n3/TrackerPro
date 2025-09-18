import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCk7H7sYkOK2QTerf4AQ4wsVERybtabhNo",
  authDomain: "trackerpro-24078.firebaseapp.com",
  projectId: "trackerpro-24078",
  storageBucket: "trackerpro-24078.firebasestorage.app",
  messagingSenderId: "540544759594",
  appId: "1:540544759594:web:88986e78dd2f47e8625053"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Connect to emulators in development (optional)
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, 'http://localhost:9099')
//   connectFirestoreEmulator(db, 'localhost', 8080)
// }

export default app