import { useEffect, useMemo, useState } from 'react'
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
import { getParkingOverview } from '../services/parkingService'

function ParkingCard({ parking, saved, onSave, onNavigate }) {
  const hasAvailability = parking.available > 0

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
          {hasAvailability ? 'Available' : 'Full'}
        </span>
      </div>

      <div className="explore-card-body">
        <div className="explore-card-title-row">
          <div>
            <h3>{parking.name}</h3>
            <p className="parking-address">
              <MapPin size={14} />
              {parking.address || 'Location details unavailable'}
            </p>
          </div>

          {parking.rating != null && (
            <div className="parking-rating">
              <Star size={13} fill="currentColor" />
              {parking.rating}
            </div>
          )}
        </div>

        <div className="parking-meta">
          {parking.distance && (
            <span>
              <Navigation size={14} />
              {parking.distance}
            </span>
          )}

          {parking.walking && (
            <span>
              <Clock3 size={14} />
              {parking.walking}
            </span>
          )}
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
            <span> / {parking.total} spots available</span>
          </div>

          {parking.price != null && (
            <div className="parking-price">
              <strong>â‚¹{parking.price}</strong>
              <span>/hr</span>
            </div>
          )}
        </div>

        <button
          className="view-parking-button"
          onClick={() =>
            onNavigate?.(`/parking-details?parking=${parking.id}`)
          }
        >
          View parking
        </button>
      </div>
    </article>
  )
}

function ParkingMap({ parking }) {
  const selectedParking = parking[0]

  return (
    <div className="explore-map">
      <div className="map-top-controls">
        <button
          className="map-control"
          type="button"
          onClick={() => {
            if ('geolocation' in navigator) {
              navigator.geolocation.getCurrentPosition(
                () => {},
                () => {},
              )
            }
          }}
        >
          <LocateFixed size={17} />
          <span>Locate me</span>
        </button>

        <button className="map-control" type="button">
          <Map size={17} />
          Map view
        </button>
      </div>

      <div className="map-road road-a" />
      <div className="map-road road-b" />
      <div className="map-road road-c" />
      <div className="map-road road-d" />

      {parking.map((item, index) => (
        <button
          className={`explore-map-pin pin-${(index % 4) + 1}`}
          key={item.id}
          title={item.name}
          type="button"
          aria-label={`${item.name}: ${item.available} available spots`}
        >
          <MapPin size={20} fill="currentColor" />
          <span>{item.available}</span>
        </button>
      ))}

      {selectedParking ? (
        <div className="map-selected-card">
          <div className="selected-card-icon">
            <Car size={19} />
          </div>

          <div>
            <strong>{selectedParking.name}</strong>
            <span>
              {selectedParking.available} of {selectedParking.total} spots
              available
            </span>
          </div>

          <ChevronDown size={17} />
        </div>
      ) : (
        <div className="map-selected-card">
          <div className="selected-card-icon">
            <Car size={19} />
          </div>
          <div>
            <strong>No parking locations</strong>
            <span>Locations will appear here when available.</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ExploreParking({ onNavigate }) {
  const [parkingData, setParkingData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('availability')
  const [showFilters, setShowFilters] = useState(false)
  const [saved, setSaved] = useState([])

  useEffect(() => {
    let cancelled = false

    async function loadParking() {
      try {
        setLoading(true)
        setError('')

        
        const response = await getParkingOverview()


        const lots = response?.parking_lots ?? []


        const mappedLots = lots.map((lot) => ({
          id: lot.id,
          name: lot.name || `Parking location ${lot.id}`,
          address: lot.address || '',
          available: Number(lot.available_slots ?? 0),
          total: Number(lot.total_slots ?? 0),
          occupancyRate: Number(lot.occupancy_rate ?? 0),
          price: lot.price ?? null,
          rating: lot.rating ?? null,
          distance: lot.distance ?? '',
          walking: lot.walking ?? '',
          ev: Boolean(lot.ev_charging),
          covered: Boolean(lot.covered),
        }))

        if (!cancelled) {
          setParkingData(mappedLots)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              'Could not load parking locations. Check that the backend is running.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadParking()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredParking = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    let results = parkingData.filter((parking) => {
      if (!normalizedQuery) return true

      return (
        parking.name.toLowerCase().includes(normalizedQuery) ||
        parking.address.toLowerCase().includes(normalizedQuery)
      )
    })

    if (sort === 'availability') {
      results = [...results].sort(
        (a, b) => b.available - a.available,
      )
    }

    return results
  }, [parkingData, query, sort])

  function toggleSaved(id) {
    setSaved((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  function resetFilters() {
    setQuery('')
    setSort('availability')
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
              type="button"
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

            <button type="button">Search</button>
          </div>
        </div>
      </section>

      <section className="explore-content">
        <div className="container explore-layout">
          <aside
            className={`explore-filters ${showFilters ? 'open' : ''}`}
          >
            <div className="filters-heading">
              <div>
                <Filter size={18} />
                <strong>Filters</strong>
              </div>

              <button type="button" onClick={resetFilters}>
                Reset
              </button>
            </div>

            <div className="filter-group">
              <h4>Distance</h4>
              <p>Distance data is not available yet.</p>
            </div>

            <div className="filter-group">
              <h4>Price per hour</h4>
              <p>Pricing data is not available yet.</p>
            </div>

            <div className="filter-group">
              <h4>Amenities</h4>
              <p>Amenity data is not available yet.</p>
            </div>
          </aside>

          <div className="explore-results">
            <div className="results-toolbar">
              <div>
                <strong>
                  {loading ? 'Loading...' : filteredParking.length}
                  {!loading && ' parking locations'}
                </strong>
                <span> from SpotSync</span>
              </div>

              <label className="sort-select">
                <span>Sort by</span>

                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="availability">Availability</option>
                  <option value="distance" disabled>
                    Distance (not available)
                  </option>
                  <option value="price" disabled>
                    Price (not available)
                  </option>
                </select>

                <ChevronDown size={15} />
              </label>
            </div>

            {loading && (
              <div className="empty-parking-state">
                <p>Loading parking locations from the server...</p>
              </div>
            )}

            {!loading && error && (
              <div className="empty-parking-state" role="alert">
                <h3>Could not load parking</h3>
                <p>{error}</p>
                <button
                  className="view-parking-button"
                  type="button"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
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
                    <h3>
                      {parkingData.length === 0
                        ? 'No parking locations available'
                        : 'No parking found'}
                    </h3>
                    <p>
                      {parkingData.length === 0
                        ? 'Add parking locations in the backend to display them here.'
                        : 'Try searching for a different parking name.'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="explore-map-column">
            <ParkingMap parking={filteredParking} />
          </div>
        </div>
      </section>
    </main>
  )
}
