import { ArrowLeft, Car, Mail, Lock, User } from 'lucide-react'

function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export default function Register() {
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

        <span className="section-kicker">GET STARTED</span>
        <h1>Create your SpotSync account</h1>
        <p className="auth-subtitle">
          Join SpotSync and make parking simpler.
        </p>

        <form
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault()
            alert('Registration will be connected to the backend soon.')
          }}
        >
          <label>
            Full name
            <div className="auth-input">
              <User size={18} />
              <input
                type="text"
                placeholder="Your name"
                required
              />
            </div>
          </label>

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
                placeholder="Create a password"
                required
              />
            </div>
          </label>

          <button type="submit" className="primary-button auth-submit">
            Create account
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/login')}>
            Log in
          </button>
        </p>
      </div>
    </main>
  )
}
