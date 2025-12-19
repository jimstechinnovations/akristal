import { requireAdmin } from '@/lib/auth'
import { ProjectForm } from '@/components/project-form'

export default async function NewProjectPage() {
  await requireAdmin()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Project</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Start a new project to share updates, offers, and events
        </p>
      </div>
      <ProjectForm />
    </div>
  )
}
