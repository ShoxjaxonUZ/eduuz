import { useRef, useEffect } from 'react'

function CodeEditor({ code = '', setCode, language = 'python' }) {
  const safeCode = code || ''
  const lines = safeCode.split('\n')
  const lineNumbers = lines.map((_, i) => i + 1).join('\n')
  const textareaRef = useRef(null)
  const highlightRef = useRef(null)
  const linesRef = useRef(null)

  // Sintaksis bo'yash
  const highlight = (text) => {
    if (!text) return ''
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // Comments
    html = html.replace(/(\/\/.*$|#.*$)/gm, '<span class="syn-comment">$1</span>')
    // Strings
    html = html.replace(/(["'`])((?:\\.|(?!\1).)*?)\1/g, '<span class="syn-string">$1$2$1</span>')
    // Keywords
    const keywords = /\b(function|return|if|else|for|while|var|let|const|def|class|import|from|as|in|not|and|or|true|false|True|False|None|null|undefined|new|this|self|public|private|static|void|int|string|bool|float|double|async|await|try|catch|except|finally|throw|raise|break|continue|pass|lambda|yield|with|elif)\b/g
    html = html.replace(keywords, '<span class="syn-keyword">$1</span>')
    // Numbers
    html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="syn-number">$1</span>')
    // Functions
    html = html.replace(/(\w+)(?=\()/g, '<span class="syn-function">$1</span>')

    return html + '\n'
  }

  // Tab tugma
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      const newCode = safeCode.substring(0, start) + '    ' + safeCode.substring(end)
      setCode(newCode)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4
        }
      }, 0)
    }
  }

  // Scroll sinxronlashtirish
  const handleScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
    if (linesRef.current && textareaRef.current) {
      linesRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  return (
    <div className="code-editor-wrapper">
      <div className="code-lines" ref={linesRef}>
        <pre>{lineNumbers}</pre>
      </div>
      <div className="code-editor-inner">
        <pre
          className="code-highlight"
          ref={highlightRef}
          dangerouslySetInnerHTML={{ __html: highlight(safeCode) }}
        />
        <textarea
          ref={textareaRef}
          className="code-textarea"
          value={safeCode}
          onChange={e => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  )
}

export default CodeEditor