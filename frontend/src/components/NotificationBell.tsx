    import { useEffect, useRef, useState } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { Bell, CheckCheck } from 'lucide-react'
    import api from '../api/axios'

    interface Notification {
    id: number
    message: string
    link: string
    is_read: boolean
    created_at: string
    }

    const POLL_INTERVAL_MS = 20000

    export default function NotificationBell() {
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const unreadCount = notifications.filter((n) => !n.is_read).length

    const fetchNotifications = async () => {
        try {
        const res = await api.get('/notifications/')
        setNotifications(res.data.results || [])
        } catch (err) {
        console.error(err)
        }
    }

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
            setOpen(false)
        }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleNotificationClick = async (n: Notification) => {
        console.log('Notification link:', n.link)   // ADD THIS LINE
        if (!n.is_read) {
        try {
            await api.patch(`/notifications/${n.id}/mark-read/`)
            setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)))
        } catch (err) {
            console.error(err)
        }
        }
        setOpen(false)
        if (n.link) navigate(n.link)
    }

    const handleMarkAllRead = async () => {
        try {
        await api.patch('/notifications/mark-all-read/')
        setNotifications((prev) => prev.map((x) => ({ ...x, is_read: true })))
        } catch (err) {
        console.error(err)
        }
    }

    const timeAgo = (dateStr: string) => {
        const diffMs = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diffMs / 60000)
        if (mins < 1) return 'just now'
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        const days = Math.floor(hrs / 24)
        return `${days}d ago`
    }

    return (
        <div className="relative" ref={containerRef}>
        <button
            onClick={() => setOpen((v) => !v)}
            className="relative text-ink/50 hover:text-primary transition p-2 rounded-lg hover:bg-primary/5"
            aria-label="Notifications"
        >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-danger text-white text-[10px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            )}
        </button>

        {open && (
            <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-surface rounded-2xl shadow-xl border border-black/5 z-[1002] max-h-96 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between shrink-0">
                <p className="text-sm font-semibold text-ink">Notifications</p>
                {unreadCount > 0 && (
                <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
                )}
            </div>

            <div className="overflow-y-auto flex-1">
                {notifications.length === 0 && (
                <p className="text-sm text-ink/40 px-4 py-6 text-center">No notifications yet.</p>
                )}
                {notifications.map((n) => (
                <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left px-4 py-3 border-b border-black/5 last:border-b-0 hover:bg-black/5 transition flex gap-2 items-start ${
                    !n.is_read ? 'bg-primary/5' : ''
                    }`}
                >
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                    <div className={!n.is_read ? '' : 'pl-4'}>
                    <p className="text-sm text-ink leading-snug">{n.message}</p>
                    <p className="text-xs text-ink/40 mt-0.5">{timeAgo(n.created_at)}</p>
                    </div>
                </button>
                ))}
            </div>
            </div>
        )}
        </div>
    )
    }