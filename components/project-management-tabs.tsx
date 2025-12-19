'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProjectUpdateForm } from '@/components/project-update-form'
import { ProjectOfferForm } from '@/components/project-offer-form'
import { ProjectEventForm } from '@/components/project-event-form'
import { FileText, Tag, Calendar } from 'lucide-react'

type TabType = 'update' | 'offer' | 'event'

interface ProjectManagementTabsProps {
  projectId: string
}

export function ProjectManagementTabs({ projectId }: ProjectManagementTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('update')

  const tabs = [
    { id: 'update' as TabType, label: 'Add Update', icon: FileText },
    { id: 'offer' as TabType, label: 'Add Offer', icon: Tag },
    { id: 'event' as TabType, label: 'Add Event', icon: Calendar },
  ]

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">Manage Content</h2>
      
      {/* Tab Buttons */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Active Form */}
      <div>
        {activeTab === 'update' && <ProjectUpdateForm projectId={projectId} />}
        {activeTab === 'offer' && <ProjectOfferForm projectId={projectId} />}
        {activeTab === 'event' && <ProjectEventForm projectId={projectId} />}
      </div>
    </div>
  )
}
