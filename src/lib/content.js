/**
 * Copy and imagery that the stylist will want to change without touching a
 * component. Photographs are hotlinked from Unsplash for now -- drop her own
 * shots into /public and point these at `/photos/...` when they arrive.
 */
const U = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const PHOTOS = {
  hero: U('1522337360788-8b13dee7a37e', 900),
  studio: U('1521590832167-7bcbfaa6381f', 900),
  gallery: [
    { src: U('1562322140-8baeececf3df', 700), alt: 'A stylist finishing a blow dry' },
    { src: U('1519699047748-de8e457a634e', 700), alt: 'Natural curls shaped and defined' },
    { src: U('1580618672591-eb180b1a973f', 700), alt: 'Waves being set with a round brush' },
    { src: U('1595476108010-b4d1f102b1b1', 700), alt: 'A wash and scalp massage at the basin' },
    { src: U('1470259078422-826894b933aa', 700), alt: 'Rose-toned colour in movement' },
    { src: U('1560066984-138dadb4c035', 700), alt: 'The studio between appointments' },
  ],
}

export const CONTACT = {
  phone: '+961 76 449935',
  phoneHref: '+96176449935',
  email: 'hello@belleandbloom.salon',
  address: 'Studio 4, Jumeirah Beach Road, Dubai',
}

export const POLICY = [
  { ico: 'clock', text: 'Cancel at least one day before your appointment.' },
  { ico: 'globe', text: 'Double-check your time zone if you are booking from abroad.' },
  { ico: 'phone', text: `Running late? Let us know in advance on ${CONTACT.phone}.` },
  { ico: 'hourglass', text: 'Arriving more than 20 minutes late means your spot goes to someone else.' },
]
