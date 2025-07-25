import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Linkedin, MessageSquare, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-glow to-success rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-xl font-bold">NexaCore Innovations</span>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              Engineering Global Innovation with Excellence. We deliver technical, creative, and digital solutions worldwide.
            </p>
            <Button variant="outline" className="border-background/20 text-background hover:bg-background hover:text-foreground">
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
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary-glow" />
                <span className="text-muted">+233 54087377</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary-glow" />
                <span className="text-muted">info@nexacoreinnovations.com</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-3 pt-2">
              <a href="#" className="w-8 h-8 bg-background/10 rounded-lg flex items-center justify-center hover:bg-primary-glow transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-background/10 rounded-lg flex items-center justify-center hover:bg-success transition-colors">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted">
          <p>&copy; 2024 NexaCore Innovations. All rights reserved.</p>
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