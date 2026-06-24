import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaFileExport } from 'react-icons/fa';
import moment from 'moment';

const AuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    status: '',
    from: '',
    to: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [actions, setActions] = useState([]);

  useEffect(() => {
    fetchActions();
    fetchLogs();
  }, [filters]);

  const fetchActions = async () => {
    try {
      const response = await api.get('/audit-logs/actions');
      setActions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch actions:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/audit-logs', {
        params: filters
      });
      setLogs(response.data.data.logs);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch audit logs');
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getActionColor = (action) => {
    const colors = {
      LOGIN: 'bg-green-100 text-green-800',
      LOGOUT: 'bg-gray-100 text-gray-800',
      CLOCK_IN: 'bg-blue-100 text-blue-800',
      CLOCK_OUT: 'bg-purple-100 text-purple-800',
      CREATE_CORRECTION: 'bg-yellow-100 text-yellow-800',
      APPROVE_CORRECTION: 'bg-green-100 text-green-800',
      REJECT_CORRECTION: 'bg-red-100 text-red-800',
      CREATE_USER: 'bg-indigo-100 text-indigo-800',
      UPDATE_USER: 'bg-indigo-100 text-indigo-800',
      DELETE_USER: 'bg-red-100 text-red-800',
      UPDATE_ROLE: 'bg-orange-100 text-orange-800',
      CREATE_RULE: 'bg-teal-100 text-teal-800',
      UPDATE_RULE: 'bg-teal-100 text-teal-800',
      DELETE_RULE: 'bg-red-100 text-red-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-1">Complete audit trail of all system actions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="input-field"
              placeholder="Search logs..."
            />
          </div>
          <div>
            <label className="label">Action</label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Actions</option>
              {actions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
            </select>
          </div>
          <div>
            <label className="label">Date Range</label>
            <div className="flex space-x-2">
              <input
                type="date"
                name="from"
                value={filters.from}
                onChange={handleFilterChange}
                className="input-field"
              />
              <input
                type="date"
                name="to"
                value={filters.to}
                onChange={handleFilterChange}
                className="input-field"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Timestamp</th>
                <th className="table-header">User</th>
                <th className="table-header">Action</th>
                <th className="table-header">Resource</th>
                <th className="table-header">Status</th>
                <th className="table-header">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="table-row">
                    <td className="table-cell text-sm">
                      {moment(log.timestamp).format('DD MMM YYYY HH:mm:ss')}
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium text-gray-900">
                          {log.user?.fullName || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.userEmail}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="badge badge-gray">
                        {log.resource}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${log.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="text-xs text-gray-600 max-w-xs truncate">
                        {log.details?.message || 
                         (log.details && Object.keys(log.details).length > 0 ? 
                           JSON.stringify(log.details).slice(0, 50) + '...' : 
                           'No details')}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} logs
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <FaChevronLeft />
              </button>
              <span className="px-3 py-1 border rounded-lg bg-blue-50 text-blue-600">
                {pagination.page}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;