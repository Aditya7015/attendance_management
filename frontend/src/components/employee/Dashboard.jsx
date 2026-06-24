// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import api from '../../services/api';
// import toast from 'react-hot-toast';
// import { FaClock, FaCalendarCheck, FaCalendarTimes, FaChartLine } from 'react-icons/fa';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import moment from 'moment';

// const Dashboard = () => {
//   const { user } = useAuth();
//   const [status, setStatus] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({});
//   const [chartData, setChartData] = useState([]);

//   useEffect(() => {
//     fetchTodayStatus();
//     fetchStats();
//   }, []);

//   const fetchTodayStatus = async () => {
//     try {
//       const response = await api.get('/attendance/today-status');
//       setStatus(response.data.data);
//     } catch (error) {
//       console.error('Failed to fetch status:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const response = await api.get('/attendance/history', {
//         params: { limit: 30 }
//       });
//       const records = response.data.data.attendance;
      
//       const present = records.filter(r => r.status === 'present').length;
//       const absent = records.filter(r => r.status === 'absent').length;
//       const total = records.length;
      
//       setStats({ present, absent, total });
      
//       // Prepare chart data
//       const chart = records.slice(0, 7).reverse().map(r => ({
//         date: moment(r.date).format('DD MMM'),
//         hours: r.workingHours || 0
//       }));
//       setChartData(chart);
//     } catch (error) {
//       console.error('Failed to fetch stats:', error);
//     }
//   };

//   const handleClockIn = async () => {
//     try {
//       await api.post('/attendance/clock-in');
//       toast.success('Clocked in successfully!');
//       fetchTodayStatus();
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to clock in');
//     }
//   };

//   const handleClockOut = async () => {
//     try {
//       await api.post('/attendance/clock-out');
//       toast.success('Clocked out successfully!');
//       fetchTodayStatus();
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to clock out');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">
//           Welcome back, {user?.fullName}!
//         </h1>
//         <p className="text-gray-600 mt-1">
//           Here's your attendance overview for today
//         </p>
//       </div>

//       {/* Today's Status Card */}
//       <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
//           <div>
//             <h2 className="text-xl font-semibold text-gray-800">
//               Today's Attendance
//             </h2>
//             <p className="text-gray-500 text-sm">
//               {moment().format('dddd, MMMM D, YYYY')}
//             </p>
//           </div>
//           <div className="flex items-center space-x-4 mt-4 md:mt-0">
//             <div className="flex items-center space-x-2">
//               <div className={`w-3 h-3 rounded-full ${status?.isClockedIn ? 'bg-green-500' : 'bg-red-500'}`} />
//               <span className="text-sm font-medium">
//                 {status?.isClockedIn ? 'Clocked In' : 'Not Clocked In'}
//               </span>
//             </div>
//             {status?.isClockedOut && (
//               <div className="flex items-center space-x-2">
//                 <div className="w-3 h-3 rounded-full bg-blue-500" />
//                 <span className="text-sm font-medium">Clocked Out</span>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
//           <div className="bg-blue-50 rounded-lg p-4">
//             <p className="text-sm text-blue-600 font-medium">Clock In</p>
//             <p className="text-xl font-bold text-blue-900">
//               {status?.clockInTime ? moment(status.clockInTime).format('HH:mm') : '--:--'}
//             </p>
//           </div>
//           <div className="bg-green-50 rounded-lg p-4">
//             <p className="text-sm text-green-600 font-medium">Clock Out</p>
//             <p className="text-xl font-bold text-green-900">
//               {status?.clockOutTime ? moment(status.clockOutTime).format('HH:mm') : '--:--'}
//             </p>
//           </div>
//           <div className="bg-purple-50 rounded-lg p-4">
//             <p className="text-sm text-purple-600 font-medium">Working Hours</p>
//             <p className="text-xl font-bold text-purple-900">
//               {status?.workingHours ? status.workingHours.toFixed(1) : '0.0'}h
//             </p>
//           </div>
//           <div className="bg-yellow-50 rounded-lg p-4">
//             <p className="text-sm text-yellow-600 font-medium">Status</p>
//             <p className={`text-xl font-bold ${
//               status?.status === 'present' ? 'text-green-600' : 'text-red-600'
//             }`}>
//               {status?.status?.toUpperCase() || 'ABSENT'}
//             </p>
//           </div>
//         </div>

//         <div className="flex space-x-4 mt-6">
//           <button
//             onClick={handleClockIn}
//             disabled={status?.isClockedIn && !status?.isClockedOut}
//             className={`px-6 py-3 rounded-lg font-medium transition-colors ${
//               status?.isClockedIn && !status?.isClockedOut
//                 ? 'bg-gray-300 cursor-not-allowed'
//                 : 'bg-blue-600 hover:bg-blue-700 text-white'
//             }`}
//           >
//             Clock In
//           </button>
//           <button
//             onClick={handleClockOut}
//             disabled={!status?.isClockedIn || status?.isClockedOut}
//             className={`px-6 py-3 rounded-lg font-medium transition-colors ${
//               !status?.isClockedIn || status?.isClockedOut
//                 ? 'bg-gray-300 cursor-not-allowed'
//                 : 'bg-green-600 hover:bg-green-700 text-white'
//             }`}
//           >
//             Clock Out
//           </button>
//         </div>

