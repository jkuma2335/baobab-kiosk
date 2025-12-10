import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import DealForm from '../../components/DealForm';
import PromoCodeForm from '../../components/PromoCodeForm';
import { toast } from 'react-toastify';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Tag,
  Sparkles,
  TrendingUp,
  Percent,
  Calendar,
  Users,
  Gift,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';

const AdminDealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [filteredPromoCodes, setFilteredPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPromoFormOpen, setIsPromoFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [editingPromoCode, setEditingPromoCode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('deals'); // 'deals' or 'promo-codes'

  useEffect(() => {
    fetchDeals();
    fetchPromoCodes();
  }, []);

  useEffect(() => {
    filterDeals();
    filterPromoCodes();
  }, [deals, promoCodes, searchQuery]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/deals');
      setDeals(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError('Failed to load deals. Please try again later.');
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const fetchPromoCodes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/promo-codes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPromoCodes(response.data.data || []);
    } catch (err) {
      console.error('Error fetching promo codes:', err);
    }
  };

  const filterDeals = () => {
    let filtered = [...deals];

    if (searchQuery.trim() && activeTab === 'deals') {
      filtered = filtered.filter((deal) =>
        deal.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDeals(filtered);
  };

  const filterPromoCodes = () => {
    let filtered = [...promoCodes];

    if (searchQuery.trim() && activeTab === 'promo-codes') {
      filtered = filtered.filter(
        (promo) =>
          promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (promo.description &&
            promo.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPromoCodes(filtered);
  };

  const handleAddDeal = () => {
    setEditingDeal(null);
    setIsFormOpen(true);
  };

  const handleEditDeal = (deal) => {
    setEditingDeal(deal);
    setIsFormOpen(true);
  };

  const handleDeleteDeal = async (dealId, dealTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${dealTitle}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/deals/${dealId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Deal deleted successfully!');
      fetchDeals();
    } catch (err) {
      console.error('Error deleting deal:', err);
      toast.error('Failed to delete deal');
    }
  };

  const handleToggleActive = async (deal) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/deals/${deal._id}`,
        { ...deal, isActive: !deal.isActive },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`Deal ${deal.isActive ? 'deactivated' : 'activated'}!`);
      fetchDeals();
    } catch (err) {
      console.error('Error updating deal:', err);
      toast.error('Failed to update deal status');
    }
  };

  const handleAddPromoCode = () => {
    setEditingPromoCode(null);
    setIsPromoFormOpen(true);
  };

  const handleEditPromoCode = (promoCode) => {
    setEditingPromoCode(promoCode);
    setIsPromoFormOpen(true);
  };

  const handleDeletePromoCode = async (promoCodeId, code) => {
    if (!window.confirm(`Are you sure you want to delete promo code "${code}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/promo-codes/${promoCodeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Promo code deleted successfully!');
      fetchPromoCodes();
    } catch (err) {
      console.error('Error deleting promo code:', err);
      toast.error('Failed to delete promo code');
    }
  };

  const handleTogglePromoActive = async (promoCode) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/promo-codes/${promoCode._id}`,
        { ...promoCode, isActive: !promoCode.isActive },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`Promo code ${promoCode.isActive ? 'deactivated' : 'activated'}!`);
      fetchPromoCodes();
    } catch (err) {
      console.error('Error updating promo code:', err);
      toast.error('Failed to update promo code status');
    }
  };

  const handleFormSuccess = () => {
    fetchDeals();
  };

  const handlePromoFormSuccess = () => {
    fetchPromoCodes();
  };

  const isPromoCodeExpired = (promoCode) => {
    if (!promoCode.endDate) return false;
    return new Date(promoCode.endDate) < new Date();
  };

  const isPromoCodeStarted = (promoCode) => {
    if (!promoCode.startDate) return true;
    return new Date(promoCode.startDate) <= new Date();
  };

  const getBadgeColor = (dealType) => {
    switch (dealType) {
      case 'bundle':
        return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'mix':
        return 'bg-gradient-to-r from-pink-500 to-pink-600';
      case 'seasonal':
        return 'bg-gradient-to-r from-purple-500 to-purple-600';
      case 'flash':
        return 'bg-gradient-to-r from-orange-500 to-orange-600';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'hot':
        return '🔥';
      case 'popular':
        return '⭐';
      case 'new':
        return '🎉';
      default:
        return '⭐';
    }
  };

  // Calculate stats
  const activeDeals = deals.filter((d) => d.isActive).length;
  const inactiveDeals = deals.filter((d) => !d.isActive).length;
  const activePromoCodes = promoCodes.filter((p) => p.isActive && !isPromoCodeExpired(p)).length;
  const expiredPromoCodes = promoCodes.filter((p) => isPromoCodeExpired(p)).length;
  const totalPromoUses = promoCodes.reduce((sum, p) => sum + (p.usedCount || 0), 0);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#FFF5F7', fontFamily: "'Lato', sans-serif" }}>
      <AdminSidebar />
      <div className="ml-64 flex-1 p-6">
        {/* Enhanced Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#B76E79', background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Deals & Promo Codes
              </h1>
              <p className="text-sm mt-2 font-medium" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
                Manage special offers, deals, and promo codes
              </p>
            </div>
            <button
              onClick={() => {
                if (activeTab === 'deals') {
                  handleAddDeal();
                } else {
                  handleAddPromoCode();
                }
              }}
              className="flex items-center space-x-2 text-white px-6 py-3 rounded-2xl transition-all duration-200 ease-in-out font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)', fontFamily: "'Poppins', sans-serif" }}
            >
              <Plus className="h-5 w-5" />
              <span>Add New {activeTab === 'deals' ? 'Deal' : 'Promo Code'}</span>
            </button>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border p-1" style={{ borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' }}>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setActiveTab('deals');
                setSearchQuery('');
              }}
              className={`flex-1 px-6 py-3 font-semibold text-sm rounded-2xl transition-all duration-200 ${
                activeTab === 'deals'
                  ? 'text-white shadow-lg transform scale-105'
                  : 'hover:bg-pink-50'
              }`}
              style={activeTab === 'deals' ? { background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)', fontFamily: "'Poppins', sans-serif" } : { color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Gift className="h-4 w-4" />
                <span>Deals</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('promo-codes');
                setSearchQuery('');
              }}
              className={`flex-1 px-6 py-3 font-semibold text-sm rounded-2xl transition-all duration-200 ${
                activeTab === 'promo-codes'
                  ? 'text-white shadow-lg transform scale-105'
                  : 'hover:bg-pink-50'
              }`}
              style={activeTab === 'promo-codes' ? { background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)', fontFamily: "'Poppins', sans-serif" } : { color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>Promo Codes</span>
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
          {activeTab === 'deals' ? (
            <>
              <div className="group relative rounded-2xl shadow-lg border p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#E6E6FA', boxShadow: '0 10px 25px -5px rgba(230, 230, 250, 0.2)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl" style={{ backgroundColor: 'rgba(183, 110, 121, 0.2)' }}></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
                        Total Deals
                      </p>
                      <p className="text-5xl font-extrabold" style={{ color: '#B76E79', fontFamily: "'Playfair Display', serif" }}>
                        {deals.length}
                      </p>
                    </div>
                    <div className="rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #B76E79 0%, #A85A6B 100%)' }}>
                      <Gift className="text-white text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-2xl shadow-lg border p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl" style={{ backgroundColor: 'rgba(80, 200, 120, 0.2)' }}></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
                        Active Deals
                      </p>
                      <p className="text-5xl font-extrabold" style={{ color: '#50C878', fontFamily: "'Playfair Display', serif" }}>
                        {activeDeals}
                      </p>
                    </div>
                    <div className="rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #50C878 0%, #45B86A 100%)' }}>
                      <Sparkles className="text-white text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-2xl shadow-lg border p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#E0E0E0', boxShadow: '0 10px 25px -5px rgba(224, 224, 224, 0.15)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl" style={{ backgroundColor: 'rgba(107, 114, 128, 0.2)' }}></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
                        Inactive Deals
                      </p>
                      <p className="text-5xl font-extrabold" style={{ color: '#9CA3AF', fontFamily: "'Playfair Display', serif" }}>
                        {inactiveDeals}
                      </p>
                    </div>
                    <div className="rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)' }}>
                      <EyeOff className="text-white text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-2xl shadow-lg border p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#E6E6FA', boxShadow: '0 10px 25px -5px rgba(230, 230, 250, 0.2)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl" style={{ backgroundColor: 'rgba(230, 230, 250, 0.2)' }}></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
                        Promo Codes
                      </p>
                      <p className="text-5xl font-extrabold" style={{ color: '#B76E79', fontFamily: "'Playfair Display', serif" }}>
                        {promoCodes.length}
                      </p>
                    </div>
                    <div className="rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #E6E6FA 0%, #DDA0DD 100%)' }}>
                      <Tag className="text-white text-xl" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="group relative rounded-2xl shadow-lg border p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#E6E6FA', boxShadow: '0 10px 25px -5px rgba(230, 230, 250, 0.2)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl" style={{ backgroundColor: 'rgba(183, 110, 121, 0.2)' }}></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
                        Total Promo Codes
                      </p>
                      <p className="text-5xl font-extrabold" style={{ color: '#B76E79', fontFamily: "'Playfair Display', serif" }}>
                        {promoCodes.length}
                      </p>
                    </div>
                    <div className="rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #E6E6FA 0%, #DDA0DD 100%)' }}>
                      <Tag className="text-white text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-2xl shadow-lg border p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl" style={{ backgroundColor: 'rgba(80, 200, 120, 0.2)' }}></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
                        Active Codes
                      </p>
                      <p className="text-5xl font-extrabold" style={{ color: '#50C878', fontFamily: "'Playfair Display', serif" }}>
                        {activePromoCodes}
                      </p>
                    </div>
                    <div className="rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #50C878 0%, #45B86A 100%)' }}>
                      <Eye className="text-white text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-2xl shadow-lg border p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#FFC0CB', boxShadow: '0 10px 25px -5px rgba(255, 192, 203, 0.15)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl" style={{ backgroundColor: 'rgba(255, 105, 180, 0.2)' }}></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
                        Expired Codes
                      </p>
                      <p className="text-5xl font-extrabold" style={{ color: '#FF69B4', fontFamily: "'Playfair Display', serif" }}>
                        {expiredPromoCodes}
                      </p>
                    </div>
                    <div className="rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)' }}>
                      <Calendar className="text-white text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-2xl shadow-lg border p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl" style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)' }}></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
                        Total Uses
                      </p>
                      <p className="text-5xl font-extrabold" style={{ color: '#D4AF37', fontFamily: "'Playfair Display', serif" }}>
                        {totalPromoUses}
                      </p>
                    </div>
                    <div className="rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C9A227 100%)' }}>
                      <Users className="text-white text-xl" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Enhanced Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={activeTab === 'deals' ? 'Search deals by title...' : 'Search promo codes by code or description...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-2 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 transition-all bg-white/80 backdrop-blur-sm chic-select"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#FF69B4' }}></div>
            <p className="mt-4 font-medium" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
              Loading {activeTab === 'deals' ? 'deals' : 'promo codes'}...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        ) : activeTab === 'deals' ? (
          <>
            {/* Enhanced Deals Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDeals.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border" style={{ borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' }}>
                  <Gift className="h-16 w-16 mx-auto mb-4" style={{ color: '#FFB6C1' }} />
                  <p className="text-lg mb-2 font-semibold" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
                    {searchQuery
                      ? 'No deals match your search'
                      : 'No deals found'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={handleAddDeal}
                      className="mt-4 px-6 py-3 text-white rounded-2xl transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)', fontFamily: "'Poppins', sans-serif" }}
                    >
                      Create Your First Deal
                    </button>
                  )}
                </div>
              ) : (
                filteredDeals.map((deal) => (
                  <div
                    key={deal._id}
                    className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-[1.02]"
                    style={deal.isActive ? { borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' } : { borderColor: '#E0E0E0', opacity: 0.75 }}
                  >
                    {/* Deal Image/Header */}
                    {deal.image && (
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                        <img
                          src={deal.image}
                          alt={deal.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`${getBadgeColor(
                              deal.dealType
                            )} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}
                          >
                            {deal.badgeText || deal.dealType}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Deal Content */}
                    <div className="p-6">
                      {/* Title */}
                      <h3 className="text-xl font-extrabold mb-2 line-clamp-2 transition-colors" style={{ color: '#4A4A4A', fontFamily: "'Playfair Display', serif" }} onMouseEnter={(e) => e.target.style.color = '#FF69B4'} onMouseLeave={(e) => e.target.style.color = '#4A4A4A'}>
                        {deal.title}
                      </h3>

                      {/* Description */}
                      {deal.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {deal.description}
                        </p>
                      )}

                      {/* Pricing */}
                      <div className="rounded-2xl p-4 mb-4 border" style={{ background: 'linear-gradient(135deg, #FFF5F7 0%, #FFE4E9 100%)', borderColor: '#FFB6C1' }}>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-extrabold" style={{ color: '#50C878', fontFamily: "'Playfair Display', serif" }}>
                            GHS {deal.discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-lg line-through" style={{ color: '#9CA3AF' }}>
                            GHS {deal.originalPrice.toFixed(2)}
                          </span>
                          {deal.savingsPercentage && (
                            <span className="ml-auto px-3 py-1 text-white rounded-full text-xs font-bold" style={{ backgroundColor: '#FF69B4', fontFamily: "'Poppins', sans-serif" }}>
                              Save {deal.savingsPercentage}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          {deal.isActive ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border-2" style={{ backgroundColor: '#FFE4E9', color: '#50C878', borderColor: '#FFB6C1', fontFamily: "'Poppins', sans-serif" }}>
                              <Eye className="h-3.5 w-3.5 mr-1.5" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border-2" style={{ backgroundColor: '#F3F4F6', color: '#6B7280', borderColor: '#E5E7EB', fontFamily: "'Poppins', sans-serif" }}>
                              <EyeOff className="h-3.5 w-3.5 mr-1.5" /> Inactive
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleActive(deal)}
                            className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-110"
                            title={deal.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {deal.isActive ? (
                              <EyeOff className="h-4 w-4 text-gray-600" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-600" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditDeal(deal)}
                            className="p-2.5 bg-blue-50 rounded-xl hover:bg-blue-100 hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-110"
                            title="Edit Deal"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteDeal(deal._id, deal.title)}
                            className="p-2.5 bg-red-50 rounded-xl hover:bg-red-100 hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-110"
                            title="Delete Deal"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {/* Enhanced Promo Codes Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPromoCodes.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border" style={{ borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' }}>
                  <Tag className="h-16 w-16 mx-auto mb-4" style={{ color: '#FFB6C1' }} />
                  <p className="text-lg mb-2 font-semibold" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
                    {searchQuery
                      ? 'No promo codes match your search'
                      : 'No promo codes found'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={handleAddPromoCode}
                      className="mt-4 px-6 py-3 text-white rounded-2xl transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)', fontFamily: "'Poppins', sans-serif" }}
                    >
                      Create Your First Promo Code
                    </button>
                  )}
                </div>
              ) : (
                filteredPromoCodes.map((promo) => {
                  const expired = isPromoCodeExpired(promo);
                  const notStarted = !isPromoCodeStarted(promo);
                  const usageLimitReached =
                    promo.usageLimit && promo.usedCount >= promo.usageLimit;

                  return (
                    <div
                      key={promo._id}
                      className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-[1.02]"
                      style={promo.isActive && !expired && !notStarted ? { borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' } : { borderColor: '#E0E0E0', opacity: 0.75 }}
                    >
                      <div className="p-6">
                        {/* Code and Status */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="rounded-xl p-2 shadow-lg" style={{ background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)' }}>
                              <Tag className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-2xl font-extrabold font-mono" style={{ color: '#4A4A4A', fontFamily: "'Playfair Display', serif" }}>
                              {promo.code}
                            </span>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            {expired && (
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold border-2 border-red-200">
                                Expired
                              </span>
                            )}
                            {notStarted && (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold border-2 border-yellow-200">
                                Not Started
                              </span>
                            )}
                            {usageLimitReached && (
                              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold border-2 border-orange-200">
                                Limit Reached
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {promo.description && (
                          <p className="text-sm text-gray-600 mb-4 font-medium">
                            {promo.description}
                          </p>
                        )}

                        {/* Discount Info */}
                        <div className="mb-4 p-4 rounded-2xl border" style={{ background: 'linear-gradient(135deg, #FFF5F7 0%, #FFE4E9 100%)', borderColor: '#FFB6C1' }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Discount:</span>
                            <span className="text-2xl font-extrabold" style={{ color: '#50C878', fontFamily: "'Playfair Display', serif" }}>
                              {promo.discountType === 'percentage'
                                ? `${promo.discountValue}%`
                                : `GHS ${promo.discountValue.toFixed(2)}`}
                            </span>
                          </div>
                          {promo.minPurchaseAmount > 0 && (
                            <div className="text-xs text-gray-600 mt-2 font-medium">
                              Min Purchase: GHS {promo.minPurchaseAmount.toFixed(2)}
                            </div>
                          )}
                          {promo.maxDiscountAmount && (
                            <div className="text-xs text-gray-600 mt-1 font-medium">
                              Max Discount: GHS {promo.maxDiscountAmount.toFixed(2)}
                            </div>
                          )}
                        </div>

                        {/* Usage Info */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-xl space-y-2 text-xs text-gray-600">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Used:</span>
                            <span className="font-bold text-gray-900">
                              {promo.usedCount || 0}
                              {promo.usageLimit && ` / ${promo.usageLimit}`}
                            </span>
                          </div>
                          {promo.startDate && (
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Starts:</span>
                              <span className="font-medium">
                                {format(new Date(promo.startDate), 'MMM dd, yyyy')}
                              </span>
                            </div>
                          )}
                          {promo.endDate && (
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Ends:</span>
                              <span className="font-medium">
                                {format(new Date(promo.endDate), 'MMM dd, yyyy')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-2">
                            {promo.isActive && !expired && !notStarted ? (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border-2" style={{ backgroundColor: '#FFE4E9', color: '#50C878', borderColor: '#FFB6C1', fontFamily: "'Poppins', sans-serif" }}>
                                <Eye className="h-3.5 w-3.5 mr-1.5" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border-2" style={{ backgroundColor: '#F3F4F6', color: '#6B7280', borderColor: '#E5E7EB', fontFamily: "'Poppins', sans-serif" }}>
                                <EyeOff className="h-3.5 w-3.5 mr-1.5" /> Inactive
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleTogglePromoActive(promo)}
                              className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-110"
                              title={promo.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {promo.isActive ? (
                                <EyeOff className="h-4 w-4 text-gray-600" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-600" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEditPromoCode(promo)}
                              className="p-2.5 bg-blue-50 rounded-xl hover:bg-blue-100 hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-110"
                              title="Edit Promo Code"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDeletePromoCode(promo._id, promo.code)}
                              className="p-2.5 bg-red-50 rounded-xl hover:bg-red-100 hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-110"
                              title="Delete Promo Code"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Deal Form Modal */}
        <DealForm
          deal={editingDeal}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingDeal(null);
          }}
          onSuccess={handleFormSuccess}
        />

        {/* Promo Code Form Modal */}
        <PromoCodeForm
          promoCode={editingPromoCode}
          isOpen={isPromoFormOpen}
          onClose={() => {
            setIsPromoFormOpen(false);
            setEditingPromoCode(null);
          }}
          onSuccess={handlePromoFormSuccess}
        />
      </div>
    </div>
  );
};

export default AdminDealsPage;
