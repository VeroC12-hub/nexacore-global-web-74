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
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/nexacore-logo.png';

const Footer = () => {
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
              {['About Us', 'Services', 'Portfolio', 'Team', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-muted hover:text-background transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/blog" className="text-muted hover:text-background transition-colors text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted">CAD/Design Engineering</li>
              <li className="text-muted">Software Development</li>
              <li className="text-muted">AI/ML Solutions</li>
              <li className="text-muted">Blockchain & Web3</li>
              <li className="text-muted">UI/UX Design</li>
              <li className="text-muted">Data Analytics</li>
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
                <span className="text-muted">+233558330610 / +233501588710</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary-glow" />
                <span className="text-muted">info@nexacoreinnovations.com</span>
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
