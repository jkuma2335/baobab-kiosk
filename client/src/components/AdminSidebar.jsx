import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, ClipboardList, Package, LayoutList, LogOut, Tag, X } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminSidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Close sidebar when a link is clicked on mobile
  const handleLinkClick = () => {
    if (window.innerWidth < 1024 && onToggle) {
      onToggle();
    }
  };

  const handleLogout = () => {
    // Remove user info and token from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Show success toast
    toast.success('Logged out successfully');
    
    // Navigate to login page
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      path: '/admin/analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      path: '/admin/orders',
      label: 'Orders',
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      path: '/admin/products',
      label: 'Products',
      icon: <Package className="h-5 w-5" />,
    },
      {
        path: '/admin/categories',
        label: 'Categories',
        icon: <LayoutList className="h-5 w-5" />,
      },
      {
        path: '/admin/deals',
        label: 'Deals',
        icon: <Tag className="h-5 w-5" />,
      },
    ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`w-64 bg-white min-h-screen fixed left-0 top-0 z-50 shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`} style={{ boxShadow: '0 10px 25px -5px rgba(183, 110, 121, 0.15)' }}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4 border-b" style={{ borderColor: '#FFF5F7' }}>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-pink-50 transition-colors"
            style={{ color: '#B76E79' }}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 border-b" style={{ borderColor: '#FFF5F7' }}>
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#B76E79' }}>Admin Panel</h2>
        </div>
      <nav className="p-4 flex flex-col h-full">
        <ul className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center space-x-3 px-4 py-3 transition-all duration-200 ease-in-out ${
                    isActive
                      ? 'rounded-full text-white'
                      : 'rounded-2xl hover:bg-pink-50'
                  }`}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)',
                    boxShadow: '0 4px 15px -5px rgba(255, 105, 180, 0.4)'
                  } : {
                    color: '#4A4A4A'
                  }}
                >
                  {item.icon}
                  <span className="font-medium" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        
        {/* Logout Button */}
        <div className="pt-4 border-t" style={{ borderColor: '#FFF5F7' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ease-in-out hover:bg-red-50"
            style={{ color: '#FF69B4' }}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>Log Out</span>
          </button>
        </div>
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;

