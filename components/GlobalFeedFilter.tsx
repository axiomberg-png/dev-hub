'use client';

import { useState } from 'react';
import { useGlobalPreferences } from '@/lib/global-context';
import { getGlobalFeed, discoverByStack } from '@/app/actions/global';
import PostCard from '@/components/PostCard';
import { Search } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  codeBlock?: string;
  language?: string;
  tags?: string[];
  locale: string;
  region?: string;
  country?: string;
  images?: string[];
  likes: number;
  commentsCount: number;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    timezone: string;
    country?: string;
  };
}

export default function GlobalFeedFilter() {
  const { preferences } = useGlobalPreferences();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterRegion, setFilterRegion] = useState(preferences.region || '');
  const [filterLocale, setFilterLocale] = useState(preferences.locale || 'en');
  const [filterStack, setFilterStack] = useState<string[]>([]);
  const [discoveredUsers, setDiscoveredUsers] = useState([]);

  const handleLoadFeed = async () => {
    setLoading(true);
    try {
      const result = await getGlobalFeed({
        locale: filterLocale,
        region: filterRegion || undefined,
        limit: 20,
        offset: 0,
      });

      if (result.success) {
        setPosts(result.data);
      }
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverByStack = async () => {
    if (filterStack.length === 0) return;

    setLoading(true);
    try {
      const result = await discoverByStack({
        techStack: filterStack,
        country: filterRegion || undefined,
        limit: 10,
      });

      if (result.success) {
        setDiscoveredUsers(result.data);
      }
    } catch (error) {
      console.error('Failed to discover:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Search size={20} />
          Filter Global Feed
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <input
                type="text"
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                placeholder="e.g., Europe, Asia"
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={filterLocale}
                onChange={(e) => setFilterLocale(e.target.value)}
                className="input-base"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tech Stack (comma-separated)
            </label>
            <input
              type="text"
              value={filterStack.join(', ')}
              onChange={(e) => setFilterStack(e.target.value.split(',').map((s) => s.trim()))}
              placeholder="e.g., React, TypeScript, Next.js"
              className="input-base"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleLoadFeed}
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              Load Feed
            </button>
            <button
              onClick={handleDiscoverByStack}
              disabled={loading || filterStack.length === 0}
              className="btn-secondary flex-1 disabled:opacity-50"
            >
              Discover by Stack
            </button>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      {posts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Global Posts</h3>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Discovered Users */}
      {discoveredUsers.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Developers by Tech Stack</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discoveredUsers.map((user: any) => (
              <div key={user.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{user.displayName}</h4>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                    {user.bio && <p className="text-sm text-gray-700 mt-2">{user.bio}</p>}
                    {user.techStack && user.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {user.techStack.map((tech: string) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-gray-500">
          Loading...
        </div>
      )}
    </div>
  );
}
