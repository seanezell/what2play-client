import GamePicker from './GamePicker';
import TopGamesPicked from './TopGamesPicked';
import RecentGamesPicked from './RecentGamesPicked';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <GamePicker />
        
        {/* Dashboard stats column */}
        <div className="space-y-6">
          <TopGamesPicked limit={5} />
          <RecentGamesPicked limit={5} />
        </div>
      </div>
    </div>
  );
}
