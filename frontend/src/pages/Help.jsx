import { ArrowLeft, Car, CircleHelp } from 'lucide-react'

function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export default function Help() {
  return (
    <main className="auth-page">
      <div className="auth-card help-card">
        <button
          type="button"
          className="back-link"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={17} />
          Back to home
        </button>

        <div className="auth-icon">
          <CircleHelp size={25} />
        </div>

        <span className="section-kicker">SPOTSYNC HELP</span>
        <h1>How can we help?</h1>

        <div className="help-list">
          <div>
            <Car size={20} />
            <div>
              <strong>Find parking</strong>
              <p>Search nearby parking spaces and compare availability.</p>
            </div>
          </div>

          <div>
            <Car size={20} />
            <div>
              <strong>Reserve a spot</strong>
              <p>Select an available parking space and continue to booking.</p>
            </div>
          </div>

          <div>
            <CircleHelp size={20} />
            <div>
              <strong>Need more help?</strong>
              <p>Support and account features will be connected soon.</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="primary-button auth-submit"
          onClick={() => navigate('/parking')}
        >
          Find Parking
        </button>
      </div>
    </main>
  )
}
