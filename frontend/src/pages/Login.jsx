
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { loginUser, getCurrentUser } from '../services/api'
import {
  ArrowRight, Eye, EyeOff, LockKeyhole, Mail
} from 'lucide-react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()

    if (!email.trim() || !password) {
      setMessage('Please enter your email address and password.')
      return
    }

    if (loading) return

    setLoading(true)
    setMessage('')

    try {
      await loginUser(email.trim().toLowerCase(), password)
      const user = await getCurrentUser()
      onLogin(user)
    } catch (error) {
      setMessage(error.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="staff-login-page">
      <style>{`
        .staff-login-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 60% 40%;
          font-family: Arial, Helvetica, sans-serif;
          background: #f8f5ff;
          color: #201735;
        }

        .staff-login-page * {
          box-sizing: border-box;
          font-family: inherit;
        }

        .staff-login-visual {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 65px;
          position: relative;
          color: white;
          background:
            linear-gradient(90deg,rgba(16,7,36,.82),rgba(28,12,54,.35)),
            url('https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1800&q=90')
            center/cover;
        }

        .staff-login-brand {
          position: absolute;
          top: 30px;
          left: 45px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 21px;
          font-weight: 800;
          color: white;
          text-decoration: none;
        }

        .staff-login-brand-icon {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          background: #6934e4;
          border-radius: 9px;
        }

        .staff-login-brand span:last-child span {
          color: #ad86ff;
        }

        .staff-login-welcome {
          font-size: clamp(38px,5vw,65px);
          font-weight: 800;
          text-align: center;
        }

        .staff-login-panel {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background:
            radial-gradient(circle at 100% 0%,#e5d7ff 0,transparent 38%),
            #f8f5ff;
        }

        .staff-login-card {
          width: 100%;
          max-width: 370px;
        }

        .staff-login-card h2 {
          font-size: 30px;
          font-weight: 800;
          margin: 0 0 5px;
        }

        .staff-login-subtitle {
          color: #827991;
          font-size: 13px;
          margin: 0 0 30px;
        }

        .staff-login-input {
          height: 46px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0 13px;
          border: 1px solid #dcd3eb;
          background: rgba(255,255,255,.8);
          border-radius: 25px;
          margin-bottom: 13px;
        }

        .staff-login-input svg {
          width: 17px;
          color: #74618f;
          flex-shrink: 0;
        }

        .staff-login-input input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 12px;
          font-family: inherit;
        }

        .staff-login-input button {
          display: flex;
          border: 0;
          background: transparent;
          cursor: pointer;
          color: #74618f;
        }

        .staff-login-forgot {
          display: block;
          text-align: right;
          font-size: 11px;
          color: #6531ce;
          text-decoration: none;
          font-weight: 700;
          margin: 8px 0 20px;
        }

        .staff-login-submit {
          height: 46px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 0;
          border-radius: 25px;
          background: linear-gradient(100deg,#7137ed,#5423bb);
          color: white;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .staff-login-message {
          color: #7137c9;
          font-size: 11px;
          margin: 12px 0;
        }

        .staff-login-switch {
          text-align: center;
          color: #776d88;
          font-size: 11px;
          margin-top: 22px;
        }

        .staff-login-switch a {
          color: #6030c9;
          font-weight: 800;
          text-decoration: none;
        }

        @media(max-width:800px) {
          .staff-login-page {
            grid-template-columns: 1fr;
          }

          .staff-login-visual {
            min-height: 300px;
          }

          .staff-login-panel {
            min-height: 550px;
            padding: 30px 22px;
          }
        }
      `}</style>

      <section className="staff-login-visual">
        <Link to="/" className="staff-login-brand">
          <span className="staff-login-brand-icon">P</span>
          <span>Spot<span>Sync</span></span>
        </Link>

        <h1 className="staff-login-welcome">Welcome Back!</h1>
      </section>

      <section className="staff-login-panel">
        <form className="staff-login-card" onSubmit={submit}>
          <h2>Sign In</h2>

          <p className="staff-login-subtitle">
            Access your account to continue
          </p>

          <div className="staff-login-input">
            <Mail />

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                setMessage('')
              }}
            />
          </div>

          <div className="staff-login-input">
            <LockKeyhole />

            <input
              type={show ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => {
                setPassword(e.target.value)
                setMessage('')
              }}
            />

            <button
              type="button"
              onClick={() => setShow(!show)}
            >
              {show ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <a
            href="#forgot-password"
            className="staff-login-forgot"
            onClick={e => {
              e.preventDefault()
              setMessage('Password recovery needs backend integration.')
            }}
          >
            Forgot Password?
          </a>

          {message && (
            <div className="staff-login-message">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="staff-login-submit"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
            {!loading && <ArrowRight size={17} />}
          </button>

          <p className="staff-login-switch">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </section>
    </main>
  )
}
