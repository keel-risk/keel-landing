// Typed access to readings recorded from api.keels.app on 24 November 2026.
// In keel-frontend these types come from lib/api/generated; here they are a
// minimal hand-written subset for the prototype only.
import xlm from '@/data/xlm-depth.json'
import ustry from '@/data/ustry-depth.json'
import history from '@/data/xlm-history-runs.json'
import assets from '@/data/assets-meta.json'

export type Band = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface DepthLevel {
  delta: number
  buySide: string
  sellSide: string
  fromSdex: string
  fromAmm: string
}

export interface Reading {
  headers: { stalenessSeconds: number; methodologyVersion: string }
  body: {
    asset: { code: string; type: string; issuer: string | null }
    quote: { code: string; type: string; issuer: string | null }
    ledgerSeq: number
    ledgerClosedAt: string
    methodologyVersion: string
    midPrice: string
    priceSource: string
    depth: DepthLevel[]
    maxSafeCollateral: string | null
    maxSafeCollateralLiquidation: string | null
    maxSafeCollateralManipulation: string | null
    band: Band
    bandConfidence: 'full' | 'partial'
  }
}

const byDelta = (a: DepthLevel, b: DepthLevel) => a.delta - b.delta

function normalise(r: Reading): Reading {
  return { ...r, body: { ...r.body, depth: [...r.body.depth].sort(byDelta) } }
}

export const xlmReading = normalise(xlm as Reading)
export const ustryReading = normalise(ustry as Reading)
export const xlmHistory = history as {
  methodologyVersion: string
  from: number
  to: number
  points: number
  runs: { band: Band; from: number; fromAt: string; to: number; toAt: string; n: number }[]
}
export const assetsMeta = assets as { total: number; methodologyVersion: string; bandsSeen: Band[] }
