import LZString from 'lz-string'

export interface ShareResult {
  url: string
  method: 'compressed' | 'base64'
  originalSize: number
  encodedSize: number
}

/**
 * Generate a shareable URL for a Mermaid diagram
 */
export function generateShareUrl(mermaidCode: string): ShareResult {
  const baseUrl = window.location.origin + window.location.pathname
  const originalSize = mermaidCode.length

  // Try LZ-String compression first (best compression)
  try {
    const compressed = LZString.compressToEncodedURIComponent(mermaidCode)
    const url = `${baseUrl}?c=${compressed}`

    if (url.length <= 2000) {
      return {
        url,
        method: 'compressed',
        originalSize,
        encodedSize: compressed.length
      }
    }
  } catch (error) {
    console.warn('LZ-String compression failed:', error)
  }

  // Fallback to Base64 encoding
  try {
    const encoded = btoa(encodeURIComponent(mermaidCode))
    const url = `${baseUrl}?code=${encoded}`

    if (url.length <= 2000) {
      return {
        url,
        method: 'base64',
        originalSize,
        encodedSize: encoded.length
      }
    }
  } catch (error) {
    console.warn('Base64 encoding failed:', error)
  }

  // If we get here, the diagram is too large
  throw new Error(
    `Diagram too large for URL sharing (${originalSize} characters). ` +
    'Consider shortening your diagram or using the export feature instead.'
  )
}

/**
 * Extract Mermaid code from URL parameters
 */
export function extractCodeFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search)

  // Try compressed format first
  const compressed = urlParams.get('c')
  if (compressed) {
    try {
      return LZString.decompressFromEncodedURIComponent(compressed)
    } catch (error) {
      console.warn('Failed to decompress URL parameter:', error)
    }
  }

  // Try base64 format
  const encoded = urlParams.get('code')
  if (encoded) {
    try {
      return decodeURIComponent(atob(encoded))
    } catch (error) {
      console.warn('Failed to decode URL parameter:', error)
    }
  }

  return null
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Clean URL by removing share parameters
 */
export function cleanUrl(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete('c')
  url.searchParams.delete('code')
  
  // Update URL without triggering a page reload
  window.history.replaceState({}, '', url.toString())
}

/**
 * Get compression statistics for display
 */
export function getCompressionStats(originalCode: string): {
  originalSize: number
  compressedSize: number
  compressionRatio: number
  method: string
} {
  const originalSize = originalCode.length
  
  try {
    const compressed = LZString.compressToEncodedURIComponent(originalCode)
    const compressedSize = compressed.length
    const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100)
    
    return {
      originalSize,
      compressedSize,
      compressionRatio,
      method: 'LZ-String'
    }
  } catch {
    // Fallback to base64 stats
    const encoded = btoa(encodeURIComponent(originalCode))
    const encodedSize = encoded.length
    
    return {
      originalSize,
      compressedSize: encodedSize,
      compressionRatio: Math.round((encodedSize / originalSize - 1) * 100), // Negative for expansion
      method: 'Base64'
    }
  }
} 