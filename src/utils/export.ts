import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export type ExportFormat = 'png' | 'svg' | 'pdf'

export interface ExportOptions {
  filename?: string
  quality?: number
  scale?: number
  backgroundColor?: string
}

/**
 * Generate a filename with timestamp
 */
function generateFilename(format: ExportFormat, customName?: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  const baseName = customName || 'mermaid-diagram'
  return `${baseName}_${timestamp}.${format}`
}

/**
 * Find the Mermaid diagram container and zoom container elements
 */
function findDiagramElements(): { 
  diagramContainer: Element; 
  zoomContainer: HTMLElement | null;
  originalTransform: string;
} | null {
  // Find the diagram container with the actual content
  const diagramContainer = document.querySelector('[data-testid="diagram-container"]')
  if (!diagramContainer) {
    return null
  }

  // Find the parent container that has the zoom transform
  const zoomContainer = diagramContainer.parentElement as HTMLElement
  const originalTransform = zoomContainer ? zoomContainer.style.transform : ''

  return {
    diagramContainer,
    zoomContainer,
    originalTransform
  }
}

/**
 * Temporarily reset zoom for export and restore it afterwards
 */
function temporarilyResetZoom(): () => void {
  const elements = findDiagramElements()
  if (!elements || !elements.zoomContainer) {
    return () => {} // No-op cleanup function
  }

  const { zoomContainer, originalTransform } = elements
  
  // Reset zoom to 100%
  zoomContainer.style.transform = 'scale(1)'
  
  // Return cleanup function to restore original zoom
  return () => {
    zoomContainer.style.transform = originalTransform
  }
}

/**
 * Calculate optimal scale factor based on diagram size
 */
function calculateOptimalScale(element: HTMLElement, baseScale: number = 5): number {
  const rect = element.getBoundingClientRect()
  const area = rect.width * rect.height
  
  // Calculate potential memory usage (rough estimate)
  const estimatedMemoryMB = (area * baseScale * baseScale * 4) / (1024 * 1024) // RGBA bytes
  
  // For very small diagrams (< 50k pixels), use maximum scale
  if (area < 50000) {
    return Math.min(baseScale * 2, 10)
  }
  
  // For small diagrams (< 200k pixels), use higher scale
  if (area < 200000) {
    return Math.min(baseScale * 1.5, 8)
  }
  
  // For medium diagrams (< 800k pixels), use base scale
  if (area < 800000) {
    return baseScale
  }
  
  // For large diagrams, use high scale but consider memory
  if (area < 1500000) {
    // If estimated memory > 200MB, reduce scale slightly
    return estimatedMemoryMB > 200 ? Math.max(baseScale * 0.8, 4) : Math.max(baseScale * 0.9, 4.5)
  }
  
  // For very large diagrams, still maintain good quality
  if (area < 3000000) {
    return estimatedMemoryMB > 300 ? Math.max(baseScale * 0.6, 3) : Math.max(baseScale * 0.7, 3.5)
  }
  
  // For extremely large diagrams, use minimum acceptable quality
  return Math.max(baseScale * 0.5, 2.5)
}

/**
 * Download a file with the given content
 */
