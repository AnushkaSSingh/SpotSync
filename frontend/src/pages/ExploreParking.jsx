import { useMemo, useState } from 'react'
import {
  Car,
  ChevronDown,
  Clock3,
  Filter,
  Heart,
  LocateFixed,
  Map,
  MapPin,
  Navigation,
  Search,
  SlidersHorizontal,
  Star,
  Zap,
} from 'lucide-react'

const parkingData = [
  {
    id: 1,
    name: 'City Center Parking',
    address: 'MG Road, City Center',
    distance: '0.4 km',
    available: 18,
    total: 42,
    price: 30,
    rating: 4.8,
    reviews: 124,
    walking: '5 min walk',
    ev: true,
    covered: true,
  },
  {
    id: 2,
    name: 'Metro Plaza Parking',
    address: 'Metro Station Road',
    distance: '0.8 km',
    available: 7,
    total: 25,
    price: 40,
    rating: 4.6,
    reviews: 89,
    walking: '9 min walk',
    ev: true,
    covered: true,
  },
  {
    id: 3,
    name: 'Tech Park Parking',
    address: 'Tech Park Avenue',
    distance: '1.2 km',
    available: 31,
    total: 60,
    price: 25,
    rating: 4.7,
    reviews: 156,
    walking: '14 min walk',
    ev: false,
    covered: false,
  },
  {
    id: 4,
    name: 'Central Mall Parking',
    address: 'Central Mall Complex',
    distance: '1.5 km',
    available: 12,
    total: 50,
    price: 35,
    rating: 4.5,
    reviews: 72,
    walking: '18 min walk',
    ev: true,
    covered: true,
  },
]

function ParkingCard({ parking, saved, onSave, onNavigate }) {
  return (
    <article className="explore-parking-card">
      <div className="explore-card-visual">
        <div className="parking-visual-icon">
          <Car size={24} />
        </div>

        <button
          className={`save-parking ${saved ? 'saved' : ''}`}
          onClick={() => onSave(parking.id)}
          aria-label={saved ? 'Remove saved parking' : 'Save parking'}
        >
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>

        <span className="parking-availability">
          <span />
          Available
        </span>
      </div>

      <div className="explore-card-body">
        <div className="explore-card-title-row">
          <div>
            <h3>{parking.name}</h3>
            <p className="parking-address">
              <MapPin size={14} />
              {parking.address}
            </p>
          </div>

          <div className="parking-rating">
            <Star size={13} fill="currentColor" />
            {parking.rating}
          </div>
        </div>

        <div className="parking-meta">
          <span>
            <Navigation size={14} />
            {parking.distance}
          </span>
          <span>
            <Clock3 size={14} />
            {parking.walking}
          </span>
        </div>

        <div className="parking-amenities">
          {parking.ev && (
            <span>
              <Zap size={13} />
              EV charging
            </span>
          )}

          {parking.covered && <span>Covered</span>}
        </div>

        <div className="explore-card-footer">
          <div>
            <strong>{parking.available}</strong>
            <span> / {parking.total} spots</span>
          </div>

          <div className="parking-price">
            <strong>₹{parking.price}</strong>
            <span>/hr</span>
          </div>
        </div>

        <button className="view-parking-button" onClick={() => onNavigate?.(`/parking-details?parking=${parking.id}`)}>View parking</button>
      </div>
    </article>
  )
}

function ParkingMap({ parking }) {
  return (
    <div className="explore-map">
      <div className="map-top-controls">
        <button className="map-control">
          <LocateFixed size={17} />
          <span>Locate me</span>
        </button>

        <button className="map-control">
          <Map size={17} />
          Map view
        </button>
      </div>

      <div className="map-road road-a" />
      <div className="map-road road-b" />
      <div className="map-road road-c" />
      <div className="map-road road-d" />

      <div className="map-location-label location-one">
        City Center
      </div>

      <div className="map-location-label location-two">
        Metro Plaza
      </div>

      {parking.map((item, index) => (
        <button
          className={`explore-map-pin pin-${index + 1}`}
          key={item.id}
          title={item.name}
        >
          <MapPin size={20} fill="currentColor" />
          <span>₹{item.price}</span>
        </button>
      ))}

      <div className="current-location">
        <span />
        You are here
      </div>

      <div className="map-selected-card">
        <div className="selected-card-icon">
          <Car size={19} />
        </div>

        <div>
          <strong>{parking[0].name}</strong>
          <span>{parking[0].available} spots available</span>
        </div>

        <ChevronDown size={17} />
      </div>
    </div>
  )
}

