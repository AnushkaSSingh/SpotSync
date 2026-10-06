import { Car, Menu, X } from 'lucide-react'
import { useState } from 'react'

function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function goHome(hash = '') {
  window.history.pushState({}, '', `/${hash}`)
  window.dispatchEvent(new PopStateEvent('popstate'))

  if (hash) {
    setTimeout(() => {
      document.getElementById(hash.replace('#', ''))?.scrollIntoView({
        behavior: 'smooth',
      })
    }, 50)
  } else {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  function handleHome(hash = '') {
    setMenuOpen(false)
    goHome(hash)
  }

  function handleNavigation(path) {
    setMenuOpen(false)
    navigate(path)
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <button
          type="button"
          className="brand"
          onClick={() => handleHome()}
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
            onClick={() => handleHome('#home')}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => handleNavigation('/parking')}
          >
            Find Parking
          </button>

          <button
            type="button"
            onClick={() => handleHome('#how-it-works')}
          >
            How It Works
          </button>
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="login-button"
            onClick={() => handleNavigation('/login')}
          >
            Log in
          </button>

          <button
            type="button"
            className="primary-button small"
            onClick={() => handleNavigation('/register')}
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
