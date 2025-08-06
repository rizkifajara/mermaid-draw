import { useState, useEffect } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import Header from './components/Layout/Header'
import CodeEditor from './components/Editor/CodeEditor'
import DiagramPreview from './components/Preview/DiagramPreview'
import Sidebar from './components/Sidebar/Sidebar'
import { useMermaid } from './hooks/useMermaid'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useDebounce } from './hooks/useDebounce'
import { extractCodeFromUrl, cleanUrl } from './utils/share'

const defaultCode = `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]`

function App() {
  // Check for shared code in URL first, then fall back to localStorage
  const getInitialCode = () => {
    const sharedCode = extractCodeFromUrl()
    if (sharedCode) {
      // Clean the URL after extracting the code
      cleanUrl()
      return sharedCode
    }
    return defaultCode
  }

  const [code, setCode] = useLocalStorage('mermaidlive-code', getInitialCode())
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('mermaidlive-theme', 'light')
  
  // Debounce code changes to avoid excessive re-renders
  const debouncedCode = useDebounce(code, 500)
  
  // Mermaid hook for diagram rendering
  const { diagram, error, loading, renderDiagram } = useMermaid(theme)
  
  // Render diagram when debounced code changes
  useEffect(() => {
    if (debouncedCode.trim()) {
      renderDiagram(debouncedCode)
    }
  }, [debouncedCode, renderDiagram, theme])

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <Header 
        onToggleSidebar={toggleSidebar}
        onToggleTheme={toggleTheme}
        theme={theme}
        diagram={diagram}
        code={code}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectTemplate={(templateCode) => setCode(templateCode)}
        />
        
        {/* Main content area */}
        <div className="flex-1 flex">
          <PanelGroup direction="horizontal">
            {/* Editor Panel */}
            <Panel defaultSize={50} minSize={30}>
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  <CodeEditor
                    value={code}
                    onChange={setCode}
                    theme={theme}
                  />
                </div>
              </div>
            </Panel>
            
            {/* Resize Handle */}
            <PanelResizeHandle className="w-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" />
            
            {/* Preview Panel */}
            <Panel defaultSize={50} minSize={30}>
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  <DiagramPreview
                    diagram={diagram}
                    error={error}
                    loading={loading}
                    code={code}
                  />
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  )
}

export default App
