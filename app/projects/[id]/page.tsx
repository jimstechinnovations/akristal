import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { Edit, Calendar, Tag, Image as ImageIcon, Video } from 'lucide-react'
import Image from 'next/image'
import { ProjectManagementTabs } from '@/components/project-management-tabs'
import { DeleteProjectItemButton } from '@/components/delete-project-item-button'
import { DeleteProjectButton } from '@/components/delete-project-button'
import { formatCurrency } from '@/lib/utils'

type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived'
type ScheduleVisibility = 'immediate' | 'scheduled' | 'hidden'

type ProjectRow = {
  id: string
  title: string
  description: string | null
  media_urls: string[] | null
  created_by: string
  status: ProjectStatus
  type?: string | null
  pre_selling_price?: number | null
  pre_selling_currency?: string | null
  main_price?: number | null
  main_currency?: string | null
  created_at: string
  updated_at: string
}

type ProjectUpdateRow = {
  id: string
  project_id: string
  description: string
  media_urls: string[] | null
  schedule_visibility: ScheduleVisibility
  scheduled_at: string | null
  created_by: string
  created_at: string
  updated_at: string
}

type ProjectOfferRow = {
  id: string
  project_id: string
  title: string
  description: string
  media_urls: string[] | null
  start_datetime: string
  end_datetime: string
  schedule_visibility: ScheduleVisibility
  scheduled_at: string | null
  created_by: string
  created_at: string
  updated_at: string
}

