import { RouterProvider } from 'react-router-dom'
import { InquiryProvider } from '../features/inquiry/InquiryContext'
import { AuthProvider } from '../features/admin/AuthContext'
import { router } from './router'

export function App() {
  return (
    <AuthProvider>
      <InquiryProvider>
        <RouterProvider router={router} />
      </InquiryProvider>
    </AuthProvider>
  )
}
