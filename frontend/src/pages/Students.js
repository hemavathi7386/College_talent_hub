import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Users,
  Search,
  Filter,
  Mail,
  Award,
  BookOpen,
  User,
  Phone,
  Linkedin,
  Github,
  Globe,
  Star,
  Eye,
  X
} from 'lucide-react';

const Students = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('');
  const [selectedResume, setSelectedResume] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);

  const departments = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Business Administration',
    'Commerce',
    'Arts & Humanities'
  ];

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (departmentFilter !== 'all') params.append('department', departmentFilter);
      if (skillFilter) params.append('skills', skillFilter);
      
      console.log('Fetching students with params:', params.toString());
      console.log('Current user role:', user?.role);
      const response = await axios.get(`/api/users/students?${params}`);
      console.log('Students API response:', response.data);
      console.log('Students array length:', response.data.students?.length || 0);
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Students useEffect triggered, user:', user);
    if (user && user.role !== 'student') {
      fetchStudents();
    }
  }, [departmentFilter, skillFilter, user]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (user?.role === 'student') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Access denied. This page is only available to faculty and recruiters.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-centurion-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Students Directory</h1>
        <p className="text-gray-600 mt-2">
          {user?.role === 'faculty' 
            ? 'Browse and connect with students across different departments' 
            : 'Find talented students for your opportunities'
          }
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-centurion-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-centurion-500"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="text"
              placeholder="Filter by skills (comma separated)"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-centurion-500"
            />
          </div>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No students found matching your criteria.</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-centurion-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-lg">
                    {student.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.rollNumber}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{student.email}</span>
                </div>
                
                {student.personalEmail && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{student.personalEmail}</span>
                  </div>
                )}
                
                {student.phoneNumber && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="truncate">{student.phoneNumber}</span>
                  </div>
                )}
                
                {student.department && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    <span className="truncate">{student.department}</span>
                  </div>
                )}
              </div>

              {/* Skills */}
              {student.skills && student.skills.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {student.skills.slice(0, 4).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-centurion-100 text-centurion-800 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {student.skills.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{student.skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {student.achievements && student.achievements.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    Recent Achievements
                  </h4>
                  <div className="space-y-1">
                    {student.achievements.slice(0, 2).map((achievement, index) => (
                      <div key={index} className="text-xs text-gray-600">
                        <span className="font-medium">{achievement.title}</span>
                        {achievement.date && (
                          <span className="text-gray-400 ml-2">
                            {new Date(achievement.date).getFullYear()}
                          </span>
                        )}
                      </div>
                    ))}
                    {student.achievements.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{student.achievements.length - 2} more achievements
                      </div>
                    )}
                  </div>
                
                  {/* Resume Viewer Modal */}
                  {showResumeModal && selectedResume && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg w-full max-w-5xl h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                          <h3 className="text-lg font-semibold text-gray-900">{selectedResume.originalName || 'Resume'}</h3>
                          <button
                            onClick={() => {
                              setShowResumeModal(false);
                              setSelectedResume(null);
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-6 w-6" />
                          </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <iframe
                            src={`/api/upload/resume/view/${selectedResume.filename}`}
                            className="w-full h-full border-0"
                            title="Resume Viewer"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Social Links */}
              {(student.linkedinUrl || student.githubUrl || student.portfolioUrl) && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Links</h4>
                  <div className="flex space-x-3">
                    {student.linkedinUrl && (
                      <a
                        href={student.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-xs text-centurion-600 hover:text-centurion-700"
                      >
                        <Linkedin className="h-3 w-3" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {student.githubUrl && (
                      <a
                        href={student.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-xs text-centurion-600 hover:text-centurion-700"
                      >
                        <Github className="h-3 w-3" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {student.portfolioUrl && (
                      <a
                        href={student.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-xs text-centurion-600 hover:text-centurion-700"
                      >
                        <Globe className="h-3 w-3" />
                        <span>Portfolio</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Resume Button */}
              {student.resume && student.resume.filename && (
                <div className="pb-4 border-b border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedResume(student.resume);
                      setShowResumeModal(true);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Resume</span>
                  </button>
                </div>
              )}

              {/* Contact Button */}
              <div className="pt-4 border-t border-gray-100">
                <a
                  href={`mailto:${student.personalEmail || student.email}`}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-centurion-600 text-white rounded-lg hover:bg-centurion-700 transition-colors text-sm"
                >
                  <Mail className="h-4 w-4" />
                  <span>Contact</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredStudents.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 text-center">
            Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} 
            {departmentFilter !== 'all' && ` from ${departmentFilter}`}
            {skillFilter && ` with skills matching "${skillFilter}"`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Students;
