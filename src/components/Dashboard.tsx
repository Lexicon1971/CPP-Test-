import React from 'react';
import { User } from '../types';

interface DashboardProps {
  user: User;
  onStartQuiz: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onStartQuiz }) => {
  const attempts = user.testAttempts || [];
  const passedOnce = attempts.some(t => t.passed);

  // --- Compliance Status Logic ---
  const lastSuccessfulTest = attempts
    .filter(attempt => attempt.passed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  let complianceStatus: 'Compliant' | 'Expiring Soon' | 'Non-Compliant' = 'Non-Compliant';
  let expiryDate: Date | null = null;
  let message = 'You do not have a valid certification. Please complete the test.';

  if (lastSuccessfulTest) {
    const successDate = new Date(lastSuccessfulTest.date);
    expiryDate = new Date(successDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    if (expiryDate < now) {
      complianceStatus = 'Non-Compliant';
    } else if (expiryDate <= thirtyDaysFromNow) {
      complianceStatus = 'Expiring Soon';
      message = `Your certification will expire on ${expiryDate.toLocaleDateString()}. Please re-test soon.`;
    } else {
      complianceStatus = 'Compliant';
      message = `Your certification is valid until ${expiryDate.toLocaleDateString()}.`;
    }
  }

  const statusStyles = {
    'Compliant': 'bg-green-100 text-green-700 border-green-300',
    'Expiring Soon': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'Non-Compliant': 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-4xl font-bold text-gray-800 mb-2 leading-tight">Policy Compliance Dashboard</h2>
          <p className="text-gray-500 mb-6 text-lg">Every volunteer and staff member must complete this knowledge verification to ensure the safety of our children.</p>
          
          <button 
            onClick={onStartQuiz}
            className="px-10 py-4 bg-[#2E5D4E] text-white rounded-2xl font-bold text-xl hover:bg-[#254a3e] transition-all transform hover:scale-105 shadow-xl shadow-green-100"
          >
            {attempts.length === 0 ? 'Start Certification Test' : 'Retake Certification Test'}
          </button>
        </div>
        
        <div className="w-full md:w-64 flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
           <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${passedOnce ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           </div>
           <div className="text-center">
             <span className="block text-2xl font-bold text-gray-800">{attempts.length}</span>
             <span className="text-xs uppercase font-bold text-gray-400 tracking-widest">Total Attempts</span>
           </div>
        </div>
      </div>

      {/* --- Compliance Status Banner --- */}
      <div className={`p-4 rounded-xl border-2 flex items-center gap-4 ${statusStyles[complianceStatus]}`}>
        <span className="font-bold text-sm uppercase tracking-wider">{complianceStatus}</span>
        <p className="text-sm">{message}</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Test History</h3>
        
        {attempts.length === 0 ? (
          <div className="py-12 text-center text-gray-400 italic">
            No test attempts recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Score</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...attempts].reverse().map((attempt, idx) => (
                  <tr key={idx} className="group">
                    <td className="py-4 text-gray-600">{new Date(attempt.date).toLocaleDateString()}</td>
                    <td className="py-4 font-bold text-gray-800">{attempt.score}%</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${attempt.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {attempt.passed ? 'PASSED' : 'RETRY'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-xs text-gray-400 group-hover:text-[#2E5D4E] transition-colors cursor-default">View Report</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};