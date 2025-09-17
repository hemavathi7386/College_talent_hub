import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Star, MapPin, Calendar, Building, Eye, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const Recommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadRecommendations();
  }, [filter]);

  const loadRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/recommendations/my-recommendations?status=${filter}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const updateRecommendationStatus = async (recommendationId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/recommendations/${recommendationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success(`Recommendation ${status}`);
        loadRecommendations();
      }
    } catch (error) {
      console.error('Error updating recommendation:', error);
      toast.error('Failed to update recommendation');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getReasonBadge = (reason) => {
    const badges = {
      skills_match: { text: 'Skills Match', color: 'bg-primary-light text-primary' },
      experience_match: { text: 'Experience Match', color: 'bg-green-100 text-green-800' },
      location_match: { text: 'Location Match', color: 'bg-purple-100 text-purple-800' },
      interest_match: { text: 'Interest Match', color: 'bg-pink-100 text-pink-800' },
      previous_applications: { text: 'Similar Applications', color: 'bg-gray-100 text-gray-800' }
    };
    
    return badges[reason] || { text: reason, color: 'bg-gray-100 text-gray-800' };
  };

  if (user.role !== 'student') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Job recommendations are only available for students.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Recommendations</h1>
        <p className="text-gray-600">Personalized job suggestions based on your profile and skills</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'pending', label: 'New Recommendations', count: recommendations.filter(r => r.status === 'pending').length },
              { key: 'viewed', label: 'Viewed', count: recommendations.filter(r => r.status === 'viewed').length },
              { key: 'applied', label: 'Applied', count: recommendations.filter(r => r.status === 'applied').length },
              { key: 'dismissed', label: 'Dismissed', count: recommendations.filter(r => r.status === 'dismissed').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-12">
          <Star size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations found</h3>
          <p className="text-gray-500">
            {filter === 'pending' 
              ? 'Check back later for new job recommendations based on your profile.'
              : `No ${filter} recommendations at the moment.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map((rec) => (
            <div key={rec._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 mr-3">
                        {rec.job.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(rec.score)}`}>
                        {Math.round(rec.score * 100)}% Match
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <Building size={16} className="mr-1" />
                      <span className="mr-4">{rec.job.company || 'Company'}</span>
                      <MapPin size={16} className="mr-1" />
                      <span className="mr-4">{rec.job.location || 'Location'}</span>
                      <Calendar size={16} className="mr-1" />
                      <span>Deadline: {new Date(rec.job.deadline).toLocaleDateString()}</span>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {rec.job.description}
                    </p>

                    {/* Match Reasons */}
                    {rec.reasons && rec.reasons.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Why this matches you:</p>
                        <div className="flex flex-wrap gap-2">
                          {rec.reasons.map((reason, index) => {
                            const badge = getReasonBadge(reason);
                            return (
                              <span
                                key={index}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
                              >
                                {badge.text}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {rec.job.skills && rec.job.skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {rec.job.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Recommended on {new Date(rec.recommendedDate).toLocaleDateString()}
                  </div>
                  
                  <div className="flex space-x-3">
                    {rec.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateRecommendationStatus(rec._id, 'dismissed')}
                          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <ThumbsDown size={16} className="mr-1" />
                          Not Interested
                        </button>
                        <button
                          onClick={() => updateRecommendationStatus(rec._id, 'viewed')}
                          className="flex items-center px-3 py-2 text-sm text-primary hover:text-primary-dark hover:bg-primary-light rounded-md transition-colors"
                        >
                          <Eye size={16} className="mr-1" />
                          View Details
                        </button>
                      </>
                    )}
                    
                    {(rec.status === 'viewed' || rec.status === 'pending') && (
                      <button
                        onClick={() => updateRecommendationStatus(rec._id, 'applied')}
                        className="flex items-center px-4 py-2 bg-primary text-text-light text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
                      >
                        <ExternalLink size={16} className="mr-1" />
                        Apply Now
                      </button>
                    )}
                    
                    {rec.status === 'applied' && (
                      <span className="flex items-center px-3 py-2 text-sm text-green-600 bg-green-50 rounded-md">
                        <ThumbsUp size={16} className="mr-1" />
                        Applied
                      </span>
                    )}
                    
                    {rec.status === 'dismissed' && (
                      <span className="flex items-center px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-md">
                        Dismissed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
