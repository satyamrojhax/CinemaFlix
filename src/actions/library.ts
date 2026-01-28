"use server";

import { database } from "@/utils/firebase";
import { ref, set, get, remove, query, orderByChild, limitToLast, startAt, endAt } from "firebase/database";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// Types
type ContentType = "movie" | "tv";
type FilterType = ContentType | "all";

interface WatchlistItem {
  id: number;
  type: ContentType;
  adult: boolean;
  backdrop_path: string;
  poster_path?: string | null;
  release_date: string;
  title: string;
  vote_average: number;
}

interface WatchlistEntry extends WatchlistItem {
  user_id: string;
  created_at: string;
}

interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

interface WatchlistResponse extends ActionResponse<WatchlistEntry[]> {
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  hasNextPage?: boolean;
}

interface CheckWatchlistResponse extends ActionResponse {
  isInWatchlist: boolean;
}

/**
 * Add item to watchlist
 */
export async function addToWatchlist(item: WatchlistItem): Promise<ActionResponse<WatchlistEntry>> {
  try {
    // Get current user from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('firebase-user-id')?.value;

    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to add items to watchlist",
      };
    }

    // Validate required fields
    if (!item.id || !item.type || !item.title) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    // Validate type
    if (!["movie", "tv"].includes(item.type)) {
      return {
        success: false,
        error: 'Invalid content type. Must be "movie" or "tv"',
      };
    }

    // Check if item already exists
    const watchlistRef = ref(database, `watchlist/${userId}/${item.type}_${item.id}`);
    const existingItem = await get(watchlistRef);

    if (existingItem.exists()) {
      return {
        success: false,
        error: "This item is already in your watchlist",
      };
    }

    // Add to watchlist
    const watchlistEntry: WatchlistEntry = {
      user_id: userId,
      id: item.id,
      type: item.type,
      adult: item.adult || false,
      backdrop_path: item.backdrop_path || "",
      poster_path: item.poster_path || null,
      release_date: item.release_date || new Date().toISOString().split("T")[0],
      title: item.title,
      vote_average: item.vote_average || 0,
      created_at: new Date().toISOString(),
    };

    await set(watchlistRef, watchlistEntry);

    // Revalidate the watchlist page if you have one
    revalidatePath("/library");

    return {
      success: true,
      data: watchlistEntry,
      message: "Added to watchlist successfully",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Remove item from watchlist
 */
export async function removeFromWatchlist(id: number, type: ContentType): Promise<ActionResponse> {
  try {
    // Get current user from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('firebase-user-id')?.value;

    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to remove items from watchlist",
      };
    }

    // Validate inputs
    if (!id || !type) {
      return {
        success: false,
        error: "Missing required parameters",
      };
    }

    // Validate type
    if (!["movie", "tv"].includes(type)) {
      return {
        success: false,
        error: "Invalid content type",
      };
    }

    // Delete from watchlist
    const watchlistRef = ref(database, `watchlist/${userId}/${type}_${id}`);
    await remove(watchlistRef);

    // Revalidate the watchlist page
    revalidatePath("/library");

    return {
      success: true,
      message: "Removed from watchlist successfully",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Remove all items from watchlist
 */
export const removeAllWatchlist = async (type: ContentType): Promise<ActionResponse> => {
  try {
    // Get current user from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('firebase-user-id')?.value;

    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to remove items from watchlist",
      };
    }

    // Validate type
    if (!["movie", "tv"].includes(type)) {
      return {
        success: false,
        error: "Invalid content type",
      };
    }

    // Get all items of the specified type
    const watchlistRef = ref(database, `watchlist/${userId}`);
    const snapshot = await get(watchlistRef);

    if (snapshot.exists()) {
      const updates: { [key: string]: null } = {};
      snapshot.forEach((childSnapshot) => {
        const item = childSnapshot.val();
        if (item.type === type) {
          updates[childSnapshot.key!] = null;
        }
      });

      // Remove all items of the specified type
      await set(ref(database, `watchlist/${userId}`), updates);
    }

    // Revalidate the watchlist page
    revalidatePath("/library");

    return {
      success: true,
      message: "Removed items from watchlist successfully",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
};

/**
 * Check if item is in watchlist
 */
export async function checkInWatchlist(
  id: number,
  type: ContentType,
): Promise<CheckWatchlistResponse> {
  try {
    // Get current user from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('firebase-user-id')?.value;

    if (!userId) {
      return {
        success: false,
        isInWatchlist: false,
        error: "User not authenticated",
      };
    }

    // Check if exists
    const watchlistRef = ref(database, `watchlist/${userId}/${type}_${id}`);
    const snapshot = await get(watchlistRef);

    return {
      success: true,
      isInWatchlist: snapshot.exists(),
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      isInWatchlist: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get user's watchlist with pagination - optimized for infinite scroll
 */
export async function getWatchlist(
  filterType: FilterType = "all",
  page: number = 1,
  limit: number = 20,
): Promise<WatchlistResponse> {
  try {
    // Get current user from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('firebase-user-id')?.value;

    if (!userId) {
      return {
        success: false,
        data: [],
        error: "User not authenticated",
      };
    }

    // Get all watchlist items for the user
    const watchlistRef = ref(database, `watchlist/${userId}`);
    const snapshot = await get(watchlistRef);

    if (!snapshot.exists()) {
      return {
        success: true,
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
        hasNextPage: false,
      };
    }

    // Convert Firebase data to array
    const allItems: WatchlistEntry[] = [];
    snapshot.forEach((childSnapshot) => {
      const item = childSnapshot.val();
      allItems.push({
        ...item,
        // Firebase stores timestamps as strings, ensure proper format
        created_at: item.created_at || new Date().toISOString(),
      });
    });

    // Sort by created_at descending (newest first)
    allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Apply type filter if not 'all'
    let filteredItems = allItems;
    if (filterType !== "all" && ["movie", "tv"].includes(filterType)) {
      filteredItems = allItems.filter(item => item.type === filterType);
    }

    // Apply pagination
    const totalCount = filteredItems.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedItems,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      data: [],
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Toggle watchlist status (helper function)
 */
export async function toggleWatchlist(item: WatchlistItem): Promise<ActionResponse> {
  const checkResult = await checkInWatchlist(item.id, item.type);

  if (!checkResult.success) {
    return checkResult;
  }

  if (checkResult.isInWatchlist) {
    return await removeFromWatchlist(item.id, item.type);
  } else {
    return await addToWatchlist(item);
  }
}
