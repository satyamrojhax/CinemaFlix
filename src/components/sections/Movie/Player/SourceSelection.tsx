import { PlayersProps } from "@/types";
import SimpleDrawer from "@/components/ui/overlay/SimpleDrawer";
import { HandlerType } from "@/types/component";
import SelectButton from "@/components/ui/input/SelectButton";
import { Ads, Clock, Rocket, Star } from "@/utils/icons";

interface MoviePlayerSourceSelectionProps extends HandlerType {
  players: PlayersProps[];
  selectedSource: number;
  setSelectedSource: (source: number) => void;
}

const MoviePlayerSourceSelection: React.FC<MoviePlayerSourceSelectionProps> = ({
  opened,
  onClose,
  players,
  selectedSource,
  setSelectedSource,
}) => {
  return (
    <SimpleDrawer
      open={opened}
      onClose={onClose}
      title="Select Source"
      withCloseButton
      direction="right"
    >
      <div className="space-y-6">
        {/* Legend */}
        <div className="bg-default-50 dark:bg-default-100 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground mb-3">Source Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Star className="text-warning-500 size-4" />
              <span className="text-sm text-foreground">Recommended</span>
            </div>
            <div className="flex items-center gap-2">
              <Rocket className="text-danger-500 size-4" />
              <span className="text-sm text-foreground">Fast hosting</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-success-500 size-4" />
              <span className="text-sm text-foreground">Watch Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <Ads className="text-primary-500 size-4" />
              <span className="text-sm text-foreground">May contain ads</span>
            </div>
          </div>
        </div>

        {/* Source Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Choose Streaming Source</h3>
          <SelectButton
            color="primary"
            groupType="list"
            value={selectedSource.toString()}
            onChange={(value) => {
              console.log('Source selection changed:', value);
              const sourceIndex = Number(value || 0);
              console.log('Parsed source index:', sourceIndex);
              console.log('Available players:', players.length);
              
              if (sourceIndex >= 0 && sourceIndex < players.length) {
                console.log('Setting source to:', sourceIndex);
                setSelectedSource(sourceIndex);
                onClose();
              } else {
                console.error('Invalid source index:', sourceIndex);
              }
            }}
            data={players.map(({ title, recommended, fast, ads, resumable }, index) => {
              return {
                label: title,
                value: index.toString(),
                description: `${recommended ? 'Recommended' : ''}${fast ? ' • Fast' : ''}${resumable ? ' • Resume support' : ''}`,
                endContent: (
                  <div key={`info-${title}`} className="flex items-center gap-1">
                    {recommended && <Star className="text-warning size-3" />}
                    {fast && <Rocket className="text-danger size-3" />}
                    {resumable && <Clock className="text-success size-3" />}
                    {ads && <Ads className="text-primary size-3" />}
                  </div>
                ),
              };
            })}
          />
        </div>
      </div>
    </SimpleDrawer>
  );
};

export default MoviePlayerSourceSelection;
