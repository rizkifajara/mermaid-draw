import { Loader2, AlertCircle, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { useState } from 'react'

interface DiagramPreviewProps {
  diagram: string | null
  error: string | null
  loading: boolean
  code: string
}

function DiagramPreview({ diagram, error, loading, code }: DiagramPreviewProps) {
  const [zoom, setZoom] = useState(100)

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25))
  }

  const handleResetZoom = () => {
    setZoom(100)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Preview
        </span>
        
        {diagram && (
          <div className="flex items-center space-x-1">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              disabled={zoom <= 25}
            >
              <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            
            <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3rem] text-center">
              {zoom}%
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              disabled={zoom >= 300}
            >
              <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            
            <button
              onClick={handleResetZoom}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ml-2"
            >
              <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
        {loading && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Rendering diagram...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="h-full flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                Syntax Error
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md font-mono">
                {error}
              </p>
            </div>
          </div>
        )}

        {diagram && !loading && !error && (
          <div 
            className="diagram-container min-h-full"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center top' }}
          >
            <div 
              data-testid="diagram-container"
              dangerouslySetInnerHTML={{ __html: diagram }}
              className="inline-block diagram-preview"
            />
          </div>
        )}

        {!diagram && !loading && !error && code.trim() === '' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <svg 
                className="w-16 h-16 mx-auto mb-4 opacity-50" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                />
              </svg>
              <p className="text-lg font-medium mb-2">Welcome to MermaidDraw</p>
              <p className="text-sm">
                Start typing Mermaid syntax in the editor to see your diagram here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DiagramPreview 