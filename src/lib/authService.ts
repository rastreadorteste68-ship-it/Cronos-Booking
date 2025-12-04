import { 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "./firebaseClient";

const ACTION_CODE_SETTINGS = {
  // URL you want to redirect back to. The domain (without http) must be in the authorized domains list in the Firebase Console.
  url: window.location.origin + "/#/auth/callback",
  handleCodeInApp: true,
};

export const AuthService = {
  sendMagicLink: async (email: string) => {
    try {
      await sendSignInLinkToEmail(auth, email, ACTION_CODE_SETTINGS);
      // Save the email locally so you don't need to ask the user for it again
      // if they open the link on the same device.
      window.localStorage.setItem('emailForSignIn', email);
      return true;
    } catch (error) {
      console.error("Error sending email link", error);
      throw error;
    }
  },

  confirmMagicLogin: async (): Promise<FirebaseUser | null> => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      
      if (!email) {
        // User opened the link on a different device. To prevent session fixation
        // attacks, ask the user to provide the associated email or verify it.
        // For simplicity in this prompt, we ask via window.prompt, 
        // but in a real UI you'd show a form.
        email = window.prompt('Por favor, confirme seu e-mail para finalizar o login:');
      }

      if (email) {
        try {
          const result = await signInWithEmailLink(auth, email, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          return result.user;
        } catch (error) {
          console.error("Error signing in with email link", error);
          throw error;
        }
      }
    }
    return null;
  }
};
