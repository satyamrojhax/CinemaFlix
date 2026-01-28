import { env } from "@/utils/env";
import { isEmpty } from "@/utils/helpers";
import { TMDB } from "tmdb-ts";
import { apiCache } from "@/utils/cache";

const token = env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MmJhZGI0ZGFmODQ3ODZmNTFkYTI4YzIwYTgyNzQ5MyIsIm5iZiI6MTcyOTU4MzQxMS42NzUyODIsInN1YiI6IjY3MTc1ODEwNTBhNmViMGJmYmMyN2I4ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kxQaEKDqbB2gH5MCNPihPG4kQdZ_0aY8_5PmLzCbiCc";

if (isEmpty(token)) {
  throw new Error("NEXT_PUBLIC_TMDB_ACCESS_TOKEN is not defined");
}

export const tmdb = new TMDB(token);

/**
 * Cached TMDB API wrapper with intelligent caching
 */
export class CachedTMDB {
  private tmdb: TMDB;
  private cache = apiCache;

  constructor(tmdb: TMDB) {
    this.tmdb = tmdb;
  }

  /**
   * Get trending movies with caching
   */
  async getTrendingMovies(timeWindow: 'day' | 'week' = 'day') {
    const cacheKey = `trending/movies/${timeWindow}`;
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      // Return cached data and refresh in background
      this.tmdb.trending.trending('movie', timeWindow).then(data => {
        this.cache.set(cacheKey, data);
      }).catch(() => {
        // Ignore background refresh errors
      });

      return cached;
    }

    const data = await this.tmdb.trending.trending('movie', timeWindow);
    await this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * Get trending TV shows with caching
   */
  async getTrendingTVShows(timeWindow: 'day' | 'week' = 'day') {
    const cacheKey = `trending/tv/${timeWindow}`;
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      this.tmdb.trending.trending('tv', timeWindow).then(data => {
        this.cache.set(cacheKey, data);
      }).catch(() => {});

      return cached;
    }

    const data = await this.tmdb.trending.trending('tv', timeWindow);
    await this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * Get movie details with caching
   */
  async getMovieDetails(id: number) {
    const cacheKey = `movie/${id}`;
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      this.tmdb.movies.details(id).then(data => {
        this.cache.set(cacheKey, data);
      }).catch(() => {});

      return cached;
    }

    const data = await this.tmdb.movies.details(id);
    await this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * Get TV show details with caching
   */
  async getTVDetails(id: number) {
    const cacheKey = `tv/${id}`;
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      this.tmdb.tvShows.details(id).then(data => {
        this.cache.set(cacheKey, data);
      }).catch(() => {});

      return cached;
    }

    const data = await this.tmdb.tvShows.details(id);
    await this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * Search movies with caching
   */
  async searchMovies(query: string, page: number = 1) {
    const cacheKey = `search/movies/${query}/${page}`;
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      this.tmdb.search.movies({ query, page }).then(data => {
        this.cache.set(cacheKey, data);
      }).catch(() => {});

      return cached;
    }

    const data = await this.tmdb.search.movies({ query, page });
    await this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * Search TV shows with caching
   */
  async searchTVShows(query: string, page: number = 1) {
    const cacheKey = `search/tv/${query}/${page}`;
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      this.tmdb.search.tvShows({ query, page }).then(data => {
        this.cache.set(cacheKey, data);
      }).catch(() => {});

      return cached;
    }

    const data = await this.tmdb.search.tvShows({ query, page });
    await this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * Get discover movies with pagination caching
   */
  async getDiscoverMovies(params: any = {}) {
    const paramStr = new URLSearchParams(params).toString();
    const cacheKey = `discover/movies?${paramStr}`;
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      this.tmdb.discover.movie(params).then((data: any) => {
        this.cache.set(cacheKey, data);
      }).catch(() => {});

      return cached;
    }

    const data = await this.tmdb.discover.movie(params);
    await this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * Get discover TV shows with pagination caching
   */
  async getDiscoverTVShows(params: any = {}) {
    const paramStr = new URLSearchParams(params).toString();
    const cacheKey = `discover/tv?${paramStr}`;
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      this.tmdb.discover.tvShow(params).then((data: any) => {
        this.cache.set(cacheKey, data);
      }).catch(() => {});

      return cached;
    }

    const data = await this.tmdb.discover.tvShow(params);
    await this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * Clear all TMDB cache
   */
  async clearCache() {
    await this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return (this.cache as any).getStats ? await (this.cache as any).getStats() : null;
  }
}

// Create cached TMDB instance
export const cachedTMDB = new CachedTMDB(tmdb);
