/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { deepEqual, TLDocumentModel } from '@tldraw/core'
import {
  AppCanvas,
  AppProvider,
  TLReactCallbacks,
  TLReactComponents,
  TLReactToolConstructor,
  useApp,
} from '@tldraw/react'
import * as React from 'react'
import { AppUI } from './components/AppUI'
import { ContextBar } from './components/ContextBar'
import { ContextMenu } from './components/ContextMenu'
import { useDrop } from './hooks/useDrop'
import { usePaste } from './hooks/usePaste'
import { useQuickAdd } from './hooks/useQuickAdd'
import {
  BoxTool,
  EllipseTool,
  HighlighterTool,
  HTMLTool,
  LineTool,
  LogseqPortalTool,
  NuEraseTool,
  PencilTool,
  PolygonTool,
  shapes,
  TextTool,
  YouTubeTool,
  IFrameTool,
  type Shape,
} from './lib'
import { LogseqContext, type LogseqContextValue } from './lib/logseq-context'

const components: TLReactComponents<Shape> = {
  ContextBar: ContextBar,
}

const tools: TLReactToolConstructor<Shape>[] = [
  BoxTool,
  // DotTool,
  EllipseTool,
  PolygonTool,
  NuEraseTool,
  HighlighterTool,
  LineTool,
  PencilTool,
  TextTool,
  YouTubeTool,
  IFrameTool,
  HTMLTool,
  LogseqPortalTool,
]

interface LogseqTldrawProps {
  renderers: LogseqContextValue['renderers']
  handlers: LogseqContextValue['handlers']
  model?: TLDocumentModel<Shape>
  onMount?: TLReactCallbacks<Shape>['onMount']
  onPersist?: TLReactCallbacks<Shape>['onPersist']
}

const AppImpl = () => {
  const ref = React.useRef<HTMLDivElement>(null)
  const app = useApp()
  return (
    <ContextMenu collisionRef={ref}>
      <div ref={ref} className="logseq-tldraw logseq-tldraw-wrapper" data-tlapp={app.uuid}>
        <AppCanvas components={components}>
          <AppUI />
        </AppCanvas>
      </div>
    </ContextMenu>
  )
}

const AppInner = ({
  onPersist,
  model,
  ...rest
}: Omit<LogseqTldrawProps, 'renderers' | 'handlers'>) => {
  const onDrop = useDrop()
  const onPaste = usePaste()
  const onQuickAdd = useQuickAdd()

  const onPersistOnDiff: TLReactCallbacks<Shape>['onPersist'] = React.useCallback(
    (app, info) => {
      if (!deepEqual(app.serialized, model)) {
        onPersist?.(app, info)
      }
    },
    [model]
  )

  return (
    <AppProvider
      Shapes={shapes}
      Tools={tools}
      onDrop={onDrop}
      onPaste={onPaste}
      onCanvasDBClick={onQuickAdd}
      onPersist={onPersistOnDiff}
      model={model}
      {...rest}
    >
      <AppImpl />
    </AppProvider>
  )
}

export const App = function App({ renderers, handlers, ...rest }: LogseqTldrawProps): JSX.Element {
  const memoRenders: any = React.useMemo(() => {
    return Object.fromEntries(
      Object.entries(renderers).map(([key, comp]) => {
        return [key, React.memo(comp)]
      })
    )
  }, [])
  const contextValue = {
    renderers: memoRenders,
    handlers: handlers,
  }

  return (
    <LogseqContext.Provider value={contextValue}>
      <AppInner {...rest} />
    </LogseqContext.Provider>
  )
}
