import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">

      {/* Sidebar — fixed left, full height */}
      <aside className="flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Right side */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Header — fixed top */}
        <div className="flex-shrink-0">
          <Header />
        </div>

        {/* Main — only this scrolls */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

      </div>
    </div>
  )
}