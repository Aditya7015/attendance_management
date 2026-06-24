import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FaUsers, FaCalendarAlt, FaSearch, FaSync, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import moment from 'moment';

const TeamAttendance = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTeamData();
  }, [selectedDate]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      
      // Fetch all employees - HR can now access this
      const usersResponse = await api.get('/users', {
        params: { role: 'employee', limit: 100, isActive: true },
        timeout: 10000
      });
      
      const employees = usersResponse.data.data.users || [];
      setUsers(employees);

      if (employees.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch attendance for each employee - limit to first 20 to avoid rate limiting
      const limitedEmployees = employees.slice(0, 20);
      const attendancePromises = limitedEmployees.map(emp =>
        api.get(`/attendance/history/${emp._id}`, {
          params: { from: selectedDate, to: selectedDate },
          timeout: 5000
        }).catch(err => {
          console.error(`Failed to fetch attendance for ${emp.email}:`, err.message);
          return { data: { data: { attendance: [] } } };
        })
      );
      
      const attendanceResponses = await Promise.all(attendancePromises);
      const attendanceMap = {};
      limitedEmployees.forEach((emp, index) => {
        const records = attendanceResponses[index]?.data?.data?.attendance || [];
        attendanceMap[emp._id] = records[0] || null;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching team data:', error);
      if (error.response?.status === 403) {
        toast.error('You don\'t have permission to view team attendance');
      } else if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error('Failed to fetch team data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTeamData();
  };

  const getStatusColor = (status) => {
    const colors = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      half_day: 'bg-yellow-100 text-yellow-800',
      holiday: 'bg-blue-100 text-blue-800',
      weekend: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    if (status === 'present') return <FaUserCheck className="text-green-600" />;
    if (status === 'absent') return <FaUserTimes className="text-red-600" />;
    return null;
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
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Attendance</h1>
          <p className="text-gray-600 mt-1">View attendance for all team members</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="mt-4 md:mt-0 btn-secondary flex items-center space-x-2"
        >
          <FaSync className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label className="label">
              <FaCalendarAlt className="inline mr-2" />
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchTeamData}
              className="btn-primary flex items-center space-x-2"
            >
              <FaSearch />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-500">Total Employees</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-500">Present</p>
          <p className="text-2xl font-bold text-green-600">
            {Object.values(attendance).filter(a => a?.status === 'present').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-500">Absent</p>
          <p className="text-2xl font-bold text-red-600">
            {Object.values(attendance).filter(a => !a || a?.status === 'absent').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-500">Half Day</p>
          <p className="text-2xl font-bold text-yellow-600">
            {Object.values(attendance).filter(a => a?.status === 'half_day').length}
          </p>
        </div>
      </div>

      {/* Team List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Employee</th>
                <th className="table-header">Department</th>
                <th className="table-header">Clock In</th>
                <th className="table-header">Clock Out</th>
                <th className="table-header">Working Hours</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length > 0 ? (
                users.slice(0, 20).map((emp) => {
                  const record = attendance[emp._id];
                  return (
                    <tr key={emp._id} className="table-row">
                      <td className="table-cell">
                        <div>
                          <div className="font-medium text-gray-900">
                            {emp.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {emp.employeeId || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">{emp.department || 'N/A'}</td>
                      <td className="table-cell">
                        {record?.clockIn?.time ? moment(record.clockIn.time).format('HH:mm') : '--:--'}
                      </td>
                      <td className="table-cell">
                        {record?.clockOut?.time ? moment(record.clockOut.time).format('HH:mm') : '--:--'}
                      </td>
                      <td className="table-cell">
                        {record?.workingHours ? record.workingHours.toFixed(1) + 'h' : '0.0h'}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <span className={`badge ${getStatusColor(record?.status)}`}>
                            {record?.status?.toUpperCase() || 'ABSENT'}
                          </span>
                          {getStatusIcon(record?.status)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No team members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {users.length > 20 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500">
            Showing first 20 employees. Use search to find specific employees.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamAttendance;