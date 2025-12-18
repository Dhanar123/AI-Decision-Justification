import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

export default function Dashboard() {
  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-500">
          Welcome to your AI Decision Justification Tracker
        </p>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Get started
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Track and justify your AI-related decisions with our comprehensive tracking system.
              </p>
            </div>
            <div className="mt-5">
              <Link
                to="/decisions"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                View Decisions
                <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
