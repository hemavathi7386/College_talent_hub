import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Briefcase, MessageSquare, Eye, Calendar } from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeframe, setTimeframe] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      if (user.role === 'recruiter') {
        endpoint = `/api/analytics/recruiter-dashboard?timeframe=${timeframe}`;
      } else if (user.role === 'faculty') {
        endpoint = `/api/analytics/faculty-dashboard?timeframe=${timeframe}`;
      } else {
        endpoint = `/api/analytics/system-overview?timeframe=${timeframe}`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (user.role === 'student') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Analytics dashboard is only available for faculty and recruiters.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">
              {user.role === 'recruiter' ? 'Recruitment insights and student engagement metrics' : 'Student performance and department analytics'}
            </p>
          </div>
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {user.role === 'recruiter' && analyticsData?.summary && (
          <>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="text-blue-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalJobs}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="text-green-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalApplications}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="text-purple-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Profile Views</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalProfileViews}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <MessageSquare className="text-yellow-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.activeStudents}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {user.role === 'faculty' && analyticsData?.summary && (
          <>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalStudents}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.activeStudents}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="text-purple-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Competitions</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalCompetitions}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="text-yellow-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.averageDepartmentScore}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Application/Competition Trends */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {user.role === 'recruiter' ? 'Application Trends' : 'Competition Participation'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={user.role === 'recruiter' ? analyticsData?.applicationStats : analyticsData?.competitionStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey={user.role === 'recruiter' ? 'totalApplications' : 'totalParticipants'} 
                stroke="#3B82F6" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performing Items */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {user.role === 'recruiter' ? 'Top Performing Jobs' : 'Top Performers'}
          </h3>
          <div className="space-y-4">
            {user.role === 'recruiter' 
              ? analyticsData?.topJobs?.slice(0, 5).map((job, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{job.jobTitle}</p>
                      <p className="text-sm text-gray-500">{job.department}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      {job.applications} applications
                    </span>
                  </div>
                ))
              : analyticsData?.performanceTrends?.slice(0, 5).map((student, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{student.studentName}</p>
                      <p className="text-sm text-gray-500">{student.competitions} competitions</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                      {student.totalPoints} pts
                    </span>
                  </div>
                ))
            }
          </div>
        </div>

        {/* Skills Distribution (Faculty) or Profile Views (Recruiter) */}
        {user.role === 'faculty' && analyticsData?.skillAnalytics && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Skills</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.skillAnalytics.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="studentCount" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {user.role === 'recruiter' && analyticsData?.profileViews && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Views Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.profileViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Student Engagement */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {user.role === 'recruiter' ? 'Student Engagement' : 'Recent Activity'}
          </h3>
          <div className="space-y-3">
            {user.role === 'recruiter' 
              ? analyticsData?.studentEngagement?.slice(0, 6).map((engagement, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium text-gray-900">{engagement.studentName}</p>
                      <p className="text-sm text-gray-500">{engagement.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{engagement.interactions} interactions</p>
                      <p className="text-xs text-gray-500">
                        {new Date(engagement.lastInteraction).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              : analyticsData?.jobApplications?.slice(0, 6).map((app, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <p className="font-medium text-gray-900">{app.studentName}</p>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {app.applications} applications
                    </span>
                  </div>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
