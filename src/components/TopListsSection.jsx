export default function TopListsSection({ title, loading, error, children }) {
  return (
    <div className="bg-slate-800 p-6 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      {loading && <div className="text-slate-400 text-center py-4">Loading...</div>}
      {!loading && error && <div className="text-red-400 text-center py-4">{error}</div>}
      {!loading && !error && children}
    </div>
  );
}
