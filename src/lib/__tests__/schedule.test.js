import assert from 'node:assert/strict'
import { test } from 'node:test'
import { addMinutes, atTime, buildSlots, findConflicts, overlaps } from '../schedule.js'

const MONDAY = new Date(2026, 7, 24) // 24 Aug 2026 is a Monday
const schedule = {
  slotMinutes: 30,
  leadTimeHours: 0,
  weekly: { 1: [{ start: '09:00', end: '12:00' }] },
}
const early = new Date(2026, 7, 24, 0, 0)

test('back-to-back appointments do not overlap', () => {
  const a = atTime(MONDAY, '09:00')
  assert.equal(overlaps(a, addMinutes(a, 60), addMinutes(a, 60), addMinutes(a, 120)), false)
})

test('partial overlap is caught', () => {
  const a = atTime(MONDAY, '09:00')
  assert.equal(overlaps(a, addMinutes(a, 60), addMinutes(a, 30), addMinutes(a, 90)), true)
})

test('slots stop early enough for the service to finish inside the window', () => {
  const slots = buildSlots({ day: MONDAY, schedule, durationMin: 90, now: early })
  assert.equal(slots.at(-1).start.getHours(), 10)
  assert.equal(slots.at(-1).start.getMinutes(), 30)
})

test('a booked slot blocks every slot it touches', () => {
  const busy = [{ start: atTime(MONDAY, '10:00'), end: atTime(MONDAY, '11:00') }]
  const slots = buildSlots({ day: MONDAY, schedule, busy, durationMin: 60, now: early })
  const free = slots.filter((s) => s.available).map((s) => s.start.getHours() + s.start.getMinutes() / 60)
  assert.deepEqual(free, [9, 11])
})

test('lead time hides slots that are too soon', () => {
  const now = atTime(MONDAY, '08:00')
  const slots = buildSlots({ day: MONDAY, schedule: { ...schedule, leadTimeHours: 2 }, durationMin: 30, now })
  assert.equal(slots.find((s) => s.available).start.getHours(), 10)
})

test('closed days produce no slots', () => {
  const sunday = new Date(2026, 7, 23)
  assert.deepEqual(buildSlots({ day: sunday, schedule, durationMin: 30, now: early }), [])
})

test('findConflicts ignores declined appointments and the appointment itself', () => {
  const candidate = { start: atTime(MONDAY, '10:00'), end: atTime(MONDAY, '11:00') }
  const existing = [
    { id: 'self', status: 'pending', ...candidate },
    { id: 'gone', status: 'declined', ...candidate },
    { id: 'clash', status: 'confirmed', start: atTime(MONDAY, '10:30'), end: atTime(MONDAY, '11:30') },
  ]
  const hits = findConflicts({ id: 'self', ...candidate }, existing, { ignoreId: 'self' })
  assert.deepEqual(hits.map((h) => h.id), ['clash'])
})
