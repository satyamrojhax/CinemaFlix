import { auth } from "./config";
import { 
  signInWithEmailAndPassword as signIn,
  createUserWithEmailAndPassword as signUp,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";

export type User = FirebaseUser;

export function createClient() {
  return {
    auth,
    signIn,
    signUp,
    signOut: firebaseSignOut,
    onAuthStateChanged: firebaseOnAuthStateChanged
  };
}

export const { auth: firebaseAuth, signIn: firebaseSignIn, signUp: firebaseSignUp, signOut: firebaseSignOutFunc, onAuthStateChanged: firebaseOnAuthStateChangedFunc } = createClient();
