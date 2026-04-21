import { useTopLists } from '../hooks/useTopLists';
import TopListsSection from './TopListsSection';

export default function RecentGamesPicked({ limit = 5 }) {
  const { games, loading, error } = useTopLists('recent', limit, 'Failed to load recent games');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <TopListsSection title="⏱️ Recently Picked" loading={loading} error={error}>
      {games.length === 0 ? (
        <div className="text-slate-400 text-center py-4">No recent picks</div>
      ) : (
        <div className="space-y-3">
          {games.map((game) => (
            <div key={`${game.game_id}-${game.picked_date}`} className="p-3 bg-slate-700 rounded hover:bg-slate-600 transition">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{game.game_name}</div>
                  <div className="text-slate-400 text-sm mt-1">
                    <span className="text-blue-300">{game.group_name}</span>
                    <span className="mx-2 text-slate-500">•</span>
                    <span className="text-slate-500">{formatDate(game.picked_date)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </TopListsSection>
  );
}
