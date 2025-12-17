import { createClient } from '@/lib/supabase/client'

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ data: { path: string } | null; error: Error | null }> {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    return { data: null, error }
  }

  return { data: { path: data.path }, error: null }
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient()
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path)
  return publicUrl
}

export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: Error | null }> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).remove([path])
  return { error }
}


