import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FaCheck, FaTimes, FaClock, FaUser } from 'react-icons/fa';
import moment from 'moment';

const PendingRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/corrections', {
        params: { status: 'pending' }
      });
      setRequests(response.data.data.corrections);
    } catch (error) {
      toast.error('Failed to fetch requests');
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId, status) => {
    try {
      await api.put(`/corrections/${requestId}/review`, {
        status,
        reviewComment
      });
      
      toast.success(`Request ${status} successfully`);
      setSelectedRequest(null);
      setReviewComment('');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to review request');
      console.error('Error reviewing request:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pending Requests</h1>
        <p className="text-gray-600 mt-1">Review and manage attendance correction requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Employee</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Requested Times</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.length > 0 ? (
                    requests.map((request) => (
                      <tr key={request._id} className="table-row">
                        <td className="table-cell">
                          <div className="flex items-center">
                            <FaUser className="text-gray-400 mr-2" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {request.user?.fullName || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.user?.employeeId || ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          {moment(request.requestedDate).format('DD MMM YYYY')}
                        </td>
                        <td className="table-cell">
                          <div className="text-sm">
                            <div>In: {request.requestedClockIn}</div>
                            <div>Out: {request.requestedClockOut}</div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="badge badge-warning">Pending</span>
                        </td>
                        <td className="table-cell">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">
                        No pending requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Review Panel */}
        <div className="lg:col-span-1">
          {selectedRequest ? (
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Review Request
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Employee</p>
                  <p className="font-medium">{selectedRequest.user?.fullName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {moment(selectedRequest.requestedDate).format('DD MMM YYYY')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Requested Times</p>
                  <p className="font-medium">
                    In: {selectedRequest.requestedClockIn} | Out: {selectedRequest.requestedClockOut}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Reason</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">
                    {selectedRequest.reason}
                  </p>
                </div>

                <div>
                  <label className="label">Review Comment</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="input-field"
                    rows="3"
                    placeholder="Add a comment (optional)"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleReview(selectedRequest._id, 'approved')}
                    className="flex-1 btn-success flex items-center justify-center space-x-2"
                  >
                    <FaCheck />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReview(selectedRequest._id, 'rejected')}
                    className="flex-1 btn-danger flex items-center justify-center space-x-2"
                  >
                    <FaTimes />
                    <span>Reject</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-full btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center text-gray-500">
                <FaClock className="text-4xl mx-auto mb-3 text-gray-300" />
                <p>Select a request to review</p>
                <p className="text-sm">Click "Review" on any pending request</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingRequests;