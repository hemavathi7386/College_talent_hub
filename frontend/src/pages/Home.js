import React from 'react';
import { Link } from 'react-router-dom';
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
  Sparkles
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

  const stats = [
    { number: "10K+", label: "Active Students", icon: Users },
    { number: "500+", label: "Job Opportunities", icon: Briefcase },
    { number: "100+", label: "Competitions", icon: Trophy },
    { number: "95%", label: "Success Rate", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gradient-light">
      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur-md shadow-xl border-b-0 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-primary p-2 rounded-xl shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse">
                  <Sparkles className="h-2 w-2 text-white p-0.5" />
                </div>
              </div>
              <h1 className="text-lg font-bold text-primary">
                College Talent Hub
              </h1>
            </div>
            <div className="flex items-center space-x-6">
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
              <div className="flex justify-center mb-8">
                <div className="p-6 bg-primary-light bg-opacity-40 rounded-full backdrop-blur-sm animate-float">
                  <Rocket className="h-16 w-16 text-primary" />
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-text mb-6 animate-fade-in">
                Launch Your
                <span className="text-primary"> Dream Career</span>
              </h1>
              <p className="text-xl md:text-2xl text-text-body mb-8 max-w-3xl mx-auto leading-relaxed">
                🚀 Connect with opportunities, showcase your talents, and build the future you deserve. 
                Join thousands of students already transforming their careers.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="bg-background/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                  <span className="text-primary font-semibold">✨ AI-Powered Matching</span>
                </div>
                <div className="bg-background/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                  <span className="text-accent-magenta font-semibold">🏆 Skill Competitions</span>
                </div>
                <div className="bg-background/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                  <span className="text-secondary font-semibold">📈 Career Analytics</span>
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
                  <div key={index} className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold text-text mb-1">{stat.number}</div>
                    <div className="text-text-body font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="mb-20">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-text mb-4">
                  About <span className="text-primary">Our Mission</span>
                </h2>
                <p className="text-xl text-text-body max-w-3xl mx-auto">
                  Empowering the next generation of talent through innovative technology and meaningful connections
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary rounded-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text mb-2">🎯 Purpose-Driven Platform</h3>
                      <p className="text-text-body">Bridging the gap between academic excellence and industry success through smart technology.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-accent-magenta rounded-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text mb-2">🛡️ Trusted by Thousands</h3>
                      <p className="text-text-body">A secure, reliable platform trusted by students, faculty, and recruiters nationwide.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-secondary rounded-lg">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text mb-2">🌍 Global Opportunities</h3>
                      <p className="text-text-body">Connecting local talent with global opportunities for unlimited career growth.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-hero rounded-3xl p-8 text-center">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-2xl font-bold text-text mb-4">Ready to Launch?</h3>
                  <p className="text-text-body mb-6">Join the revolution in career development and unlock your potential today.</p>
                  <div className="text-4xl font-bold text-primary">
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
                <h2 className="text-4xl font-bold text-text mb-4">
                  Explore <span className="text-accent-magenta">Endless Possibilities</span>
                </h2>
                <p className="text-xl text-text-body max-w-3xl mx-auto">
                  Discover a world of opportunities designed to accelerate your career journey
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="text-4xl mb-4">🎓</div>
                  <h3 className="text-xl font-bold text-text mb-3">For Students</h3>
                  <p className="text-text-body mb-4">Showcase your skills, find perfect job matches, and compete in exciting challenges.</p>
                  <ul className="space-y-2 text-sm text-text-body">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-primary mr-2" />AI Job Recommendations</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-primary mr-2" />Skill Competitions</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-primary mr-2" />Career Analytics</li>
                  </ul>
                </div>
                <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="text-4xl mb-4">👨‍🏫</div>
                  <h3 className="text-xl font-bold text-text mb-3">For Faculty</h3>
                  <p className="text-text-body mb-4">Manage competitions, track student progress, and foster academic excellence.</p>
                  <ul className="space-y-2 text-sm text-text-body">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Competition Management</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Student Analytics</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Progress Tracking</li>
                  </ul>
                </div>
                <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="text-4xl mb-4">💼</div>
                  <h3 className="text-xl font-bold text-text mb-3">For Recruiters</h3>
                  <p className="text-text-body mb-4">Find top talent, post opportunities, and build your dream team efficiently.</p>
                  <ul className="space-y-2 text-sm text-text-body">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-accent-magenta mr-2" />Talent Discovery</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-accent-magenta mr-2" />Job Posting</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-accent-magenta mr-2" />Recruitment Analytics</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="mb-20">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-text mb-4">
                  Powerful <span className="text-secondary">Features</span>
                </h2>
                <p className="text-xl text-text-body max-w-3xl mx-auto">
                  Cutting-edge tools designed to supercharge your career development journey
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="bg-background/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                      <div className="inline-flex p-4 rounded-2xl bg-primary mb-6">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-text mb-4">{feature.title}</h3>
                      <p className="text-text-body text-lg leading-relaxed">{feature.description}</p>
                      <div className="mt-6">
                        <div className="flex items-center text-primary font-semibold hover:text-primary-dark transition-colors cursor-pointer">
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

        {/* Sign Up Sidebar */}
        <div className="w-96 bg-background/95 backdrop-blur-md shadow-2xl p-8 sticky top-0 h-screen overflow-y-auto">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-primary rounded-2xl">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center text-text mb-2">
              Ready to Get Started?
            </h2>
            <p className="text-center text-text-body">
              Join thousands of students transforming their careers
            </p>
          </div>

          <div className="space-y-6">
            <Link
              to="/signup"
              className="w-full py-4 bg-gradient-button text-text-light font-bold rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <span>Sign Up Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <div className="text-center">
              <p className="text-text-body">
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
            <h3 className="text-lg font-bold text-text mb-4 text-center">Why Join Us?</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary-light rounded-lg">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-text text-sm">Smart Job Matching</h4>
                  <p className="text-text-body text-xs">AI-powered recommendations</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary-light rounded-lg">
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-text text-sm">Skill Competitions</h4>
                  <p className="text-text-body text-xs">Showcase your talents</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary-light rounded-lg">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-text text-sm">Network & Connect</h4>
                  <p className="text-text-body text-xs">Build meaningful connections</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-background-light">
            <div className="text-center text-sm text-text-muted">
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
