'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'

interface Member {
  name: string
  role: string
  imageUrl: string
  details: string
}

interface MemberCardProps {
  member: Member
}

export function MemberCard({ member }: MemberCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <Card className="overflow-hidden border border-gray-200/70 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
      <div className="flex flex-col h-full">
        <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-900 md:h-60">
          <Image
            src={imageError ? '/user-placeholder.svg' : member.imageUrl}
            alt={member.name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain object-top"
            onError={() => setImageError(true)}
          />
        </div>
        <CardContent className="flex flex-1 flex-col space-y-3 p-5 sm:p-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              {member.name}
            </h2>
            <p className="mt-1 text-xs sm:text-sm font-medium uppercase tracking-wide text-blue-600 dark:text-blue-300">
              {member.role}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {member.details}
          </p>
        </CardContent>
      </div>
    </Card>
  )
}
