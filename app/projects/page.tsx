import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils'

type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived' | 'sold_out'

type ProjectRow = {
  id: string
  title: string
  description: string | null
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

export default async function ProjectsPage() {
  const supabase = await createClient()
  const currentUser = await getCurrentUser()
  const isAdmin = currentUser?.profile?.role === 'admin'
  const canCreate = isAdmin // Only admins can create projects for now

  // Fetch projects based on user role
  let projects: ProjectRow[] | null = null

  if (isAdmin) {
    // Admins see all projects including draft and archived
    const { data } = await supabase
      .from('projects')
      .select('id, title, description, created_by, status, type, pre_selling_price, pre_selling_currency, main_price, main_currency, created_at, updated_at')
      .order('created_at', { ascending: false })
    projects = data as ProjectRow[] | null
  } else if (currentUser) {
    // Non-admin logged-in users see all statuses except draft/archived + their own projects (including drafts)
    // Fetch projects that are not draft/archived
    const { data: publicProjects } = await supabase
      .from('projects')
      .select('id, title, description, created_by, status, type, pre_selling_price, pre_selling_currency, main_price, main_currency, created_at, updated_at')
      .not('status', 'eq', 'draft')
      .not('status', 'eq', 'archived')
      .order('created_at', { ascending: false })
    
    // Fetch user's own projects (including drafts/archived)
    const { data: userProjects } = await supabase
      .from('projects')
      .select('id, title, description, created_by, status, type, pre_selling_price, pre_selling_currency, main_price, main_currency, created_at, updated_at')
      .eq('created_by', currentUser.id)
      .order('created_at', { ascending: false })
    
    // Combine and deduplicate by id
    const publicProjectsList = (publicProjects as ProjectRow[] | null) ?? []
    const userProjectsList = (userProjects as ProjectRow[] | null) ?? []
    const projectMap = new Map<string, ProjectRow>()
    
    publicProjectsList.forEach(p => projectMap.set(p.id, p))
    userProjectsList.forEach(p => projectMap.set(p.id, p))
    
    projects = Array.from(projectMap.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  } else {
    // Public users see all statuses except draft and archived
    const { data } = await supabase
      .from('projects')
      .select('id, title, description, created_by, status, type, pre_selling_price, pre_selling_currency, main_price, main_currency, created_at, updated_at')
      .not('status', 'eq', 'draft')
      .not('status', 'eq', 'archived')
      .order('created_at', { ascending: false })
    projects = data as ProjectRow[] | null
  }
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
                  {project.type && (
                    <div className="mb-2">
                      <span className="inline-flex rounded-full bg-[#c89b3c]/20 px-3 py-1 text-xs font-semibold text-[#c89b3c] capitalize">
                        {project.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                    {project.description || 'No description available.'}
                  </p>
                  {(project.pre_selling_price || project.main_price) && (
                    <div className="mb-4 space-y-1">
                      {project.pre_selling_price && (
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Pre-selling: </span>
                          <span className="font-semibold text-[#c89b3c]">
                            {formatCurrency(project.pre_selling_price, project.pre_selling_currency || 'RWF')}
                          </span>
                        </div>
                      )}
                      {project.main_price && (
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Main Price: </span>
                          <span className="font-semibold text-[#c89b3c]">
                            {formatCurrency(project.main_price, project.main_currency || 'RWF')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        project.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : project.status === 'completed'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : project.status === 'sold_out'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {project.status.replace(/_/g, ' ')}
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
