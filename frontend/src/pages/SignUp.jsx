
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Eye, EyeOff, LockKeyhole,
  UserRound, Mail, Phone, Zap, ShieldCheck,
  ChartNoAxesCombined
} from 'lucide-react'

export default function SignUp() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState('')

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setMessage('')
  }

  function submit(e) {
    e.preventDefault()

    if (Object.values(form).some(value => !value.trim())) {
      setMessage('Please fill in all fields.')
      return
    }

    if (form.password.length < 6) {
      setMessage('Password must contain at least 6 characters.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setMessage('Registration form validated. Connect the staff registration API to create your account.')
  }

  return (
    <main className="staff-auth-page">
      <style>{`
        .staff-auth-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 55% 45%;
          font-family: Arial, Helvetica, sans-serif;
          background: #f7f3ff;
          color: #1c1530;
        }

        .staff-auth-page * {
          box-sizing: border-box;
          font-family: inherit;
        }

        .staff-auth-visual {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 65px;
          position: relative;
          color: white;
          background:
            linear-gradient(90deg,rgba(16,7,36,.93),rgba(28,12,54,.58)),
            url('https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1800&q=90')
            center/cover;
        }

        .staff-auth-brand {
          position: absolute;
          top: 35px;
          left: 55px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          text-decoration: none;
          font-size: 21px;
          font-weight: 800;
        }

        .staff-auth-brand-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          background: #6934e4;
          border-radius: 9px;
        }

        .staff-auth-brand span:last-child span {
          color: #ad86ff;
        }

        .staff-auth-copy h1 {
          font-size: clamp(42px,5vw,65px);
          line-height: 1.1;
          margin: 0 0 12px;
          font-weight: 800;
        }

        .staff-auth-copy h1 span {
          color: #a77aff;
        }

        .staff-auth-copy h2 {
          font-size: 25px;
          color: #d8c7ff;
          margin: 0 0 12px;
        }

        .staff-auth-copy p {
          color: #e1d9ed;
          font-size: 14px;
          line-height: 1.7;
          max-width: 390px;
        }

        .staff-auth-highlights {
          display: flex;
          gap: 25px;
          margin-top: 35px;
          flex-wrap: wrap;
        }

        .staff-auth-highlight {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 11px;
          color: #eee8fa;
          line-height: 1.5;
        }

        .staff-auth-highlight svg {
          width: 36px;
          height: 36px;
          padding: 8px;
          background: #6636cb;
          border-radius: 9px;
        }

        .staff-auth-panel {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background:
            radial-gradient(circle at 100% 0%,#e5d7ff 0,transparent 38%),
            #f8f5ff;
        }

        .staff-auth-card {
          width: 100%;
          max-width: 410px;
        }

        .staff-auth-card h2 {
          font-size: 29px;
          margin: 0 0 5px;
          font-weight: 800;
        }

        .staff-auth-card h2 span {
          color: #6731d5;
        }

        .staff-auth-subtitle {
          color: #827991;
          font-size: 13px;
          margin-bottom: 26px;
        }

        .staff-auth-input {
          display: flex;
          align-items: center;
          gap: 11px;
          height: 44px;
          border: 1px solid #ddd4ed;
          background: rgba(255,255,255,.8);
          border-radius: 12px;
          padding: 0 13px;
          margin-bottom: 10px;
        }

        .staff-auth-input svg {
          width: 17px;
          color: #74618f;
          flex-shrink: 0;
        }

        .staff-auth-input input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 12px;
          font-family: inherit;
        }

        .staff-auth-input button {
          border: 0;
          background: transparent;
          color: #74618f;
          cursor: pointer;
          display: flex;
        }

        .staff-auth-submit {
          width: 100%;
          height: 46px;
          border: 0;
          border-radius: 25px;
          background: linear-gradient(100deg,#7137ed,#5423bb);
          color: white;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 17px;
        }

        .staff-auth-message {
          font-size: 11px;
          color: #7137c9;
          margin-top: 12px;
          line-height: 1.5;
        }

        .staff-auth-switch {
          text-align: center;
          font-size: 11px;
          color: #776d88;
          margin-top: 20px;
        }

        .staff-auth-switch a {
          color: #6030c9;
          font-weight: 800;
          text-decoration: none;
        }

        @media(max-width:850px) {
          .staff-auth-page {
            grid-template-columns: 1fr;
          }

          .staff-auth-visual {
            min-height: 340px;
            padding: 100px 35px 40px;
          }

          .staff-auth-brand {
            top: 25px;
            left: 30px;
          }

          .staff-auth-copy h1 {
            font-size: 42px;
          }

          .staff-auth-panel {
            min-height: 650px;
            padding: 35px 22px;
          }
        }
      `}</style>

      <section className="staff-auth-visual">
        <Link to="/" className="staff-auth-brand">
          <span className="staff-auth-brand-icon">P</span>
          <span>Spot<span>Sync</span></span>
        </Link>

        <div className="staff-auth-copy">
          <h1>Join Spot<span>Sync</span></h1>
          <h2>Smart parking, smarter you.</h2>

          <p>
            Find parking, book in seconds, and experience
            a hassle-free journey.
          </p>

          <div className="staff-auth-highlights">
            <div className="staff-auth-highlight">
              <Zap />
              <span>Real-Time<br />Availability</span>
            </div>

            <div className="staff-auth-highlight">
              <ShieldCheck />
              <span>Secure &<br />Reliable</span>
            </div>

            <div className="staff-auth-highlight">
              <ChartNoAxesCombined />
              <span>Smart<br />Navigation</span>
            </div>
          </div>
        </div>
      </section>

      <section className="staff-auth-panel">
        <form className="staff-auth-card" onSubmit={submit}>
          <h2>Create Your <span>Account</span></h2>

          <p className="staff-auth-subtitle">
            Get started with SpotSync today
          </p>

          <div className="staff-auth-input">
            <UserRound />
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={e => update('name', e.target.value)}
            />
          </div>

          <div className="staff-auth-input">
            <Mail />
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={e => update('email', e.target.value)}
            />
          </div>

          <div className="staff-auth-input">
            <Phone />
            <input
              type="tel"
              placeholder="Phone Number"
              value={form.phone}
              onChange={e => update('phone', e.target.value)}
            />
          </div>

          <div className="staff-auth-input">
            <LockKeyhole />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={e => update('password', e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <div className="staff-auth-input">
            <LockKeyhole />
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={e => update('confirmPassword', e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {message && (
            <div className="staff-auth-message">
              {message}
            </div>
          )}

          <button className="staff-auth-submit" type="submit">
            Sign Up <ArrowRight size={17} />
          </button>

          <p className="staff-auth-switch">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </form>
      </section>
    </main>
  )
}
