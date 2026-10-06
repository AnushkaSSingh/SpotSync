import { Car, Menu, X } from 'lucide-react'
import { useState } from 'react'

function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  function goHome(hash = '') {
    setMenuOpen(false)
    navigate(`/${hash}`)
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <button
          type="button"
          className="brand"
          onClick={() => goHome()}
          aria-label="SpotSync home"
        >
          <span className="brand-mark">
            <Car size={20} />
          </span>

          <span>
            Spot<span>Sync</span>
          </span>
        </button>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <button
            type="button"
            onClick={() => goHome('#home')}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              navigate('/parking')
            }}
          >
            Find Parking
          </button>

          <button
            type="button"
            onClick={() => goHome('#how-it-works')}
          >
            How It Works
          </button>
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="login-button"
            onClick={() => {
              setMenuOpen(false)
              navigate('/login')
            }}
          >
            Log in
          </button>

          <button
            type="button"
            className="primary-button small"
            onClick={() => {
              setMenuOpen(false)
              navigate('/register')
            }}
          >
            Get Started
          </button>
        </div>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
    </header>
  )
}

export default Navbar
