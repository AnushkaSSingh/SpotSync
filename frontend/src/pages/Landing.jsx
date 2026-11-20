import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap,
  ShieldCheck,
  ChartNoAxesCombined,
  Radio,
  Map,
  Sparkles,
  AlertTriangle,
  CarFront,
  History,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

const parkingImage =
  'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=2200&q=90'

export default function Landing() {
  const featuredRef = useRef(null)

  // Restore normal page scrolling and animate the featured section
  // according to the actual window scroll position.
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const root = document.getElementById('root')

    // Save existing styles so other pages are not affected.
    const elements = [html, body, root].filter(Boolean)
    const previousStyles = elements.map(element => ({
      element,
      height: element.style.height,
      minHeight: element.style.minHeight,
      overflow: element.style.overflow,
      overflowY: element.style.overflowY,
      overflowX: element.style.overflowX,
    }))

    elements.forEach(element => {
      element.style.height = 'auto'
      element.style.minHeight = '100%'
      element.style.overflowY = 'auto'
      element.style.overflowX = 'clip'
    })

    body.style.margin = '0'

    const section = featuredRef.current
    if (!section) return

    let frame = null

    const updateTransition = () => {
      if (frame !== null) return

      frame = window.requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect()
        const viewportHeight = window.innerHeight

        // Transition starts as the section enters the screen
        // and finishes as it approaches the upper part of the screen.
        const start = viewportHeight * 0.95
        const end = viewportHeight * 0.12

        const rawProgress = (start - rect.top) / (start - end)

        const progress = Math.max(0, Math.min(1, rawProgress))

        // Smooth easing while keeping the animation connected to scrolling.
        const eased = progress * progress * (3 - 2 * progress)

        section.style.setProperty(
          '--scroll-progress',
          eased.toFixed(4)
        )

        frame = null
      })
    }

    updateTransition()

    window.addEventListener('scroll', updateTransition, {
      passive: true,
    })

    window.addEventListener('resize', updateTransition)

    return () => {
      window.removeEventListener('scroll', updateTransition)
      window.removeEventListener('resize', updateTransition)

      if (frame !== null) {
        window.cancelAnimationFrame(frame)
      }

      // Restore the previous global styles when leaving the landing page.
      previousStyles.forEach(item => {
        item.element.style.height = item.height
        item.element.style.minHeight = item.minHeight
        item.element.style.overflow = item.overflow
        item.element.style.overflowY = item.overflowY
        item.element.style.overflowX = item.overflowX
      })

      if (root) {
        body.style.margin = previousStyles[1]?.element === body
          ? previousStyles[1].element.style.margin
          : ''
      }
    }
  }, [])

  const features = [
    {
      icon: Radio,
      title: 'Smart IoT Sensors',
      description:
        'Eight HC-SR04 ultrasonic sensors monitor seven parking spaces and the entrance. Arduino UNO Q sends readings to the backend to detect parking occupancy.',
      tags: ['7 bay sensors', '1 entrance / ramp'],
    },
    {
      icon: Map,
      title: 'Live Floor Plans',
      description:
        'View every parking bay across both floors. Instantly identify available, occupied, reserved and unknown spaces.',
    },
    {
      icon: Sparkles,
      title: 'Smart Allocation',
      description:
        'Parking bays are ranked using distance, congestion, driver preferences and availability to recommend suitable spaces.',
    },
    {
      icon: AlertTriangle,
      title: 'Mismatch Alerts',
      description:
        'Identify incorrect parking assignments and sensor issues. Staff can review discrepancies and manage their resolution.',
    },
    {
      icon: CarFront,
      title: 'Active Parking',
      description:
        'Monitor parked vehicles, parking duration and bays reserved for incoming arrivals from one central dashboard.',
    },
    {
      icon: History,
      title: 'History & Reports',
      description:
        'Search parking records by vehicle plate, ticket or parking slot. Filter records by date and export reports.',
    },
  ]

  const steps = [
    {
      number: '01',
      title: 'Log the Arrival',
      description: 'Enter the vehicle number plate, type and parking preferences.',
    },
    {
      number: '02',
      title: 'Get a Ranked Bay',
      description: 'SpotSync checks availability and recommends a suitable parking bay.',
    },
    {
      number: '03',
      title: 'Park and Sync',
      description: 'Sensors confirm occupancy and help identify incorrect parking.',
    },
    {
      number: '04',
      title: 'Check Out',
      description: 'Complete the exit process and update the parking bay status.',
    },
  ]

  return (
    <main className="spotsync-landing">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap');

        /* RESTORE PAGE SCROLLING */

        html,
        body,
        #root {
          height: auto !important;
          min-height: 100% !important;
          overflow-y: auto !important;
          overflow-x: clip !important;
        }

        body {
          margin: 0;
        }

        .spotsync-landing {
          --purple: #642ee0;
          --lilac: #9b72ed;
          --dark: #171128;
          --light-bg: #f8f7fc;

          font-family: 'DM Sans', sans-serif;
          background: var(--light-bg);
          color: #171128;
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow: visible;
        }

        .spotsync-landing * {
          box-sizing: border-box;
        }

        .spotsync-landing a {
          text-decoration: none;
        }

        /* HEADER */

        .landing-header {
          position: fixed;
          inset: 0 0 auto;
          height: 75px;
          padding: 0 7%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          background: rgba(18, 12, 37, .96);
          border-bottom: 1px solid rgba(167, 122, 255, .18);
          backdrop-filter: blur(14px);
          z-index: 1000;
        }

        .landing-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-size: 19px;
          font-weight: 800;
          white-space: nowrap;
        }

        .landing-logo-icon {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: #642ee0;
          color: white;
          font-size: 21px;
          font-weight: 800;
        }

        .logo-purple {
          color: #a77aff;
        }

        .landing-nav {
          display: flex;
          align-items: center;
          gap: 34px;
        }

        .landing-nav a {
          color: #e1d9f3;
          font-size: 13px;
          font-weight: 600;
          transition: color .2s;
        }

        .landing-nav a:hover {
          color: #ad85ff;
        }

        .landing-auth {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .landing-signin,
        .landing-signup {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 11px 23px;
          border-radius: 25px;
          font-size: 12px;
          font-weight: 800;
          transition: .25s;
        }

        .landing-signin {
          border: 1px solid #8d7ba9;
          color: white;
        }

        .landing-signup {
          background: #6332d8;
          color: white;
        }

        .landing-signin:hover,
        .landing-signup:hover {
          transform: translateY(-2px);
        }

        /* HERO */

        .landing-hero {
          min-height: 650px;
          height: calc(100svh - 75px);
          max-height: 850px;
          width: 100%;
          position: relative;
          display: flex;
          align-items: center;
          margin-top: 75px;
          background:
            linear-gradient(
              90deg,
              rgba(15, 8, 32, .96) 0%,
              rgba(19, 10, 39, .83) 38%,
              rgba(18, 9, 35, .30) 100%
            ),
            url('${parkingImage}') center / cover no-repeat;
        }

        .landing-hero-content {
          width: 100%;
          max-width: 1440px;
          padding: 50px 8.5%;
          margin: auto;
        }

        .landing-eyebrow {
          color: #c2a6ff;
          font-size: 12px;
          letter-spacing: 2px;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 20px;
          display: block;
        }

        .landing-hero h1 {
          font-size: clamp(54px, 7vw, 86px);
          font-weight: 800;
          line-height: 1.03;
          letter-spacing: -3px;
          margin: 0;
          max-width: 720px;
          color: white;
        }

        .landing-hero h1 span {
          display: block;
          color: #9b68ff;
        }

        .landing-hero-description {
          font-size: 17px;
          color: #e0d9ed;
          margin: 22px 0 29px;
        }

        .landing-get-started {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 13px;
          padding: 15px 27px;
          border-radius: 28px;
          color: white;
          background: linear-gradient(100deg, #7137f2, #5722c9);
          font-size: 13px;
          font-weight: 800;
          box-shadow: 0 8px 25px rgba(84, 39, 180, .3);
          transition: .25s;
        }

        .landing-get-started:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(84, 39, 180, .4);
        }

        .landing-benefits {
          display: flex;
          flex-wrap: wrap;
          gap: 27px;
          margin-top: 42px;
        }

        .landing-benefit {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #e2dbea;
          font-size: 11px;
          font-weight: 600;
        }

        .landing-benefit svg {
          color: #c5a9ff;
        }

        /* SCROLL-LINKED FEATURED SECTION */

        .landing-featured {
          --scroll-progress: 0;
          min-height: 660px;
          padding: 100px 7%;
          display: grid;
          grid-template-columns: 1.05fr .95fr;
          align-items: center;
          gap: 9%;
          background: #faf9fd;
          scroll-margin-top: 75px;
          position: relative;
          overflow: visible;
        }

        .landing-featured-image {
          height: 460px;
          width: 100%;
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 25px 65px rgba(36, 20, 67, .15);
          transform:
            translate3d(calc(var(--scroll-progress) * -130px), 0, 0)
            scale(calc(1 - var(--scroll-progress) * .32));
          transform-origin: center center;
          will-change: transform;
        }

        .landing-featured-image img {
          height: 100%;
          width: 100%;
          display: block;
          object-fit: cover;
        }

        .landing-featured-content {
          transform: translate3d(
            calc(var(--scroll-progress) * 145px),
            0,
            0
          );
          will-change: transform;
        }

        .landing-featured-label {
          color: #8051d5;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .landing-featured-content h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(39px, 5vw, 58px);
          line-height: 1.12;
          color: #000;
          margin: 18px 0;
        }

        .landing-featured-content h2 span {
          color: #8058bd;
        }

        .landing-featured-content > p {
          color: #686174;
          font-size: 15px;
          line-height: 1.9;
          max-width: 500px;
        }

        .landing-featured-points {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-top: 30px;
        }

        .landing-featured-point {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #30233e;
          font-size: 13px;
          font-weight: 700;
        }

        .landing-featured-point svg {
          color: #8356d3;
          flex-shrink: 0;
        }

        /* SECTION HEADINGS */

        .landing-section {
          max-width: 1320px;
          margin: auto;
          padding: 95px 45px 45px;
          scroll-margin-top: 95px;
        }

        .landing-section-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(34px, 4vw, 46px);
          line-height: 1.2;
          margin: 0 0 12px;
          letter-spacing: -.8px;
          color: #000;
        }

        .landing-section-heading em {
          color: #8654d2;
        }

        .landing-section-subtitle {
          color: #6d6877;
          font-size: 14px;
          line-height: 1.7;
          margin: 0 0 35px;
        }

        /* FEATURE CARDS */

        .landing-feature-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .landing-feature-card {
          background: #fff;
          border: 1px solid #eeeaf5;
          border-radius: 19px;
          padding: 27px;
          min-height: 225px;
          box-shadow: 0 7px 25px rgba(35, 19, 58, .045);
          transition: .3s ease;
        }

        .landing-feature-card:hover {
          transform: translateY(-7px);
          border-color: #d7c6f4;
          box-shadow: 0 17px 35px rgba(75, 40, 130, .11);
        }

        .landing-feature-icon {
          width: 43px;
          height: 43px;
          border-radius: 13px;
          background: #f1eaff;
          display: grid;
          place-items: center;
          color: #7742c9;
          margin-bottom: 18px;
        }

        .landing-feature-card h3 {
          font-family: 'DM Sans', sans-serif;
          font-size: 17px;
          font-weight: 800;
          margin: 0 0 11px;
          color: #000;
        }

        .landing-feature-card p {
          font-size: 12px;
          color: #625d6b;
          line-height: 1.8;
          margin: 0;
        }

        .landing-feature-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 16px;
        }

        .landing-feature-tags span {
          background: #f1eaff;
          color: #7041b5;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
        }

        /* HOW IT WORKS */

        .landing-how {
          padding-top: 105px;
          padding-bottom: 100px;
        }

        .landing-steps {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
          margin-top: 45px;
        }

        .landing-step {
          background: white;
          border: 1px solid #eeeaf5;
          border-radius: 17px;
          padding: 25px 22px;
          min-height: 190px;
          transition: .3s ease;
        }

        .landing-step:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(75, 40, 130, .09);
        }

        .landing-step-number {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          background: #eee6ff;
          color: #6b35c3;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 20px;
        }

        .landing-step h3 {
          font-size: 16px;
          font-weight: 800;
          color: #000;
          margin: 0 0 10px;
        }

        .landing-step p {
          color: #686174;
          font-size: 12px;
          line-height: 1.8;
          margin: 0;
        }

        /* FINAL CTA */

        .landing-final-cta {
          text-align: center;
          padding: 90px 20px;
          background: linear-gradient(120deg, #211338, #39205d);
          color: white;
        }

        .landing-final-cta h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(30px, 4vw, 46px);
          margin: 0 0 16px;
          color: white;
        }

        .landing-final-cta h2 em {
          color: #b99aff;
        }

        .landing-final-cta p {
          color: #d3c8e4;
          font-size: 14px;
          margin-bottom: 28px;
        }

        /* FOOTER */

        .landing-footer {
          padding: 25px 7%;
          background: #171128;
          display: flex;
          justify-content: space-between;
          gap: 15px;
          color: #b6acc9;
          font-size: 11px;
        }

        /* TABLET */

        @media (max-width: 900px) {
          .landing-featured {
            grid-template-columns: 1fr 1fr;
            gap: 5%;
            padding-left: 5%;
            padding-right: 5%;
          }

          .landing-featured-image {
            height: 380px;
            transform:
              translate3d(calc(var(--scroll-progress) * -65px), 0, 0)
              scale(calc(1 - var(--scroll-progress) * .22));
          }

          .landing-featured-content {
            transform: translate3d(
              calc(var(--scroll-progress) * 70px),
              0,
              0
            );
          }

          .landing-feature-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .landing-steps {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* MOBILE */

        @media (max-width: 600px) {
          .landing-header {
            height: 70px;
            padding: 0 12px;
            gap: 8px;
          }

          .landing-logo {
            font-size: 14px;
            gap: 6px;
          }

          .landing-logo-icon {
            width: 29px;
            height: 29px;
            font-size: 16px;
          }

          .landing-nav {
            display: none;
          }

          .landing-auth {
            gap: 6px;
          }

          .landing-signin,
          .landing-signup {
            padding: 9px 12px;
            font-size: 10px;
          }

          .landing-hero {
            min-height: 590px;
            height: calc(100svh - 70px);
            margin-top: 70px;
            background-position: 60% center;
          }

          .landing-hero-content {
            padding: 35px 23px;
          }

          .landing-hero h1 {
            font-size: 52px;
            letter-spacing: -2px;
          }

          .landing-hero-description {
            font-size: 14px;
            line-height: 1.7;
          }

          .landing-benefits {
            gap: 14px;
          }

          .landing-benefit {
            font-size: 9px;
          }

          .landing-featured {
            grid-template-columns: 1fr;
            gap: 35px;
            padding: 75px 20px;
          }

          .landing-featured-image {
            height: 300px;
            border-radius: 22px;
            transform:
              translate3d(calc(var(--scroll-progress) * -15px), 0, 0)
              scale(calc(1 - var(--scroll-progress) * .14));
          }

          .landing-featured-content {
            transform: translate3d(
              calc(var(--scroll-progress) * 20px),
              0,
              0
            );
          }

          .landing-featured-content h2 {
            font-size: 39px;
          }

          .landing-featured-points {
            grid-template-columns: 1fr;
          }

          .landing-section {
            padding: 75px 18px 30px;
          }

          .landing-feature-grid {
            grid-template-columns: 1fr;
          }

          .landing-feature-card {
            min-height: auto;
          }

          .landing-steps {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .landing-step {
            min-height: auto;
          }

          .landing-how {
            padding-top: 75px;
            padding-bottom: 75px;
          }

          .landing-final-cta {
            padding: 75px 18px;
          }

          .landing-footer {
            padding: 22px 18px;
            flex-wrap: wrap;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .landing-feature-card,
          .landing-step {
            transition: none;
          }
        }
      `}</style>

      {/* HEADER */}

      <header className="landing-header">
        <Link to="/" className="landing-logo">
          <span className="landing-logo-icon">P</span>
          <span>
            Spot<span className="logo-purple">Sync</span>
          </span>
        </Link>

        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
        </nav>

        <div className="landing-auth">
          <Link to="/login" className="landing-signin">
            Sign In
          </Link>
          <Link to="/signup" className="landing-signup">
            Sign Up
          </Link>
        </div>
      </header>

      {/* HERO */}

      <section className="landing-hero" id="home">
        <div className="landing-hero-content">
          <span className="landing-eyebrow">
            Smart parking. Smarter city.
          </span>

          <h1>
            Find. Park. Go.
            <span>Smarter.</span>
          </h1>

          <p className="landing-hero-description">
            Real-time parking, effortless experience.
          </p>

          <Link to="/signup" className="landing-get-started">
            Get Started <ArrowRight size={17} />
          </Link>

          <div className="landing-benefits">
            <div className="landing-benefit">
              <Zap size={20} />
              <span>Real-Time<br />Availability</span>
            </div>

            <div className="landing-benefit">
              <ShieldCheck size={20} />
              <span>Secure &<br />Reliable</span>
            </div>

            <div className="landing-benefit">
              <ChartNoAxesCombined size={20} />
              <span>Smart Navigation</span>
            </div>
          </div>
        </div>
      </section>

      {/* SCROLL TRANSITION */}

      <section ref={featuredRef} className="landing-featured">
        <div className="landing-featured-image">
          <img
            src={parkingImage}
            alt="Modern parking facility"
          />
        </div>

        <div className="landing-featured-content">
          <span className="landing-featured-label">
            Smart Parking Experience
          </span>

          <h2>
            Parking made
            <br />
            <span>effortless.</span>
          </h2>

          <p>
            SpotSync brings intelligent parking management into one
            connected system. Monitor parking availability, manage
            vehicle arrivals and exits, and keep track of every parking
            space through a smarter digital experience.
          </p>

          <div className="landing-featured-points">
            <div className="landing-featured-point">
              <CheckCircle2 size={19} />
              Real-time monitoring
            </div>

            <div className="landing-featured-point">
              <CheckCircle2 size={19} />
              Intelligent allocation
            </div>

            <div className="landing-featured-point">
              <CheckCircle2 size={19} />
              Secure operations
            </div>

            <div className="landing-featured-point">
              <CheckCircle2 size={19} />
              Centralized dashboard
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}

      <section className="landing-section" id="features">
        <h2 className="landing-section-heading">
          Everything the car park <em>needs</em>
        </h2>

        <p className="landing-section-subtitle">
          One calm dashboard for the front desk, from the first arrival
          to the last checkout.
        </p>

        <div className="landing-feature-grid">
          {features.map(feature => {
            const Icon = feature.icon

            return (
              <article className="landing-feature-card" key={feature.title}>
                <div className="landing-feature-icon">
                  <Icon size={20} />
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>

                {feature.tags && (
                  <div className="landing-feature-tags">
                    {feature.tags.map(tag => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section
        className="landing-section landing-how"
        id="how-it-works"
      >
        <h2 className="landing-section-heading">
          From arrival to exit in <em>four steps</em>
        </h2>

        <p className="landing-section-subtitle">
          No clipboards, no guesswork. A smarter way to manage parking.
        </p>

        <div className="landing-steps">
          {steps.map(step => (
            <article className="landing-step" key={step.number}>
              <div className="landing-step-number">
                {step.number}
              </div>

              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}

      <section className="landing-final-cta">
        <h2>
          Ready to see your car park <em>breathe?</em>
        </h2>

        <p>
          Experience smarter parking with SpotSync.
        </p>

        <Link to="/signup" className="landing-get-started">
          Get Started <ArrowRight size={17} />
        </Link>
      </section>

      {/* FOOTER */}

      <footer className="landing-footer">
        <span>
          Â© 2026 SpotSync Â· Smart parking. Smarter city.
        </span>

        <span>Smart IoT parking system</span>
      </footer>
    </main>
  )
}
