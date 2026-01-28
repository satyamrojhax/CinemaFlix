"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
const UnauthorizedNotice = dynamic(() => import("@/components/ui/notice/Unauthorized"));
const LibraryList = dynamic(() => import("@/components/sections/Library/List"));

const LibraryPage = () => {
  const { user, loading } = useFirebaseAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      {!user ? (
        <UnauthorizedNotice
          title="Sign in to access your library"
          description="Create a free account to save your favorite movies and TV shows!"
        />
      ) : (
        <LibraryList />
      )}
    </Suspense>
  );
};

export default LibraryPage;
