import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { ProjectForm } from '@/components/project-form'

type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived'

type ProjectRow = {
  id: string
  title: string
  description: string | null
  created_by: string
  status: ProjectStatus
  created_at: string
  updated_at: string
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin() // Only admins can edit projects
  const { id } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !project) {
    notFound()
  }

  const typedProject = project as ProjectRow

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Project</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update the details for this project
        </p>
      </div>
      <ProjectForm project={typedProject} />
    </div>
  )
}
