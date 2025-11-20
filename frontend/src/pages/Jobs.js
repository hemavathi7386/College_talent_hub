import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Plus,
  Filter,
  Search,
  Clock,
  Building,
  Star,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingJob, setEditingJob] = useState(null);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    company: user?.company || '',
    type: 'job',
    requiredSkills: [],
    location: '',
    salary: { min: '', max: '', currency: 'INR' },
    duration: '',
    applicationDeadline: '',
    requirements: { experience: '', education: '', other: '' }
  });
  const [skillInput, setSkillInput] = useState('');

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('type', filter);
      
      const response = await axios.get(`/api/jobs?${params}`);
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/jobs', newJob);
      setJobs([response.data.job, ...jobs]);
      setNewJob({
        title: '',
        description: '',
        company: user?.company || '',
        type: 'job',
        requiredSkills: [],
        location: '',
        salary: { min: '', max: '', currency: 'INR' },
        duration: '',
        applicationDeadline: '',
        requirements: { experience: '', education: '', other: '' }
      });
      setShowCreateJob(false);
      toast.success('Job posted successfully!');
    } catch (error) {
      toast.error('Failed to create job');
    }
  };

  const handleApplyJob = async (jobId) => {
    try {
      await axios.post(`/api/jobs/${jobId}/apply`);
      toast.success('Application submitted successfully!');
      fetchJobs(); // Refresh to update application status
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply for job');
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setNewJob({
      title: job.title,
      description: job.description,
      company: job.company,
      type: job.type,
      requiredSkills: job.requiredSkills,
      location: job.location,
      salary: job.salary || { min: '', max: '', currency: 'INR' },
      duration: job.duration || '',
      applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().slice(0, 16) : '',
      requirements: job.requirements || { experience: '', education: '', other: '' }
    });
    setShowCreateJob(true);
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/jobs/${editingJob._id}`, newJob);
      setJobs(jobs.map(job => job._id === editingJob._id ? response.data : job));
      setNewJob({
        title: '',
        description: '',
        company: user?.company || '',
        type: 'job',
        requiredSkills: [],
        location: '',
        salary: { min: '', max: '', currency: 'INR' },
        duration: '',
        applicationDeadline: '',
        requirements: { experience: '', education: '', other: '' }
      });
      setEditingJob(null);
      setShowCreateJob(false);
      toast.success('Job updated successfully!');
    } catch (error) {
      toast.error('Failed to update job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    
    try {
      await axios.delete(`/api/jobs/${jobId}`);
      setJobs(jobs.filter(job => job._id !== jobId));
      toast.success('Job deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !newJob.requiredSkills.includes(skillInput.trim())) {
      setNewJob({
        ...newJob,
        requiredSkills: [...newJob.requiredSkills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setNewJob({
      ...newJob,
      requiredSkills: newJob.requiredSkills.filter(skill => skill !== skillToRemove)
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {user?.role === 'recruiter' ? 'Manage Job Postings' : 'Discover Opportunities'}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {user?.role === 'recruiter' 
              ? 'Post and manage job opportunities' 
              : 'Discover opportunities that match your skills'
            }
          </p>
        </div>
        {user?.role === 'recruiter' && (
          <button
            onClick={() => setShowCreateJob(true)}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Post Job</span>
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs, companies, or locations..."
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
            <option value="all">All Types</option>
            <option value="job">Full-time Jobs</option>
            <option value="internship">Internships</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>
      </div>

      {/* Create Job Modal */}
      {showCreateJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
              <form onSubmit={editingJob ? handleUpdateJob : handleCreateJob} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      required
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input
                      type="text"
                      required
                      value={newJob.company}
                      onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows="4"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={newJob.type}
                      onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="job">Full-time Job</option>
                      <option value="internship">Internship</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      required
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                    <input
                      type="date"
                      required
                      value={newJob.applicationDeadline}
                      onChange={(e) => setNewJob({ ...newJob, applicationDeadline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a skill"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newJob.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-light text-primary-dark"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 text-primary hover:text-primary-dark"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateJob(false);
                      setEditingJob(null);
                      setNewJob({
                        title: '',
                        description: '',
                        company: user?.company || '',
                        type: 'job',
                        requiredSkills: [],
                        location: '',
                        salary: { min: '', max: '', currency: 'INR' },
                        duration: '',
                        applicationDeadline: '',
                        requirements: { experience: '', education: '', other: '' }
                      });
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors flex items-center space-x-2"
                  >
                    {editingJob ? 'Update Job' : 'Post Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-6">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No jobs found matching your criteria.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job._id} className="bg-white rounded-2xl shadow-xl border-0 p-6 backdrop-blur-sm bg-opacity-95 mb-8">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-semibold text-text-primary mb-2">{job.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.type === 'job' ? 'bg-green-100 text-green-800' :
                      job.type === 'internship' ? 'bg-primary-light text-primary-dark' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                    </span>
                    {job.skillMatch && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        {job.skillMatch}% match
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Building className="h-4 w-4" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {formatDate(job.applicationDeadline)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{job.applicantCount || 0} applicants</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.requiredSkills.slice(0, 5).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                        +{job.requiredSkills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="ml-6 flex flex-col items-end space-y-2">
                  {job.salary?.min && (
                    <div className="text-right">
                      <div className="flex items-center text-green-600">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">
                          {job.salary.min}-{job.salary.max} {job.salary.currency}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {user?.role === 'student' && (
                    job.applicants && job.applicants.some(a => a.user?._id === user._id || a.user === user._id || a === user._id) ? (
                      <button
                        disabled
                        className="px-4 py-2 rounded-xl text-sm font-medium bg-green-100 text-green-700 cursor-not-allowed flex items-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Applied</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApplyJob(job._id)}
                        disabled={!job.isApplicationOpen}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          job.isApplicationOpen
                            ? 'bg-primary text-white hover:bg-primary-dark'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {job.isApplicationOpen ? 'Apply Now' : 'Deadline Passed'}
                      </button>
                    )
                  )}

                  {user?.role === 'recruiter' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditJob(job)}
                        className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center space-x-1"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center space-x-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Posted {formatDate(job.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Jobs;
