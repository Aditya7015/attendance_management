import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaCalendarAlt,
  FaUser,
  FaHourglassHalf,
  FaRocket
} from 'react-icons/fa';
import moment from 'moment';

const AttendanceCard = ({ 
  record, 
  user, 
  compact = false, 
  showUser = true,
  onClick,
  className = ''
}) => {
  // If no record, show an empty state
  if (!record) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200 ${className}`}
      >
        <div className="text-center">
          <FaCalendarAlt className="text-gray-300 text-3xl mx-auto mb-2" />
          <p className="text-sm text-gray-400">No attendance record</p>
          <p className="text-xs text-gray-300">for this day</p>
        </div>
      </motion.div>
    );
  }

  const statusConfig = {
    present: {
      icon: <FaCheckCircle className="text-green-500" />,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'Present',
      color: 'text-green-700'
    },
    absent: {
      icon: <FaTimesCircle className="text-red-500" />,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'Absent',
      color: 'text-red-700'
    },
    half_day: {
      icon: <FaHourglassHalf className="text-yellow-500" />,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'Half Day',
      color: 'text-yellow-700'
    },
    holiday: {
      icon: <FaRocket className="text-purple-500" />,
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'Holiday',
      color: 'text-purple-700'
    },
    weekend: {
      icon: <FaCalendarAlt className="text-gray-500" />,
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'Weekend',
      color: 'text-gray-700'
    }
  };

  const status = statusConfig[record.status] || statusConfig.present;
  const isClockedIn = record.clockIn && record.clockIn.time;
  const isClockedOut = record.clockOut && record.clockOut.time;
  const workingHours = record.workingHours || 0;
  const isLate = record.isLate || false;
  const lateMinutes = record.lateMinutes || 0;

  // Compact card design
  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`${status.bg} ${status.border} border rounded-xl p-3 cursor-pointer transition-all duration-200 hover:shadow-lg ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{status.icon}</span>
            <span className={`text-sm font-semibold ${status.color}`}>
              {status.text}
            </span>
          </div>
          {isClockedIn && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <FaClock className="text-blue-400" />
              <span>{moment(isClockedIn).format('HH:mm')}</span>
            </div>
          )}
        </div>
        {isClockedIn && workingHours > 0 && (
          <div className="mt-1 text-xs text-gray-500">
            {workingHours.toFixed(1)} hours
          </div>
        )}
        {isLate && (
          <div className="mt-1 text-xs text-red-500">
            ⚠️ {lateMinutes}m late
          </div>
        )}
      </motion.div>
    );
  }

  // Full card design
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}
      onClick={onClick}
      className={`${status.bg} ${status.border} border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${className}`}
    >
      {/* User Info */}
      {showUser && user && (
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {user.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.fullName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      )}

      {/* Status Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{status.icon}</span>
          <span className={`text-xl font-bold ${status.color}`}>
            {status.text}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {moment(record.date).format('DD MMM YYYY')}
        </span>
      </div>

      {/* Time Details */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 font-medium">Clock In</p>
          <p className="text-lg font-bold text-blue-600">
            {isClockedIn ? moment(record.clockIn.time).format('HH:mm') : '--:--'}
          </p>
        </div>
        <div className="bg-white/50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 font-medium">Clock Out</p>
          <p className="text-lg font-bold text-green-600">
            {isClockedOut ? moment(record.clockOut.time).format('HH:mm') : '--:--'}
          </p>
        </div>
        <div className="bg-white/50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 font-medium">Hours</p>
          <p className="text-lg font-bold text-purple-600">
            {workingHours > 0 ? workingHours.toFixed(1) : '0.0'}
          </p>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex flex-wrap gap-2 mt-2">
        {isLate && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <FaClock className="text-red-500" />
            {lateMinutes}m late
          </span>
        )}
        {isClockedIn && isClockedOut && !isLate && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <FaCheckCircle className="text-green-500" />
            On time
          </span>
        )}
        {isClockedIn && !isClockedOut && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium animate-pulse">
            <FaClock className="text-blue-500" />
            Working...
          </span>
        )}
        {workingHours > 8 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            <FaRocket className="text-purple-500" />
            Overtime
          </span>
        )}
      </div>
    </motion.div>
  );
};

// Grid of Attendance Cards
export const AttendanceCardGrid = ({ 
  records = [], 
  users = {},
  compact = false,
  showUser = true,
  onCardClick,
  className = ''
}) => {
  if (records.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-2xl p-12 text-center ${className}`}>
        <FaCalendarAlt className="text-4xl text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No attendance records to display</p>
        <p className="text-sm text-gray-400">Records will appear here once available</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {records.map((record) => {
        const user = users[record.userId] || null;
        return (
          <AttendanceCard
            key={record._id || record.date}
            record={record}
            user={user}
            compact={compact}
            showUser={showUser}
            onClick={() => onCardClick && onCardClick(record)}
          />
        );
      })}
    </div>
  );
};

export default AttendanceCard;