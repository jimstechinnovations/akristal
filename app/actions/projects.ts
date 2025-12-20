'use server'

import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { getErrorMessage } from '@/lib/utils'

// Project types (until database types are regenerated)
type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived'
type ScheduleVisibility = 'immediate' | 'scheduled' | 'hidden'

type ProjectType = 'bungalow' | 'duplex' | 'terresse' | 'town_house' | 'apartment' | 'high_rising' | 'block' | 'flat'

type ProjectInsert = {
  title: string
  description?: string | null
  media_urls?: string[]
  created_by: string
  status?: ProjectStatus
  type?: ProjectType | null
  pre_selling_price?: number | null
  pre_selling_currency?: string | null
  main_price?: number | null
  main_currency?: string | null
  created_at?: string
  updated_at?: string
}

type ProjectUpdate = {
  title?: string
  description?: string | null
  media_urls?: string[]
  status?: ProjectStatus
  type?: ProjectType | null
  pre_selling_price?: number | null
  pre_selling_currency?: string | null
  main_price?: number | null
  main_currency?: string | null
  updated_at?: string
}

type ProjectUpdateInsert = {
  project_id: string
  description: string
  media_urls?: string[]
  schedule_visibility?: ScheduleVisibility
  scheduled_at?: string | null
  created_by: string
  created_at?: string
  updated_at?: string
}

type ProjectOfferInsert = {
  project_id: string
  title: string
  description: string
  media_urls?: string[]
  start_datetime: string
  end_datetime: string
  schedule_visibility?: ScheduleVisibility
  scheduled_at?: string | null
  created_by: string
  created_at?: string
  updated_at?: string
}

type ProjectEventInsert = {
  project_id: string
  title: string
  description: string
  media_urls?: string[]
  start_datetime: string
  end_datetime: string
  schedule_visibility?: ScheduleVisibility
  scheduled_at?: string | null
  created_by: string
  created_at?: string
  updated_at?: string
}

