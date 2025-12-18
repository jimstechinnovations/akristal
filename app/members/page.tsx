import { MemberCard } from '@/components/member-card'

export const metadata = {
  title: 'Members - TheAkristalGroup',
  description: 'Meet distinguished members and partners of TheAkristalGroup.',
}

const members = [
  {
    name: 'Dr. Valentino Heavens (Ph.D Honoris Causa, B.TECH, DFCILMMD, FIMC, NBDSP, CMS, CMC®, CIL)',
    role: 'Executive Coach & Transformational Leadership Expert',
    imageUrl:
      'https://bhiaowmjscvgxxbiqzhe.supabase.co/storage/v1/object/public/teams/user1.jpg',
    details:
      'Dr. Valentino Heavens is the MD/CEO of Black Belt Global Consulting and the visionary behind the BlackBeltCEO Network. He is a distinguished Executive Coach, Certified Management Consultant (CMC®), and Transformational Leadership Expert with decades of experience empowering businesses and leaders across Africa and beyond. He holds a B.Tech in Computer Science. He is a Fellow of the Institute of Management Consultants (FIMC), Doctoral Research Fellow of The Chartered Institute of Leadership, Manpower and Management Development (DFCILMMD) Nigeria/USA, Certified Management Specialist (CMS) from London Graduate School, a Fellow of The Academy of Management Executives (AME-USA), Faculty Member at Kaduna Business School (Nigeria), and a licensed National BDSP. Dr. Heavens brings an uncommon blend of strategic insight, leadership development, and spiritual clarity to organizational transformation.',
  },
  {
    name: 'Prince Ibunkun Adetayo Oyekunle',
    role: 'Engineer, Developer & Real Estate Innovator',
    imageUrl:
      'https://bhiaowmjscvgxxbiqzhe.supabase.co/storage/v1/object/public/teams/user2.jpg',
    details:
      'Prince Ibunkun Adetayo Oyekunle embodies the synergy between technology and real estate. As a computer/civil engineer and real estate developer, he has carved a unique path that integrates digital innovation with physical development. His work in tech security & guard, home automation, construction, and real estate financing reflects a holistic approach to modern challenges, while his leadership and vision inspire those around him. From his academic roots up to his current stature as a professional of distinction, his journey illustrates the power of versatility, determination, and foresight. In every endeavor, he demonstrates that excellence is not confined to one field but can be achieved across disciplines when driven by passion and purpose. Prince Ibunkun Adetayo Oyekunle is not only a developer and engineer—he is a visionary shaping the future of living and technology.',
  },
]

export default function MembersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Our Members
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Meet the visionary leaders and strategic partners whose expertise, integrity, and innovation
          help shape the future of TheAkristalGroup and the wider real estate ecosystem.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {members.map((member) => (
          <MemberCard key={member.name} member={member} />
        ))}
      </div>
    </div>
  )
}
