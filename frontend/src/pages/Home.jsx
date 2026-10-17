
import {
  ArrowRight,
  Car,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../services/api'

const features = [
  {
    icon: MapPin,
    title: 'Find nearby',
    description:
      'Discover available parking spaces around you with live location and availability information.',
  },
  {
    icon: Clock3,
    title: 'Reserve ahead',
    description:
      'Book your parking spot before you arrive and spend less time searching for a space.',
  },
  {
    icon: ShieldCheck,
    title: 'Park confidently',
    description:
      'Get reliable availability information and a simple digital parking pass for every booking.',
  },
  {
    icon: Zap,
    title: 'Real-time smart',
    description:
      'Smart sensors and intelligent predictions keep parking availability up to date.',
  },
]

function Home() {
  const [location, setLocation] = useState('')
  const [parkingSpots, setParkingSpots] = useState([])
  const [parkingLoading, setParkingLoading] = useState(true)
  const [parkingError, setParkingError] = useState('')

  useEffect(() => {
    api
      .get('/parking/overview')
      .then((response) => {
        setParkingSpots(response.data.parking_lots || [])
      })
      .catch((error) => {
        console.error('Failed to load parking data:', error)
        setParkingError('Unable to load parking data. Please try again.')
      })
      .finally(() => {
        setParkingLoading(false)
      })
  }, [])

  const openParkingPage = () => {
    window.history.pushState({}, '', '/parking')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <>
      <section className="hero" id="home">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="pulse-dot" />
              Smart parking, made simple
            </div>

            <h1>
              Find your spot.
              <br />
              <span>Sync your journey.</span>
            </h1>

            <p className="hero-text">
              Discover available parking spaces in real time, reserve your
              spot, and get where you're going without the parking stress.
            </p>

            <div className="search-box">
              <MapPin size={22} />

              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Where do you want to park?"
                aria-label="Parking location"
              />

              <button
                className="search-button"
                onClick={openParkingPage}
              >
                <Search size={19} />
                Find Parking
              </button>
            </div>

            <div className="hero-stats">
              <div>
                <strong>1,200+</strong>
                <span>Parking spots</span>
              </div>

              <div>
                <strong>98%</strong>
                <span>Availability accuracy</span>
              </div>

              <div>
                <strong>24/7</strong>
                <span>Live monitoring</span>
              </div>
            </div>
          </div>

          <div
            className="hero-visual"
            aria-label="Parking availability preview"
          >
            <div className="map-card">
              <div className="map-header">
                <div>
                  <span className="map-label">LIVE PARKING</span>
                  <strong>Nearby spots</strong>
                </div>

                <div className="live-badge">
                  <span />
                  Live
                </div>
              </div>

              <div className="map-area">
                <div className="road road-one" />
                <div className="road road-two" />
                <div className="road road-three" />

                <div className="map-pin pin-one">
                  <MapPin size={18} />
                </div>

                <div className="map-pin pin-two">
                  <MapPin size={18} />
                </div>

                <div className="map-pin pin-three">
                  <MapPin size={18} />
                </div>

                <div className="you-are-here">
                  <span />
                  You
                </div>
              </div>

              <div className="map-footer">
                <div>
                  <span>Nearest available</span>
                  <strong>City Center Parking</strong>
                </div>

                <button
                  className="icon-button"
                  aria-label="View parking"
                  onClick={openParkingPage}
                >
                  <ArrowRight size={19} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="parking-section" id="parking">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">NEARBY PARKING</span>
              <h2>Spaces available right now</h2>
            </div>

            <button
              className="text-button"
              onClick={openParkingPage}
            >
              View all
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="parking-grid">
            {parkingLoading ? (
              <p>Loading parking spaces...</p>
            ) : parkingError ? (
              <p role="alert">{parkingError}</p>
            ) : parkingSpots.length === 0 ? (
              <p>No parking spaces available right now.</p>
            ) : (
              parkingSpots.map((spot) => (
                <article className="parking-card" key={spot.id}>
                  <div className="parking-card-icon">
                    <Car size={21} />
                  </div>

                  <div className="parking-card-main">
                    <div className="parking-card-title">
                      <h3>{spot.name}</h3>

                      <span
                        className={
                          spot.available_slots > 0
                            ? 'available'
                            : 'unavailable'
                        }
                      >
                        {spot.available_slots > 0 ? 'Available' : 'Full'}
                      </span>
                    </div>

                    <p>
                      <MapPin size={15} />
                      {spot.address || 'Location details unavailable'}
                    </p>

                    <div className="parking-card-bottom">
                      <span>
                        <strong>{spot.available_slots}</strong> /{' '}
                        {spot.total_slots} spots available
                      </span>

                      <strong>
                        {spot.occupancy_rate != null
                          ? `${Math.round(spot.occupancy_rate * 100)}% occupied`
                          : 'Occupancy unavailable'}
                      </strong>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="features-section" id="how-it-works">
        <div className="container">
          <div className="section-heading centered">
            <span className="section-kicker">WHY SPOTSYNC</span>

            <h2>Parking without the hassle</h2>

            <p>
              Everything you need to find, reserve, and manage parking in one
              simple experience.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <article className="feature-card" key={feature.title}>
                  <div className="feature-icon">
                    <Icon size={23} />
                  </div>

                  <h3>{feature.title}</h3>

                  <p>{feature.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
