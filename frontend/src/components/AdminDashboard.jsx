import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import Logo from './Logo';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [attemptsData, setAttemptsData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sendingTopicId, setSendingTopicId] = useState(null); // track which topic is being sent

  const topicsList = [
    { id: 'secure-ai', name: 'Secure & Responsible AI Usage', totalModules: 10 },
    { id: 'leave-policy', name: 'Leave Policy', totalModules: 4 },
    { id: 'hardware-policy', name: 'Hardware Policy', totalModules: 4 },
    { id: 'server-policy', name: 'Server Policy', totalModules: 4 },
    { id: 'company-policies', name: 'Company Policies', totalModules: 0 },
    { id: 'logical-questions', name: 'Logical based questions', totalModules: 0 }
  ];

  const topicNameMap = {
    'secure-ai': 'Secure & Responsible AI Usage',
    'leave-policy': 'Leave Policy',
    'hardware-policy': 'Hardware Policy',
    'server-policy': 'Server Policy',
    'company-policies': 'Company Policies',
    'logical-questions': 'Logical based questions'
  };

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      const regularUsers = response.data.filter(u => u.role !== 'admin');
      setUsers(regularUsers);
      setFilteredUsers(regularUsers);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success(`User ${userName} deleted`);
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleViewAttempts = async (user) => {
    setSelectedUser(user);
    setLoading(true);
    try {
      const response = await api.get(`/admin/users/${user._id}/attempts`);
      setAttemptsData(response.data);
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to load quiz attempts');
    } finally {
      setLoading(false);
    }
  };

  const handleSendAcknowledgement = async (topicId) => {
    if (!selectedUser) return;
    setSendingTopicId(topicId);
    try {
      await api.post(`/admin/users/${selectedUser._id}/acknowledge/${topicId}`);
      toast.success(`Acknowledgement sent to ${selectedUser.name} for ${topicNameMap[topicId]}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send acknowledgement');
    } finally {
      setSendingTopicId(null);
    }
  };

  const getTopicProgress = (user, topicId, totalModules) => {
    if (totalModules === 0) return null;
    const topicName = topicNameMap[topicId];
    const topicCompleted = user.topicsProgress?.[topicName]?.completed === true;
    if (topicCompleted) return 100;
    const moduleProg = user.moduleProgress?.[topicId];
    const completedModules = moduleProg?.completedModules?.length || 0;
    if (completedModules === totalModules) return 99;
    if (completedModules === 0) return 0;
    return Math.round((completedModules / totalModules) * 100);
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(users.filter(u => 
        u.name.toLowerCase().includes(term) || 
        u.email.toLowerCase().includes(term)
      ));
    }
  }, [searchTerm, users]);

  if (loading && !showModal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-lightBlue-500">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Logo className="h-10" />
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Admin: {user?.name}</span>
            <button onClick={logout} className="px-4 py-2 text-pink-500 hover:bg-pink-50 rounded-lg">Logout</button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary-600">All Users & Progress</h2>
          <div className="relative">
            <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-64" />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr><th className="px-6 py-3 text-left">Name</th><th className="px-6 py-3 text-left">Email</th><th className="px-6 py-3 text-left">Role</th><th className="px-6 py-3 text-left">Topic Progress (%)</th><th className="px-6 py-3 text-left">Actions</th></tr></thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4 capitalize">{u.role}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {topicsList.map(topic => {
                        const progress = getTopicProgress(u, topic.id, topic.totalModules);
                        if (progress === null) return null;
                        return (
                          <div key={topic.id} className="text-sm">
                            <div className="flex justify-between text-xs"><span>{topic.name}</span><span>{progress}%</span></div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div></div>
                          </div>
                        );
                      })}
                      {topicsList.every(t => t.totalModules === 0 || getTopicProgress(u, t.id, t.totalModules) === 0) && <span className="text-xs text-gray-400">No progress yet</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleViewAttempts(u)} className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm mr-2">View Attempts</button>
                    <button onClick={() => handleDeleteUser(u._id, u.name)} className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && <p className="text-center text-gray-500 mt-8">No users found.</p>}
      </main>

      {/* Modal for quiz attempts */}
      {showModal && attemptsData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Quiz Attempts: {attemptsData.name}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="space-y-6">
                {topicsList.map(topic => {
                  const userAttempts = attemptsData.attempts.filter(a => a.topicId === topic.id);
                  if (userAttempts.length === 0) return null;
                  const hasPassed = userAttempts.some(a => a.passed);
                  return (
                    <div key={topic.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-lg">{topic.name}</h4>
                        {hasPassed && (
                          <button
                            onClick={() => handleSendAcknowledgement(topic.id)}
                            disabled={sendingTopicId === topic.id}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                          >
                            {sendingTopicId === topic.id ? 'Sending...' : 'Send Acknowledgment'}
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {userAttempts.map((attempt, idx) => (
                          <div key={idx} className="text-sm border-b pb-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">{new Date(attempt.attemptDate).toLocaleString()}</span>
                              <span className={attempt.passed ? 'text-green-600 font-medium' : 'text-red-600'}>
                                {attempt.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </div>
                            <div className="mt-1">Score: {attempt.score}/{attempt.totalQuestions} ({Math.round((attempt.score/attempt.totalQuestions)*100)}%)</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {attemptsData.attempts.length === 0 && <p className="text-gray-500">No quiz attempts yet.</p>}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;