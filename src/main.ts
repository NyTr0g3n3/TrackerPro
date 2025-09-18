import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// --- DÉBUT DE L'AJOUT ---
import { initializeApp } from "firebase/app";

// Remplacez ceci par la configuration de VOTRE projet Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCk7H7sYkOK2QTerf4AQ4wsVERybtabhNo",
  authDomain: "trackerpro-24078.firebaseapp.com",
  projectId: "trackerpro-24078",
  storageBucket: "trackerpro-24078.firebasestorage.app",
  messagingSenderId: "540544759594",
  appId: "1:540544759594:web:88986e78dd2f47e8625053"
};

// Initialise Firebase
initializeApp(firebaseConfig);
// --- FIN DE L'AJOUT ---


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')