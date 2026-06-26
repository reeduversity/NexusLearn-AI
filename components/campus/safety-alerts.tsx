import { createClient } from '@/lib/supabase/server'
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  Siren,
  Clock,
  CheckCircle2,
  Bell,
} from 'lucide-react'

const severityConfig: Record<
  string,
  {
    icon: typeof ShieldAlert
    bg: string
    border: string
    text: string
    iconColor: string
    badge: string
    badgeText: string
  }
> = {
  emergency: {
    icon: Siren,
    bg: 'bg-red-50 dark:bg-red-900/10',
    border: 'border-red-200 dark:border-red-900/40',
    text: 'text-red-800 dark:text-red-300',
    iconColor: 'text-red-500',
    badge: 'bg-red-100 dark:bg-red-900/30',
    badgeText: 'text-red-700 dark:text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-50 dark:bg-yellow-900/10',
    border: 'border-yellow-200 dark:border-yellow-900/40',
    text: 'text-yellow-800 dark:text-yellow-300',
    iconColor: 'text-yellow-500',
    badge: 'bg-yellow-100 dark:bg-yellow-900/30',
    badgeText: 'text-yellow-700 dark:text-yellow-400',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    border: 'border-blue-200 dark:border-blue-900/40',
    text: 'text-blue-800 dark:text-blue-300',
    iconColor: 'text-blue-500',
    badge: 'bg-blue-100 dark:bg-blue-900/30',
    badgeText: 'text-blue-700 dark:text-blue-400',
  },
}

function getConfig(type: string) {
  return severityConfig[type?.toLowerCase()] || severityConfig.info
}

function getRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default async function SafetyAlerts() {
  const supabase = await createClient()

  const { data: alerts } = await supabase
    .from('safety_alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  const emergencyAlerts = (alerts || []).filter((a) => a.type === 'emergency')
  const warningAlerts = (alerts || []).filter((a) => a.type === 'warning')
  const infoAlerts = (alerts || []).filter((a) => a.type === 'info')

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 px-6 py-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <ShieldAlert className="mr-2 h-5 w-5 text-red-500" />
          Campus Safety Alerts
        </h2>
        <div className="flex items-center space-x-2">
          {emergencyAlerts.length > 0 && (
            <span className="flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              {emergencyAlerts.length} Active
            </span>
          )}
          <button className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Alert Content */}
      <div className="p-6">
        {alerts && alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert: any) => {
              const config = getConfig(alert.type)
              const IconComponent = config.icon

              return (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-4 transition-colors ${config.bg} ${config.border}`}
                >
                  {/* Alert Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <IconComponent className={`h-5 w-5 shrink-0 ${config.iconColor}`} />
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${config.badge} ${config.badgeText}`}
                      >
                        {alert.type}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>{getRelativeTime(alert.created_at)}</span>
                    </div>
                  </div>

                  {/* Alert Content */}
                  <h3 className={`mt-2 font-semibold ${config.text}`}>{alert.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{alert.message}</p>

                  {/* Alert Footer */}
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span>
                      {new Date(alert.created_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {alert.resolved && (
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-900/10">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-green-700 dark:text-green-400">
              All Clear
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              There are no active safety alerts at the moment. Stay safe!
            </p>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {alerts && alerts.length > 0 && (
        <div className="border-t border-gray-200 dark:border-zinc-800 px-6 py-3">
          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <div className="flex items-center space-x-4">
              {emergencyAlerts.length > 0 && (
                <span className="flex items-center">
                  <span className="mr-1 h-2 w-2 rounded-full bg-red-500" />
                  {emergencyAlerts.length} Emergency
                </span>
              )}
              {warningAlerts.length > 0 && (
                <span className="flex items-center">
                  <span className="mr-1 h-2 w-2 rounded-full bg-yellow-500" />
                  {warningAlerts.length} Warning
                </span>
              )}
              {infoAlerts.length > 0 && (
                <span className="flex items-center">
                  <span className="mr-1 h-2 w-2 rounded-full bg-blue-500" />
                  {infoAlerts.length} Info
                </span>
              )}
            </div>
            <span>
              Last updated: {getRelativeTime(alerts[0].created_at)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
