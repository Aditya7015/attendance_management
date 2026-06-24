const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const AttendanceRule = require('../src/models/AttendanceRule');
const Attendance = require('../src/models/Attendance');
const AuditLog = require('../src/models/AuditLog');
const CorrectionRequest = require('../src/models/CorrectionRequest');

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_management');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await AttendanceRule.deleteMany({});
    await Attendance.deleteMany({});
    await AuditLog.deleteMany({});
    await CorrectionRequest.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create admin user - STORE PLAIN TEXT PASSWORD
    const admin = await User.create({
      email: 'admin@company.com',
      passwordHash: 'Admin@123',  // Plain text for now
      fullName: 'Admin User',
      role: 'admin',
      department: 'Administration',
      designation: 'System Administrator',
      isActive: true
    });
    console.log('✅ Admin user created');

    // Create HR user - STORE PLAIN TEXT PASSWORD
    const hr = await User.create({
      email: 'hr@company.com',
      passwordHash: 'Hr@123',  // Plain text for now
      fullName: 'HR Manager',
      role: 'hr',
      department: 'Human Resources',
      designation: 'HR Manager',
      isActive: true
    });
    console.log('✅ HR user created');

    // Create employees - STORE PLAIN TEXT PASSWORDS
    const employees = [];
    const departments = ['Engineering', 'Marketing', 'Sales', 'Finance', 'Operations'];
    const designations = ['Software Engineer', 'Marketing Specialist', 'Sales Executive', 'Financial Analyst', 'Operations Manager'];
    
    for (let i = 1; i <= 5; i++) {
      const employee = await User.create({
        email: `employee${i}@company.com`,
        passwordHash: 'Emp@123',  // Plain text for now
        fullName: `Employee ${i}`,
        role: 'employee',
        department: departments[i-1],
        designation: designations[i-1],
        employeeId: `EMP${String(i).padStart(4, '0')}`,
        isActive: true
      });
      employees.push(employee);
      console.log(`✅ Employee ${i} created: employee${i}@company.com`);
    }

    // Create attendance rules
    const rules = [
      {
        ruleKey: 'work_start_time',
        ruleName: 'Work Start Time',
        ruleValue: '09:00',
        dataType: 'time',
        category: 'time',
        description: 'Standard office work start time',
        createdBy: admin._id,
        isActive: true
      },
      {
        ruleKey: 'work_end_time',
        ruleName: 'Work End Time',
        ruleValue: '18:00',
        dataType: 'time',
        category: 'time',
        description: 'Standard office work end time',
        createdBy: admin._id,
        isActive: true
      },
      {
        ruleKey: 'grace_minutes',
        ruleName: 'Grace Minutes',
        ruleValue: '10',
        dataType: 'number',
        category: 'time',
        description: 'Grace period allowed for late clock-in (in minutes)',
        createdBy: admin._id,
        isActive: true
      },
      {
        ruleKey: 'work_days',
        ruleName: 'Work Days',
        ruleValue: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        dataType: 'array',
        category: 'time',
        description: 'Days of the week that are working days',
        createdBy: admin._id,
        isActive: true
      },
      {
        ruleKey: 'overtime_threshold_hours',
        ruleName: 'Overtime Threshold',
        ruleValue: '8',
        dataType: 'number',
        category: 'overtime',
        description: 'Hours worked before overtime starts counting',
        createdBy: admin._id,
        isActive: true
      }
    ];

    await AttendanceRule.insertMany(rules);
    console.log('✅ Attendance rules created');

    // Create sample attendance records for employees
    const today = new Date();
    console.log('📊 Creating sample attendance records...');
    
    for (const employee of employees) {
      // Create attendance for the last 10 days
      for (let i = 1; i <= 10; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Get day of week (0 = Sunday, 6 = Saturday)
        const dayOfWeek = date.getDay();
        
        // Skip weekends (Saturday and Sunday)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          continue;
        }

        // Randomly determine attendance status
        const random = Math.random();
        let status = 'present';
        let hasClockIn = true;
        let hasClockOut = true;
        let clockInHour = 9;
        let clockInMin = Math.floor(Math.random() * 30);
        let clockOutHour = 17 + Math.floor(Math.random() * 2);
        let clockOutMin = Math.floor(Math.random() * 30);
        
        if (random < 0.1) {
          // Absent - skip creating record
          continue;
        } else if (random < 0.15) {
          // Half day
          status = 'half_day';
          clockOutHour = 13;
          clockOutMin = 0;
        }

        // Prepare attendance data
        const attendanceData = {
          userId: employee._id,
          date: dateStr,
          status: status
        };

        // Add clock in
        if (hasClockIn) {
          const clockInTime = new Date(date);
          clockInTime.setHours(clockInHour, clockInMin, 0, 0);
          attendanceData.clockIn = {
            time: clockInTime,
            source: 'web',
            ip: '192.168.1.100'
          };
        }

        // Add clock out
        if (hasClockOut && hasClockIn) {
          const clockOutTime = new Date(date);
          clockOutTime.setHours(clockOutHour, clockOutMin, 0, 0);
          attendanceData.clockOut = {
            time: clockOutTime,
            source: 'web',
            ip: '192.168.1.100'
          };
        }

        // Calculate late minutes if clocked in
        if (hasClockIn) {
          const isLate = clockInHour > 9 || (clockInHour === 9 && clockInMin > 10);
          if (isLate) {
            attendanceData.isLate = true;
            attendanceData.lateMinutes = ((clockInHour - 9) * 60 + (clockInMin - 10));
          }
        }

        try {
          await Attendance.create(attendanceData);
        } catch (err) {
          // Skip if duplicate
          if (err.code !== 11000) {
            console.error(`Error creating attendance for ${employee.email} on ${dateStr}:`, err.message);
          }
        }
      }
    }
    console.log('✅ Sample attendance records created');

    // Create some correction requests
    const sampleEmployee = employees[0];
    const correctionRequests = [
      {
        userId: sampleEmployee._id,
        requestedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        requestedClockIn: '09:30',
        requestedClockOut: '18:30',
        reason: 'Had to attend an emergency meeting, need to adjust clock-in time',
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        userId: employees[1]._id,
        requestedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        requestedClockIn: '08:45',
        requestedClockOut: '17:15',
        reason: 'System issue prevented clock-in, please approve correction',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    await CorrectionRequest.insertMany(correctionRequests);
    console.log('✅ Sample correction requests created');

    // Create some audit logs
    const auditLogs = [
      {
        userId: admin._id,
        userEmail: admin.email,
        userRole: admin.role,
        action: 'LOGIN',
        resource: 'auth',
        status: 'success',
        details: { message: 'Admin logged in' },
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        userId: hr._id,
        userEmail: hr.email,
        userRole: hr.role,
        action: 'LOGIN',
        resource: 'auth',
        status: 'success',
        details: { message: 'HR logged in' },
        ip: '192.168.1.2',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        userId: sampleEmployee._id,
        userEmail: sampleEmployee.email,
        userRole: sampleEmployee.role,
        action: 'CLOCK_IN',
        resource: 'attendance',
        status: 'success',
        details: { time: new Date().toISOString(), source: 'web' },
        ip: '192.168.1.3',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
      }
    ];

    await AuditLog.insertMany(auditLogs);
    console.log('✅ Sample audit logs created');

    // Verify users were created correctly
    console.log('\n🔍 Verifying users:');
    const allUsers = await User.find({}).select('+passwordHash');
    for (const user of allUsers) {
      console.log(`  ${user.email} - Role: ${user.role} - Password stored: ${user.passwordHash}`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Sample Credentials:');
    console.log('  👤 Admin: admin@company.com / Admin@123');
    console.log('  👤 HR: hr@company.com / Hr@123');
    console.log('  👤 Employee 1: employee1@company.com / Emp@123');
    console.log('  👤 Employee 2: employee2@company.com / Emp@123');
    console.log('  👤 Employee 3: employee3@company.com / Emp@123');
    console.log('  👤 Employee 4: employee4@company.com / Emp@123');
    console.log('  👤 Employee 5: employee5@company.com / Emp@123');
    console.log('\n🔗 API URL: http://localhost:5000/api');
    console.log('📝 Test with Thunder Client:');
    console.log('   POST http://localhost:5000/api/auth/login');
    console.log('   Body: { "email": "admin@company.com", "password": "Admin@123" }');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    if (error.errors) {
      console.error('Validation errors:', Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })));
    }
    process.exit(1);
  }
};

seedDatabase();