//         {status?.isLate && (
//           <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//             <p className="text-sm text-yellow-800">
//               ⚠️ You were late by {status.lateMinutes} minutes today
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white rounded-lg shadow-lg p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-500 text-sm">Present Days</p>
//               <p className="text-2xl font-bold text-green-600">{stats.present || 0}</p>
//             </div>
//             <FaCalendarCheck className="text-green-500 text-4xl" />
//           </div>
//         </div>
//         <div className="bg-white rounded-lg shadow-lg p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-500 text-sm">Absent Days</p>
//               <p className="text-2xl font-bold text-red-600">{stats.absent || 0}</p>
//             </div>
//             <FaCalendarTimes className="text-red-500 text-4xl" />
//           </div>
//         </div>
//         <div className="bg-white rounded-lg shadow-lg p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-500 text-sm">Total Days</p>
//               <p className="text-2xl font-bold text-blue-600">{stats.total || 0}</p>
//             </div>
//             <FaChartLine className="text-blue-500 text-4xl" />
//           </div>
//         </div>
//       </div>

//       {/* Chart */}
//       {chartData.length > 0 && (
//         <div className="bg-white rounded-lg shadow-lg p-6">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">
//             Last 7 Days Working Hours
//           </h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip />
//                 <Line 
//                   type="monotone" 
//                   dataKey="hours" 
//                   stroke="#3B82F6" 
//                   strokeWidth={2}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FaClock, FaCalendarCheck, FaCalendarTimes, FaChartLine } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import moment from 'moment';

const Dashboard = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchTodayStatus();
    fetchStats();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await api.get('/attendance/today-status');
      setStatus(response.data.data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
      // Don't show toast for this error as it might be expected
      if (error.response?.status !== 500) {
        toast.error('Failed to fetch today\'s status');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/attendance/history', {
        params: { limit: 30 }
      });
      const records = response.data.data.attendance || [];
      
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const total = records.length;
      
      setStats({ present, absent, total });
      
      // Prepare chart data
      const chart = records.slice(0, 7).reverse().map(r => ({
        date: moment(r.date).format('DD MMM'),
        hours: r.workingHours || 0
      }));
      setChartData(chart);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      if (error.response?.status !== 403) {
        toast.error('Failed to fetch attendance history');
      }
    }
  };

  const handleClockIn = async () => {
    try {
      await api.post('/attendance/clock-in');
      toast.success('Clocked in successfully!');
      fetchTodayStatus();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clock in';
      toast.error(message);
      console.error('Clock in error:', error);
    }
  };

  const handleClockOut = async () => {
    try {
      await api.post('/attendance/clock-out');
      toast.success('Clocked out successfully!');
      fetchTodayStatus();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clock out';
      toast.error(message);
      console.error('Clock out error:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.fullName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's your attendance overview for today
        </p>
      </div>

      {/* Today's Status Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Today's Attendance
            </h2>
            <p className="text-gray-500 text-sm">
              {moment().format('dddd, MMMM D, YYYY')}
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${status?.isClockedIn ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {status?.isClockedIn ? 'Clocked In' : 'Not Clocked In'}
              </span>
            </div>
            {status?.isClockedOut && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-medium">Clocked Out</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Clock In</p>
            <p className="text-xl font-bold text-blue-900">
              {status?.clockInTime ? moment(status.clockInTime).format('HH:mm') : '--:--'}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Clock Out</p>
            <p className="text-xl font-bold text-green-900">
              {status?.clockOutTime ? moment(status.clockOutTime).format('HH:mm') : '--:--'}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">Working Hours</p>
            <p className="text-xl font-bold text-purple-900">
              {status?.workingHours ? status.workingHours.toFixed(1) : '0.0'}h
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-yellow-600 font-medium">Status</p>
            <p className={`text-xl font-bold ${
              status?.status === 'present' ? 'text-green-600' : status?.status === 'weekend' ? 'text-blue-600' : 'text-red-600'
            }`}>
              {status?.status?.toUpperCase() || 'ABSENT'}
            </p>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleClockIn}
            disabled={status?.isClockedIn && !status?.isClockedOut}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              status?.isClockedIn && !status?.isClockedOut
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Clock In
          </button>
          <button
            onClick={handleClockOut}
            disabled={!status?.isClockedIn || status?.isClockedOut}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              !status?.isClockedIn || status?.isClockedOut
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            Clock Out
          </button>
        </div>

        {status?.isLate && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ You were late by {status.lateMinutes} minutes today
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Present Days</p>
              <p className="text-2xl font-bold text-green-600">{stats.present || 0}</p>
            </div>
            <FaCalendarCheck className="text-green-500 text-4xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Absent Days</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent || 0}</p>
            </div>
            <FaCalendarTimes className="text-red-500 text-4xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Days</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total || 0}</p>
            </div>
            <FaChartLine className="text-blue-500 text-4xl" />
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Last 7 Days Working Hours
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;