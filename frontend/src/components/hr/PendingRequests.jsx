import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaUser,
  FaUserCircle,
  FaCalendarAlt,
  FaFileAlt,
  FaComment,
  FaFilter,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaHistory,
  FaRocket,
  FaShieldAlt,
  FaUsers
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const PendingRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [isReviewing, setIsReviewing] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = { status: filterStatus };
      if (filterStatus === 'all') {
        delete params.status;
      }
      const response = await api.get('/corrections', { params });
      setRequests(response.data.data.corrections || []);
    } catch (error) {
      toast.error('Failed to fetch requests');
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId, status) => {
    setIsReviewing(true);
    try {
      await api.put(`/corrections/${requestId}/review`, {
        status,
        reviewComment
      });
      
      toast.success(
        status === 'approved' 
          ? '✅ Request approved successfully!' 
          : '❌ Request rejected successfully!',
        {
          style: {
            background: status === 'approved' ? '#10B981' : '#EF4444',
            color: '#fff',
          }
        }
      );
      
      setSelectedRequest(null);
      setReviewComment('');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to review request');
      console.error('Error reviewing request:', error);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleQuickReview = async (requestId, status) => {
    setIsReviewing(true);
    try {
      await api.put(`/corrections/${requestId}/review`, {
        status,
        reviewComment: status === 'approved' 
          ? 'Approved via quick action' 
          : 'Rejected via quick action'
      });
      
      toast.success(
        status === 'approved' 
          ? '✅ Request approved!' 
          : '❌ Request rejected!'
      );
      
      fetchRequests();
    } catch (error) {
      toast.error('Failed to review request');
    } finally {
      setIsReviewing(false);
    }
  };

  // Filter and search
  const filteredRequests = useMemo(() => {
    let filtered = requests;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.user?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [requests, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    const badges = {
      pending: { 
        class: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: <FaHourglassHalf className="text-yellow-500" />,
        label: 'Pending'
      },
      approved: { 
        class: 'bg-green-50 text-green-700 border-green-200',
        icon: <FaCheckCircle className="text-green-500" />,
        label: 'Approved'
      },
      rejected: { 
        class: 'bg-red-50 text-red-700 border-red-200',
        icon: <FaTimesCircle className="text-red-500" />,
        label: 'Rejected'
      }
    };
    return badges[status] || badges.pending;
  };

  // Statistics
  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }), [requests]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-8">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/25">
                  <FaFileAlt className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Correction Requests
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Review and manage attendance correction requests
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchRequests}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <FaRocket className="text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <FaFileAlt className="text-blue-500 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl">
                <FaHourglassHalf className="text-yellow-500 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <FaCheckCircle className="text-green-500 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <FaTimesCircle className="text-red-500 text-xl" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              {/* Search and Filter Bar */}
              <div className="p-4 border-b border-gray-200/50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by employee name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  >
                    <option value="pending">Pending</option>
                    <option value="all">All Requests</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Requests Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedRequests.length > 0 ? (
                      paginatedRequests.map((request, index) => {
                        const statusBadge = getStatusBadge(request.status);
                        return (
                          <motion.tr
                            key={request._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50/50 transition-colors duration-150"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                                  {request.user?.fullName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {request.user?.fullName || 'Unknown'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {request.user?.employeeId || ''}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-sm text-gray-900">
                                  {moment(request.requestedDate).format('DD MMM YYYY')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  In: {request.requestedClockIn} | Out: {request.requestedClockOut}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.class}`}>
                                {statusBadge.icon}
                                {statusBadge.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {request.status === 'pending' ? (
                                  <>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleQuickReview(request._id, 'approved')}
                                      disabled={isReviewing}
                                      className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                                      title="Approve"
                                    >
                                      <FaCheck />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleQuickReview(request._id, 'rejected')}
                                      disabled={isReviewing}
                                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                      title="Reject"
                                    >
                                      <FaTimes />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => setSelectedRequest(request)}
                                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                      title="Review Details"
                                    >
                                      <FaFileAlt />
                                    </motion.button>
                                  </>
                                ) : (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedRequest(request)}
                                    className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                    title="View Details"
                                  >
                                    <FaFileAlt />
                                  </motion.button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <FaClock className="text-4xl text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No requests found</p>
                            <p className="text-sm text-gray-400 mt-1">
                              {searchTerm ? 'Try adjusting your search' : 'All caught up!'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200/50 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of{' '}
                    {filteredRequests.length}
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <FaChevronLeft />
                    </motion.button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <motion.button
                          key={pageNum}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-xl font-medium transition-all ${
                            currentPage === pageNum
                              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {pageNum}
                        </motion.button>
                      );
                    })}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <FaChevronRight />
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Review Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <AnimatePresence mode="wait">
              {selectedRequest ? (
                <motion.div
                  key="review-panel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20 sticky top-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <FaFileAlt className="text-purple-500" />
                      Review Request
                    </h3>
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <FaTimes className="text-gray-500" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Employee Info */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                        {selectedRequest.user?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedRequest.user?.fullName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedRequest.user?.employeeId || 'No ID'}
                        </p>
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                          <FaCalendarAlt className="inline mr-1" />
                          Date
                        </p>
                        <p className="font-medium text-gray-900">
                          {moment(selectedRequest.requestedDate).format('dddd, DD MMM YYYY')}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                            Clock In
                          </p>
                          <p className="text-lg font-bold text-blue-600">
                            {selectedRequest.requestedClockIn}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                            Clock Out
                          </p>
                          <p className="text-lg font-bold text-green-600">
                            {selectedRequest.requestedClockOut}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                          <FaFileAlt className="inline mr-1" />
                          Reason
                        </p>
                        <div className="mt-1 p-3 bg-gray-50/50 rounded-xl text-sm text-gray-700 border border-gray-200/50">
                          {selectedRequest.reason}
                        </div>
                      </div>
                    </div>

                    {/* Review Comment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <FaComment className="inline mr-1" />
                        Review Comment
                      </label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                        rows="3"
                        placeholder="Add a comment (optional)"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleReview(selectedRequest._id, 'approved')}
                        disabled={isReviewing}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <FaCheck />
                        {isReviewing ? 'Processing...' : 'Approve'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleReview(selectedRequest._id, 'rejected')}
                        disabled={isReviewing}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <FaTimes />
                        {isReviewing ? 'Processing...' : 'Reject'}
                      </motion.button>
                    </div>

                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="w-full btn-secondary py-2.5"
                      disabled={isReviewing}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-panel"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 text-center"
                >
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full mb-4">
                      <FaFileAlt className="text-5xl text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No Request Selected</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-xs">
                      Select a pending request from the list to review it here
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                      <FaShieldAlt />
                      <span>HR Review Panel</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PendingRequests;