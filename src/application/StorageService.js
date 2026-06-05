import supabase from './supabaseClient'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

class StorageService {
  constructor(client = supabase) {
    this.client = client
    this._bucketMap = {}
  }


  async getCoverUrl(
    path,
    {
      bucket = 'Covers',
      expirySec = 3600
    } = {}
  ) {

    return this.getBookUrl(
      bucket,
      path,
      expirySec
    )
  }

  // Return a usable URL for the file. If bucket/file is public, returns public URL.
  // For private buckets, downloads the file and returns an object URL (browser-only).
  _bucketVariants(name) {
    if (!name) return []
    const variants = new Set()
    variants.add(name)
    variants.add(name.toLowerCase())
    variants.add(name.toUpperCase())
    variants.add(name.charAt(0).toUpperCase() + name.slice(1))
    return Array.from(variants)
  }

  async _tryBuckets(bucket, fn) {
    const variants = this._bucketVariants(bucket)
    let lastErr
    for (const b of variants) {
      try {
        const res = await fn(b)
        return { bucket: b, res }
      } catch (e) {
        lastErr = e
        const msg = (e && (e.message || e.error_description || e.error)) || String(e)
        if (!/bucket not found|Bucket not found|404|400/i.test(msg)) {
          // not a bucket-not-found error — rethrow
          throw e
        }
        // otherwise try next variant
      }
    }
    throw lastErr || new Error(`Bucket not found (tried: ${variants.join(', ')})`)
  }

  async getBookUrl(bucket, path, expirySec = 3600) {


    if (!bucket || !path) {

      throw new Error(
        'bucket and path required'
      )
    }


    try {
      const { res } =
        await this._tryBuckets(
          bucket,
          async b => {
           

            const {
              data,
              error
            } =
              await this.client.storage
                .from(b)
                .createSignedUrl(
                  path,
                  expirySec
                )

            if (error) {
              console.error(
                'createSignedUrl failed:',
                error
              )

              throw error
            }

            

            return data.signedUrl
          }
        )

      return res
    } finally {
      console.groupEnd()
    }
  }

  // Download the book and optionally trigger a save-as in browser
  async downloadBook(bucket, path, { fileName } = {}) {
    if (!bucket || !path) throw new Error('bucket and path required')
    const { res } = await this._tryBuckets(bucket, async (b) => {
      const { data, error } = await this.client.storage.from(b).download(path)
      if (error) throw error
      return data
    })
    const data = res

    // Return blob for programmatic use
    const blob = data
    if (typeof window !== 'undefined' && fileName) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    }

    return blob
  }

  // Check whether a file exists in storage by listing the parent directory and looking for filename
  async checkBookExists(bucket, filePath) {
    if (!bucket || !filePath) throw new Error('bucket and filePath required')
    const parts = filePath.split('/')
    const fileName = parts.pop()
    const dir = parts.join('/')
    const { res } = await this._tryBuckets(bucket, async (b) => {
      const { data, error } = await this.client.storage.from(b).list(dir || '', { limit: 100 })
      if (error) throw error
      return data
    })
    const data = res
    return Array.isArray(data) && data.some((f) => f.name === fileName)
  }

  // Upload a File/Blob to the bucket at given path. `file` should be a File or Blob.
  async uploadBook(bucket, path, file, { upsert = false } = {}) {
    if (!bucket || !path || !file) throw new Error('bucket, path and file required')
    const { res } = await this._tryBuckets(bucket, async (b) => {
      const { data, error } = await this.client.storage.from(b).upload(path, file, { upsert })
      if (error) throw error
      return data
    })
    return res
  }

  // Convenience helper to upload a cover image to the `Covers` bucket
  async uploadCover(path, file, { bucket = 'Covers', upsert = true } = {}) {
    if (!path || !file) throw new Error('path and file required')
    const contentType = (file && file.type) || 'image/jpeg'
    const { res } = await this._tryBuckets(bucket, async (b) => {
      const { data, error } = await this.client.storage.from(b).upload(path, file, { upsert, contentType })
      if (error) throw error
      return data
    })
    return res
  }

  // Convenience helper to upload a PDF to the `Books` bucket
  async uploadPdf(path, file, { bucket = 'Books', upsert = false } = {}) {
    if (!path || !file) throw new Error('path and file required')
    const contentType = 'application/pdf'
    const { res } = await this._tryBuckets(bucket, async (b) => {
      const { data, error } = await this.client.storage.from(b).upload(path, file, { upsert, contentType })
      if (error) throw error
      return data
    })
    return res
  }

  // Upload with progress using XHR. Calls onProgress(loaded, total) repeatedly.
  // Returns a promise that resolves to response JSON like Supabase storage API.
  async uploadBookWithProgress(
  bucket,
  path,
  file,
  { upsert = false } = {},
  onProgress
) {
  if (!bucket || !path || !file) {
    throw new Error('bucket, path and file required')
  }

  if (onProgress) {
    onProgress(0, file.size || 1)
  }

  const result = await this.uploadBook(
    bucket,
    path,
    file,
    { upsert }
  )

  if (onProgress) {
    onProgress(file.size || 1, file.size || 1)
  }

  return result
}
}

export default new StorageService()
