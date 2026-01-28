// Server-side Firebase utilities are not recommended for auth operations
// Firebase Auth should be handled client-side only
// This file is kept for potential future server-side database operations

import { getDatabase } from "firebase/database";
import { app } from "./config";

export const database = getDatabase(app);
