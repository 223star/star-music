import type { VercelRequest, VercelResponse } from '@vercel/node'
import { searchBilibili, searchNetease, searchQQMusic } from './utils'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const keyword = req.query.keyword as string
  const source = (req.query.source as string) || 'all'
  const page = parseInt((req.query.page as string) || '1')

  if (!keyword) {
    res.status(400).json({ error: 'keyword is required' })
    return
  }

  try {
    let tracks: any[] = []

    if (source === 'all' || source === 'bilibili') {
      const biliTracks = await searchBilibili(keyword, page)
      tracks = tracks.concat(biliTracks)
    }
    if (source === 'all' || source === 'netease') {
      const neteaseTracks = await searchNetease(keyword, page)
      tracks = tracks.concat(neteaseTracks)
    }
    if (source === 'all' || source === 'qqmusic') {
      const qqTracks = await searchQQMusic(keyword, page)
      tracks = tracks.concat(qqTracks)
    }

    // 去重（基于标题相似度去重）
    const seen = new Set()
    tracks = tracks.filter(t => {
      const key = t.title + t.artist
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    res.status(200).json({
      tracks: tracks.slice(0, 30),
      total: tracks.length,
      source
    })
  } catch (err) {
    console.error('Search error:', err)
    res.status(500).json({ error: '搜索失败' })
  }
}