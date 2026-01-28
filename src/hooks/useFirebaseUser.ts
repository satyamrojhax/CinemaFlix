"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { queryClient } from "@/app/providers";
import { addToast } from "@heroui/react";
import { ref, get } from "firebase/database";
import { database } from "@/utils/firebase";

type AuthUserData = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  username?: string;
};

const fetchUser = async (user: any): Promise<AuthUserData | null> => {
  if (!user) return null;

  try {
    // Get additional user data from Firebase Realtime Database
    const userRef = ref(database, `users/${user.uid}`);
    const snapshot = await get(userRef);

    let username = '';
    if (snapshot.exists()) {
      const userData = snapshot.val();
      username = userData.displayName || '';
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      username,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    addToast({
      title: "Error fetching user data",
      description: "Could not load user profile",
      color: "danger",
    });

    // Return basic user data even if database fetch fails
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  }
};

const useFirebaseUser = () => {
  const { user, loading } = useFirebaseAuth();

  const query = useQuery({
    queryKey: ["firebase-user"],
    queryFn: () => fetchUser(user),
    enabled: !loading && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // Invalidate query when user changes
    queryClient.invalidateQueries({ queryKey: ["firebase-user"] });
  }, [user]);

  return query;
};

export default useFirebaseUser;
