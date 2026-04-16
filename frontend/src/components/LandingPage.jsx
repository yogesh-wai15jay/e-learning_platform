import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import Logo from './Logo';
import HorizontalScrollSection from './HorizontalScrollSection';

const LandingPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin');
  }, [user]);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await api.get('/topics');
      setTopics(response.data);
    } catch (error) {
      toast.error('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const getProgressText = (topic) => {
    if (!topic.contentAvailable) return 'Coming Soon';
    if (topic.progress?.completed) return 'Completed ✓';
    if (topic.completedModules > 0) return 'In Progress';
    return 'Not Started';
  };

  const getProgressColor = (topic) => {
    if (!topic.contentAvailable) return 'text-gray-400';
    if (topic.progress?.completed) return 'text-green-600';
    if (topic.completedModules > 0) return 'text-yellow-600';
    return 'text-gray-500';
  };

  // Progress percentage: 100% only if quiz passed; otherwise cap at 99% when all modules done.
  const getProgressPercentage = (topic) => {
    if (topic.progress?.completed) return 100;
    if (!topic.contentAvailable || topic.totalModules === 0) return 0;
    const modulePercentage = Math.round((topic.completedModules / topic.totalModules) * 100);
    if (modulePercentage === 100 && !topic.progress?.completed) return 99;
    return modulePercentage;
  };

  const handleTopicClick = (topic) => {
    if (topic.contentAvailable) {
      navigate(`/topic/${topic.id}`);
    } else {
      toast('Content coming soon!', { icon: '📚' });
    }
  };

  const renderTopicCard = (topic) => {
  const percentage = getProgressPercentage(topic);
  const isNotStarted = !topic.progress?.completed && topic.completedModules === 0 && topic.contentAvailable;
  const isInProgress = !topic.progress?.completed && topic.completedModules > 0;
  const isCompleted = topic.progress?.completed === true;

  return (
    <div
      onClick={() => handleTopicClick(topic)}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer p-6 h-full flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{topic.name}</h3>
        <span className={`text-sm font-medium ${getProgressColor(topic)}`}>
          {getProgressText(topic)}
        </span>
      </div>

      <div className="flex-1">
        <div className="flex items-center text-gray-600 mb-4">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">Est. {topic.estimatedTime} min</span>
        </div>
      </div>

      {/* This wrapper will stick to the bottom because of mt-auto */}
      <div className="mt-auto">
        {isNotStarted && (
          <button className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium">
            Enroll Now
          </button>
        )}

        {isInProgress && topic.totalModules > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {topic.completedModules} of {topic.totalModules} modules completed
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <span className="text-sm text-green-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Course Completed
            </span>
          </div>
        )}

        {!topic.contentAvailable && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-400">Content under development</span>
          </div>
        )}
      </div>
    </div>
  );
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Categorize topics
  const inProgressTopics = topics.filter(t => t.contentAvailable && !t.progress?.completed && t.completedModules > 0);
  const completedTopics = topics.filter(t => t.progress?.completed === true);
  const notStartedTopics = topics.filter(t => t.contentAvailable && !t.progress?.completed && t.completedModules === 0);
  const upcomingTopics = topics.filter(t => !t.contentAvailable);

  inProgressTopics.sort((a, b) => b.completedModules - a.completedModules);
  completedTopics.sort((a, b) => a.name.localeCompare(b.name));
  notStartedTopics.sort((a, b) => a.name.localeCompare(b.name));
  upcomingTopics.sort((a, b) => a.name.localeCompare(b.name));

  const continueLearningTopics = [...inProgressTopics, ...completedTopics];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-lightBlue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Logo className="h-10" />
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="px-4 py-2 text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {continueLearningTopics.length > 0 && (
          <HorizontalScrollSection
            title="Continue Learning"
            topics={continueLearningTopics}
            renderTopicCard={renderTopicCard}
          />
        )}

        {notStartedTopics.length > 0 && (
          <HorizontalScrollSection
            title="Other Courses"
            topics={notStartedTopics}
            renderTopicCard={renderTopicCard}
          />
        )}

        {upcomingTopics.length > 0 && (
          <HorizontalScrollSection
            title="Upcoming Courses"
            topics={upcomingTopics}
            renderTopicCard={renderTopicCard}
          />
        )}
      </main>
    </div>
  );
};

export default LandingPage;