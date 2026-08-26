/**
 * Copy and imagery that Simona will want to change without touching a
 * component. Photographs are hotlinked from Unsplash for now -- drop her own
 * shots into /public and point these at `/photos/...` when they arrive.
 */
const U = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

/** Her name and how the site signs itself. */
export const BRAND = {
  name: 'Hair by Simona',
  first: 'Simona',
  city: 'Dubai',
}

/**
 * The two salons she works out of. The client picks one when booking, and the
 * choice is carried onto the request, the day view and the log so she knows
 * where to be. Her calendar is deliberately shared across both -- a time taken
 * at one salon is taken at the other, which is what stops her being booked in
 * two places at once.
 *
 * To change a salon: edit the name, address and `days` line below. `days` is
 * plain text shown to clients, not a rule -- the booking calendar is the
 * single source of truth for when she is free.
 */
export const LOCATIONS = [
  {
    id: 'salon-one',
    name: 'Salon One',
    address: 'Studio 4, Jumeirah Beach Road, Dubai',
    days: 'Usually Monday to Wednesday',
    mapUrl: 'https://maps.google.com/?q=Jumeirah+Beach+Road+Dubai',
  },
  {
    id: 'salon-two',
    name: 'Salon Two',
    address: 'Al Wasl Road, Dubai',
    days: 'Usually Thursday to Saturday',
    mapUrl: 'https://maps.google.com/?q=Al+Wasl+Road+Dubai',
  },
]

export const findLocation = (id) => LOCATIONS.find((l) => l.id === id) ?? null

export const PHOTOS = {
  hero: U('1522337360788-8b13dee7a37e', 900),
  studio: U('1521590832167-7bcbfaa6381f', 900),
  gallery: [
    { src: U('1562322140-8baeececf3df', 700), alt: 'Simona finishing a blow dry' },
    { src: U('1519699047748-de8e457a634e', 700), alt: 'Natural curls shaped and defined' },
    { src: U('1580618672591-eb180b1a973f', 700), alt: 'Waves being set with a round brush' },
    { src: U('1595476108010-b4d1f102b1b1', 700), alt: 'A wash and scalp massage at the basin' },
    { src: U('1470259078422-826894b933aa', 700), alt: 'Rose-toned colour in movement' },
    { src: U('1560066984-138dadb4c035', 700), alt: 'The chair between appointments' },
  ],
}

export const CONTACT = {
  phone: '+961 76 449935',
  phoneHref: '+96176449935',
  email: 'hello@hairbysimona.com',
}

export const POLICY = [
  { ico: 'pin', text: 'Check which salon your appointment is at — she moves between two.' },
  { ico: 'clock', text: 'Cancel at least one day before your appointment.' },
  { ico: 'globe', text: 'Double-check your time zone if you are booking from abroad.' },
  { ico: 'phone', text: `Running late? Let Simona know in advance on ${CONTACT.phone}.` },
  { ico: 'hourglass', text: 'Arriving more than 20 minutes late means your spot goes to someone else.' },
]
