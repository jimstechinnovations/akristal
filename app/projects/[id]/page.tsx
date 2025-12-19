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

type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived'
type ScheduleVisibility = 'immediate' | 'scheduled' | 'hidden'

type ProjectRow = {
  id: string
  title: string
  description: string | null
  created_by: string
  status: ProjectStatus
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

  // Fetch project
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !project) {
    notFound()
  }

  const typedProject = project as ProjectRow

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

  const typedUpdates = (updates as ProjectUpdateRow[] | null) ?? []
  const typedOffers = (offers as ProjectOfferRow[] | null) ?? []
  const typedEvents = (events as ProjectEventRow[] | null) ?? []

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{typedProject.title}</h1>
          <div className="mt-2 flex items-center space-x-4">
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
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Created {new Date(typedProject.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        {canEdit && (
          <Link href={`/projects/${id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Project
            </Button>
          </Link>
        )}
      </div>

      {typedProject.description && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {typedProject.description}
            </p>
          </CardContent>
        </Card>
      )}

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
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap flex-1">
                      {update.description}
                    </p>
                    {canEdit && (
                      <div className="flex-shrink-0">
                        <DeleteProjectItemButton itemId={update.id} itemType="update" />
                      </div>
                    )}
                  </div>
                  {update.media_urls && Array.isArray(update.media_urls) && update.media_urls.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-4">
                      {update.media_urls.map((url, idx) => (
                        <div key={idx} className="relative h-48 w-full overflow-hidden rounded-lg">
                          {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <Image src={url} alt={`Update media ${idx + 1}`} fill className="object-cover" />
                          ) : (
                            <video src={url} controls className="h-full w-full object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-gray-900 dark:text-white">{offer.title}</CardTitle>
                    {canEdit && <DeleteProjectItemButton itemId={offer.id} itemType="offer" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                    {offer.description}
                  </p>
                  {offer.media_urls && Array.isArray(offer.media_urls) && offer.media_urls.length > 0 && (
                    <div className="mb-4">
                      <div className="relative h-32 w-full overflow-hidden rounded-lg">
                        {offer.media_urls[0].match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <Image
                            src={offer.media_urls[0]}
                            alt={offer.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <video src={offer.media_urls[0]} controls className="h-full w-full object-cover" />
                        )}
                      </div>
                    </div>
                  )}
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
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-gray-900 dark:text-white">{event.title}</CardTitle>
                    {canEdit && <DeleteProjectItemButton itemId={event.id} itemType="event" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                    {event.description}
                  </p>
                  {event.media_urls && Array.isArray(event.media_urls) && event.media_urls.length > 0 && (
                    <div className="mb-4">
                      <div className="relative h-32 w-full overflow-hidden rounded-lg">
                        {event.media_urls[0].match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <Image
                            src={event.media_urls[0]}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <video src={event.media_urls[0]} controls className="h-full w-full object-cover" />
                        )}
                      </div>
                    </div>
                  )}
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
