import React from 'react';
import { useProxy } from '~/stores/proxies'; // updated import

const ProxyTable = () => {
  const { proxies, loading, error } = useProxy();

  if (loading) return <div className="text-gray-500 text-center py-4">Loading proxies...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (!proxies.length) return <div className="text-gray-400 text-center py-4">No proxies found.</div>;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-sm text-left text-gray-800">
        <thead className="text-xs uppercase bg-gray-100 text-gray-600">
          <tr>
            <th className="px-6 py-3">Hostname</th>
            <th className="px-6 py-3">Port</th>
            <th className="px-6 py-3">Password</th>
            <th className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {proxies.map(proxy => (
            <tr key={proxy.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
              <td className="px-6 py-4">{proxy.hostname}</td>
              <td className="px-6 py-4">{proxy.port}</td>
              <td className="px-6 py-4">{proxy.password}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                    proxy.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {proxy.active ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProxyTable;