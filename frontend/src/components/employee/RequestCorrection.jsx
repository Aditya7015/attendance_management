import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FaCalendarAlt, FaClock, FaFileAlt, FaPaperPlane } from 'react-icons/fa';

const RequestCorrection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requestedDate: '',
    requestedClockIn: '',
    requestedClockOut: '',
    reason: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/corrections/request', formData);
      toast.success('Correction request submitted successfully!');
      setFormData({
        requestedDate: '',
        requestedClockIn: '',
        requestedClockOut: '',
        reason: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
      console.error('Error submitting correction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Request Correction</h1>
        <p className="text-gray-600 mt-1">
          Submit a request to correct your attendance record
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">
                <FaCalendarAlt className="inline mr-2" />
                Date
              </label>
              <input
                type="date"
                name="requestedDate"
                value={formData.requestedDate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                required
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <FaClock className="inline mr-2" />
                  Clock In Time
                </label>
                <input
                  type="time"
                  name="requestedClockIn"
                  value={formData.requestedClockIn}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">
                  <FaClock className="inline mr-2" />
                  Clock Out Time
                </label>
                <input
                  type="time"
                  name="requestedClockOut"
                  value={formData.requestedClockOut}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="label">
                <FaFileAlt className="inline mr-2" />
                Reason
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                minLength={10}
                maxLength={500}
                rows={4}
                className="input-field"
                placeholder="Please provide a detailed reason for the correction (minimum 10 characters)"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.reason.length}/500 characters
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ℹ️ Your request will be reviewed by HR. You'll be notified once it's approved or rejected.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPaperPlane />
              <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </form>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Request Guidelines</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• You can only request corrections for your own attendance records</li>
            <li>• Requests must be for dates within the last 30 days</li>
            <li>• Provide a clear and detailed reason for the correction</li>
            <li>• HR will review your request within 2-3 business days</li>
            <li>• You'll receive a notification once your request is processed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RequestCorrection;