type ProjectEventRow = {
  id: string
  project_id: string
  title: string
  description: string
  media_urls: string[] | null
  start_datetime: string
  end_datetime: string
  schedule_visibility: ScheduleVisibility
  scheduled_at: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const id = resolvedParams.id
  const supabase = await createClient()
  const currentUser = await getCurrentUser()
  const isAdmin = currentUser?.profile?.role === 'admin'

  // Fetch project (explicitly include media_urls to ensure it's selected)
  const { data: project, error } = await supabase
    .from('projects')
    .select('id, title, description, media_urls, created_by, status, type, pre_selling_price, pre_selling_currency, main_price, main_currency, created_at, updated_at')
    .eq('id', id)
    .single()

  if (error || !project) {
    notFound()
  }

  const typedProject = project as ProjectRow

  // Parse media_urls if they come as strings (PostgreSQL TEXT[] can sometimes be returned as string)
  const parseMediaUrls = (mediaUrls: any): string[] | null => {
    if (!mediaUrls) return null
    if (Array.isArray(mediaUrls)) {
      // Filter out any null/undefined values and ensure all are strings
      const filtered = mediaUrls.filter((url): url is string => typeof url === 'string' && url.length > 0)
      return filtered.length > 0 ? filtered : null
    }
    if (typeof mediaUrls === 'string') {
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(mediaUrls)
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((url): url is string => typeof url === 'string' && url.length > 0)
          return filtered.length > 0 ? filtered : null
        }
      } catch {
        // If JSON parsing fails, it might be a single URL string
        if (mediaUrls.trim().length > 0) {
          return [mediaUrls.trim()]
        }
      }
    }
    return null
  }

  // Parse project media_urls
  // First check raw data from database
  const rawMediaUrls = (project as any).media_urls
  console.log('Raw media_urls from DB:', rawMediaUrls, 'Type:', typeof rawMediaUrls)
  
  typedProject.media_urls = parseMediaUrls(rawMediaUrls)
  
  // Debug: Log to help diagnose issues
  console.log('Parsed media URLs:', typedProject.media_urls)

  // Check if user can view this project
  const canView =
    typedProject.status === 'active' ||
    currentUser?.id === typedProject.created_by ||
    isAdmin

  if (!canView) {
    notFound()
  }

  const canEdit = isAdmin // Only admins can edit projects for now

  // Fetch all updates (RLS will filter visible ones for public, all for owners/admins)
  const { data: updates } = await supabase
    .from('project_updates')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  // Fetch all offers (RLS will filter visible ones for public, all for owners/admins)
  const { data: offers } = await supabase
    .from('project_offers')
    .select('*')
    .eq('project_id', id)
    .order('start_datetime', { ascending: true })

  // Fetch all events (RLS will filter visible ones for public, all for owners/admins)
  const { data: events } = await supabase
    .from('project_events')
    .select('*')
    .eq('project_id', id)
    .order('start_datetime', { ascending: true })

  const typedUpdates = ((updates as ProjectUpdateRow[] | null) ?? []).map((update) => ({
    ...update,
    media_urls: parseMediaUrls(update.media_urls),
  }))
  const typedOffers = ((offers as ProjectOfferRow[] | null) ?? []).map((offer) => ({
    ...offer,
    media_urls: parseMediaUrls(offer.media_urls),
  }))
  const typedEvents = ((events as ProjectEventRow[] | null) ?? []).map((event) => ({
    ...event,
    media_urls: parseMediaUrls(event.media_urls),
  }))

  // Filter visible content for public view
  const now = new Date()
  const visibleUpdates = canEdit
    ? typedUpdates
    : typedUpdates.filter(
        (update) =>
          update.schedule_visibility === 'immediate' ||
          (update.schedule_visibility === 'scheduled' &&
            update.scheduled_at &&
            new Date(update.scheduled_at) <= now)
      )

  const visibleOffers = canEdit
    ? typedOffers
    : typedOffers.filter(
        (offer) =>
          (offer.schedule_visibility === 'immediate' ||
            (offer.schedule_visibility === 'scheduled' &&
              offer.scheduled_at &&
              new Date(offer.scheduled_at) <= now)) &&
          new Date(offer.start_datetime) <= now &&
          new Date(offer.end_datetime) >= now
      )

  const visibleEvents = canEdit
    ? typedEvents
    : typedEvents.filter(
        (event) =>
          event.schedule_visibility === 'immediate' ||
          (event.schedule_visibility === 'scheduled' &&
            event.scheduled_at &&
            new Date(event.scheduled_at) <= now)
      )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">{typedProject.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                typedProject.status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : typedProject.status === 'completed'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {typedProject.status}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Created {new Date(typedProject.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2 flex-shrink-0">
            <Link href={`/projects/${id}/edit`} className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full sm:w-auto">
                <Edit className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Edit Project</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            </Link>
            <div className="flex-shrink-0">
            <DeleteProjectButton projectId={id} />
            </div>
          </div>
        )}
      </div>

      {typedProject.media_urls && Array.isArray(typedProject.media_urls) && typedProject.media_urls.length > 0 && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {typedProject.media_urls.map((url, idx) => {
                if (!url || typeof url !== 'string') return null
                const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                return (
                  <div key={idx} className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    {isImage ? (
                      <Image 
                        src={url} 
                        alt={`Project media ${idx + 1}`} 
                        fill 
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <video src={url} controls className="h-full w-full object-cover" />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Details */}
        <Card className="mb-8">
          <CardContent className="pt-6">
          <div className="space-y-4">
            {typedProject.type && (
              <div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Type: </span>
                <span className="text-sm text-gray-900 dark:text-white capitalize">
                  {typedProject.type.replace(/_/g, ' ')}
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {typedProject.pre_selling_price && (
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Pre-selling Price: </span>
                  <span className="text-lg font-bold text-[#c89b3c]">
                    {formatCurrency(typedProject.pre_selling_price, typedProject.pre_selling_currency || 'RWF')}
                  </span>
                </div>
              )}
              {typedProject.main_price && (
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Main Price: </span>
                  <span className="text-lg font-bold text-[#c89b3c]">
                    {formatCurrency(typedProject.main_price, typedProject.main_currency || 'RWF')}
                  </span>
                </div>
              )}
            </div>
            {typedProject.description && (
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {typedProject.description}
            </p>
              </div>
            )}
          </div>
          </CardContent>
        </Card>

      {/* Management Forms (only for admins) */}
      {canEdit && <ProjectManagementTabs projectId={id} />}

      {/* Updates Section */}
      {visibleUpdates.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">Updates</h2>
          <div className="space-y-4">
            {visibleUpdates.map((update) => (
              <Card key={update.id}>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    {canEdit && (
                      <div className="flex-shrink-0">
                        <DeleteProjectItemButton itemId={update.id} itemType="update" />
                      </div>
                    )}
                  </div>
                  {update.media_urls && Array.isArray(update.media_urls) && update.media_urls.length > 0 && (
                    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {update.media_urls.map((url, idx) => {
                        if (!url || typeof url !== 'string') return null
                        const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                        return (
                          <div key={idx} className="relative h-48 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                            {isImage ? (
                              <Image 
                                src={url} 
                                alt={`Update media ${idx + 1}`} 
                                fill 
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <video src={url} controls className="h-full w-full object-cover" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">
                    {update.description}
                  </p>
                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(update.created_at).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Offers Section */}
      {visibleOffers.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">Current Offers</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleOffers.map((offer) => (
              <Card key={offer.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-gray-900 dark:text-white flex-1 min-w-0 break-words">{offer.title}</CardTitle>
                    {canEdit && <div className="flex-shrink-0"><DeleteProjectItemButton itemId={offer.id} itemType="offer" /></div>}
                  </div>
                </CardHeader>
                <CardContent>
                  {offer.media_urls && Array.isArray(offer.media_urls) && offer.media_urls.length > 0 && offer.media_urls[0] && (
                    <div className="mb-4">
                      <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                        {offer.media_urls[0].match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <Image
                            src={offer.media_urls[0]}
                            alt={offer.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <video src={offer.media_urls[0]} controls className="h-full w-full object-cover" />
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                    {offer.description}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(offer.start_datetime).toLocaleDateString()} -{' '}
                      {new Date(offer.end_datetime).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Events Section */}
      {visibleEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">Upcoming Events</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-gray-900 dark:text-white flex-1 min-w-0 break-words">{event.title}</CardTitle>
                    {canEdit && <div className="flex-shrink-0"><DeleteProjectItemButton itemId={event.id} itemType="event" /></div>}
                  </div>
                </CardHeader>
                <CardContent>
                  {event.media_urls && Array.isArray(event.media_urls) && event.media_urls.length > 0 && event.media_urls[0] && (
                    <div className="mb-4">
                      <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                        {event.media_urls[0].match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <Image
                            src={event.media_urls[0]}
                            alt={event.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <video src={event.media_urls[0]} controls className="h-full w-full object-cover" />
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                    {event.description}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(event.start_datetime).toLocaleString()} -{' '}
                      {new Date(event.end_datetime).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {visibleUpdates.length === 0 && visibleOffers.length === 0 && visibleEvents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {canEdit
                ? 'No updates, offers, or events for this project yet. Use the forms above to add content.'
                : 'No updates, offers, or events available for this project yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
