import { useEffect, useState } from 'react'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import ExploreParking from './pages/ExploreParking'
import ParkingDetails from './pages/ParkingDetails'
import BookingDetails from './pages/BookingDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import Help from './pages/Help'

function App() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  let page = <Home />

  if (path === '/parking') {
    page = <ExploreParking />
  } else if (path === '/parking-details') {
    page = <ParkingDetails />
  } else if (path === '/booking') {
    page = <BookingDetails />
  } else if (path === '/login') {
    page = <Login />
  } else if (path === '/register') {
    page = <Register />
  } else if (path === '/help') {
    page = <Help />
  }

  return <MainLayout>{page}</MainLayout>
}

export default App
