import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaFileAlt, 
  FaPaperPlane,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaInfoCircle,
  FaArrowLeft,
  FaHistory,
  FaUserCheck,
  FaShieldAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const RequestCorrection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requestedDate: '',
    requestedClockIn: '',
    requestedClockOut: '',
    reason: ''
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [showRecent, setShowRecent] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    fetchRecentRequests();
  }, []);

  const fetchRecentRequests = async () => {
    try {
      const response = await api.get('/corrections', {
        params: { limit: 5 }
      });
      setRecentRequests(response.data.data.corrections || []);
    } catch (error) {
      console.error('Failed to fetch recent requests:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/corrections/request', formData);
      toast.success('🎉 Correction request submitted successfully!', {
        icon: '✅',
        style: {
          background: '#10B981',
          color: '#fff',
        }
      });
      setFormData({
        requestedDate: '',
        requestedClockIn: '',
        requestedClockOut: '',
        reason: ''
      });
      fetchRecentRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request', {
        icon: '❌',
        style: {
          background: '#EF4444',
          color: '#fff',
        }
      });
      console.error('Error submitting correction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: <FaHourglassHalf className="text-yellow-500" />, text: 'Pending', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      approved: { icon: <FaCheckCircle className="text-green-500" />, text: 'Approved', className: 'bg-green-50 text-green-700 border-green-200' },
      rejected: { icon: <FaTimesCircle className="text-red-500" />, text: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' }
    };
    return badges[status] || badges.pending;
  };

  const maxDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-8">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/25">
                  <FaFileAlt className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Request Correction
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Submit a request to correct your attendance record
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowRecent(!showRecent)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <FaHistory className="text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Recent Requests</span>
              {recentRequests.length > 0 && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs font-bold">
                  {recentRequests.length}
                </span>
              )}
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 md:p-8 border border-white/20">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaCalendarAlt className="inline mr-2 text-purple-500" />
                    Date of Correction
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaCalendarAlt className="text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                    <input
                      type="date"
                      name="requestedDate"
                      value={formData.requestedDate}
                      onChange={handleChange}
                      max={maxDate}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-purple-500/10 group-focus-within:via-purple-500/5 group-focus-within:to-pink-500/10 transition-all duration-500 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Select the date you want to correct</p>
                </motion.div>

                {/* Time Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaClock className="inline mr-2 text-blue-500" />
                      Clock In Time
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaClock className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type="time"
                        name="requestedClockIn"
                        value={formData.requestedClockIn}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-blue-500/5 group-focus-within:to-blue-500/10 transition-all duration-500 pointer-events-none" />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaClock className="inline mr-2 text-green-500" />
                      Clock Out Time
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaClock className="text-gray-400 group-focus-within:text-green-500 transition-colors" />
                      </div>
                      <input
                        type="time"
                        name="requestedClockOut"
                        value={formData.requestedClockOut}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/0 via-green-500/0 to-green-500/0 group-focus-within:from-green-500/10 group-focus-within:via-green-500/5 group-focus-within:to-green-500/10 transition-all duration-500 pointer-events-none" />
                    </div>
                  </motion.div>
                </div>

                {/* Reason Field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaFileAlt className="inline mr-2 text-pink-500" />
                    Reason for Correction
                  </label>
                  <div className="relative group">
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      minLength={10}
                      maxLength={500}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all duration-300 resize-none"
                      placeholder="Please provide a detailed reason for the correction (minimum 10 characters)"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/0 via-pink-500/0 to-purple-500/0 group-focus-within:from-pink-500/10 group-focus-within:via-pink-500/5 group-focus-within:to-purple-500/10 transition-all duration-500 pointer-events-none" />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-400">
                      {formData.reason.length}/500 characters
                    </p>
                    {formData.reason.length > 0 && formData.reason.length < 10 && (
                      <p className="text-xs text-red-500">Minimum 10 characters required</p>
                    )}
                    {formData.reason.length >= 10 && (
                      <p className="text-xs text-green-500">✓ Good length</p>
                    )}
                  </div>
                </motion.div>

                {/* Info Box */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm border border-blue-200/50 rounded-xl flex items-start gap-3"
                >
                  <FaInfoCircle className="text-blue-500 text-lg mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Review Process</p>
                    <p className="text-sm text-gray-600">
                      Your request will be reviewed by HR within 2-3 business days. 
                      You'll be notified once it's approved or rejected.
                    </p>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 p-[1px] transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative flex items-center justify-center gap-3 px-6 py-3.5 bg-white/90 group-hover:bg-white/80 rounded-xl transition-all duration-300">
                    <span className="text-gray-900 font-semibold text-base">
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <svg className="animate-spin h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Submitting...
                        </div>
                      ) : (
                        <>
                          <FaPaperPlane className="text-purple-500" />
                          Submit Request
                        </>
                      )}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10"
                      initial={{ x: '-100%' }}
                      animate={{ x: isHovered ? '100%' : '-100%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Right Side - Guidelines & Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Guidelines Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaShieldAlt className="text-purple-500" />
                Guidelines
              </h3>
              <ul className="space-y-3">
                {[
                  'Only request corrections for your own attendance records',
                  'Requests must be for dates within the last 30 days',
                  'Provide a clear and detailed reason',
                  'HR will review within 2-3 business days',
                  'You\'ll be notified once processed'
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3 text-sm text-gray-600"
                  >
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50/50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {recentRequests.filter(r => r.status === 'pending').length}
                  </p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="p-3 bg-green-50/50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {recentRequests.filter(r => r.status === 'approved').length}
                  </p>
                  <p className="text-xs text-gray-500">Approved</p>
                </div>
                <div className="p-3 bg-red-50/50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {recentRequests.filter(r => r.status === 'rejected').length}
                  </p>
                  <p className="text-xs text-gray-500">Rejected</p>
                </div>
                <div className="p-3 bg-purple-50/50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {recentRequests.length}
                  </p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Requests Modal */}
        <AnimatePresence>
          {showRecent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowRecent(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">Recent Requests</h3>
                  <button
                    onClick={() => setShowRecent(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <FaTimesCircle className="text-gray-500 text-xl" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {recentRequests.length > 0 ? (
                    <div className="space-y-4">
                      {recentRequests.map((request, index) => {
                        const status = getStatusBadge(request.status);
                        return (
                          <motion.div
                            key={request._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-gray-50/50 rounded-xl border border-gray-100"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {moment(request.requestedDate).format('DD MMM YYYY')}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  In: {request.requestedClockIn} | Out: {request.requestedClockOut}
                                </p>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {request.reason}
                                </p>
                              </div>
                              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${status.className}`}>
                                {status.icon}
                                <span>{status.text}</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaHistory className="text-4xl text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No recent requests found</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RequestCorrection;