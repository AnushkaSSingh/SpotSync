export default function Register() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="section-kicker">JOIN SPOTSYNC</span>
        <h1>Create your account</h1>
        <p>Save parking spots and manage your reservations easily.</p>

        <form onSubmit={(event) => {
  event.preventDefault()
  alert('Account created successfully!')
}}>
          <label>
            Full name
            <input type="text" placeholder="Your name" required />
          </label>

          <label>
            Email
            <input type="email" placeholder="you@example.com" required />
          </label>

          <label>
            Password
            <input type="password" placeholder="••••••••" required />
          </label>

          <button type="submit" className="primary-button">
            Create account
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => {
              window.history.pushState({}, '', '/login')
              window.dispatchEvent(new PopStateEvent('popstate'))
            }}
          >
            Log in
          </button>
        </p>
      </div>
    </main>
  )
}
