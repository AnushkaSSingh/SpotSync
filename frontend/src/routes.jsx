import Home from './pages/Home'
import ExploreParking from './pages/ExploreParking'

export const routes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/parking',
    element: <ExploreParking />,
  },
]
