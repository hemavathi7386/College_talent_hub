import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  Briefcase, 
  Trophy, 
  Target,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Home = () => {

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

  return (
    <div className="min-h-screen bg-gradient-light">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-primary p-2 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-text">
                College Talent Hub
              </h1>
            </div>
            <div className="flex items-center space-x-8">
              <a href="#about" className="text-text-muted hover:text-primary font-medium transition-colors">About</a>
              <a href="#explore" className="text-text-muted hover:text-primary font-medium transition-colors">Explore</a>
              <a href="#features" className="text-text-muted hover:text-primary font-medium transition-colors">Features</a>
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
              <h1 className="text-5xl md:text-6xl font-bold text-text mb-6 leading-tight">
                Launch Your
                <span className="text-primary"> Dream Career</span>
              </h1>
              <p className="text-xl text-text-body mb-10 max-w-3xl mx-auto leading-relaxed">
                Connect with opportunities, showcase your talents, and build the future you deserve.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="bg-white rounded-lg px-6 py-3 shadow-sm border border-border">
                  <span className="text-text-body font-medium">AI-Powered Matching</span>
                </div>
                <div className="bg-white rounded-lg px-6 py-3 shadow-sm border border-border">
                  <span className="text-text-body font-medium">Skill Competitions</span>
                </div>
                <div className="bg-white rounded-lg px-6 py-3 shadow-sm border border-border">
                  <span className="text-text-body font-medium">Career Analytics</span>
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="mb-20">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  About <span className="text-primary">Our Mission</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Empowering the next generation of talent through innovative technology and meaningful connections
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Purpose-Driven Platform</h3>
                  <p className="text-gray-600">Bridging the gap between academic excellence and industry success through smart technology.</p>
                </div>
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Trusted by Thousands</h3>
                  <p className="text-gray-600">A secure, reliable platform trusted by students, faculty, and recruiters nationwide.</p>
                </div>
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Global Opportunities</h3>
                  <p className="text-gray-600">Connecting local talent with global opportunities for unlimited career growth.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Explore Section */}
          <section id="explore" className="mb-20">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Explore <span className="text-primary">Possibilities</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Discover opportunities designed to accelerate your career journey
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">For Students</h3>
                  <p className="text-gray-600 mb-4">Showcase your skills, find perfect job matches, and compete in exciting challenges.</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-primary mr-2" />AI Job Recommendations</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-primary mr-2" />Skill Competitions</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-primary mr-2" />Career Analytics</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">For Faculty</h3>
                  <p className="text-gray-600 mb-4">Manage competitions, track student progress, and foster academic excellence.</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-primary mr-2" />Competition Management</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-primary mr-2" />Student Analytics</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-primary mr-2" />Progress Tracking</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">For Recruiters</h3>
                  <p className="text-gray-600 mb-4">Find top talent, post opportunities, and build your dream team efficiently.</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-primary mr-2" />Talent Discovery</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-primary mr-2" />Job Posting</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-primary mr-2" />Recruitment Analytics</li>
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
                  Powerful <span className="text-primary">Features</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Cutting-edge tools designed to supercharge your career development journey
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                      <p className="text-gray-600 text-lg leading-relaxed mb-4">{feature.description}</p>
                      <div className="flex items-center text-primary font-semibold hover:text-primary-dark transition-colors cursor-pointer">
                        <span>Learn More</span>
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* Sign Up Sidebar */}
        <div className="w-96 bg-white shadow-lg p-8 sticky top-0 h-screen overflow-y-auto border-l border-gray-200">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
              Get Started
            </h2>
            <p className="text-center text-gray-600">
              Transform your career journey
            </p>
          </div>

          <div className="space-y-6">
            <Link
              to="/signup"
              className="w-full py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-sm flex items-center justify-center space-x-2"
            >
              <span>Sign Up Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?
                <Link
                  to="/login"
                  className="ml-2 text-primary font-semibold hover:text-primary-dark transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Why Join Us?</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Smart Job Matching</h4>
                  <p className="text-gray-600 text-xs">AI-powered recommendations</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Skill Competitions</h4>
                  <p className="text-gray-600 text-xs">Showcase your talents</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Network & Connect</h4>
                  <p className="text-gray-600 text-xs">Build meaningful connections</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p>Secure & Trusted Platform</p>
              <p className="mt-2">Empowering students to achieve their career goals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
