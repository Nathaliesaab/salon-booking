/**
 * Single import point for data access. Everything in `pages/` and
 * `components/` talks to this, never to Firestore or the demo store directly,
 * so swapping between them is one flag.
 */
import { configured } from './config'
import * as firestore from './db'
import * as demo from './demoBackend'

const impl = configured ? firestore : demo

export const DEMO = !configured
export const {
  DEFAULT_SCHEDULE,
  watchDay, watchBusy, watchAppointmentsFrom, watchServices, watchSchedule, watchBlackouts,
  loadDayAppointments, loadDayBusy,
  requestAppointment, setAppointmentStatus,
  saveSchedule, saveService, deleteService,
  addBlackout, removeBlackout, isAdmin,
} = impl

export const resetDemo = demo.resetDemo
