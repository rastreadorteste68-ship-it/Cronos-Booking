import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  isSignInWithEmailLink,
  signInWithEmailLink
} from "firebase/auth";
import { firebaseApp } from "./firebaseClient";

const auth = getAuth(firebaseApp);

export async function loginWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (err: any) {
    // Check for user-not-found (standard) or invalid-credential (newer identity platform)
    if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    }
    throw err;
  }
}

export function logout() {
  return auth.signOut();
}

export async function confirmMagicLogin() {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Por favor, confirme seu email para login:') || '';
    }
    if (email) {
      const result = await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
      return result.user;
    }
  }
  return null;
}

export const AuthService = {
  loginWithEmail,
  logout,
  confirmMagicLogin
};