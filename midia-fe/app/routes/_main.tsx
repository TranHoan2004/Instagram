// MainLayout.tsx
import { Outlet } from 'react-router'
import Header from '~/components/layout/header/Header'
import LeftSidebar from '~/components/layout/left-nav/LeftSidebar'
import RightSidebar from '~/components/layout/right-nav/RightSidebar'
import { AuthProvider } from '~/contexts/AuthContext'

const MainLayout = () => {
  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        <style>{`
        :root {
          --left-sidebar-width: 4rem;
          --right-sidebar-width: 0;
        }
        @media (min-width: 768px) {
          :root {
            --left-sidebar-width: clamp(180px, 180px + ((100vw - 1600px) * 0.46875), 300px);
            --right-sidebar-width: 18rem;
          }
        }
      `}</style>

        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Content + Header */}
        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <main className="flex-1 mt-[60px] w-full">
            <Outlet />
          </main>
        </div>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </AuthProvider>
  )
}

export default MainLayout
