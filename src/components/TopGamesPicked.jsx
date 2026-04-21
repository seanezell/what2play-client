import { useTopLists } from '../hooks/useTopLists';
import TopListsSection from './TopListsSection';

export default function TopGamesPicked({ limit = 5 }) {
  const { games, loading, error } = useTopLists('top', limit, 'Failed to load top games');

  return (
    <TopListsSection title="🏆 Top Games Picked" loading={loading} error={error}>
      {games.length === 0 ? (
        <div className="text-slate-400 text-center py-4">No games yet</div>
      ) : (
        <div className="space-y-3">
          {games.map((game, index) => (
            <div key={game.game_id} className="flex items-center justify-between p-3 bg-slate-700 rounded hover:bg-slate-600 transition">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-slate-400 font-mono text-sm font-bold w-6">#{index + 1}</span>
                <span className="text-white font-medium truncate">{game.name}</span>
              </div>
              <span className="text-blue-400 font-bold ml-2 flex-shrink-0">{game.pick_count}</span>
            </div>
          ))}
        </div>
      )}
    </TopListsSection>
  );
}
