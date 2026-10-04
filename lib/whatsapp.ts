import { site } from '@/config/site'

/** wa.me deep link with a pre-filled message. `number` is digits only, international format. */
export function whatsappLink(message?: string, number: string = site.whatsapp) {
  const digits = number.replace(/\D/g, '')
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${digits}${text}`
}
