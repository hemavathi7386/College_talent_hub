import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Edit2, Save, X, Plus, Award, Mail, Building, BookOpen, Upload, Download, Briefcase, Phone, Linkedin, Github, Globe } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    skills: user?.skills || [],
    achievements: user?.achievements || [],
    department: user?.department || '',
    company: user?.company || '',
    personalEmail: user?.personalEmail || '',
    phoneNumber: user?.phoneNumber || '',
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl: user?.githubUrl || '',
    portfolioUrl: user?.portfolioUrl || ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    date: ''
  });
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [resume, setResume] = useState(null);
  // const [resumeFile, setResumeFile] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    skills: []
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const addAchievement = async () => {
    if (newAchievement.title.trim()) {
      try {
        const response = await axios.put('/api/profile/achievement', newAchievement);
        setUser(prev => ({ ...prev, achievements: response.data.achievements }));
        setNewAchievement({ title: '', description: '', date: '' });
        setShowAddAchievement(false);
        toast.success('Achievement added successfully!');
      } catch (error) {
        toast.error('Failed to add achievement');
      }
    }
  };

  const removeAchievement = async (index) => {
    try {
      const response = await axios.delete(`/api/profile/achievement/${index}`);
      setUser(prev => ({ ...prev, achievements: response.data.achievements }));
      toast.success('Achievement deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete achievement');
    }
  };

  const handleSave = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      skills: user?.skills || [],
      achievements: user?.achievements || [],
      department: user?.department || '',
      company: user?.company || ''
    });
    setIsEditing(false);
    setShowAddAchievement(false);
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/profile/me');
      setResume(response.data.resume);
      setExperiences(response.data.experiences || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('resume', file);
      
      try {
        const response = await axios.post('/api/upload/resume', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setResume(response.data.resume);
        alert('Resume uploaded successfully!');
      } catch (error) {
        alert('Error uploading resume: ' + (error.response?.data?.message || 'Upload failed'));
      }
    }
  };

  const addExperience = async () => {
    try {
      const response = await axios.put('/api/profile/experience', newExperience);
      setExperiences(response.data.experiences);
      setNewExperience({
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        skills: []
      });
      setShowAddExperience(false);
    } catch (error) {
      alert('Error adding experience: ' + (error.response?.data?.message || 'Failed to add'));
    }
  };

  const deleteExperience = async (expId) => {
    try {
      const response = await axios.delete(`/api/profile/experience/${expId}`);
      setExperiences(response.data.experiences);
    } catch (error) {
      alert('Error deleting experience: ' + (error.response?.data?.message || 'Failed to delete'));
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                <p className="text-blue-100 capitalize">{user?.role}</p>
                <div className="flex items-center space-x-4 mt-2 text-blue-100">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  {user?.department && (
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-sm">{user?.department}</span>
                    </div>
                  )}
                  {user?.company && (
                    <div className="flex items-center space-x-1">
                      <Building className="h-4 w-4" />
                      <span className="text-sm">{user?.company}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Edit2 className="h-4 w-4" />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {(user?.role === 'student' || user?.role === 'faculty') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {user?.role === 'recruiter' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                
                {/* Contact Information Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personal Email</label>
                  <input
                    type="email"
                    name="personalEmail"
                    value={formData.personalEmail}
                    onChange={handleInputChange}
                    placeholder="your.personal@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Profile</label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleInputChange}
                    placeholder="https://github.com/yourusername"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Website</label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleInputChange}
                    placeholder="https://yourportfolio.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
                {user?.department && (
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium text-gray-900">{user?.department}</p>
                  </div>
                )}
                {user?.company && (
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-medium text-gray-900">{user?.company}</p>
                  </div>
                )}
                {user?.rollNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Roll Number</p>
                    <p className="font-medium text-gray-900">{user?.rollNumber}</p>
                  </div>
                )}
                
                {/* Contact Information Display */}
                {user?.personalEmail && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Personal Email
                    </p>
                    <p className="font-medium text-gray-900">{user?.personalEmail}</p>
                  </div>
                )}
                
                {user?.phoneNumber && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Phone Number
                    </p>
                    <p className="font-medium text-gray-900">{user?.phoneNumber}</p>
                  </div>
                )}
                
                {user?.linkedinUrl && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Linkedin className="h-3 w-3" />
                      LinkedIn
                    </p>
                    <a 
                      href={user?.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-700 underline"
                    >
                      View Profile
                    </a>
                  </div>
                )}
                
                {user?.githubUrl && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Github className="h-3 w-3" />
                      GitHub
                    </p>
                    <a 
                      href={user?.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-700 underline"
                    >
                      View Profile
                    </a>
                  </div>
                )}
                
                {user?.portfolioUrl && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Portfolio
                    </p>
                    <a 
                      href={user?.portfolioUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-700 underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
            {isEditing ? (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user?.skills?.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills added yet</p>
                )}
              </div>
            )}
          </div>

          {/* Resume Section - Only for Students */}
          {user?.role === 'student' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resume</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {resume ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-100 p-2 rounded">
                        <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{resume.originalName}</p>
                        <p className="text-sm text-gray-500">Uploaded on {formatDate(resume.uploadDate)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={`/api/upload/resume/${resume.filename}`}
                        className="flex items-center space-x-1 text-centurion-600 hover:text-centurion-700"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </a>
                      <label className="flex items-center space-x-1 text-centurion-600 hover:text-centurion-700 cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <span>Replace</span>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleResumeUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload your resume
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">
                          PDF files only, max 5MB
                        </span>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleResumeUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Experience Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
              <button
                onClick={() => setShowAddExperience(true)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Experience</span>
              </button>
            </div>

            {showAddExperience && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={newExperience.title}
                    onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={newExperience.company}
                    onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={newExperience.location}
                    onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    placeholder="Start Date"
                    value={newExperience.startDate}
                    onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {!newExperience.current && (
                    <input
                      type="date"
                      placeholder="End Date"
                      value={newExperience.endDate}
                      onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newExperience.current}
                      onChange={(e) => setNewExperience({ ...newExperience, current: e.target.checked })}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">Currently working here</label>
                  </div>
                </div>
                <textarea
                  placeholder="Job Description"
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                  className="w-full mt-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                />
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={addExperience}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Experience
                  </button>
                  <button
                    onClick={() => setShowAddExperience(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {experiences.length > 0 ? (
                experiences.map((exp, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Briefcase className="h-5 w-5 text-blue-600 mt-1" />
                        <div>
                          <h3 className="font-medium text-gray-900">{exp.title}</h3>
                          <p className="text-blue-600">{exp.company}</p>
                          {exp.location && <p className="text-sm text-gray-500">{exp.location}</p>}
                          <p className="text-sm text-gray-500">
                            {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                          </p>
                          {exp.description && (
                            <p className="text-gray-600 mt-2">{exp.description}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteExperience(exp._id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No experience added yet</p>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Achievements & Certifications</h2>
              <button
                onClick={() => setShowAddAchievement(true)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Achievement</span>
              </button>
            </div>

            {showAddAchievement && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Achievement title"
                    value={newAchievement.title}
                    onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Description"
                    value={newAchievement.description}
                    onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                  />
                  <input
                    type="date"
                    value={newAchievement.date}
                    onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={addAchievement}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddAchievement(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {user?.achievements?.length > 0 ? (
                user.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Award className="h-5 w-5 text-yellow-500 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                      {achievement.description && (
                        <p className="text-gray-600 mt-1">{achievement.description}</p>
                      )}
                      {achievement.date && (
                        <p className="text-sm text-gray-500 mt-1">{formatDate(achievement.date)}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeAchievement(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No achievements added yet</p>
              )}
            </div>
          </div>

          {/* Save/Cancel buttons */}
          {isEditing && (
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
