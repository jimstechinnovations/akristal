import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'

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

export default async function ProjectsPage() {
  const supabase = await createClient()
  const currentUser = await getCurrentUser()
  const isAdmin = currentUser?.profile?.role === 'admin'
  const canCreate = isAdmin // Only admins can create projects for now

  // Fetch projects based on user role
  let query = supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (isAdmin) {
    // Admins see all projects
    // No filter needed
  } else if (currentUser) {
    // Non-admin logged-in users see active projects + their own projects
    query = query.or(`status.eq.active,created_by.eq.${currentUser.id}`)
  } else {
    // Public users only see active projects
    query = query.eq('status', 'active')
  }

  const { data: projects } = await query
  const typedProjects = (projects as ProjectRow[] | null) ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Explore our ongoing and completed projects
          </p>
        </div>
        {canCreate && (
          <Link href="/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        )}
      </div>

      {typedProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {typedProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {project.description || 'No description available.'}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        project.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : project.status === 'completed'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {project.status}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">No projects found.</p>
            {canCreate && (
              <Link href="/projects/new" className="mt-4 inline-block">
                <Button>Create Your First Project</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
