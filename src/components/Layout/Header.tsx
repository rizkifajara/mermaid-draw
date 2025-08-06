import { Menu, Sun, Moon, Download, Share, Settings, Check } from 'lucide-react'
import { useState } from 'react'
import { generateShareUrl, copyToClipboard } from '../../utils/share'
import { exportDiagram, isExportAvailable, type ExportFormat } from '../../utils/export'
import { useToast } from '../../hooks/useToast'
import { Toast } from '../Common/Toast'

interface HeaderProps {
  onToggleSidebar: () => void
  onToggleTheme: () => void
  theme: 'light' | 'dark'
  diagram: string | null
  code: string
}

function Header({ onToggleSidebar, onToggleTheme, theme, diagram, code }: HeaderProps) {
  const [shareStatus, setShareStatus] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle')
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting'>('idle')
  const { toast, success, error: showError, hideToast } = useToast()

  const handleExport = async (format: ExportFormat) => {
    if (!isExportAvailable()) {
      showError('No diagram available to export. Please create a diagram first.')
      return
    }

    setExportStatus('exporting')
    
    try {
      await exportDiagram(format, {
        quality: 1.0,
        scale: 2,
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
      })
      
      success(`Diagram exported as ${format.toUpperCase()} successfully!`)
    } catch (error) {
      console.error('Export failed:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to export diagram as ${format.toUpperCase()}`
      showError(errorMessage)
    } finally {
      setExportStatus('idle')
    }
  }

  const handleShare = async () => {
    if (!code.trim()) return

    setShareStatus('copying')
    
    try {
      const shareResult = generateShareUrl(code)
      const copySuccess = await copyToClipboard(shareResult.url)
      
      if (copySuccess) {
        setShareStatus('copied')
        setTimeout(() => setShareStatus('idle'), 2000)
        
        const compressionInfo = shareResult.method === 'compressed' 
          ? ` (${Math.round((1 - shareResult.encodedSize / shareResult.originalSize) * 100)}% compressed)`
          : ''
        
        success(`Shareable URL copied to clipboard${compressionInfo}`)
      } else {
        setShareStatus('error')
        setTimeout(() => setShareStatus('idle'), 3000)
        showError('Failed to copy URL to clipboard')
      }
    } catch (err) {
      console.error('Share failed:', err)
      setShareStatus('error')
      setTimeout(() => setShareStatus('idle'), 3000)
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to generate shareable URL'
      showError(errorMessage)
    }
  }

  const getShareButtonContent = () => {
    switch (shareStatus) {
      case 'copying':
        return (
          <>
            <Share className="w-4 h-4 animate-pulse text-gray-700 dark:text-gray-200" />
            <span>Copying...</span>
          </>
        )
      case 'copied':
        return (
          <>
            <Check className="w-4 h-4 text-green-500 dark:text-green-400" />
            <span>Copied!</span>
          </>
        )
      case 'error':
        return (
          <>
            <Share className="w-4 h-4 text-red-500 dark:text-red-400" />
            <span>Error</span>
          </>
        )
      default:
        return (
          <>
            <Share className="w-4 h-4 text-gray-700 dark:text-gray-200" />
            <span>Share</span>
          </>
        )
    }
  }

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
      <div className="flex items-center space-x-4">
        {/* Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img 
            src="/logo.png" 
            alt="MermaidDraw Logo" 
            className="w-8 h-8"
          />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            MermaidDraw
          </h1>
        </div>
      </div>

      <div className="flex-1" />

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {/* Export Dropdown */}
        <div className="relative group">
          <button
            className={`toolbar-button flex items-center space-x-1 text-gray-700 dark:text-gray-200 ${
              exportStatus === 'exporting' ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            disabled={!diagram || exportStatus === 'exporting'}
          >
            <Download className={`w-4 h-4 text-gray-700 dark:text-gray-200 ${exportStatus === 'exporting' ? 'animate-pulse' : ''}`} />
            <span>{exportStatus === 'exporting' ? 'Exporting...' : 'Export'}</span>
          </button>
          
          {diagram && exportStatus === 'idle' && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={() => handleExport('png')}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Export as PNG image"
              >
                PNG
              </button>
              <button
                onClick={() => handleExport('svg')}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Export as SVG vector"
              >
                SVG
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Export as PDF document"
              >
                PDF
              </button>
            </div>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className={`toolbar-button flex items-center space-x-1 text-gray-700 dark:text-gray-200 ${
            shareStatus === 'copied' ? 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-600 text-green-700 dark:text-green-200' :
            shareStatus === 'error' ? 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-600 text-red-700 dark:text-red-200' : ''
          }`}
          disabled={!code.trim() || shareStatus === 'copying'}
        >
          {getShareButtonContent()}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="toolbar-button text-gray-700 dark:text-gray-200"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-gray-700 dark:text-gray-200" />
          ) : (
            <Sun className="w-4 h-4 text-gray-700 dark:text-gray-200" />
          )}
        </button>

        {/* Settings */}
        <button
          className="toolbar-button text-gray-700 dark:text-gray-200"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 text-gray-700 dark:text-gray-200" />
        </button>
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      )}
    </header>
  )
}

export default Header 