import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const QuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { result, topicTitle } = location.state || {};

  if (!result) {
    navigate(`/topic/${topicId}`);
    return null;
  }

  const { correctCount, totalQuestions, passed, results } = result;
  const percentage = (correctCount / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className={`p-6 text-center ${passed ? 'bg-green-50' : 'bg-pink-50'}`}>
            <h1 className="text-3xl font-bold mb-2">
              {passed ? '🎉 Congratulations! You Passed!' : '❌ Sorry, You Did Not Pass'}
            </h1>
            <p className="text-gray-600">
              {passed 
                ? `You have successfully completed "${topicTitle}".` 
                : `You need at least 7 correct answers to pass. Try again in 6 hours.`}
            </p>
          </div>

          <div className="p-6">
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {correctCount}/{totalQuestions}
              </div>
              <div className="text-gray-500">Your Score</div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${passed ? 'bg-green-600' : 'bg-pink-500'}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">Detailed Results</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.map((res, idx) => (
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

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                Back to Dashboard
              </button>
              {!passed && (
                <button
                  onClick={() => navigate(`/topic/${topicId}`)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Review Modules
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;