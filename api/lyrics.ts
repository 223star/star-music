import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getLyrics } from './utils'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const title = req.query.title as string
  const artist = req.query.artist as string

  if (!title) {
    res.status(400).json({ error: 'title is required' })
    return
  }

  try {
    const lyrics = await getLyrics(title, artist || '')
    res.status(200).json({ lyrics })
  } catch (err) {
    console.error('Lyrics error:', err)
    res.status(200).json({ lyrics: [] })
  }
}