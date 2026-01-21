
import React, { useState, useMemo, useEffect } from 'react';
import { authService } from '../services/authService';
import { emailService } from '../services/emailService';
import { User } from '../types';

// Define a new type that includes the calculated compliance status
type UserWithCompliance = User & {
  complianceStatus: 'Compliant' | 'Expiring Soon' | 'Non-Compliant';
  expiryDate: Date | null;
};

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'outstanding' | 'passed'>('all');
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = authService.listenToUsers((allUsers) => {
      // Filter out admin users from the main list
      setUsers(allUsers.filter(u => !u.isAdmin));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const usersWithCompliance = useMemo((): UserWithCompliance[] => {
    return users.map(user => {
      const attempts = user.testAttempts || [];
      const lastSuccessfulTest = attempts
        .filter(attempt => attempt.passed)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      if (!lastSuccessfulTest) {
        return { ...user, complianceStatus: 'Non-Compliant', expiryDate: null };
      }

      const successDate = new Date(lastSuccessfulTest.date);
      const expiryDate = new Date(successDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      if (expiryDate < now) {
        return { ...user, complianceStatus: 'Non-Compliant', expiryDate };
      }
      if (expiryDate <= thirtyDaysFromNow) {
        return { ...user, complianceStatus: 'Expiring Soon', expiryDate };
      }
      return { ...user, complianceStatus: 'Compliant', expiryDate };
    });
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (filter === 'outstanding') {
      return usersWithCompliance.filter(u => u.complianceStatus === 'Non-Compliant' || u.complianceStatus === 'Expiring Soon');
    }
    if (filter === 'passed') {
      return usersWithCompliance.filter(u => u.complianceStatus === 'Compliant');
    }
    return usersWithCompliance;
  }, [usersWithCompliance, filter]);

  const sendReminders = async () => {
    const outstanding = usersWithCompliance.filter(u => u.complianceStatus !== 'Compliant' && u.intendToTeach);
    if (outstanding.length === 0) {
      setStatusMessage({ text: 'No outstanding users to remind.', type: 'success' });
      setTimeout(() => setStatusMessage(null), 5000);
      return;
    }
    
    try {
      await emailService.sendBulkReminder(outstanding);
      setStatusMessage({ text: `Reminders sent to ${outstanding.length} staff member(s).`, type: 'success' });
    } catch (error) {
      setStatusMessage({ text: 'Failed to send reminders.', type: 'error' });
    }
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY remove ${user.name}?`)) {
      try {
        await emailService.sendAccountDeletedEmail(user);
        await authService.deleteUser(user.id);
        setStatusMessage({ text: `Account for ${user.name} has been removed.`, type: 'success' });
      } catch (e) {
        setStatusMessage({ text: `Error removing user.`, type: 'error' });
      }
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const statusStyles = {
    'Compliant': 'bg-green-100 text-green-700',
    'Expiring Soon': 'bg-yellow-100 text-yellow-700',
    'Non-Compliant': 'bg-red-100 text-red-700',
  };

  const totalStaff = users.length;
  const validCerts = usersWithCompliance.filter(u => u.complianceStatus === 'Compliant').length;
  const outstandingCerts = totalStaff - validCerts;

  return (
    <div className="space-y-8">
      <div className="bg-[#2E5D4E] p-8 rounded-2xl shadow-xl text-white">
        <h2 className="text-3xl font-bold mb-2">Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-10 p-4 rounded-xl">
             <span className="text-3xl font-black block">{totalStaff}</span>
             <span className="text-xs font-bold uppercase opacity-60">Total Staff</span>
          </div>
          <div className="bg-white bg-opacity-10 p-4 rounded-xl">
             <span className="text-3xl font-black block">{validCerts}</span>
             <span className="text-xs font-bold uppercase opacity-60">Valid Certifications</span>
          </div>
          <div className="bg-white bg-opacity-10 p-4 rounded-xl">
             <span className="text-3xl font-black block text-red-200">{outstandingCerts}</span>
             <span className="text-xs font-bold uppercase opacity-60">Outstanding / Expired</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl font-bold text-center ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {statusMessage.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(['all', 'outstanding', 'passed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-white text-[#2E5D4E] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button onClick={sendReminders} className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold text-sm hover:bg-red-600 transition-all">
            Send Bulk Reminders
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 text-left">Staff Member</th>
                <th className="px-6 py-4 text-left">Grade</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="p-12 text-center text-gray-400">Loading staff data...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-gray-400 italic">No matching records found.</td></tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.gradeTaught}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusStyles[user.complianceStatus]}`}>
                        {user.complianceStatus.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteUser(user)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};