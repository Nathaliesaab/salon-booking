import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import Stars from '../components/Stars'
import { PHOTOS } from '../lib/content'
import { watchReviews, watchServices } from '../lib/backend'

const PROMISES = [
  { ico: 'palette', title: 'Colour, mixed for you', text: 'Balayage, roots and gloss formulated against your skin tone and your history — never straight out of a box.' },
  { ico: 'chair', title: 'One guest at a time', text: 'No overlapping chairs and no rushing. The studio is yours from the moment you sit down.' },
  { ico: 'scissors', title: 'An honest consultation', text: 'If a look will not hold on your hair, she will tell you before she picks up the scissors — and offer something that will.' },
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
            <span className="eyebrow">Hair studio · Dubai</span>
            <h1>The quiet luxury of hair that <em>actually suits you</em></h1>
            <p className="lead">
              Belle &amp; Bloom is a single-chair studio for colour, cuts and blow dries.
              One stylist, one guest, and as much time as the work honestly takes.
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
        <figure className="split-photo">
          <img src={PHOTOS.studio} alt="Inside the Belle and Bloom studio" loading="lazy" />
        </figure>
        <div className="split-copy">
          <div className="section-head left">
          <span className="eyebrow">The studio</span>
          <h2>A small room, and <span className="script">very high standards</span></h2>
          <p>
            Belle &amp; Bloom began with one mirror, one chair and a refusal to run three
            heads at once. It is still one stylist keeping her own calendar — which is
            exactly why every appointment gets her whole attention.
            </p>
          </div>
          <ul className="promise-list">
            {PROMISES.map((p) => (
              <li key={p.title}>
                <span className="ico"><Icon name={p.ico} size={22} /></span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="services">
        <div className="section-head">
          <span className="eyebrow">Services</span>
          <h2>The menu</h2>
          <p>
            Prices are a starting point. Hair that is very long, very thick or heavily
            corrected may need more time — she will confirm before anything begins.
          </p>
        </div>
        <div className="menu-list">
          {services.map((s) => (
            <div className="menu-item" key={s.id}>
              <span className="name">
                {s.name}
                <span className="dur">{s.durationMin} minutes</span>
              </span>
              <span className="dots" aria-hidden="true" />
              {s.price && <span className="price">{s.price}</span>}
            </div>
          ))}
          {services.length === 0 && <p className="muted" style={{ paddingTop: '1.4rem' }}>The service menu is being updated — please check back shortly.</p>}
        </div>
        <div className="center" style={{ marginTop: '2.5rem' }}>
          <Link className="btn-link" to="/book">See available times</Link>
        </div>
      </section>

      <section className="section" id="gallery">
        <div className="section-head">
          <span className="eyebrow">The work</span>
          <h2>Recent from the chair</h2>
        </div>
        <div className="gallery">
          {PHOTOS.gallery.map((g) => (
            <figure key={g.src}>
              <img src={g.src} alt={g.alt} loading="lazy" />
            </figure>
          ))}
        </div>
      </section>

      <section className="section tint" id="love">
        <div className="section-head">
          <span className="eyebrow">Kind words</span>
          <h2>From the chair</h2>
        </div>
        <div className="grid">
          {reviews.map((r) => (
            <div className="quote" key={r.id}>
              <Stars value={r.rating} />
              <p>“{r.text}”</p>
              <span className="who">{r.name}</span>
            </div>
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
        <p>Choose a day on the calendar, pick a time that suits you, and she will confirm your place personally.</p>
        <Link className="btn-link primary" to="/book">Book an appointment</Link>
      </section>
    </>
  )
}
