import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  isSignInWithEmailLink,
  signInWithEmailLink
} from "firebase/auth";
import { firebaseApp } from "./firebaseClient";

const auth = getAuth(firebaseApp);

export async function loginWithEmail(email: string, password: string) {
  // Strict Login
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function registerWithEmail(email: string, password: string, name: string) {
  // Explicit Registration
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update Firebase Profile Display Name
  if (result.user) {
    await updateProfile(result.user, { displayName: name });
  }
  
  return result.user;
}

export async function confirmMagicLogin() {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Por favor, confirme seu email para continuar:');
    }
    if (email) {
      const result = await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
      return result.user;
    }
  }
  return null;
}

export function logout() {
  return auth.signOut();
}

export const AuthService = {
  loginWithEmail,
  registerWithEmail,
  confirmMagicLogin,
  logout
};