import StatusPill from './StatusPill'
import { formatTime, formatDayLong } from '../lib/schedule'

export default function AppointmentRow({ appt, showDate = false, actions = null }) {
  return (
    <div className="appt">
      <div className="when">
        {showDate && <div className="small muted">{formatDayLong(appt.start)}</div>}
        {formatTime(appt.start)}
        <div className="small muted">{formatTime(appt.end)}</div>
      </div>
      <div className="who">
        <strong>{appt.clientName}</strong> <StatusPill status={appt.status} />
        <div className="meta">
          {appt.serviceName} · {appt.durationMin} min
          {appt.price ? ` · ${appt.price}` : ''}
        </div>
        {appt.clientPhone && <div className="meta">{appt.clientPhone}</div>}
        {appt.notes && <div className="meta">“{appt.notes}”</div>}
        {actions && <div className="row" style={{ marginTop: '.5rem' }}>{actions}</div>}
      </div>
    </div>
  )
}
