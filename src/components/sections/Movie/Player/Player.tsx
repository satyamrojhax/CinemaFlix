import { SpacingClasses } from "@/utils/constants";
import { siteConfig } from "@/config/site";
import useBreakpoints from "@/hooks/useBreakpoints";
import { cn } from "@/utils/helpers";
import { mutateMovieTitle } from "@/utils/movies";
import { getMoviePlayers } from "@/utils/players";
import OrientationManager from "@/utils/orientation";
import { Card, Skeleton } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { useMemo, useEffect, useState, useCallback } from "react";
import { MovieDetails } from "tmdb-ts/dist/types/movies";
import { usePlayerEvents } from "@/hooks/usePlayerEvents";
const MoviePlayerHeader = dynamic(() => import("./Header"));
const MoviePlayerSourceSelection = dynamic(() => import("./SourceSelection"));

interface MoviePlayerProps {
  movie: MovieDetails;
  startAt?: number;
}

const MoviePlayer: React.FC<MoviePlayerProps> = ({ movie, startAt }) => {
  const players = getMoviePlayers(movie.id, startAt);
  const title = mutateMovieTitle(movie);
  const idle = useIdle(3000);
  const { mobile } = useBreakpoints();
  const [opened, handlers] = useDisclosure(false);
  const [selectedSource, setSelectedSource] = useQueryState<number>(
    "src",
    parseAsInteger.withDefault(0),
  );
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isLoadingFallback, setIsLoadingFallback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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

  // Initialize orientation manager
  useEffect(() => {
    const orientationManager = OrientationManager.getInstance();
  }, []);

  usePlayerEvents({ saveHistory: true });
  useDocumentTitle(`Play ${title} | ${siteConfig.name}`);

  const PLAYER = useMemo(() => players[currentPlayerIndex] || players[0], [players, currentPlayerIndex]);

  // Handle fullscreen request with auto-landscape
  const handleFullscreen = useCallback(() => {
    const videoContainer = document.querySelector('[data-video-container]') as HTMLElement;
    if (videoContainer && mobile) {
      // Mark container for orientation manager
      videoContainer.setAttribute('data-video-container', 'true');
    }
    
    const orientationManager = OrientationManager.getInstance();
    orientationManager.requestFullscreen(videoContainer || document.documentElement);
  }, [mobile]);

  // Handle automatic fallback when iframe fails to load
  const handleIframeError = useCallback(() => {
    console.log(`Player ${PLAYER.title} failed to load`);
    setIsLoadingFallback(false);
  }, [PLAYER.title]);

  // Sync selectedSource with currentPlayerIndex
  useEffect(() => {
    setSelectedSource(currentPlayerIndex);
  }, [currentPlayerIndex, setSelectedSource]);

  // Reset to primary player when selectedSource changes (manual selection)
  useEffect(() => {
    setCurrentPlayerIndex(selectedSource);
  }, [selectedSource]);

  return (
    <>
      <div className={cn("relative", SpacingClasses.reset)}>
        <MoviePlayerHeader
          id={movie.id}
          movieName={title}
          onOpenSource={handlers.open}
          hidden={idle && !mobile}
        />
        <Card shadow="md" radius="none" className="relative h-screen" data-video-container>
          <Skeleton className="absolute h-full w-full" />
          {isLoadingFallback && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
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
              onClick={mobile ? handleFullscreen : undefined}
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
      </div>

      <MoviePlayerSourceSelection
        opened={opened}
        onClose={handlers.close}
        players={players}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
      />
    </>
  );
};

MoviePlayer.displayName = "MoviePlayer";

export default MoviePlayer;
