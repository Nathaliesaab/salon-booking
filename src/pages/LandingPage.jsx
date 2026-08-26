import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import Stars from '../components/Stars'
import Reveal from '../components/Reveal'
import { BRAND, LOCATIONS, PHOTOS } from '../lib/content'
import { watchReviews, watchServices } from '../lib/backend'

const PROMISES = [
  { ico: 'palette', title: 'Colour, mixed for you', text: 'Balayage, roots and gloss formulated against your skin tone and your history — never straight out of a box.' },
  { ico: 'chair', title: 'One guest at a time', text: 'No overlapping chairs and no rushing. The chair is yours from the moment you sit down.' },
  { ico: 'pin', title: 'Two salons, one calendar', text: 'Simona works out of two salons. You pick the one that suits you, and the times you see are the ones she is genuinely free — never double-booked across the two.' },
  { ico: 'scissors', title: 'An honest consultation', text: 'If a look will not hold on your hair, Simona will tell you before she picks up the scissors — and offer something that will.' },
  { ico: 'leaf', title: 'Care that outlasts the visit', text: 'Every appointment ends with a plan for keeping the colour and the cut looking like this at home.' },
]

export default function LandingPage() {
  const [services, setServices] = useState([])
  const [reviews, setReviews] = useState([])
  useEffect(() => watchServices((list) => setServices(list.filter((s) => s.active !== false))), [])
  useEffect(() => watchReviews((list) => setReviews(list.filter((r) => !r.hidden).slice(0, 3))), [])

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <span className="eyebrow">Hair by Simona · {BRAND.city}</span>
            <h1>The quiet luxury of hair that <em>actually suits you</em></h1>
            <p className="lead">
              Simona does colour, cuts and blow dries at two salons across {BRAND.city} —
              and takes her bookings herself, wherever she happens to be that day.
              One guest at a time, and as much time as the work honestly takes.
            </p>
            <div className="hero-actions">
              <Link className="btn-link primary" to="/book">Book an appointment</Link>
              <Link className="btn-link" to="/contact">Enquire</Link>
            </div>
            <div className="hero-stats">
              <div><span className="n">9</span><span className="l">Years behind the chair</span></div>
              <div><span className="n">1,400</span><span className="l">Guests since opening</span></div>
              <div><span className="n">4.9</span><span className="l">Average rating</span></div>
            </div>
          </div>

          <div>
            <figure className="arch">
              <img src={PHOTOS.hero} alt="A guest having her hair styled in the studio" loading="eager" />
              <figcaption className="caption">Est. 2017</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="split" id="about">
        <Reveal as="figure" className="split-photo">
          <img src={PHOTOS.studio} alt="Simona at work in the salon" loading="lazy" />
        </Reveal>
        <div className="split-copy">
          <div className="section-head left">
          <span className="eyebrow">The studio</span>
          <h2>Two chairs, and <span className="script">one very high standard</span></h2>
          <p>
            Simona splits her week between two salons, but she keeps a single calendar
            and answers every request herself. Book with her, not with a front desk —
            which is exactly why every appointment gets her whole attention.
            </p>
          </div>
          <ul className="promise-list">
            {PROMISES.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 70}>
                <span className="ico"><Icon name={p.ico} size={22} /></span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="services">
        <Reveal className="section-head">
          <span className="eyebrow">Services</span>
          <h2>The menu</h2>
          <p>
            Prices are a starting point. Hair that is very long, very thick or heavily
            corrected may need more time — she will confirm before anything begins.
          </p>
        </Reveal>
        <div className="menu-list">
          {services.map((s, i) => (
            <Reveal className="menu-item" key={s.id} delay={Math.min(i, 6) * 60}>
              <span className="name">
                {s.name}
                <span className="dur">{s.durationMin} minutes</span>
              </span>
              <span className="dots" aria-hidden="true" />
              {s.price && <span className="price">{s.price}</span>}
            </Reveal>
          ))}
          {services.length === 0 && <p className="muted" style={{ paddingTop: '1.4rem' }}>The service menu is being updated — please check back shortly.</p>}
        </div>
        <div className="center" style={{ marginTop: '2.5rem' }}>
          <Link className="btn-link" to="/book">See available times</Link>
        </div>
      </section>

      <section className="section" id="gallery">
        <Reveal className="section-head">
          <span className="eyebrow">The work</span>
          <h2>Recent from the chair</h2>
        </Reveal>
        <div className="gallery">
          {PHOTOS.gallery.map((g, i) => (
            <Reveal as="figure" key={g.src} delay={i * 60}>
              <img src={g.src} alt={g.alt} loading="lazy" />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section" id="where">
        <Reveal className="section-head">
          <span className="eyebrow">Where to find her</span>
          <h2>Two salons</h2>
          <p>Pick whichever is easier for you when you book — the available times are the same either way.</p>
        </Reveal>
        <div className="grid where-grid">
          {LOCATIONS.map((l, i) => (
            <Reveal className="tile" key={l.id} delay={i * 90}>
              <span className="ico"><Icon name="pin" /></span>
              <h3>{l.name}</h3>
              <p className="muted small">{l.address}</p>
              <p className="muted small">{l.days}</p>
              {l.mapUrl && <p className="small"><a href={l.mapUrl} target="_blank" rel="noreferrer">Open in maps</a></p>}
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section tint" id="love">
        <Reveal className="section-head">
          <span className="eyebrow">Kind words</span>
          <h2>From the chair</h2>
        </Reveal>
        <div className="grid">
          {reviews.map((r, i) => (
            <Reveal className="quote" key={r.id} delay={i * 80}>
              <Stars value={r.rating} />
              <p>“{r.text}”</p>
              <span className="who">{r.name}</span>
            </Reveal>
          ))}
          {reviews.length === 0 && <p className="muted center">No reviews yet — yours could be the first.</p>}
        </div>
        <div className="center" style={{ marginTop: '2.5rem' }}>
          <Link className="btn-link" to="/reviews">Read all reviews · leave yours</Link>
        </div>
      </section>

      <section className="band">
        <span className="eyebrow" style={{ color: 'rgba(246,239,236,.7)' }}>Appointments</span>
        <h2>Ready when you are</h2>
        <p>Choose your salon, pick a time that suits you, and Simona will confirm your place personally.</p>
        <Link className="btn-link primary" to="/book">Book an appointment</Link>
      </section>
    </>
  )
}
