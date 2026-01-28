"use server";

import { tmdb } from "@/api/tmdb";
import { UnifiedPlayerEventData } from "@/hooks/usePlayerEvents";
import { ActionResponse } from "@/types";
import { HistoryDetail } from "@/types/movie";
import { mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import { database } from "@/utils/firebase";
import { ref, set, get, query, orderByChild, limitToLast } from "firebase/database";
import { cookies } from "next/headers";

export const syncHistory = async (
  data: UnifiedPlayerEventData,
  completed?: boolean,
): Promise<ActionResponse> => {
  console.info("Saving history:", data);

  if (!data) return { success: false, message: "No data to save" };

  if (data.mediaType === "tv" && (!data.season || !data.episode)) {
    return { success: false, message: "Missing season or episode" };
  }

  try {
    // Get current user from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('firebase-user-id')?.value;

    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to save history",
      };
    }

    // Validate required fields
    if (!data.mediaId || !data.mediaType) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    // Validate type
    if (!["movie", "tv"].includes(data.mediaType)) {
      return {
        success: false,
        message: 'Invalid content type. Must be "movie" or "tv"',
      };
    }

    const media =
      data.mediaType === "movie"
        ? await tmdb.movies.details(Number(data.mediaId))
        : await tmdb.tvShows.details(Number(data.mediaId));

    // Create unique key for history entry
    const historyKey = data.mediaType === "tv"
      ? `${data.mediaId}_${data.season}_${data.episode}`
      : `${data.mediaId}`;

    const historyRef = ref(database, `histories/${userId}/${historyKey}`);

    const historyData = {
      user_id: userId,
      media_id: Number(data.mediaId),
      type: data.mediaType,
      season: data.season || 0,
      episode: data.episode || 0,
      duration: data.duration,
      last_position: data.currentTime,
      completed: completed || false,
      adult: "adult" in media ? media.adult : false,
      backdrop_path: media.backdrop_path,
      poster_path: media.poster_path,
      release_date: "release_date" in media ? media.release_date : media.first_air_date,
      title: "title" in media ? mutateMovieTitle(media) : mutateTvShowTitle(media),
      vote_average: media.vote_average,
      updated_at: new Date().toISOString(),
    };

    await set(historyRef, historyData);

    console.info("History saved:", historyData);

    return {
      success: true,
      message: "History saved",
    };
  } catch (error) {
    console.info("Unexpected error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
};

export const getUserHistories = async (limit: number = 20): Promise<ActionResponse<HistoryDetail[]>> => {
  try {
    // Get current user from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('firebase-user-id')?.value;

    if (!userId) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    // Get all history items for the user
    const historiesRef = ref(database, `histories/${userId}`);
    const snapshot = await get(historiesRef);

    if (!snapshot.exists()) {
      return {
        success: true,
        data: [],
      };
    }

    // Convert Firebase data to array and sort by updated_at
    const histories: HistoryDetail[] = [];
    snapshot.forEach((childSnapshot) => {
      histories.push(childSnapshot.val());
    });

    // Sort by updated_at descending (most recent first)
    histories.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    // Apply limit
    const limitedHistories = histories.slice(0, limit);

    return {
      success: true,
      data: limitedHistories,
    };
  } catch (error) {
    console.info("Unexpected error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
};

export const getMovieLastPosition = async (id: number): Promise<number> => {
  try {
    // Get current user from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('firebase-user-id')?.value;

    if (!userId) {
      return 0;
    }

    const historyRef = ref(database, `histories/${userId}/${id}`);
    const snapshot = await get(historyRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return data.last_position || 0;
    }

    return 0;
  } catch (error) {
    console.info("Unexpected error:", error);
    return 0;
  }
};

export const getTvShowLastPosition = async (
  id: number,
  season: number,
  episode: number,
): Promise<number> => {
  try {
    // Get current user from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('firebase-user-id')?.value;

    if (!userId) {
      return 0;
    }

    const historyKey = `${id}_${season}_${episode}`;
    const historyRef = ref(database, `histories/${userId}/${historyKey}`);
    const snapshot = await get(historyRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return data.last_position || 0;
    }

    return 0;
  } catch (error) {
    console.info("Unexpected error:", error);
    return 0;
  }
};