export default function ExploreParking({ onNavigate }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('distance')
  const [showFilters, setShowFilters] = useState(false)
  const [saved, setSaved] = useState([])

  const filteredParking = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    let results = parkingData.filter((parking) => {
      if (!normalizedQuery) return true

      return (
        parking.name.toLowerCase().includes(normalizedQuery) ||
        parking.address.toLowerCase().includes(normalizedQuery)
      )
    })

    if (sort === 'price') {
      results = [...results].sort((a, b) => a.price - b.price)
    }

    if (sort === 'availability') {
      results = [...results].sort((a, b) => b.available - a.available)
    }

    return results
  }, [query, sort])

  function toggleSaved(id) {
    setSaved((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  return (
    <main className="explore-page">
      <section className="explore-header">
        <div className="container">
          <div className="explore-breadcrumb">
            <span>Home</span>
            <span>/</span>
            <strong>Find Parking</strong>
          </div>

          <div className="explore-heading">
            <div>
              <span className="section-kicker">FIND YOUR SPOT</span>
              <h1>Parking near you</h1>
              <p>
                Discover available parking spaces in real time and reserve
                your spot before you arrive.
              </p>
            </div>

            <button
              className="mobile-filter-button"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={17} />
              Filters
            </button>
          </div>

          <div className="explore-search">
            <Search size={20} />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by location, parking name..."
              aria-label="Search parking"
            />

            <button>
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="explore-content">
        <div className="container explore-layout">
          <aside className={`explore-filters ${showFilters ? 'open' : ''}`}>
            <div className="filters-heading">
              <div>
                <Filter size={18} />
                <strong>Filters</strong>
              </div>

              <button>Reset</button>
            </div>

            <div className="filter-group">
              <h4>Distance</h4>

              <label>
                <input type="radio" name="distance" defaultChecked />
                <span>Within 1 km</span>
              </label>

              <label>
                <input type="radio" name="distance" />
                <span>Within 3 km</span>
              </label>

              <label>
                <input type="radio" name="distance" />
                <span>Within 5 km</span>
              </label>
            </div>

            <div className="filter-group">
              <h4>Price per hour</h4>

              <label>
                <input type="checkbox" />
                <span>Under ₹30</span>
              </label>

              <label>
                <input type="checkbox" />
                <span>₹30 – ₹50</span>
              </label>

              <label>
                <input type="checkbox" />
                <span>₹50+</span>
              </label>
            </div>

            <div className="filter-group">
              <h4>Amenities</h4>

              <label>
                <input type="checkbox" />
                <span>EV charging</span>
              </label>

              <label>
                <input type="checkbox" />
                <span>Covered parking</span>
              </label>

              <label>
                <input type="checkbox" />
                <span>Accessible parking</span>
              </label>
            </div>
          </aside>

          <div className="explore-results">
            <div className="results-toolbar">
              <div>
                <strong>{filteredParking.length} parking locations</strong>
                <span> near your current location</span>
              </div>

              <label className="sort-select">
                <span>Sort by</span>

                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="distance">Distance</option>
                  <option value="price">Price</option>
                  <option value="availability">Availability</option>
                </select>

                <ChevronDown size={15} />
              </label>
            </div>

            <div className="explore-results-grid">
              {filteredParking.map((parking) => (
                <ParkingCard
                  key={parking.id}
                  parking={parking}
                  saved={saved.includes(parking.id)}
                  onSave={toggleSaved}
                  onNavigate={onNavigate}
                />
              ))}
            </div>

            {filteredParking.length === 0 && (
              <div className="empty-parking-state">
                <Search size={32} />
                <h3>No parking found</h3>
                <p>Try searching for a different location.</p>
              </div>
            )}
          </div>

          <div className="explore-map-column">
            <ParkingMap parking={filteredParking.length ? filteredParking : parkingData} />
          </div>
        </div>
      </section>
    </main>
  )
}

