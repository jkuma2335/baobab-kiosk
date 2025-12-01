import { Link } from 'react-router-dom';
import { FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 max-w-full overflow-x-hidden w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Categories */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products?category=Oils" className="hover:text-green-400 transition-colors">
                  Oils & Spreads
                </Link>
              </li>
              <li>
                <Link to="/products?category=Grains" className="hover:text-green-400 transition-colors">
                  Grains & Flours
                </Link>
              </li>
              <li>
                <Link to="/products?category=Meat" className="hover:text-green-400 transition-colors">
                  Meat & Poultry
                </Link>
              </li>
              <li>
                <Link to="/products?category=Spices" className="hover:text-green-400 transition-colors">
                  Spices & Seasonings
                </Link>
              </li>
              <li>
                <Link to="/products?category=Hausa Koko" className="hover:text-green-400 transition-colors">
                  Hausa Koko Mixes
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-green-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-green-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-green-400 transition-colors">
                  Delivery Information
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-green-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-green-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-green-400 mt-1 flex-shrink-0" />
                <span>Accra, Ghana</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhone className="text-green-400 flex-shrink-0" />
                <a href="tel:+233XXXXXXXXX" className="hover:text-green-400 transition-colors">
                  +233 XX XXX XXXX
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="text-green-400 flex-shrink-0" />
                <a href="mailto:info@baobabkiosk.com" className="hover:text-green-400 transition-colors">
                  info@baobabkiosk.com
                </a>
              </li>
              <li className="flex items-center space-x-3 mt-4">
                <FaWhatsapp className="text-green-400 flex-shrink-0 text-xl" />
                <a href="https://wa.me/233XXXXXXXXX" className="hover:text-green-400 transition-colors font-medium">
                  Order via WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col items-center space-y-4 text-center">
            <p className="text-sm font-semibold text-white">
              Website Developed by Apex Softwares
            </p>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-sm">
              <a href="tel:+233535368745" className="flex items-center space-x-2 hover:text-green-400 transition-colors">
                <FaPhone className="text-green-400" />
                <span>+233 53 536 8745</span>
              </a>
              <a href="mailto:godsonaidoo026@gmail.com" className="flex items-center space-x-2 hover:text-green-400 transition-colors">
                <FaEnvelope className="text-green-400" />
                <span>godsonaidoo026@gmail.com</span>
              </a>
              <a href="https://wa.me/233535368745" className="flex items-center space-x-2 hover:text-green-400 transition-colors">
                <FaWhatsapp className="text-green-400" />
                <span>WhatsApp: +233 53 536 8745</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

