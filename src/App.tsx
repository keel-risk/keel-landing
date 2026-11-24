import { Audience } from '@/components/landing/Audience'
import { Bands } from '@/components/landing/Bands'
import { Checked } from '@/components/landing/Checked'
import { Closing, Nav } from '@/components/landing/Chrome'
import { Hero } from '@/components/landing/Hero'
import { Story } from '@/components/landing/Story'
import { WaysIn } from '@/components/landing/WaysIn'
import { assetsMeta, ustryReading, xlmHistory, xlmReading } from '@/lib/fixtures'

export default function App() {
  return (
    <div id="top">
      <Nav />
      <main className="frame">
        <Hero reading={xlmReading} />
        <Story deep={xlmReading} thin={ustryReading} limitsFrom={ustryReading} />
        <Bands reading={xlmReading} history={xlmHistory} />
        <Checked />
        <Audience />
        <WaysIn assetCount={assetsMeta.total} />
        <Closing reading={xlmReading} />
      </main>
    </div>
  )
}
