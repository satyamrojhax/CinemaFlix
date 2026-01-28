"use client";

import { cachedTMDB } from "@/api/tmdb";
import { DiscoverMoviesFetchQueryType } from "@/types/movie";
import { MovieDiscoverResult } from "tmdb-ts/dist/types/discover";

interface FetchDiscoverMovies {
  page?: number;
  type?: DiscoverMoviesFetchQueryType;
  genres?: string;
}

const useFetchDiscoverMovies = async ({
  page = 1,
  type = "discover",
  genres,
}: FetchDiscoverMovies): Promise<MovieDiscoverResult> => {
  const params = genres ? { page, with_genres: genres } : { page };

  const queryData = {
    discover: () => cachedTMDB.getDiscoverMovies(params),
    todayTrending: () => cachedTMDB.getTrendingMovies("day"),
    thisWeekTrending: () => cachedTMDB.getTrendingMovies("week"),
    popular: () => cachedTMDB.getDiscoverMovies({ page, sort_by: "popularity.desc" }),
    nowPlaying: () => cachedTMDB.getDiscoverMovies({ page, "primary_release_date.gte": new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], "primary_release_date.lte": new Date().toISOString().split('T')[0] }),
    upcoming: () => cachedTMDB.getDiscoverMovies({ page, "primary_release_date.gte": new Date().toISOString().split('T')[0] }),
    topRated: () => cachedTMDB.getDiscoverMovies({ page, sort_by: "vote_average.desc" }),
  }[type];

  return await queryData() as MovieDiscoverResult;
};

export default useFetchDiscoverMovies;
