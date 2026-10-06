import { ArrowLeft, Car, Mail, Lock } from 'lucide-react'

function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export default function Login() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <button
          type="button"
          className="back-link"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={17} />
          Back to home
        </button>

        <div className="auth-icon">
          <Car size={25} />
        </div>

        <span className="section-kicker">WELCOME BACK</span>
        <h1>Log in to SpotSync</h1>
        <p className="auth-subtitle">
          Find your parking spot and manage your reservations.
        </p>

        <form
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault()
            alert('Login will be connected to the backend soon.')
          }}
        >
          <label>
            Email address
            <div className="auth-input">
              <Mail size={18} />
              <input
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
          </label>

          <label>
            Password
            <div className="auth-input">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>
          </label>

          <button type="submit" className="primary-button auth-submit">
            Log in
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <button type="button" onClick={() => navigate('/register')}>
            Get started
          </button>
        </p>
      </div>
    </main>
  )
}
