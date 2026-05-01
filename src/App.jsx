import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Games from './pages/Games'
import Playground from './pages/Playground'

import ManageCategories from './pages/Managecategories'
import PlansPage from './pages/Planspage'


import BannerPage from './pages/banner/Bannerpage'
import LocationManagement from './pages/location/LocationManagement'
import PrivacyPolicy from './pages/privacyPolicy/PrivacyPolicy'
import TermsConditions from './pages/termsConditions/TermsConditions'
import Venues from './pages/Venue'
import Bookings from './pages/Bokkings'
import Courts from './pages/Courts'
import SportGrounds from './pages/Sportgrounds'
import AcaBookings from './pages/academy/AcaBookings'
import ModernSlotUI from './pages/academy/SportSlots'
import AcademyJoin from './pages/Academyjoin'
import CourtBookings from './pages/academy/Courtbookings'
import RevenueShare from './pages/RevenueShare'
import Coaching from './pages/Coaching'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
             <Route path="/academyjoin" element={<AcademyJoin />} />
          <Route path="/games" element={<Games />} />
          <Route path="/join-games" element={<Playground />} />
          <Route path="/catgeory" element={<ManageCategories />} />
          
          <Route path="/coaching" element={<Coaching />} />
          <Route path="/banners" element={<BannerPage />} />
          <Route path="/locations" element={<LocationManagement />} />
          <Route path="/privacy-policys" element={<PrivacyPolicy />} />
          <Route path="/term-conditions" element={<TermsConditions />} />
          <Route path="/plan" element={<PlansPage />} />
          <Route path="/courts" element={<Courts />} />
          <Route path="/grounds" element={<SportGrounds />} />
          <Route path="/venue" element={<Venues />} />
          <Route path="/bookings" element={<Bookings />} />
           <Route path="/revenueShare" element={<RevenueShare />} />

          {/* academy  */}
            <Route path="/booking" element={<AcaBookings />} />
          <Route path="/slots" element={<ModernSlotUI />} />
          <Route path="/bookings" element={<Bookings />} />
             <Route path="/courtbooking" element={<CourtBookings/>} />
          

        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}