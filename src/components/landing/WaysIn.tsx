import { useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import NumberFlow from '@number-flow/react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DASHBOARD_URL } from './Hero'
import { SectionHead } from './primitives'

const API_DOCS_URL = 'https://api.keels.app/v1'
const MCP_URL = 'https://github.com/Keel-Official/keel-mcp'
const MCP_CMD = 'npx -y @keel-official/mcp'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'api', label: 'API' },
  { id: 'agents', label: 'AI agents' },
]

export function WaysIn({ assetCount }: { assetCount: number }) {
  const [tab, setTab] = useState('dashboard')
  const [copied, setCopied] = useState(false)
  const reduce = useReducedMotion()
  const countRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(countRef, { once: true, margin: '-20% 0px' })
  const shown = inView || reduce ? assetCount : 0

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(MCP_CMD)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section id="ways-in" aria-labelledby="ways-title" className="rule px-[max(4vw,16px)] py-20 sm:py-28">
      <SectionHead id="ways-title" title="Three ways in" />
      <Tabs value={tab} onValueChange={setTab} className="mt-10">
        <TabsList aria-label="Ways to use Keel">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {tab === t.id && (
                <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-primary" transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0.2, duration: 0.5 }} />
              )}
              <span className="relative">{t.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="rounded-[20px] border border-line bg-raised p-6 sm:p-10">
          <TabsContent value="dashboard" forceMount hidden={tab !== 'dashboard'}>
            <p className="title text-[clamp(24px,3vw,36px)]">
              Browse the{' '}
              <span ref={countRef} className="font-mono">
                <NumberFlow value={shown} />
              </span>{' '}
              Stellar assets Keel monitors.
            </p>
            <Button asChild className="mt-8"><a href={DASHBOARD_URL}>Open the dashboard</a></Button>
          </TabsContent>
          <TabsContent value="api">
            <p className="title text-[clamp(24px,3vw,36px)]">Read-only JSON over HTTPS.</p>
            <pre className="mt-6 overflow-x-auto rounded-lg border border-line bg-sunk p-4 font-mono text-sm text-soft"><code>GET {API_DOCS_URL}/asset/XLM/depth</code></pre>
            <Button asChild className="mt-8"><a href={API_DOCS_URL}>Read the API docs</a></Button>
          </TabsContent>
          <TabsContent value="agents">
            <p className="title text-[clamp(24px,3vw,36px)]">Ask Claude, Cursor or any MCP client, and get Keel's own numbers back.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-line bg-sunk p-2 pl-4">
              <code className="font-mono text-sm text-soft">{MCP_CMD}</code>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={copy}>{copied ? 'Copied' : 'Copy'}</Button>
            </div>
            <Button asChild className="mt-8"><a href={MCP_URL}>Set up keel-mcp</a></Button>
          </TabsContent>
        </div>
      </Tabs>
    </section>
  )
}
