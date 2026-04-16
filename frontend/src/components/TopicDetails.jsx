import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

const TopicDetails = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const fetchTopicDetails = async () => {
    try {
      const response = await api.get(`/topics/${topicId}`);
      setTopic(response.data);
    } catch (error) {
      toast.error('Failed to load topic details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadModuleProgress = async () => {
    setIsLoadingProgress(true);
    try {
      const res = await api.get(`/topics/${topicId}/progress`);
      setCurrentModuleIndex(res.data.lastModuleIndex || 0);
      setCompletedModules(res.data.completedModules || []);
    } catch (err) {
      console.error('Failed to load module progress', err);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const saveModuleProgress = async (completed, currentIdx) => {
    if (isLoadingProgress) return;
    if (!topic || !topic.contentAvailable) return;
    try {
      await api.post(`/topics/${topicId}/progress`, {
        completedModules: completed,
        currentModuleIndex: currentIdx
      });
    } catch (err) {
      console.error('Failed to save module progress', err);
    }
  };

  useEffect(() => {
    fetchTopicDetails();
  }, [topicId]);

  useEffect(() => {
    if (topic && topic.contentAvailable) {
      loadModuleProgress();
    }
  }, [topic]);

  useEffect(() => {
    if (!isLoadingProgress && topic && topic.contentAvailable && !topic.progress?.completed) {
      saveModuleProgress(completedModules, currentModuleIndex);
    }
  }, [completedModules, currentModuleIndex, topic]);

  const goToNextModule = () => {
    if (!topic?.subtopics) return;
    if (!completedModules.includes(currentModuleIndex)) {
      setCompletedModules([...completedModules, currentModuleIndex]);
    }
    if (currentModuleIndex < topic.subtopics.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    }
  };

  const goToPreviousModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  };

  const handleStartQuiz = () => {
    if (topic.progress?.completed) {
      toast('You have already completed this topic!', { icon: '🏆' });
      return;
    }
    const totalModules = topic.subtopics.length;
    let updatedCompleted = [...completedModules];
    const lastModuleIndex = totalModules - 1;
    if (!updatedCompleted.includes(lastModuleIndex) && currentModuleIndex === lastModuleIndex) {
      updatedCompleted.push(lastModuleIndex);
      setCompletedModules(updatedCompleted);
      saveModuleProgress(updatedCompleted, currentModuleIndex);
    }
    if (updatedCompleted.length !== totalModules) {
      toast.error(`Please complete all modules first. (${updatedCompleted.length}/${totalModules} completed)`);
      return;
    }
    // Show instructions instead of directly opening quiz
    setShowInstructions(true);
  };

  const handleStartQuizFromInstructions = () => {
    setShowInstructions(false);
    setShowQuiz(true);
  };

  const handleQuizComplete = () => {
    setShowQuiz(false);
    fetchTopicDetails();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!topic) return null;

  if (!topic.contentAvailable) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-6 flex items-center text-primary-600 hover:text-primary-800"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{topic.title}</h1>
            <p className="text-gray-500">{topic.placeholderContent || 'Content coming soon!'}</p>
          </div>
        </div>
      </div>
    );
  }

  const subtopics = topic.subtopics;
  const currentModule = currentModuleIndex < subtopics.length ? subtopics[currentModuleIndex] : null;
  const isLastModule = currentModuleIndex === subtopics.length - 1;
  const allModulesCompleted = completedModules.length === subtopics.length;
  const topicCompleted = topic.progress?.completed;

  // Determine passing score based on topicId (hardcoded for now)
  const getPassingScore = () => {
    if (topicId === 'secure-ai') return 7;
    return 7; // all topics have 10 questions, pass 7
  };
  const totalQuestions = topicId === 'secure-ai' ? 10 : 10; // all have 10 for now

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="pl-4 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-primary-600 hover:text-primary-800"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-8">
              <div className="bg-primary-500 text-white px-6 py-4">
                <h2 className="font-semibold text-lg">{topic.title}</h2>
                <p className="text-sm text-primary-100 mt-1">Course Modules</p>
              </div>
              <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
                {subtopics.map((mod, idx) => {
                  const isCompleted = completedModules.includes(idx);
                  const isActive = currentModuleIndex === idx;
                  return (
                    <div
                      key={mod.id}
                      onClick={() => setCurrentModuleIndex(idx)}
                      className={`px-6 py-4 cursor-pointer transition-colors ${
                        isActive ? 'bg-primary-50 border-l-4 border-primary-500' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {idx+1}. {mod.title}
                          </p>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {mod.estimatedTime} min
                          </div>
                        </div>
                        {isCompleted && (
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
                {/* Final Assessment - always visible */}
                <div
                  onClick={handleStartQuiz}
                  className="px-6 py-4 cursor-pointer transition-colors hover:bg-pink-50 border-t-2 border-pink-200 bg-pink-50/30"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-pink-600">
                        🎯 Final Assessment (Quiz)
                      </p>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {totalQuestions} questions · 30 sec each
                      </div>
                    </div>
                    {topicCompleted && (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Content */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
              {currentModule ? (
                <div dangerouslySetInnerHTML={{ __html: currentModule.content }} />
              ) : (
                <div className="text-center py-12 text-gray-500">Select a module to begin learning</div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={goToPreviousModule}
                  disabled={currentModuleIndex === 0}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentModuleIndex === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ← Previous
                </button>

                {!topicCompleted && !isLastModule && (
                  <button
                    onClick={goToNextModule}
                    className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Next →
                  </button>
                )}

                {isLastModule && !topicCompleted && (
                  <button
                    onClick={handleStartQuiz}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Take Final Quiz
                  </button>
                )}

                {topicCompleted && (
                  <div className="text-green-600 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Topic Completed!
                  </div>
                )}
              </div>

              <div className="mt-4 text-sm text-gray-500 text-center">
                Module {currentModuleIndex+1} of {subtopics.length} &nbsp;|&nbsp;
                Completed: {completedModules.length}/{subtopics.length} modules
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <InstructionsModal
          topicTitle={topic.title}
          totalQuestions={totalQuestions}
          passingScore={getPassingScore()}
          onStart={handleStartQuizFromInstructions}
          onCancel={() => setShowInstructions(false)}
        />
      )}

      {/* Quiz Modal */}
      {showQuiz && (
        <QuizModal
          topicId={topicId}
          topicTitle={topic.title}
          onClose={() => setShowQuiz(false)}
          onComplete={handleQuizComplete}
          navigate={navigate}
        />
      )}
    </div>
  );
};

// Instructions Modal Component
const InstructionsModal = ({ topicTitle, totalQuestions, passingScore, onStart, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <h2 className="text-2xl font-bold text-primary-600 mb-4">Quiz Instructions</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>Course:</strong> {topicTitle}</p>
          <p><strong>Total Questions:</strong> {totalQuestions}</p>
          <p><strong>Time per Question:</strong> 30 seconds</p>
          <p><strong>Passing Score:</strong> {passingScore}/{totalQuestions} ({Math.round((passingScore/totalQuestions)*100)}%)</p>
          <p><strong>Attempt Limit:</strong> If you fail, you must wait 6 hours before retrying.</p>
          <p className="text-sm text-gray-500 mt-2">Once you start, the timer begins. Do not refresh the page during the quiz.</p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={onStart} className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
};


// Quiz Modal Component (unchanged - keep as is)
const QuizModal = ({ topicId, topicTitle, onClose, onComplete, navigate }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!loading && !quizCompleted && questions.length > 0 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizCompleted && questions.length > 0) {
      handleTimeout();
    }
  }, [timeLeft, loading, quizCompleted]);

  const fetchQuestions = async () => {
    try {
      const response = await api.get(`/quiz/${topicId}`);
      setQuestions(response.data.questions);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load quiz');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleTimeout = () => {
    toast.error('Time\'s up! Moving to next question.');
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimeLeft(30);
    } else {
      submitQuiz();
    }
  };

  const handleAnswerChange = (optionText) => {
  const currentQuestion = questions[currentIndex];
  const currentAnswers = answers[currentIndex] || [];
  let newAnswers;
  if (currentQuestion.correctAnswers.length > 1) {
    if (currentAnswers.includes(optionText)) {
      newAnswers = currentAnswers.filter(t => t !== optionText);
    } else {
      newAnswers = [...currentAnswers, optionText];
    }
  } else {
    newAnswers = [optionText];
  }
  setAnswers({ ...answers, [currentIndex]: newAnswers });
};

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimeLeft(30);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const formattedAnswers = [];
      for (let i = 0; i < questions.length; i++) {
        formattedAnswers.push(answers[i] || []);
      }
      const response = await api.post(`/quiz/${topicId}/submit`, { answers: formattedAnswers });
      const resultData = response.data;
      
      onClose(); // close the quiz modal
      // Navigate to result page
      navigate(`/topic/${topicId}/result`, { 
        state: { 
          result: resultData,
          topicTitle: topicTitle
        } 
      });
      if (resultData.passed) {
        onComplete(); // refresh topic details
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (quizCompleted && result) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-2">
                {result.correctCount}/{result.totalQuestions}
              </div>
              <div className={`text-xl font-semibold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                {result.passed ? 'PASSED ✓' : 'FAILED ✗'}
              </div>
              <p className="text-gray-500 mt-2">
                {result.passed ? 'Great job! Topic completed.' : 'Need at least 7 correct to pass. Try again in 12 hours.'}
              </p>
            </div>
            
            <div className="space-y-4">
              {result.results.map((res, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <p className="font-medium">Q{idx + 1}. {res.questionText}</p>
                    <span className={`px-2 py-1 rounded text-sm ${res.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {res.isCorrect ? 'Correct' : 'Wrong'}
                    </span>
                  </div>
                  {!res.isCorrect && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Correct answer:</span> {res.correctAnswers.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            <button
              onClick={onClose}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isMultiSelect = currentQuestion?.correctAnswers.length > 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-500">
              Question {currentIndex + 1} of {questions.length}
            </div>
            <div className={`text-lg font-bold ${timeLeft <= 5 ? 'text-red-600' : 'text-gray-700'}`}>
              Time: {timeLeft}s
            </div>
          </div>
          
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-4">{currentQuestion?.text}</h3>
          
          <div className="space-y-3">
            {currentQuestion?.options.map((option) => (
              <label
                key={option.letter}
                className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type={isMultiSelect ? 'checkbox' : 'radio'}
                  name="question"
                  checked={(answers[currentIndex] || []).includes(option.text)}
                  onChange={() => handleAnswerChange(option.text)}
                  className="mt-1 mr-3"
                />
                <span className="text-gray-700">
                  <span className="font-medium">{option.letter}.</span> {option.text}
                </span>
              </label>
            ))}
          </div>
          
          <div className="flex justify-between mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleNext}
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {currentIndex === questions.length - 1 ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicDetails;