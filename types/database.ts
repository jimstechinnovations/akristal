export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'buyer' | 'seller' | 'agent' | 'admin'
export type ListingType = 'sale' | 'rent'
export type PropertyStatus = 'available' | 'sold' | 'rented' | 'pending' | 'suspended'
export type ListingStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'suspended'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type PaymentMethod = 'bank_transfer' | 'card' | 'mobile_money' | 'other'

export type { Database } from './supabase'
