import { useState, useCallback, useEffect } from 'react'
import mermaid from 'mermaid'

interface MermaidState {
  diagram: string | null
  error: string | null
  loading: boolean
}

// Initialize Mermaid with theme
const initializeMermaid = (theme: 'light' | 'dark') => {
  mermaid.initialize({
    startOnLoad: false,
    theme: theme === 'dark' ? 'dark' : 'default',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    flowchart: {
      curve: 'basis',
      padding: 10
    },
    sequence: {
      actorMargin: 50,
      width: 150,
      height: 65
    },
    gantt: {
      fontSize: 11,
      sectionFontSize: 11,
      gridLineStartPadding: 35
    }
  })
}

export function useMermaid(theme: 'light' | 'dark' = 'light') {
  const [state, setState] = useState<MermaidState>({
    diagram: null,
    error: null,
    loading: false
  })

  // Re-initialize Mermaid when theme changes
  useEffect(() => {
    initializeMermaid(theme)
  }, [theme])

  const renderDiagram = useCallback(async (code: string) => {
    if (!code.trim()) {
      setState({ diagram: null, error: null, loading: false })
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Validate syntax first
      const isValid = await mermaid.parse(code)
      if (!isValid) {
        throw new Error('Invalid Mermaid syntax')
      }

      // Generate unique ID for each render
      const id = `mermaid-diagram-${Date.now()}`
      
      // Render the diagram
      const { svg } = await mermaid.render(id, code)
      
      setState({
        diagram: svg,
        error: null,
        loading: false
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setState({
        diagram: null,
        error: errorMessage,
        loading: false
      })
    }
  }, [])

  return {
    ...state,
    renderDiagram
  }
} 