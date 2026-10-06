import { Car } from 'lucide-react'

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="brand">
          <span className="brand-mark">
            <Car size={19} />
          </span>
          <span>
            Spot<span>Sync</span>
          </span>
        </div>

        <p>Smart parking. Simpler journeys.</p>

        <p>© {new Date().getFullYear()} SpotSync</p>
      </div>
    </footer>
  )
}

export default Footer