export async function createProject(formData: FormData) {
  try {
    const user = await requireRole(['admin'])
    const supabase = await createClient()

    const createdAtStr = formData.get('created_at')
    const createdAt = createdAtStr && createdAtStr !== '' 
      ? new Date(createdAtStr as string).toISOString() 
      : undefined

    const mediaUrlsStr = formData.get('media_urls')
    let mediaUrls: string[] = []
    if (mediaUrlsStr && mediaUrlsStr !== 'null' && mediaUrlsStr !== '') {
      try {
        mediaUrls = JSON.parse(mediaUrlsStr as string)
        if (!Array.isArray(mediaUrls)) {
          console.error('media_urls is not an array:', mediaUrls)
          mediaUrls = []
        }
      } catch (parseError) {
        console.error('Failed to parse media_urls:', parseError, 'Raw value:', mediaUrlsStr)
        mediaUrls = []
      }
    }

    const typeValue = formData.get('type')
    const preSellingPrice = formData.get('pre_selling_price')
    const mainPrice = formData.get('main_price')

    const projectData: ProjectInsert = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
      created_by: user.id,
      status: (formData.get('status') as 'draft' | 'active' | 'completed' | 'archived') || 'draft',
      type: typeValue && typeValue !== '' ? (typeValue as ProjectType) : null,
      pre_selling_price: preSellingPrice && preSellingPrice !== '' ? parseFloat(preSellingPrice as string) : null,
      pre_selling_currency: formData.get('pre_selling_currency') as string || null,
      main_price: mainPrice && mainPrice !== '' ? parseFloat(mainPrice as string) : null,
      main_currency: formData.get('main_currency') as string || null,
      created_at: createdAt,
    }

    type ProjectsInsertClient = {
      from: (table: 'projects') => {
        insert: (values: ProjectInsert) => {
          select: () => {
            single: () => Promise<{
              data: { id: string; title: string; description: string | null; created_by: string; status: ProjectStatus; created_at: string; updated_at: string } | null
              error: { message: string } | null
            }>
          }
        }
      }
    }

    const { data: project, error } = await (supabase as unknown as ProjectsInsertClient)
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (error) throw error

    if (!project) {
      return { success: false, error: 'Failed to create project' }
    }

    revalidatePath('/projects')
    revalidatePath(`/projects/${project.id}`)

    return { success: true, project }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function updateProject(id: string, formData: FormData) {
  try {
    const user = await requireRole(['admin'])
    const supabase = await createClient()

    // Check if user owns the project or is admin
    const { data: existingProject } = await supabase
      .from('projects')
      .select('created_by')
      .eq('id', id)
      .single()

    if (!existingProject) {
      return { success: false, error: 'Project not found' }
    }

    const existingCreator = (existingProject as { created_by: string } | null) ?? null

    if (existingCreator?.created_by !== user.id && user.profile?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const mediaUrlsStr = formData.get('media_urls')
    let mediaUrls: string[] = []
    if (mediaUrlsStr && mediaUrlsStr !== 'null' && mediaUrlsStr !== '') {
      try {
        mediaUrls = JSON.parse(mediaUrlsStr as string)
        if (!Array.isArray(mediaUrls)) {
          console.error('media_urls is not an array:', mediaUrls)
          mediaUrls = []
        }
      } catch (parseError) {
        console.error('Failed to parse media_urls:', parseError, 'Raw value:', mediaUrlsStr)
        mediaUrls = []
      }
    }

    const updateData: ProjectUpdate = {}
    const title = formData.get('title')
    if (typeof title === 'string') updateData.title = title

    const description = formData.get('description')
    if (typeof description === 'string') updateData.description = description || null

    const status = formData.get('status')
    if (typeof status === 'string') {
      updateData.status = status as 'draft' | 'active' | 'completed' | 'archived'
    }

    const type = formData.get('type')
    if (type !== null) {
      updateData.type = type && type !== '' ? (type as ProjectType) : null
    }

    const preSellingPrice = formData.get('pre_selling_price')
    if (preSellingPrice !== null) {
      updateData.pre_selling_price = preSellingPrice && preSellingPrice !== '' ? parseFloat(preSellingPrice as string) : null
      updateData.pre_selling_currency = formData.get('pre_selling_currency') as string || null
    }

    const mainPrice = formData.get('main_price')
    if (mainPrice !== null) {
      updateData.main_price = mainPrice && mainPrice !== '' ? parseFloat(mainPrice as string) : null
      updateData.main_currency = formData.get('main_currency') as string || null
    }
    
    if (mediaUrlsStr !== null) {
      // If media_urls is provided (even if empty), update it
      updateData.media_urls = mediaUrls.length > 0 ? mediaUrls : []
    }

    type ProjectsUpdateClient = {
      from: (table: 'projects') => {
        update: (values: ProjectUpdate) => {
          eq: (column: 'id', value: string) => {
            select: () => {
              single: () => Promise<{
                data: { id: string; title: string; description: string | null; created_by: string; status: ProjectStatus; created_at: string; updated_at: string } | null
                error: { message: string } | null
              }>
            }
          }
        }
      }
    }

    const { data: project, error } = await (supabase as unknown as ProjectsUpdateClient)
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (!project) {
      return { success: false, error: 'Failed to update project' }
    }

    revalidatePath('/projects')
    revalidatePath(`/projects/${id}`)

    return { success: true, project }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteProject(id: string) {
  try {
    // Only admins can delete projects
    await requireRole(['admin'])
    const supabase = await createClient()

    // Check if project exists
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .single()

    if (!existingProject) {
      return { success: false, error: 'Project not found' }
    }

    // Delete project (CASCADE will automatically delete all related records: updates, offers, events)
    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) throw error

    revalidatePath('/projects')
    revalidatePath(`/projects/${id}`)

    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function createProjectUpdate(projectId: string, formData: FormData) {
  try {
    const user = await requireRole(['admin'])
    const supabase = await createClient()

    // Verify project ownership or admin
    const { data: project } = await supabase
      .from('projects')
      .select('created_by')
      .eq('id', projectId)
      .single()

    if (!project) {
      return { success: false, error: 'Project not found' }
    }

    if ((project as any).created_by !== user.id && user.profile?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const mediaUrlsStr = formData.get('media_urls')
    let mediaUrls: string[] = []
    if (mediaUrlsStr && mediaUrlsStr !== 'null' && mediaUrlsStr !== '') {
      try {
        mediaUrls = JSON.parse(mediaUrlsStr as string)
        if (!Array.isArray(mediaUrls)) {
          console.error('media_urls is not an array:', mediaUrls)
          mediaUrls = []
        }
      } catch (parseError) {
        console.error('Failed to parse media_urls:', parseError, 'Raw value:', mediaUrlsStr)
        mediaUrls = []
      }
    }

    console.log('Creating update with media URLs:', mediaUrls)

    const updateData: ProjectUpdateInsert = {
      project_id: projectId,
      description: formData.get('description') as string,
      media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
      schedule_visibility: (formData.get('schedule_visibility') as 'immediate' | 'scheduled' | 'hidden') || 'immediate',
      scheduled_at: formData.get('scheduled_at') ? (formData.get('scheduled_at') as string) : null,
      created_by: user.id,
    }

    console.log('Inserting update data:', { ...updateData, media_urls: mediaUrls })

    const { error } = await (supabase as any).from('project_updates').insert(updateData)

    if (error) throw error

    revalidatePath(`/projects/${projectId}`)

    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function createProjectOffer(projectId: string, formData: FormData) {
  try {
    const user = await requireRole(['admin'])
    const supabase = await createClient()

    // Verify project ownership or admin
    const { data: project } = await supabase
      .from('projects')
      .select('created_by')
      .eq('id', projectId)
      .single()

    if (!project) {
      return { success: false, error: 'Project not found' }
    }

    if ((project as any).created_by !== user.id && user.profile?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

      const mediaUrlsStr = formData.get('media_urls')
      const mediaUrls = mediaUrlsStr && mediaUrlsStr !== 'null' ? JSON.parse(mediaUrlsStr as string) : []

      const offerData: ProjectOfferInsert = {
      project_id: projectId,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
      start_datetime: formData.get('start_datetime') as string,
      end_datetime: formData.get('end_datetime') as string,
      schedule_visibility: (formData.get('schedule_visibility') as 'immediate' | 'scheduled' | 'hidden') || 'immediate',
      scheduled_at: formData.get('scheduled_at') ? (formData.get('scheduled_at') as string) : null,
      created_by: user.id,
    }

    const { error } = await (supabase as any).from('project_offers').insert(offerData)

    if (error) throw error

    revalidatePath(`/projects/${projectId}`)

    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function createProjectEvent(projectId: string, formData: FormData) {
  try {
    const user = await requireRole(['seller', 'agent', 'admin'])
    const supabase = await createClient()

    // Verify project ownership or admin
    const { data: project } = await supabase
      .from('projects')
      .select('created_by')
      .eq('id', projectId)
      .single()

    if (!project) {
      return { success: false, error: 'Project not found' }
    }

    if ((project as any).created_by !== user.id && user.profile?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

      const mediaUrlsStr = formData.get('media_urls')
      let mediaUrls: string[] = []
      if (mediaUrlsStr && mediaUrlsStr !== 'null' && mediaUrlsStr !== '') {
        try {
          mediaUrls = JSON.parse(mediaUrlsStr as string)
          if (!Array.isArray(mediaUrls)) {
            console.error('media_urls is not an array:', mediaUrls)
            mediaUrls = []
          }
        } catch (parseError) {
          console.error('Failed to parse media_urls:', parseError, 'Raw value:', mediaUrlsStr)
          mediaUrls = []
        }
      }

      console.log('Creating event with media URLs:', mediaUrls)

      const eventData: ProjectEventInsert = {
      project_id: projectId,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
      start_datetime: formData.get('start_datetime') as string,
      end_datetime: formData.get('end_datetime') as string,
      schedule_visibility: (formData.get('schedule_visibility') as 'immediate' | 'scheduled' | 'hidden') || 'immediate',
      scheduled_at: formData.get('scheduled_at') ? (formData.get('scheduled_at') as string) : null,
      created_by: user.id,
    }

    const { error } = await (supabase as any).from('project_events').insert(eventData)

    if (error) throw error

    revalidatePath(`/projects/${projectId}`)

    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteProjectUpdate(updateId: string) {
  try {
    const user = await requireRole(['admin'])
    const supabase = await createClient()

    // Check if user owns the update or is admin
    const { data: update } = await supabase
      .from('project_updates')
      .select('created_by, project_id')
      .eq('id', updateId)
      .single()

    if (!update) {
      return { success: false, error: 'Update not found' }
    }

    if ((update as any).created_by !== user.id && user.profile?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const projectId = (update as any).project_id

    const { error } = await supabase.from('project_updates').delete().eq('id', updateId)

    if (error) throw error

    revalidatePath(`/projects/${projectId}`)

    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteProjectOffer(offerId: string) {
  try {
    const user = await requireRole(['admin'])
    const supabase = await createClient()

    // Check if user owns the offer or is admin
    const { data: offer } = await supabase
      .from('project_offers')
      .select('created_by, project_id')
      .eq('id', offerId)
      .single()

    if (!offer) {
      return { success: false, error: 'Offer not found' }
    }

    if ((offer as any).created_by !== user.id && user.profile?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const projectId = (offer as any).project_id

    const { error } = await supabase.from('project_offers').delete().eq('id', offerId)

    if (error) throw error

    revalidatePath(`/projects/${projectId}`)

    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteProjectEvent(eventId: string) {
  try {
    const user = await requireRole(['admin'])
    const supabase = await createClient()

    // Check if user owns the event or is admin
    const { data: event } = await supabase
      .from('project_events')
      .select('created_by, project_id')
      .eq('id', eventId)
      .single()

    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    if ((event as any).created_by !== user.id && user.profile?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const projectId = (event as any).project_id

    const { error } = await supabase.from('project_events').delete().eq('id', eventId)

    if (error) throw error

    revalidatePath(`/projects/${projectId}`)

    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}
