import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getWorkspace } from '../lib/demoApi'

interface NavItem {
  label: string
  path: string
}

export default function DevNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [items, setItems] = useState<NavItem[]>([
    { label: 'Home', path: '/demo' },
    { label: 'Create', path: '/create' },
  ])

  useEffect(() => {
    getWorkspace().then((ws: any) => {
      const active   = ws.proposals.filter((p: any) => p.status === 'active')
      const activated = ws.proposals.find((p: any)  => p.status === 'activated')
      const expired   = ws.proposals.find((p: any)  => p.status === 'expired')

      const next: NavItem[] = [{ label: 'Home', path: '/demo' }]
      if (active[0]) next.push({ label: 'Detail',    path: `/demo/proposal/${active[0].id}` })
      if (active[1]) next.push({ label: 'Detail 2',  path: `/demo/proposal/${active[1].id}` })
      if (activated) next.push({ label: 'Activated',  path: `/demo/proposal/${activated.id}` })
      if (expired)   next.push({ label: 'Expired',    path: `/demo/proposal/${expired.id}`   })
      next.push({ label: 'Create', path: '/create' })

      setItems(next)
    }).catch(() => {})
  }, [])

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      zIndex: 100,
      maxWidth: 360,
      justifyContent: 'flex-end',
    }}>
      {items.map(item => {
        const isCurrent = pathname === item.path
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            onMouseEnter={e => {
              if (!isCurrent) {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--cream)'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--cream-dim)'
              }
            }}
            onMouseLeave={e => {
              if (!isCurrent) {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--cream-dim)'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-mid)'
              }
            }}
            style={{
              padding: '6px 12px',
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: '.65rem',
              fontWeight: 600,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              background: isCurrent ? 'var(--green)' : 'var(--surface)',
              color: isCurrent ? 'var(--bg)' : 'var(--cream-dim)',
              border: `1px solid ${isCurrent ? 'var(--green)' : 'var(--border-mid)'}`,
              cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
