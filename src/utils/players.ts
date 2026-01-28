import { PlayersProps } from "@/types";

/**
 * Generates a list of movie players with their respective titles and source URLs.
 * Each player is constructed using the provided movie ID.
 *
 * @param {string | number} id - The ID of the movie to be embedded in the player URLs.
 * @param {number} [startAt] - The start position in seconds to be embedded in the player URLs. Optional.
 * @returns {PlayersProps[]} - An array of objects, each containing
 * the title of the player and the corresponding source URL.
 */
export const getMoviePlayers = (id: string | number, startAt?: number): PlayersProps[] => {
  return [
    {
      title: "VIDEASY",
      source: `https://player.videasy.net/movie/${id}?color=F59E0B&overlay=true${startAt ? `&progress=${startAt}` : ''}`,
      recommended: true,
      fast: true,
      ads: false,
      resumable: true,
      primary: true,
    },
    {
      title: "VidKing",
      source: `https://www.vidking.net/embed/movie/${id}?color=F59E0B&autoPlay=false${startAt ? `&progress=${startAt}` : ''}`,
      recommended: true,
      fast: true,
      ads: false,
      resumable: true,
    },
  ];
};

/**
 * Generates a list of TV show players with their respective titles and source URLs.
 * Each player is constructed using the provided TV show ID, season, and episode.
 *
 * @param {string | number} id - The ID of the TV show to be embedded in the player URLs.
 * @param {string | number} [season] - The season number of the TV show episode to be embedded.
 * @param {string | number} [episode] - The episode number of the TV show episode to be embedded.
 * @param {number} [startAt] - The start position in seconds to be embedded in the player URLs. Optional.
 * @returns {PlayersProps[]} - An array of objects, each containing
 * the title of the player and the corresponding source URL.
 */
export const getTvShowPlayers = (
  id: string | number,
  season: number,
  episode: number,
  startAt?: number,
): PlayersProps[] => {
  return [
    {
      title: "VIDEASY",
      source: `https://player.videasy.net/tv/${id}/${season}/${episode}?color=F59E0B&overlay=true&nextEpisode=true&episodeSelector=true${startAt ? `&progress=${startAt}` : ''}`,
      recommended: true,
      fast: true,
      ads: false,
      resumable: true,
      primary: true,
    },
    {
      title: "VidKing",
      source: `https://www.vidking.net/embed/tv/${id}/${season}/${episode}?color=F59E0B&autoPlay=false&nextEpisode=true&episodeSelector=true${startAt ? `&progress=${startAt}` : ''}`,
      recommended: true,
      fast: true,
      ads: false,
      resumable: true,
    },
  ];
};
