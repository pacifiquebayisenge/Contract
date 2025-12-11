import { format, formatDistance, formatRelative } from 'date-fns'
import { enGB } from 'date-fns/locale'

export function formatDate(dateString: string): string {
	return format(new Date(dateString), 'EEE, d MMMM yyyy', { locale: enGB })
	// Output: Thu, 11 December 2025
}

export function formatDateTime(dateString: string): string {
	return format(new Date(dateString), 'EEE, d MMMM yyyy HH:mm')
	// Output: Thu, 11 December 2025 01:09
}

export function formatTimeAgo(dateString: string): string {
	return formatDistance(new Date(dateString), new Date(), { addSuffix: true })
	// Output: 5 minutes ago / 2 days ago / about 1 month ago
}
