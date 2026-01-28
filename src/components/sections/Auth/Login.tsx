import { signIn } from "@/actions/auth";
import PasswordInput from "@/components/ui/input/PasswordInput";
import { LoginFormSchema } from "@/schemas/auth";
import { Google, LockPassword, Mail } from "@/utils/icons";
import { addToast, Button, Divider, Input, Link } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthFormProps } from "./Forms";
import { useRouter } from "@bprogress/next/app";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { auth } from "@/utils/firebase";
import GoogleLoginButton from "@/components/ui/button/GoogleLoginButton";

const AuthLoginForm: React.FC<AuthFormProps> = ({ setForm }) => {
  const router = useRouter();
  const { signIn: firebaseSignIn } = useFirebaseAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      loginPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // First validate on server
      const { success, message } = await signIn(data);

      if (!success) {
        addToast({
          title: message,
          color: "danger",
        });
        return;
      }

      // If server validation passes, perform Firebase authentication
      try {
        console.log("Attempting Firebase sign in for:", data.email);

        // Check if Firebase Auth is available
        if (!auth) {
          throw new Error("Firebase Auth is not initialized");
        }

        await firebaseSignIn(data.email, data.loginPassword);
        console.log("Firebase sign in successful");

        addToast({
          title: "Login successful!",
          color: "success",
        });

        router.push("/");
      } catch (firebaseError: any) {
        console.error("Firebase login error:", firebaseError);

        // Handle specific Firebase errors
        let errorMessage = "Login failed. Please try again.";

        if (firebaseError.code === 'auth/user-not-found') {
          errorMessage = "Account not found. Please check your email or create an account.";
        } else if (firebaseError.code === 'auth/wrong-password') {
          errorMessage = "Incorrect password. Please try again.";
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = "Invalid email address.";
        } else if (firebaseError.code === 'auth/user-disabled') {
          errorMessage = "This account has been disabled.";
        } else if (firebaseError.code === 'auth/too-many-requests') {
          errorMessage = "Too many failed login attempts. Please try again later.";
        } else if (firebaseError.code === 'auth/network-request-failed') {
          errorMessage = "Network error. Please check your internet connection.";
        } else if (firebaseError.code === 'auth/internal-error') {
          errorMessage = "Server error. Please try again in a moment.";
        }

        addToast({
          title: "Login Failed",
          description: errorMessage,
          color: "danger",
        });
        return;
      }
    } catch (error: any) {
      addToast({
        title: "Login Error",
        description: error.message || "An unexpected error occurred during login",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  const getButtonText = useCallback(() => {
    if (isSubmitting) return "Signing In...";
    return "Sign In";
  }, [isSubmitting]);

  return (
    <div className="flex flex-col gap-5">
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <p className="text-small text-foreground-500 mb-4 text-center">
          Sign in to continue your streaming journey
        </p>
        <Input
          {...register("email")}
          isInvalid={!!errors.email?.message}
          errorMessage={errors.email?.message}
          isRequired
          label="Email Address"
          placeholder="Enter your email"
          type="email"
          variant="underlined"
          startContent={<Mail className="text-xl" />}
          isDisabled={isSubmitting}
        />
        <PasswordInput
          {...register("loginPassword")}
          isInvalid={!!errors.loginPassword?.message}
          errorMessage={errors.loginPassword?.message}
          isRequired
          variant="underlined"
          label="Password"
          placeholder="Enter your password"
          startContent={<LockPassword className="text-xl" />}
          isDisabled={isSubmitting}
        />
        <div className="flex w-full items-center justify-end px-1 py-2">
          <Link
            size="sm"
            className="text-foreground cursor-pointer"
            onClick={() => setForm("forgot")}
            isDisabled={isSubmitting}
          >
            Forgot password?
          </Link>
        </div>
        <Button
          className="mt-4"
          color="primary"
          type="submit"
          variant="shadow"
          isLoading={isSubmitting}
        >
          {getButtonText()}
        </Button>
      </form>
      <div className="flex items-center gap-4">
        <Divider className="flex-1" />
        <p className="text-tiny text-default-500 shrink-0">OR</p>
        <Divider className="flex-1" />
      </div>
      <GoogleLoginButton isDisabled={isSubmitting} />
      <p className="text-small text-center">
        Don't have an account?
        <Link
          isBlock
          size="sm"
          className="cursor-pointer"
          onClick={() => setForm("register")}
          isDisabled={isSubmitting}
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default AuthLoginForm;
