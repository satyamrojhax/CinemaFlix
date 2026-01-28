// System fonts with proper fallbacks to prevent loading issues
export const Poppins = {
  style: {
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', sans-serif`,
  },
  className: "font-system",
  variable: "--font-system",
};

export const Saira = {
  style: {
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', sans-serif`,
  },
  className: "font-system",
  variable: "--font-system",
};

/*
// Google Fonts implementation with better error handling
import { Poppins as FontPoppins, Saira as FontSaira } from "next/font/google";

export const PoppinsGoogle = FontPoppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins-google",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
  preload: false, // Disable preload to prevent blocking
});

export const SairaGoogle = FontSaira({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-saira-google",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
  preload: false, // Disable preload to prevent blocking
});
*/
