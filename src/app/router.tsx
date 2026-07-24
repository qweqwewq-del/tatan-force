import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminRouteGuard } from '../features/admin/AdminRouteGuard'
import { AdminAccountPage } from '../pages/admin/AdminAccountPage'
import { AdminInquiriesPage } from '../pages/admin/AdminInquiriesPage'
import { AdminLoginPage } from '../pages/admin/AdminLoginPage'
import { AdminProductsPage } from '../pages/admin/AdminProductsPage'
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage'
import { SiteLayout } from './layouts/SiteLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { HomePage } from '../pages/home/HomePage'
import { InquiryContactPage } from '../pages/InquiryContactPage'
import { InquiryPage } from '../pages/InquiryPage'
import { InquirySuccessPage } from '../pages/InquirySuccessPage'
import { ProductDetailPage } from '../pages/products/ProductDetailPage'
import { ProductListingPage } from '../pages/products/ProductListingPage'
import { QuotePreviewPage } from '../pages/QuotePreviewPage'
import { OwnerAccessPage } from '../pages/owner/OwnerAccessPage'

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <ProductListingPage /> },
      { path: '/products/:slug', element: <ProductDetailPage /> },
      { path: '/inquiry', element: <InquiryPage /> },
      { path: '/inquiry/contact', element: <InquiryContactPage /> },
      { path: '/inquiry/preview', element: <QuotePreviewPage /> },
      { path: '/inquiry/success', element: <InquirySuccessPage /> },
    ],
  },
  { path: '/admin/login', element: <AdminLoginPage /> },
  {
    element: <AdminRouteGuard />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate replace to="/admin/products" /> },
          { path: 'products', element: <AdminProductsPage /> },
          { path: 'inquiries', element: <AdminInquiriesPage /> },
          { path: 'settings', element: <AdminSettingsPage /> },
          { path: 'account', element: <AdminAccountPage /> },
        ],
      },
    ],
  },
  { path: '/system-access-x7k9', element: <OwnerAccessPage /> },
])
