import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import moment from 'moment';
import { FaSearch, FaFileExport, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import toast from 'react-hot-toast';

const History = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    fetchHistory();
  }, [filters]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/attendance/history', {
        params: {
          from: filters.from,
          to: filters.to,
          page: filters.page,
          limit: filters.limit
        }
      });
      setRecords(response.data.data.attendance);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch history');
      console.error('Error fetching history:', error);
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

  const getStatusBadge = (status) => {
    const badges = {
      present: 'badge-success',
      absent: 'badge-danger',
      half_day: 'badge-warning',
      holiday: 'badge-info',
      weekend: 'badge-gray'
    };
    return badges[status] || 'badge-gray';
  };

  if (loading && records.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attendance History</h1>
        <p className="text-gray-600 mt-1">View your attendance records</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">From Date</label>
            <input
              type="date"
              name="from"
              value={filters.from}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">To Date</label>
            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchHistory}
              className="btn-primary flex items-center space-x-2 w-full"
            >
              <FaSearch />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Clock In</th>
                <th className="table-header">Clock Out</th>
                <th className="table-header">Working Hours</th>
                <th className="table-header">Status</th>
                <th className="table-header">Late</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.length > 0 ? (
                records.map((record) => (
                  <tr key={record._id} className="table-row">
                    <td className="table-cell">
                      {moment(record.date).format('DD MMM YYYY')}
                    </td>
                    <td className="table-cell">
                      {record.clockIn ? moment(record.clockIn.time).format('HH:mm') : '--:--'}
                    </td>
                    <td className="table-cell">
                      {record.clockOut ? moment(record.clockOut.time).format('HH:mm') : '--:--'}
                    </td>
                    <td className="table-cell">
                      {record.workingHours ? record.workingHours.toFixed(1) + 'h' : '0.0h'}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusBadge(record.status)}`}>
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="table-cell">
                      {record.isLate ? (
                        <span className="text-red-600">{record.lateMinutes}m late</span>
                      ) : (
                        <span className="text-green-600">On time</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No attendance records found
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
              {pagination.total} results
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

export default History;