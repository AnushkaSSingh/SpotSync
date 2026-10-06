import {
  ArrowRight,
  Car,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

const parkingSpots = [
  {
    name: 'City Center Parking',
    distance: '0.4 km',
    available: 18,
    total: 42,
    price: '₹30/hr',
  },
  {
    name: 'Metro Plaza Parking',
    distance: '0.8 km',
    available: 7,
    total: 25,
    price: '₹40/hr',
  },
  {
    name: 'Tech Park Parking',
    distance: '1.2 km',
    available: 31,
    total: 60,
    price: '₹25/hr',
  },
]

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

              <button className="search-button">
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

          <div className="hero-visual" aria-label="Parking availability preview">
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

                <button className="icon-button" aria-label="View parking">
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

            <button className="text-button">
              View all
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="parking-grid">
            {parkingSpots.map((spot) => (
              <article className="parking-card" key={spot.name}>
                <div className="parking-card-icon">
                  <Car size={21} />
                </div>

                <div className="parking-card-main">
                  <div className="parking-card-title">
                    <h3>{spot.name}</h3>
                    <span className="available">Available</span>
                  </div>

                  <p>
                    <MapPin size={15} />
                    {spot.distance} away
                  </p>

                  <div className="parking-card-bottom">
                    <span>
                      <strong>{spot.available}</strong> / {spot.total} spots
                    </span>

                    <strong>{spot.price}</strong>
                  </div>
                </div>
              </article>
            ))}
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
