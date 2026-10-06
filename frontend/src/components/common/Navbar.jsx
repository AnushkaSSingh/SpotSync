import { Car, Menu, X } from 'lucide-react'
import { useState } from 'react'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <a href="/" className="brand" aria-label="SpotSync home">
          <span className="brand-mark">
            <Car size={20} />
          </span>
          <span>
            Spot<span>Sync</span>
          </span>
        </a>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#parking" onClick={() => setMenuOpen(false)}>Find Parking</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
        </nav>

        <div className="nav-actions">
          <button className="login-button">Log in</button>
          <button className="primary-button small">Get Started</button>
        </div>

        <button
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
