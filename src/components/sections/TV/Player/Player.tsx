import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { getTvShowPlayers } from "@/utils/players";
import { Card, Skeleton } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { memo, useMemo, useEffect, useState, useCallback } from "react";
import { Episode, TvShowDetails } from "tmdb-ts";
import useBreakpoints from "@/hooks/useBreakpoints";
import { SpacingClasses } from "@/utils/constants";
import { usePlayerEvents } from "@/hooks/usePlayerEvents";
const TvShowPlayerHeader = dynamic(() => import("./Header"));
const TvShowPlayerSourceSelection = dynamic(() => import("./SourceSelection"));
const TvShowPlayerEpisodeSelection = dynamic(() => import("./EpisodeSelection"));

export interface TvShowPlayerProps {
  tv: TvShowDetails;
  id: number;
  seriesName: string;
  seasonName: string;
  episode: Episode;
  episodes: Episode[];
  nextEpisodeNumber: number | null;
  prevEpisodeNumber: number | null;
  startAt?: number;
}

const TvShowPlayer: React.FC<TvShowPlayerProps> = ({
  tv,
  id,
  episode,
  episodes,
  startAt,
  ...props
}) => {
  const { mobile } = useBreakpoints();
  const players = getTvShowPlayers(id, episode.season_number, episode.episode_number, startAt);
  const idle = useIdle(3000);
  const [sourceOpened, sourceHandlers] = useDisclosure(false);
  const [episodeOpened, episodeHandlers] = useDisclosure(false);
  const [selectedSource, setSelectedSource] = useQueryState<number>(
    "src",
    parseAsInteger.withDefault(0),
  );
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isLoadingFallback, setIsLoadingFallback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  usePlayerEvents({
    saveHistory: true,
    metadata: { season: episode.season_number, episode: episode.episode_number },
  });
  useDocumentTitle(
    `Play ${props.seriesName} - ${props.seasonName} - ${episode.name} | ${siteConfig.name}`,
  );

  const PLAYER = useMemo(() => players[currentPlayerIndex] || players[0], [players, currentPlayerIndex]);

  // Auto-start with first available player (client-side only)
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && players.length > 0 && !isPlaying) {
      setIsPlaying(true);
    }
  }, [mounted, players, isPlaying]);

  // Handle automatic fallback when iframe fails to load
  const handleIframeError = useCallback(() => {
    console.log(`Player ${PLAYER.title} failed to load`);
    setIsLoadingFallback(false);
  }, [PLAYER.title]);

  // Reset to primary player when selectedSource changes (manual selection)
  useEffect(() => {
    setCurrentPlayerIndex(selectedSource);
  }, [selectedSource]);

  // If current player index is different from selected source, update selected source
  useEffect(() => {
    if (currentPlayerIndex !== selectedSource) {
      setSelectedSource(currentPlayerIndex);
    }
  }, [currentPlayerIndex, selectedSource, setSelectedSource]);

  return (
    <div className={cn("relative", SpacingClasses.reset)}>
      <TvShowPlayerHeader
        id={id}
        episode={episode}
        hidden={idle && !mobile}
        selectedSource={selectedSource}
        onOpenSource={sourceHandlers.open}
        onOpenEpisode={episodeHandlers.open}
        {...props}
      />

      <Card shadow="md" radius="none" className="relative h-screen">
        <Skeleton className="absolute h-full w-full" />
        {isLoadingFallback && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-warning mx-auto mb-2"></div>
              <p className="text-sm">Loading stream...</p>
            </div>
          </div>
        )}
        {isPlaying && (
          <iframe
            allowFullScreen
            key={PLAYER.title}
            src={PLAYER.source}
            className={cn("z-10 h-full w-full border-0", { "pointer-events-none": idle && !mobile })}
            onError={handleIframeError}
            onLoad={() => setIsLoadingFallback(false)}
            referrerPolicy="no-referrer-when-downgrade"
            style={{
              pointerEvents: 'auto',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
          />
        )}
      </Card>

      <TvShowPlayerSourceSelection
        opened={sourceOpened}
        onClose={sourceHandlers.close}
        players={players}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
      />
      <TvShowPlayerEpisodeSelection
        id={id}
        opened={episodeOpened}
        onClose={episodeHandlers.close}
        episodes={episodes}
      />
    </div>
  );
};

export default memo(TvShowPlayer);
