import GamePicker from './GamePicker';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <GamePicker />
        
        {/* Placeholder for future dashboard components */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4">📊 Coming Soon</h3>
          <div className="text-slate-400 text-center py-8">
            Top games, recent picks, and more stats will appear here!
          </div>
        </div>
      </div>
    </div>
  );
}
