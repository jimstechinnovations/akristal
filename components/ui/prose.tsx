import { cn } from '@/lib/utils'

/** Long-form text styling (legal pages, articles) without a typography plugin. */
export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'max-w-[70ch] text-[0.9375rem] leading-relaxed text-ink/90',
        '[&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-display-s [&_h2]:font-medium [&_h2]:text-ink first:[&_h2]:mt-0',
        '[&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink',
        '[&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6',
        '[&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-semibold [&_strong]:text-ink',
        className
      )}
    >
      {children}
    </div>
  )
}

export function LegalHeader({ title, updated }: { title: string; updated: string }) {
  return (
    <header className="border-b border-line pb-8">
      <h1 className="font-display text-display-l font-medium">{title}</h1>
      <p className="mt-3 text-sm text-muted">
        Last updated <time dateTime={updated}>{new Date(updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
      </p>
    </header>
  )
}
