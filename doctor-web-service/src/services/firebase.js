import {getAuth, OAuthProvider, signInWithPopup} from 'firebase/auth'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'

export const signInWithGoogle = async () => {
  const googleProvider = new firebase.auth.GoogleAuthProvider()
  try {
    const result = await firebase.auth().signInWithPopup(googleProvider)
    return result
  } catch (error) {}
}

export const signInWithApple = async () => {
  const auth = getAuth()
  let appleProvider = new OAuthProvider('apple.com')
  appleProvider.addScope('email')
  appleProvider.addScope('name')

  try {
    const result = await signInWithPopup(auth, appleProvider)
    return result
  } catch (error) {
    eventEmitter.emit('apiError', {...error, alertType: alertType.MODAL})
  }
}

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
}
let firebaseApp
if (!firebase.apps.length) {
  firebaseApp = firebase.initializeApp(config)
}

export const auth = getAuth(firebaseApp)
export const firestore = firebase.firestore()
