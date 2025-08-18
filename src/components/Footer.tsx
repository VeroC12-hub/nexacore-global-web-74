import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Linkedin,
  MessageSquare,
  Download,
  Facebook,
  Youtube,
  Instagram,
  Send,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/nexacore-logo.png';

const Footer = () => {
  // Navigation items with their corresponding routes
  const navigationItems = [
    { name: 'About Us', path: '/about', external: false },
    { name: 'Services', path: '/services', external: false },
    { name: 'Portfolio', path: '/portfolio', external: false },
    { name: 'Team', path: '/team', external: false },
    { name: 'Contact', path: '/contact', external: false },
    { name: 'Blog', path: 'https://nexacoreinn.blogspot.com/', external: true }
  ];

  // Service items with exact mapping to Services page sections
  const serviceItems = [
    { 
      name: 'CAD/Design Engineering', 
      path: '/services#engineering-technical',
      category: 'Engineering & Technical Services'
    },
    { 
      name: 'Software Development', 
      path: '/services#software-app-development',
      category: 'Software & App Development'
    },
    { 
      name: 'AI/ML Solutions', 
      path: '/services#engineering-technical',
      category: 'Engineering & Technical Services'
    },
    { 
      name: 'Blockchain & Web3', 
      path: '/services#engineering-technical',
      category: 'Engineering & Technical Services'
    },
    { 
      name: 'UI/UX Design', 
      path: '/services#creative-branding',
      category: 'Creative & Branding'
    },
    { 
      name: 'Data Analytics', 
      path: '/services#data-digital-growth',
      category: 'Data & Digital Growth'
    }
  ];

  // Function to handle service link clicks with smooth scrolling
  const handleServiceClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    
    // Check if we're already on the services page
    if (window.location.pathname === '/services') {
      // We're already on services page, just scroll to section
      const sectionId = path.split('#')[1];
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    } else {
      // Navigate to services page with hash
      window.location.href = path;
    }
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="NexaCore Logo" className="w-8 h-8 rounded" />
              <span className="text-xl font-bold">NexaCore Innovations</span>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              Engineering Global Innovation with Excellence. We deliver technical, creative, and digital solutions worldwide.
            </p>
            <Button className="bg-white text-foreground hover:bg-muted text-sm font-medium px-4 py-2">
              <Download className="w-4 h-4 mr-2" />
              Company Profile
            </Button>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  {item.external ? (
                    <a 
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-background transition-colors text-sm flex items-center"
                    >
                      {item.name}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  ) : (
                    <Link 
                      to={item.path}
                      className="text-muted hover:text-background transition-colors text-sm"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Our Services</h3>
            <ul className="space-y-2 text-sm">
              {serviceItems.map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.path}
                    onClick={(e) => handleServiceClick(e, item.path)}
                    className="text-muted hover:text-background transition-colors cursor-pointer"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Get in Touch</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 mt-0.5 text-primary-glow" />
                <span className="text-muted">Accra, Ghana<br />Global Remote Team</span>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-primary-glow" />
                <a 
                  href="tel:+233209628907" 
                  className="text-muted hover:text-background transition-colors"
                >
                  +233209628907 / +233501588710
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary-glow" />
                <a 
                  href="mailto:info@nexacore-innovations.com" 
                  className="text-muted hover:text-background transition-colors"
                >
                  info@nexacore-innovations.com
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3 pt-2">
              <a href="https://www.linkedin.com/company/nexacore-innovations" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-md hover:bg-primary-glow">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/people/NexaCore-Innovations/61578918113006" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-md hover:bg-[#3b5998]">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://youtube.com/nexacore" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-md hover:bg-red-600">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://x.com/nexacore" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-md hover:bg-black">
                X
              </a>
              <a href="https://www.instagram.com/nexacoreinnovations" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-md hover:bg-pink-600">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://t.me/nexacore" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-md hover:bg-blue-500">
                <Send className="w-4 h-4" />
              </a>
              <a href="https://tiktok.com/@nexacore" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-md hover:bg-black">
                TikTok
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} NexaCore Innovations. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-background transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-background transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
