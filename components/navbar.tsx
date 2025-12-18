'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'
import type { Database } from '@/types/database'
import type { LucideIcon } from 'lucide-react'
import {
  Moon,
  Sun,
  Menu,
  X,
  Home,
  Search,
  MessageSquare,
  LayoutDashboard,
  Heart,
  List,
  Plus,
  Tags,
  Users,
  CreditCard,
  Briefcase,
  LogOut,
  LogIn,
  UserPlus,
  ChevronDown,
  User,
  Settings,
} from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']

type AuthUser = {
  id: string
  email?: string
  profile: Profile | null
}

type NavLink = { href: string; label: string; icon: LucideIcon }

export function Navbar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [propertiesDropdownOpen, setPropertiesDropdownOpen] = useState(false)
  const [listingDropdownOpen, setListingDropdownOpen] = useState(false)
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const supabase = createClient()

  // Ensure component is mounted before rendering theme-dependent content
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function getUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        // If profile is missing/unavailable, keep the auth user so we still render "signed-in" UI.
        setUser({
          id: authUser.id,
          email: authUser.email ?? undefined,
          profile: profile ?? null,
        })
      } else {
        setUser(null)
      }
    }
    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      getUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  const role: Profile['role'] | undefined = user?.profile?.role

  const getDashboardLink = (r?: Profile['role']) => {
    if (r === 'admin') return '/admin'
    if (r === 'seller') return '/seller/dashboard'
    if (r === 'agent') return '/agent/dashboard'
    if (r === 'buyer') return '/buyer/dashboard'
    return '/dashboard'
  }

  const getDashboardLabel = (r?: Profile['role']) => {
    if (r === 'admin') return 'Admin'
    if (r === 'seller') return 'Seller Dashboard'
    if (r === 'agent') return 'Agent Dashboard'
    if (r === 'buyer') return 'Buyer Dashboard'
    return 'Dashboard'
  }

  const navLinks: NavLink[] = []

  // Only show Home for non-authenticated users
  if (!user) {
    navLinks.push({ href: '/', label: 'Home', icon: Home })
  }

  // Dedicated Services page
  navLinks.push({ href: '/services', label: 'Services', icon: Briefcase })

  if (user) {
    if (role === 'buyer') {
      navLinks.push({ href: '/buyer/dashboard', label: 'Dashboard', icon: LayoutDashboard })
      navLinks.push({ href: '/buyer/favorites', label: 'Favorites', icon: Heart })
      navLinks.push({ href: '/messages', label: 'Messages', icon: MessageSquare })
    } else if (role === 'seller') {
      navLinks.push({ href: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard })
      // Listing dropdown will be rendered separately
      navLinks.push({ href: '/messages', label: 'Messages', icon: MessageSquare })
    } else if (role === 'agent') {
      navLinks.push({ href: '/agent/dashboard', label: 'Dashboard', icon: LayoutDashboard })
      // Listing dropdown will be rendered separately
    } else if (role === 'admin') {
      navLinks.push({ href: '/admin', label: 'Admin', icon: LayoutDashboard })
      // Admin management links will be in a dropdown
      navLinks.push({ href: '/messages', label: 'Messages', icon: MessageSquare })
    } else {
      navLinks.push({
        href: getDashboardLink(role),
        label: getDashboardLabel(role),
        icon: LayoutDashboard,
      })
    }
  }

  // Get listing links based on role
  const getListingLinks = () => {
    if (role === 'seller') {
      return [
        { href: '/seller/properties', label: 'My Listings', icon: List },
        { href: '/seller/properties/new', label: 'New Listing', icon: Plus },
      ]
    } else if (role === 'agent') {
      return [
        { href: '/agent/properties', label: 'My Listings', icon: List },
        { href: '/seller/properties/new', label: 'New Listing', icon: Plus },
      ]
    }
    return []
  }

  // Get admin management links
  const getAdminLinks = () => {
    if (role === 'admin') {
      return [
        { href: '/admin/properties', label: 'Properties', icon: List },
        { href: '/admin/categories', label: 'Categories', icon: Tags },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/payments', label: 'Payments', icon: CreditCard },
      ]
    }
    return []
  }

  const listingLinks = getListingLinks()
  const hasListingDropdown = listingLinks.length > 0
  const adminLinks = getAdminLinks()
  const hasAdminDropdown = adminLinks.length > 0

  // Properties dropdown links (role-aware)
  const propertiesLinks: NavLink[] =
    role === 'admin'
      ? [
          { href: '/properties', label: 'General', icon: Search },
          { href: '/admin/properties', label: 'Own', icon: List },
        ]
      : [
          { href: '/properties', label: 'General', icon: Search },
          { href: '/adminProperties', label: 'Admin', icon: List },
        ]

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  // Get user initial from name or email
  const getUserInitial = () => {
    if (user?.profile?.full_name) {
      const names = user.profile.full_name.trim().split(' ')
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase()
      }
      return names[0][0].toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  // Get role display name
  const getRoleDisplayName = (r?: Profile['role']) => {
    if (r === 'admin') return 'Administrator'
    if (r === 'seller') return 'Seller'
    if (r === 'agent') return 'Agent'
    if (r === 'buyer') return 'Buyer'
    return 'User'
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white text-gray-900 dark:border-slate-800 dark:bg-[#0f172a] dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/Akristal-svg.svg"
                alt="TheAkristalGroup logo"
                width={32}
                height={32}
                className="h-8 w-8 sm:h-9 sm:w-9"
                priority
              />
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  TheAkristalGroup
                </span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 -mt-1">
                  REDEFINING REAL ESTATE
                </span>
              </div>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-4 md:items-center">
              {/* Main nav links (excluding Properties, which has its own dropdown) */}
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isLinkActive(link.href)
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}

              {/* Properties Dropdown (General vs Admin/Own) */}
              <div className="relative">
                <button
                  onClick={() => setPropertiesDropdownOpen(!propertiesDropdownOpen)}
                  className={`flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    propertiesLinks.some((link) => isLinkActive(link.href))
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <Search className="h-4 w-4" />
                  <span>Properties</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      propertiesDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {propertiesDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setPropertiesDropdownOpen(false)}
                    />
                    <div className="absolute left-0 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700 z-20">
                      <div className="py-1">
                        {propertiesLinks.map((link) => {
                          const Icon = link.icon
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setPropertiesDropdownOpen(false)}
                              className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                                isLinkActive(link.href)
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{link.label}</span>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Listing Dropdown for Seller/Agent */}
              {hasListingDropdown && (
                <div className="relative">
                  <button
                    onClick={() => setListingDropdownOpen(!listingDropdownOpen)}
                    className={`flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      listingLinks.some((link) => isLinkActive(link.href))
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    <List className="h-4 w-4" />
                    <span>Listing</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        listingDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {listingDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setListingDropdownOpen(false)}
                      />
                      <div className="absolute left-0 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700 z-20">
                        <div className="py-1">
                          {listingLinks.map((link) => {
                            const Icon = link.icon
                            return (
                              <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setListingDropdownOpen(false)}
                                className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                                  isLinkActive(link.href)
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                                <span>{link.label}</span>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Admin Management Dropdown */}
              {hasAdminDropdown && (
                <div className="relative">
                  <button
                    onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                    className={`flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      adminLinks.some((link) => isLinkActive(link.href))
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>Manage</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        adminDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {adminDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setAdminDropdownOpen(false)}
                      />
                      <div className="absolute left-0 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700 z-20">
                        <div className="py-1">
                          {adminLinks.map((link) => {
                            const Icon = link.icon
                            return (
                              <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setAdminDropdownOpen(false)}
                                className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                                  isLinkActive(link.href)
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                                <span>{link.label}</span>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-semibold text-sm"
                    aria-label="Profile menu"
                  >
                    {getUserInitial()}
                  </button>

                  {profileDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setProfileDropdownOpen(false)}
                      />
                      <div className="fixed left-1/2 top-16 -translate-x-1/2 w-64 max-w-[90vw] lg:absolute lg:top-auto lg:left-auto lg:right-0 lg:translate-x-0 lg:max-w-none mt-2 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700 z-20">
                        <div className="py-2">
                          {/* User Info */}
                          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-semibold">
                                {getUserInitial()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                  {user.profile?.full_name || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {user.email}
                                </p>
                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">
                                  {getRoleDisplayName(role)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <Link
                            href={getDashboardLink(role)}
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            <span>{getDashboardLabel(role)}</span>
                          </Link>

                          <Link
                            href="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                          >
                            <User className="h-4 w-4" />
                            <span>View Profile</span>
                          </Link>

                          <Link
                            href="/settings"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                          </Link>

                          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false)
                              handleSignOut()
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    Log In
                  </Button>
                  <Button variant="ghost" size="sm" className="sm:hidden" aria-label="Log in">
                    <LogIn className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="hidden sm:flex">
                    Sign Up
                  </Button>
                  <Button size="sm" className="sm:hidden" aria-label="Sign up">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}

            <button
              className="md:hidden rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="md:hidden border-t border-gray-200 dark:border-slate-800">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 rounded-md px-3 py-2 text-base font-medium ${
                    isLinkActive(link.href)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              )
            })}

            {/* Mobile Properties Dropdown */}
            <div>
              <button
                onClick={() => setPropertiesDropdownOpen(!propertiesDropdownOpen)}
                className={`flex items-center justify-between w-full rounded-md px-3 py-2 text-base font-medium ${
                  propertiesLinks.some((link) => isLinkActive(link.href))
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Properties</span>
                </div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    propertiesDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {propertiesDropdownOpen && (
                <div className="pl-6 mt-1 space-y-1">
                  {propertiesLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => {
                          setMobileMenuOpen(false)
                          setPropertiesDropdownOpen(false)
                        }}
                        className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium ${
                          isLinkActive(link.href)
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{link.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Mobile Listing Dropdown */}
            {hasListingDropdown && (
              <div>
                <button
                  onClick={() => setListingDropdownOpen(!listingDropdownOpen)}
                  className={`flex items-center justify-between w-full rounded-md px-3 py-2 text-base font-medium ${
                    listingLinks.some((link) => isLinkActive(link.href))
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <List className="h-5 w-5" />
                    <span>Listing</span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      listingDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {listingDropdownOpen && (
                  <div className="pl-6 mt-1 space-y-1">
                    {listingLinks.map((link) => {
                      const Icon = link.icon
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => {
                            setMobileMenuOpen(false)
                            setListingDropdownOpen(false)
                          }}
                          className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium ${
                            isLinkActive(link.href)
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{link.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Mobile Admin Dropdown */}
            {hasAdminDropdown && (
              <div>
                <button
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  className={`flex items-center justify-between w-full rounded-md px-3 py-2 text-base font-medium ${
                    adminLinks.some((link) => isLinkActive(link.href))
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Manage</span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      adminDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {adminDropdownOpen && (
                  <div className="pl-6 mt-1 space-y-1">
                    {adminLinks.map((link) => {
                      const Icon = link.icon
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => {
                            setMobileMenuOpen(false)
                            setAdminDropdownOpen(false)
                          }}
                          className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium ${
                            isLinkActive(link.href)
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{link.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {!user && (
              <div className="pt-2 border-t border-gray-200 dark:border-slate-800 space-y-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Log In</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </nav>
  )
}
