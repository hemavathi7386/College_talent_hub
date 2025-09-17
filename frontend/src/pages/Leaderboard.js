import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Award, TrendingUp, Users, Target } from 'lucide-react';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
    loadMyStats();
    loadCategories();
  }, [selectedCategory]);

  const loadLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = selectedCategory === 'overall' 
        ? '/api/leaderboard/overall'
        : `/api/leaderboard/category/${selectedCategory}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const loadMyStats = async () => {
    if (user.role !== 'student') return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/leaderboard/my-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setMyStats(data);
    } catch (error) {
      console.error('Error loading my stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/leaderboard/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="text-yellow-500" size={24} />;
      case 2: return <Medal className="text-gray-400" size={24} />;
      case 3: return <Award className="text-amber-600" size={24} />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-600">Competition rankings and student achievements</p>
      </div>

      {/* My Stats Card (for students) */}
      {user.role === 'student' && myStats && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{myStats.totalPoints || 0}</div>
              <div className="text-blue-100">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">#{myStats.overallRank || 'N/A'}</div>
              <div className="text-blue-100">Overall Rank</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">#{myStats.departmentRank || 'N/A'}</div>
              <div className="text-blue-100">Department Rank</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{myStats.totalCompetitions || 0}</div>
              <div className="text-blue-100">Competitions</div>
            </div>
          </div>
          
          {myStats.firstPlaces > 0 || myStats.secondPlaces > 0 || myStats.thirdPlaces > 0 ? (
            <div className="mt-4 pt-4 border-t border-blue-400">
              <div className="flex justify-center space-x-6">
                {myStats.firstPlaces > 0 && (
                  <div className="flex items-center">
                    <Trophy className="text-yellow-300 mr-1" size={20} />
                    <span>{myStats.firstPlaces}</span>
                  </div>
                )}
                {myStats.secondPlaces > 0 && (
                  <div className="flex items-center">
                    <Medal className="text-gray-300 mr-1" size={20} />
                    <span>{myStats.secondPlaces}</span>
                  </div>
                )}
                {myStats.thirdPlaces > 0 && (
                  <div className="flex items-center">
                    <Award className="text-amber-300 mr-1" size={20} />
                    <span>{myStats.thirdPlaces}</span>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('overall')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'overall'
                ? 'bg-primary text-text-light'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingUp size={16} className="inline mr-1" />
            Overall
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                selectedCategory === category
                  ? 'bg-primary text-text-light'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Target size={16} className="inline mr-1" />
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users size={20} className="mr-2" />
            {selectedCategory === 'overall' ? 'Overall Rankings' : `${selectedCategory} Rankings`}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rankings available</h3>
            <p className="text-gray-500">Participate in competitions to see rankings here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {leaderboard.map((student, index) => (
              <div
                key={student.studentId}
                className={`p-6 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  student.studentId === user.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadge(student.rank)}`}>
                    {getRankIcon(student.rank)}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {student.name}
                      {student.studentId === user.id && (
                        <span className="ml-2 text-sm text-blue-600 font-medium">(You)</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{student.department}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{student.totalPoints}</div>
                    <div className="text-xs text-gray-500">Points</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{student.totalCompetitions}</div>
                    <div className="text-xs text-gray-500">Competitions</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{student.averageScore}</div>
                    <div className="text-xs text-gray-500">Avg Score</div>
                  </div>

                  {/* Medals */}
                  <div className="flex space-x-2">
                    {student.firstPlaces > 0 && (
                      <div className="flex items-center">
                        <Trophy className="text-yellow-500" size={16} />
                        <span className="ml-1 text-sm font-medium">{student.firstPlaces}</span>
                      </div>
                    )}
                    {student.secondPlaces > 0 && (
                      <div className="flex items-center">
                        <Medal className="text-gray-400" size={16} />
                        <span className="ml-1 text-sm font-medium">{student.secondPlaces}</span>
                      </div>
                    )}
                    {student.thirdPlaces > 0 && (
                      <div className="flex items-center">
                        <Award className="text-amber-600" size={16} />
                        <span className="ml-1 text-sm font-medium">{student.thirdPlaces}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
