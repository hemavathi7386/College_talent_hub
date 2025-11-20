import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Plus,
  Filter,
  Search,
  Clock,
  Award,
  MapPin,
  User,
  ExternalLink,
  UserPlus,
  UserMinus,
  Eye,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const Competitions = () => {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCompetition, setShowCreateCompetition] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newCompetition, setNewCompetition] = useState({
    title: '',
    description: '',
    date: '',
    registrationDeadline: '',
    maxParticipants: 100,
    category: 'technical',
    prizes: [{ position: '1st', prize: '' }],
    rules: '',
    externalLink: ''
  });
  const [expandedCompetitions, setExpandedCompetitions] = useState({});
  const [editingCompetition, setEditingCompetition] = useState(null);

  const fetchCompetitions = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('category', filter);
      
      console.log('Fetching competitions with params:', params.toString());
      const response = await axios.get(`/api/competitions?${params}`);
      console.log('Competitions API response:', response.data);
      setCompetitions(response.data.competitions || []);
    } catch (error) {
      console.error('Error fetching competitions:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, [filter]);

  const handleCreateCompetition = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/competitions', newCompetition);
      setCompetitions([response.data, ...competitions]);
      setNewCompetition({
        title: '',
        description: '',
        date: '',
        registrationDeadline: '',
        maxParticipants: 100,
        category: 'technical',
        prizes: [{ position: '1st', prize: '' }],
        rules: '',
        externalLink: ''
      });
      setShowCreateCompetition(false);
      toast.success('Competition created successfully!');
    } catch (error) {
      toast.error('Failed to create competition');
    }
  };

  const handleRegister = async (competitionId) => {
    try {
      await axios.post(`/api/competitions/${competitionId}/register`);
      toast.success('Successfully registered for competition!');
      fetchCompetitions(); // Refresh to update registration status
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
    }
  };

  const handleEditCompetition = (competition) => {
    setEditingCompetition(competition);
    setNewCompetition({
      title: competition.title,
      description: competition.description,
      date: competition.date ? new Date(competition.date).toISOString().slice(0, 16) : '',
      registrationDeadline: competition.registrationDeadline ? new Date(competition.registrationDeadline).toISOString().slice(0, 16) : '',
      maxParticipants: competition.maxParticipants,
      category: competition.category,
      prizes: competition.prizes || [{ position: '1st', prize: '' }],
      rules: competition.rules || '',
      externalLink: competition.externalLink || ''
    });
    setShowCreateCompetition(true);
  };

  const handleUpdateCompetition = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/competitions/${editingCompetition._id}`, newCompetition);
      setCompetitions(competitions.map(comp => comp._id === editingCompetition._id ? response.data : comp));
      setNewCompetition({
        title: '',
        description: '',
        date: '',
        registrationDeadline: '',
        maxParticipants: 100,
        category: 'technical',
        prizes: [{ position: '1st', prize: '' }],
        rules: '',
        externalLink: ''
      });
      setEditingCompetition(null);
      setShowCreateCompetition(false);
      toast.success('Competition updated successfully!');
    } catch (error) {
      toast.error('Failed to update competition');
    }
  };

  const handleDeleteCompetition = async (competitionId) => {
    if (!window.confirm('Are you sure you want to delete this competition?')) return;
    
    try {
      await axios.delete(`/api/competitions/${competitionId}`);
      setCompetitions(competitions.filter(comp => comp._id !== competitionId));
      toast.success('Competition deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete competition');
    }
  };

  // const handleUnregister = async (competitionId) => {
  //   try {
  //     await axios.delete(`/api/competitions/${competitionId}/register`);
  //     toast.success('Successfully unregistered from competition!');
  //     fetchCompetitions();
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || 'Failed to unregister');
  //   }
  // };

  const addPrize = () => {
    setNewCompetition({
      ...newCompetition,
      prizes: [...newCompetition.prizes, { position: '', prize: '' }]
    });
  };

  const updatePrize = (index, field, value) => {
    const updatedPrizes = newCompetition.prizes.map((prize, i) =>
      i === index ? { ...prize, [field]: value } : prize
    );
    setNewCompetition({ ...newCompetition, prizes: updatedPrizes });
  };

  const removePrize = (index) => {
    setNewCompetition({
      ...newCompetition,
      prizes: newCompetition.prizes.filter((_, i) => i !== index)
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isRegistrationOpen = (competition) => {
    return new Date() < new Date(competition.registrationDeadline) && competition.isActive;
  };

  const toggleParticipants = (competitionId) => {
    setExpandedCompetitions(prev => ({
      ...prev,
      [competitionId]: !prev[competitionId]
    }));
  };

  const filteredCompetitions = competitions.filter(competition =>
    competition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    competition.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Competitions</h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'faculty' 
              ? 'Create and manage competitions for students' 
              : 'Participate in exciting competitions and showcase your skills'
            }
          </p>
        </div>
        {user?.role === 'faculty' && (
          <button
            onClick={() => setShowCreateCompetition(true)}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Competition</span>
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search competitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            <option value="technical">Technical</option>
            <option value="cultural">Cultural</option>
            <option value="sports">Sports</option>
            <option value="academic">Academic</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Create Competition Modal */}
      {showCreateCompetition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{editingCompetition ? 'Edit Competition' : 'Create New Competition'}</h2>
              <form onSubmit={editingCompetition ? handleUpdateCompetition : handleCreateCompetition} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newCompetition.title}
                    onChange={(e) => setNewCompetition({ ...newCompetition, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    value={newCompetition.description}
                    onChange={(e) => setNewCompetition({ ...newCompetition, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="4"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Competition Date</label>
                    <input
                      type="datetime-local"
                      required
                      value={newCompetition.date}
                      onChange={(e) => setNewCompetition({ ...newCompetition, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline</label>
                    <input
                      type="datetime-local"
                      required
                      value={newCompetition.registrationDeadline}
                      onChange={(e) => setNewCompetition({ ...newCompetition, registrationDeadline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newCompetition.category}
                      onChange={(e) => setNewCompetition({ ...newCompetition, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="technical">Technical</option>
                      <option value="cultural">Cultural</option>
                      <option value="sports">Sports</option>
                      <option value="academic">Academic</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                    <input
                      type="number"
                      min="1"
                      value={newCompetition.maxParticipants}
                      onChange={(e) => setNewCompetition({ ...newCompetition, maxParticipants: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prizes</label>
                  {newCompetition.prizes.map((prize, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        placeholder="Position (e.g., 1st, 2nd)"
                        value={prize.position}
                        onChange={(e) => updatePrize(index, 'position', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Prize description"
                        value={prize.prize}
                        onChange={(e) => updatePrize(index, 'prize', e.target.value)}
                        className="flex-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {newCompetition.prizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePrize(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPrize}
                    className="text-primary hover:text-primary-dark text-sm transition-colors"
                  >
                    + Add Prize
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rules (Optional)</label>
                  <textarea
                    value={newCompetition.rules}
                    onChange={(e) => setNewCompetition({ ...newCompetition, rules: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">External Competition Link (Optional)</label>
                  <input
                    type="url"
                    value={newCompetition.externalLink}
                    onChange={(e) => setNewCompetition({ ...newCompetition, externalLink: e.target.value })}
                    placeholder="https://example.com/competition"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Add a link to external competition platforms (HackerRank, Codechef, etc.)</p>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateCompetition(false);
                      setEditingCompetition(null);
                      setNewCompetition({
                        title: '',
                        description: '',
                        date: '',
                        registrationDeadline: '',
                        maxParticipants: 100,
                        category: 'technical',
                        prizes: [{ position: '1st', prize: '' }],
                        rules: '',
                        externalLink: ''
                      });
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    {editingCompetition ? 'Update Competition' : 'Create Competition'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Competitions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCompetitions.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No competitions found matching your criteria.</p>
          </div>
        ) : (
          filteredCompetitions.map((competition) => (
            <div key={competition._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{competition.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      competition.category === 'technical' ? 'bg-primary-light text-primary-dark' :
                      competition.category === 'cultural' ? 'bg-purple-100 text-purple-800' :
                      competition.category === 'sports' ? 'bg-green-100 text-green-800' :
                      competition.category === 'academic' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {competition.category.charAt(0).toUpperCase() + competition.category.slice(1)}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{competition.participantCount || 0}/{competition.maxParticipants}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {isRegistrationOpen(competition) ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Registration Open
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      Registration Closed
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-3">{competition.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Competition: {formatDate(competition.date)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Registration Deadline: {formatDate(competition.registrationDeadline)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Organized by: {competition.organizer?.name}</span>
                </div>
              </div>

              {competition.prizes && competition.prizes.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    Prizes
                  </h4>
                  <div className="space-y-1">
                    {competition.prizes.map((prize, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        <span className="font-medium">{prize.position}:</span> {prize.prize}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Faculty View - Show Registered Students */}
              {user?.role === 'faculty' && competition.participants && competition.participants.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => toggleParticipants(competition._id)}
                    className="flex items-center space-x-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Registered Students ({competition.participants.length})</span>
                    {expandedCompetitions[competition._id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  
                  {expandedCompetitions[competition._id] && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">Registered Students:</h5>
                      <div className="space-y-2">
                        {competition.participants.map((participant, index) => (
                          <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {participant.user?.name || 'Unknown Student'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {participant.user?.email} • {participant.user?.department}
                                </p>
                                {participant.user?.rollNumber && (
                                  <p className="text-xs text-gray-500">
                                    Roll: {participant.user.rollNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              Registered: {new Date(participant.registeredAt || competition.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* External Link */}
              {competition.externalLink && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ExternalLink className="h-4 w-4" />
                    <a 
                      href={competition.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-dark font-medium hover:underline"
                    >
                      Visit External Competition Platform
                    </a>
                  </div>
                </div>
              )}

              {user?.role === 'student' && (
                <div className="flex justify-end space-x-3">
                  {competition.externalLink && (
                    <a
                      href={competition.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>External Link</span>
                    </a>
                  )}
                  {competition.participants && competition.participants.some(p => p.user?._id === user._id || p.user === user._id) ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg cursor-not-allowed flex items-center space-x-2"
                    >
                      <Check className="h-4 w-4" />
                      <span>Registered</span>
                    </button>
                  ) : isRegistrationOpen(competition) ? (
                    <button
                      onClick={() => handleRegister(competition._id)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Register
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                    >
                      Registration Closed
                    </button>
                  )}
                </div>
              )}

              {user?.role === 'faculty' && (
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => handleEditCompetition(competition)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCompetition(competition._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Competitions;
