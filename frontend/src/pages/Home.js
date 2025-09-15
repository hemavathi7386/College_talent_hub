import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  GraduationCap, 
  Users, 
  Briefcase, 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Rocket, 
  Shield, 
  Globe,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        await register(formData);
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const features = [
    {
      icon: Briefcase,
      title: "Smart Job Matching",
      description: "AI-powered job recommendations tailored to your skills and aspirations",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Trophy,
      title: "Skill Competitions",
      description: "Showcase your talents in exciting competitions and climb the leaderboard",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Network & Connect",
      description: "Build meaningful connections with peers, faculty, and industry professionals",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Target,
      title: "Career Analytics",
      description: "Track your progress and get insights to accelerate your career growth",
      color: "from-green-500 to-teal-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Students", icon: Users },
    { number: "500+", label: "Job Opportunities", icon: Briefcase },
    { number: "100+", label: "Competitions", icon: Trophy },
    { number: "95%", label: "Success Rate", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-xl border-b-0 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-blue-600 p-2 rounded-xl shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse">
                  <Sparkles className="h-2 w-2 text-white p-0.5" />
                </div>
              </div>
              <h1 className="text-lg font-bold text-blue-600">
                College Talent Hub
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About</a>
              <a href="#explore" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Explore</a>
              <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex min-h-screen">
        {/* Main Content */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <section className="text-center mb-20">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-8">
                <div className="p-6 bg-white bg-opacity-20 rounded-full backdrop-blur-sm animate-float">
                  <Rocket className="h-16 w-16 text-blue-600" />
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-fade-in">
                Launch Your
                <span className="text-blue-600"> Dream Career</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                🚀 Connect with opportunities, showcase your talents, and build the future you deserve. 
                Join thousands of students already transforming their careers.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                  <span className="text-blue-600 font-semibold">✨ AI-Powered Matching</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                  <span className="text-purple-600 font-semibold">🏆 Skill Competitions</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                  <span className="text-green-600 font-semibold">📈 Career Analytics</span>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <Icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="mb-20">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  About <span className="text-blue-600">Our Mission</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Empowering the next generation of talent through innovative technology and meaningful connections
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-500 rounded-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">🎯 Purpose-Driven Platform</h3>
                      <p className="text-gray-600">Bridging the gap between academic excellence and industry success through smart technology.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-purple-500 rounded-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">🛡️ Trusted by Thousands</h3>
                      <p className="text-gray-600">A secure, reliable platform trusted by students, faculty, and recruiters nationwide.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-green-500 rounded-lg">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">🌍 Global Opportunities</h3>
                      <p className="text-gray-600">Connecting local talent with global opportunities for unlimited career growth.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-100 rounded-3xl p-8 text-center">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Launch?</h3>
                  <p className="text-gray-600 mb-6">Join the revolution in career development and unlock your potential today.</p>
                  <div className="text-4xl font-bold text-blue-600">
                    Your Future Starts Here
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Explore Section */}
          <section id="explore" className="mb-20">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Explore <span className="text-purple-600">Endless Possibilities</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Discover a world of opportunities designed to accelerate your career journey
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="text-4xl mb-4">🎓</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">For Students</h3>
                  <p className="text-gray-600 mb-4">Showcase your skills, find perfect job matches, and compete in exciting challenges.</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />AI Job Recommendations</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Skill Competitions</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Career Analytics</li>
                  </ul>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="text-4xl mb-4">👨‍🏫</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">For Faculty</h3>
                  <p className="text-gray-600 mb-4">Manage competitions, track student progress, and foster academic excellence.</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-blue-500 mr-2" />Competition Management</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-blue-500 mr-2" />Student Analytics</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-blue-500 mr-2" />Progress Tracking</li>
                  </ul>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="text-4xl mb-4">💼</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">For Recruiters</h3>
                  <p className="text-gray-600 mb-4">Find top talent, post opportunities, and build your dream team efficiently.</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-purple-500 mr-2" />Talent Discovery</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-purple-500 mr-2" />Job Posting</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-purple-500 mr-2" />Recruitment Analytics</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="mb-20">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Powerful <span className="text-green-600">Features</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Cutting-edge tools designed to supercharge your career development journey
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                      <div className="inline-flex p-4 rounded-2xl bg-blue-500 mb-6">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                      <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                      <div className="mt-6">
                        <div className="flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors cursor-pointer">
                          <span>Learn More</span>
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* Login/Register Sidebar */}
        <div className="w-96 bg-white/95 backdrop-blur-md shadow-2xl p-8 sticky top-0 h-screen overflow-y-auto">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-blue-600 rounded-2xl">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
              {isLogin ? 'Welcome Back!' : 'Join Us Today!'}
            </h2>
            <p className="text-center text-gray-600">
              {isLogin ? 'Sign in to continue your journey' : 'Start your career transformation'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="recruiter">Recruiter</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p>🔒 Secure & Trusted Platform</p>
              <p className="mt-2">Join 10,000+ students already transforming their careers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
