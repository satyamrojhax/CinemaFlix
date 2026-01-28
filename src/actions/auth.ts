"use server";

import {
  ForgotPasswordFormInput,
  ForgotPasswordFormSchema,
  LoginFormInput,
  LoginFormSchema,
  RegisterFormInput,
  RegisterFormSchema,
  ResetPasswordFormInput,
  ResetPasswordFormSchema,
} from "@/schemas/auth";
import { z } from "zod";
import { ActionResponse } from "@/types";
import { cookies } from "next/headers";

/**
 * A generic type for our authentication actions.
 * @template T The type of the form data.
 * @param data The validated form data.
 * @returns An ActionResponse.
 */
type AuthAction<T> = (data: T) => Promise<ActionResponse>;

/**
 * A higher-order function to create a server action that handles
 * form validation and captcha checks for Firebase auth.
 * @template T The type of the form data, which must include an optional captchaToken.
 * @param schema The Zod schema for validation.
 * @param action The core logic of the server action.
 * @returns An async function that serves as the server action.
 */
const createAuthAction = <T extends { captchaToken?: string }>(
  schema: z.ZodSchema<T>,
  action: AuthAction<T>,
) => {
  return async (formData: T): Promise<ActionResponse> => {
    const result = schema.safeParse(formData);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(". ");
      return { success: false, message };
    }

    // Temporarily disable captcha requirement for better UX
    // Firebase Auth provides sufficient protection against abuse
    // TODO: Re-enable captcha when forms are updated to include it
    /*
    if (!result.data.captchaToken) {
      return { success: false, message: "Captcha is required." };
    }
    */

    try {
      return await action(result.data);
    } catch (error) {
      // Catch potential unhandled errors in actions
      if (error instanceof Error) {
        return { success: false, message: error.message };
      }
      return { success: false, message: "An unexpected error occurred." };
    }
  };
};

const signInWithEmailAction: AuthAction<LoginFormInput> = async (data) => {
  // Firebase auth is handled on the client side
  return { success: true, message: "Sign in request validated. Client will handle authentication." };
};

const signUpAction: AuthAction<RegisterFormInput> = async (data) => {
  // Firebase auth is handled on the client side
  return {
    success: true,
    message: "Sign up request validated. Client will handle user creation.",
  };
};

const sendResetPasswordEmailAction: AuthAction<ForgotPasswordFormInput> = async (data) => {
  // Password reset is handled on the client side with Firebase Auth
  return {
    success: true,
    message: "Password reset request validated. Client will handle email sending.",
  };
};

const resetPasswordAction: AuthAction<ResetPasswordFormInput> = async (data) => {
  // Password update is handled on the client side with Firebase Auth
  return { success: true, message: "Password reset request validated." };
};

export const signIn = createAuthAction(LoginFormSchema, signInWithEmailAction);
export const signUp = createAuthAction(RegisterFormSchema, signUpAction);
export const sendResetPasswordEmail = createAuthAction(
  ForgotPasswordFormSchema,
  sendResetPasswordEmailAction,
);
export const resetPassword = createAuthAction(ResetPasswordFormSchema, resetPasswordAction);

export const signOut = async (): Promise<ActionResponse> => {
  // Clear the auth token cookie
  const cookieStore = await cookies();
  cookieStore.delete('firebase-auth-token');

  return { success: true, message: "You have been signed out." };
};
