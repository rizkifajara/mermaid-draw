import { X, Code, BookOpen, HelpCircle } from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (code: string) => void
}

const templates = [
  {
    id: 'basic-flowchart',
    name: 'Basic Flowchart',
    category: 'Flowchart',
    code: `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]`
  },
  {
    id: 'sequence-diagram',
    name: 'API Request',
    category: 'Sequence',
    code: `sequenceDiagram
    participant U as User
    participant A as API
    participant D as Database
    
    U->>A: Request data
    A->>D: Query
    D-->>A: Result
    A-->>U: Response`
  },
  {
    id: 'class-diagram',
    name: 'Class Diagram',
    category: 'Class',
    code: `classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }
    
    class Admin {
        +deleteUser()
        +banUser()
    }
    
    User <|-- Admin`
  },
  {
    id: 'gantt-chart',
    name: 'Project Timeline',
    category: 'Gantt',
    code: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Requirements :req, 2024-01-01, 2024-01-10
    Design      :design, after req, 2024-01-20
    section Development
    Frontend    :frontend, 2024-01-15, 2024-02-15
    Backend     :backend, 2024-01-20, 2024-02-20`
  }
]

function Sidebar({ isOpen, onClose, onSelectTemplate }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'help'>('templates')

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 lg:relative lg:w-64">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  activeTab === 'templates'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Code className="w-4 h-4 inline mr-1" />
                Templates
              </button>
              <button
                onClick={() => setActiveTab('help')}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  activeTab === 'help'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <HelpCircle className="w-4 h-4 inline mr-1" />
                Help
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'templates' && (
              <div className="p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Choose a template to get started
                </h3>
                
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      onSelectTemplate(template.code)
                      onClose()
                    }}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {template.category}
                      </span>
                    </div>
                    <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-hidden line-clamp-3">
                      {template.code.split('\n').slice(0, 3).join('\n')}...
                    </pre>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'help' && (
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    Quick Reference
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Flowchart</h4>
                                             <code className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-1 rounded block">
                         flowchart TD{'\n'}A[Box] --{'>'} B[Another Box]
                       </code>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Sequence</h4>
                                             <code className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-1 rounded block">
                         sequenceDiagram{'\n'}A-{'>>'}B: Hello
                       </code>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Class</h4>
                                             <code className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-1 rounded block">
                         classDiagram{'\n'}class User {'{'}methods(){'}'}
                       </code>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    For complete documentation, visit{' '}
                    <a 
                      href="https://mermaid.js.org" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 underline"
                    >
                      mermaid.js.org
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar 