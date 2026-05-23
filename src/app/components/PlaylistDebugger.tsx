import React, { useState } from 'react';
import { testPlaylistAccess } from './SimplePodPlayer/utils';
import { PLAYLIST_CONFIGS } from './SimplePodPlayer/constants';

export function PlaylistDebugger() {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState(false);

  const testAllPlaylists = async () => {
    setTesting(true);
    const results: Record<string, boolean> = {};
    
    for (const [key, config] of Object.entries(PLAYLIST_CONFIGS)) {
      console.log(`Testing playlist: ${key} (${config.playlistId})`);
      const isAccessible = await testPlaylistAccess(config.playlistId);
      results[key] = isAccessible;
    }
    
    setTestResults(results);
    setTesting(false);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg max-w-md mx-auto">
      <h3 className="text-lg font-medium mb-4">Playlist Debugger</h3>
      
      <button
        onClick={testAllPlaylists}
        disabled={testing}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {testing ? 'Testing...' : 'Test All Playlists'}
      </button>
      
      {Object.keys(testResults).length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Results:</h4>
          {Object.entries(testResults).map(([key, isAccessible]) => {
            const config = PLAYLIST_CONFIGS[key as keyof typeof PLAYLIST_CONFIGS];
            return (
              <div key={key} className="flex items-center justify-between p-2 bg-white rounded">
                <div>
                  <div className="font-medium">{config.name}</div>
                  <div className="text-xs text-gray-500">{config.playlistId}</div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  isAccessible 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isAccessible ? 'Accessible' : 'Not Accessible'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}