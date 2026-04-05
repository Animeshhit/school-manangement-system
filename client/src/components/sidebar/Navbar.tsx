import { Search, Bell, Settings, Plus } from 'lucide-react';

const Navbar = () => {
  return (
    
    <nav className="bg-white border-b border-gray-200 px-8 py-4">
      <div className='flex items-center justify-between container mx-auto'>
      <div className="flex-1">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search branches, ID or location..."
            className="w-full pl-10 pr-4 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-8">
        <button className="text-gray-600 hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="text-gray-600 hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        <button className="text-gray-600 hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="ml-6">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
          Create Branch
        </button>
      </div>
      </div>
    </nav>
  );
};

export default Navbar;
