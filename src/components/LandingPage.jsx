import TopGamesPicked from './TopGamesPicked';
import RecentGamesPicked from './RecentGamesPicked';

export default function LandingPage({ onLogin, onSignup }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            What 2 Play?
          </h1>
          
          <div className="max-w-2xl mx-auto mb-8">
            <p className="text-xl text-slate-300 mb-4">
              Sound familiar?
            </p>
            <div className="bg-slate-700 bg-opacity-50 rounded-lg p-6 border border-slate-600 text-slate-200 italic">
              <p className="mb-2">"What do you want to play tonight?"</p>
              <p className="mb-2">"I don't know, what do you want to play?"</p>
              <p className="text-slate-400">&lt;Repeat&gt;</p>
            </div>
          </div>

          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Stop the loop. Let <span className="font-semibold text-blue-400">What 2 Play</span> help you and your friends decide what to play next.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onSignup}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Sign Up
            </button>
            <button
              onClick={onLogin}
              className="px-8 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 border border-slate-600 transition duration-200"
            >
              Log In
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 max-w-4xl mx-auto">
          <div className="bg-slate-800 bg-opacity-50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="text-lg font-semibold text-white mb-2">Your Library</h3>
            <p className="text-slate-400 text-sm">
              Catalog all your games across platforms in one place.
            </p>
          </div>

          <div className="bg-slate-800 bg-opacity-50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-lg font-semibold text-white mb-2">Create Groups</h3>
            <p className="text-slate-400 text-sm">
              Organize game nights with your friends and manage who's playing.
            </p>
          </div>

          <div className="bg-slate-800 bg-opacity-50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition">
            <div className="text-3xl mb-3">🎲</div>
            <h3 className="text-lg font-semibold text-white mb-2">Pick Together</h3>
            <p className="text-slate-400 text-sm">
              Collaborate with your group to decide what to play tonight.
            </p>
          </div>
        </div>

        {/* Community Data Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">What's Being Played</h2>
            <p className="text-slate-400">See what the community is playing right now</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 bg-opacity-50 border border-slate-700 rounded-lg overflow-hidden">
              <TopGamesPicked limit={5} />
            </div>
            <div className="bg-slate-800 bg-opacity-50 border border-slate-700 rounded-lg overflow-hidden">
              <RecentGamesPicked limit={5} />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-slate-800 bg-opacity-50 border border-slate-700 rounded-lg p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to stop the loop?
          </h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Join friends around the world who are already using What 2 Play to make game night decisions easier.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onSignup}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Create Your Account
            </button>
            <button
              onClick={onLogin}
              className="px-8 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 border border-slate-600 transition duration-200"
            >
              Already Have an Account?
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 mt-20 py-8 text-center text-slate-500 text-sm">
        <p>What 2 Play © 2026</p>
      </div>
    </div>
  );
}
