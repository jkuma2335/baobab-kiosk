import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Chart library (large)
          'charts': ['recharts'],
          // PDF and image processing (heavy)
          'documents': ['jspdf', 'jspdf-autotable', 'html2canvas'],
          // Excel processing
          'excel': ['xlsx'],
          // Date utilities
          'utils': ['date-fns'],
          // Icons (can be large if all imported)
          'icons': ['lucide-react', 'react-icons'],
          // Admin pages (split from main bundle)
          'admin-dashboard': [
            './src/pages/admin/AdminDashboardPage.jsx',
            './src/pages/admin/DetailedAnalyticsPage.jsx',
          ],
          'admin-orders': ['./src/pages/admin/AdminOrdersPage.jsx'],
          'admin-products': ['./src/pages/admin/AdminProductsPage.jsx'],
          'admin-categories': [
            './src/pages/admin/AdminCategoriesPage.jsx',
            './src/pages/admin/CategoryDetailsPage.jsx',
          ],
          'admin-deals': ['./src/pages/admin/AdminDealsPage.jsx'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
