import { Editor } from '@monaco-editor/react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  theme: 'light' | 'dark'
}

function CodeEditor({ value, onChange, theme }: CodeEditorProps) {
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '')
  }

  return (
    <div className="h-full border-r border-gray-200 dark:border-gray-700">
      <div className="h-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Mermaid Code
        </span>
      </div>
      
      <div className="h-[calc(100%-2.5rem)]">
        <Editor
          height="100%"
          defaultLanguage="plaintext"
          value={value}
          onChange={handleEditorChange}
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
            renderWhitespace: 'boundary',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
          }}
        />
      </div>
    </div>
  )
}

export default CodeEditor