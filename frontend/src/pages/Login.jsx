export default function Login() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="section-kicker">WELCOME BACK</span>
        <h1>Log in to SpotSync</h1>
        <p>Access your parking reservations and saved spots.</p>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            localStorage.setItem('spotsync_logged_in', 'true')
            alert('Logged in successfully!')
            window.history.pushState({}, '', '/home')
            window.dispatchEvent(new PopStateEvent('popstate'))
          }}
        >
          <label>
            Email
            <input type="email" placeholder="you@example.com" required />
          </label>

          <label>
            Password
            <input type="password" placeholder="••••••••" required />
          </label>

          <button type="submit" className="primary-button">
            Log in
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => {
              window.history.pushState({}, '', '/register')
              window.dispatchEvent(new PopStateEvent('popstate'))
            }}
          >
            Get started
          </button>
        </p>
      </div>
    </main>
  )
}
