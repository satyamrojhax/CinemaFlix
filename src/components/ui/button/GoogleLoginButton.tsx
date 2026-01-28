"use client";

import { Google } from "@/utils/icons";
import { addToast, Button } from "@heroui/react";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/utils/firebase";

type GoogleLoginButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "startContent" | "onPress"
>;

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ variant = "faded", ...props }) => {
  const { signIn } = useFirebaseAuth();
  const router = useRouter();

  const handleGoogleLogin = useCallback(async () => {
    try {
      // For now, implement basic Google sign-in with Firebase
      // In a production app, you'd use Firebase's Google Auth provider
      const provider = new GoogleAuthProvider();

      // This will open a popup for Google authentication
      const result = await signInWithPopup(auth, provider);

      addToast({
        title: "Success",
        description: "Successfully signed in with Google",
        color: "success",
      });

      // Redirect to homepage after successful sign-in
      router.push("/");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      addToast({
        title: "Authentication Error",
        description: error.message || "Failed to sign in with Google",
        color: "danger",
      });
    }
  }, [signIn, router]);

  return (
    <Button
      variant={variant}
      startContent={<Google size={20} />}
      onPress={handleGoogleLogin}
      {...props}
    >
      Continue with Google
    </Button>
  );
};

export default GoogleLoginButton;