function downloadFile(content: string | Blob, filename: string, mimeType?: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Export diagram as PNG using html2canvas
 */
export async function exportAsPNG(options: ExportOptions = {}): Promise<void> {
  const {
    filename,
    quality = 1.0,
    scale = 5, // Increased from 2 to 5 for higher quality
    backgroundColor = '#ffffff'
  } = options

  const elements = findDiagramElements()
  if (!elements) {
    throw new Error('Could not find diagram to export. Please ensure a diagram is rendered.')
  }

  const { diagramContainer } = elements

  // Temporarily reset zoom and get cleanup function
  const restoreZoom = temporarilyResetZoom()

  try {
    // Wait a tiny bit for the DOM to update after zoom change
    await new Promise(resolve => setTimeout(resolve, 100))

    // Calculate optimal scale based on diagram size
    const optimalScale = calculateOptimalScale(diagramContainer as HTMLElement, scale)

    const canvas = await html2canvas(diagramContainer as HTMLElement, {
      scale: optimalScale,
      backgroundColor,
      useCORS: true,
      allowTaint: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      // Additional quality settings
      removeContainer: false,
      imageTimeout: 15000,
      // Force high DPI
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    })

    // Apply canvas smoothing for better quality
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const finalFilename = filename || generateFilename('png')
            downloadFile(blob, finalFilename)
            resolve()
          } else {
            reject(new Error('Failed to generate PNG blob'))
          }
        },
        'image/png',
        quality
      )
    })
  } catch (error) {
    throw new Error(`PNG export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    // Always restore the original zoom
    restoreZoom()
  }
}

/**
 * Export diagram as SVG
 */
export async function exportAsSVG(options: ExportOptions = {}): Promise<void> {
  const { filename, backgroundColor = '#ffffff' } = options

  const elements = findDiagramElements()
  if (!elements) {
    throw new Error('Could not find diagram to export. Please ensure a diagram is rendered.')
  }

  const { diagramContainer } = elements

  // Find the SVG element within the container
  const svgElement = diagramContainer.querySelector('svg')
  if (!svgElement) {
    throw new Error('Could not find SVG element in the diagram.')
  }

  try {
    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true) as SVGElement
    
    // Ensure proper SVG attributes for standalone file
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
    
    // Ensure viewBox is set for proper scaling
    if (!svgClone.getAttribute('viewBox')) {
      const width = svgClone.getAttribute('width') || '800'
      const height = svgClone.getAttribute('height') || '600'
      svgClone.setAttribute('viewBox', `0 0 ${width} ${height}`)
    }
    
    // Add background based on theme
    const existingBackground = svgClone.querySelector('rect[data-bg="true"]') as SVGRectElement
    if (existingBackground) {
      existingBackground.setAttribute('fill', backgroundColor)
    } else {
      // Check if there's already a background rect
      const existingRect = svgClone.querySelector('rect[fill="#ffffff"], rect[fill="white"], rect[fill="#f9f9f9"]')
      if (existingRect) {
        existingRect.setAttribute('fill', backgroundColor)
      } else {
        // Add new background rect
        const backgroundRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        backgroundRect.setAttribute('width', '100%')
        backgroundRect.setAttribute('height', '100%')
        backgroundRect.setAttribute('fill', backgroundColor)
        backgroundRect.setAttribute('data-bg', 'true')
        svgClone.insertBefore(backgroundRect, svgClone.firstChild)
      }
    }

    // Get the outer HTML of the SVG
    const svgString = new XMLSerializer().serializeToString(svgClone)
    
    // Create a properly formatted SVG document
    const svgDoc = `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`
    
    const finalFilename = filename || generateFilename('svg')
    downloadFile(svgDoc, finalFilename, 'image/svg+xml')
  } catch (error) {
    throw new Error(`SVG export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Export diagram as PDF
 */
export async function exportAsPDF(options: ExportOptions = {}): Promise<void> {
  const {
    filename,
    quality = 1.0,
    scale = 5, // Increased from 2 to 5 for higher quality
    backgroundColor = '#ffffff'
  } = options

  const elements = findDiagramElements()
  if (!elements) {
    throw new Error('Could not find diagram to export. Please ensure a diagram is rendered.')
  }

  const { diagramContainer } = elements

  // Temporarily reset zoom and get cleanup function
  const restoreZoom = temporarilyResetZoom()

  try {
    // Wait a tiny bit for the DOM to update after zoom change
    await new Promise(resolve => setTimeout(resolve, 100))

    // Calculate optimal scale based on diagram size
    const optimalScale = calculateOptimalScale(diagramContainer as HTMLElement, scale)

    // First, capture the diagram as canvas
    const canvas = await html2canvas(diagramContainer as HTMLElement, {
      scale: optimalScale,
      backgroundColor,
      useCORS: true,
      allowTaint: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      // Additional quality settings
      removeContainer: false,
      imageTimeout: 15000,
      // Force high DPI
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    })

    // Get canvas dimensions
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height

    // Calculate PDF dimensions (in mm) - maintain aspect ratio
    const aspectRatio = canvasWidth / canvasHeight
    const maxWidth = 297 // A4 landscape width in mm
    const maxHeight = 210 // A4 landscape height in mm
    
    let pdfWidth: number
    let pdfHeight: number

    if (aspectRatio > maxWidth / maxHeight) {
      // Diagram is wider - fit to width
      pdfWidth = maxWidth
      pdfHeight = maxWidth / aspectRatio
    } else {
      // Diagram is taller - fit to height
      pdfHeight = maxHeight
      pdfWidth = maxHeight * aspectRatio
    }

    // Ensure minimum size
    pdfWidth = Math.max(pdfWidth, 50)
    pdfHeight = Math.max(pdfHeight, 50)

    // Create PDF with calculated dimensions
    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight]
    })

    // Convert canvas to data URL
    const imgData = canvas.toDataURL('image/png', quality)

    // Add image to PDF with proper sizing
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

    // Download the PDF
    const finalFilename = filename || generateFilename('pdf')
    pdf.save(finalFilename)
  } catch (error) {
    throw new Error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    // Always restore the original zoom
    restoreZoom()
  }
}

/**
 * Main export function that handles all formats
 */
export async function exportDiagram(format: ExportFormat, options: ExportOptions = {}): Promise<void> {
  switch (format) {
    case 'png':
      return exportAsPNG(options)
    case 'svg':
      return exportAsSVG(options)
    case 'pdf':
      return exportAsPDF(options)
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

/**
 * Check if export is available (diagram is rendered)
 */
export function isExportAvailable(): boolean {
  return findDiagramElements() !== null
} 