import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getBilibiliStream, getNeteaseStream, getQQMusicStream } from './utils'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const bvid = req.query.bvid as string
  const source = (req.query.source as string) || 'bilibili'
  const songId = req.query.songId as string

  try {
    let audioUrl: string | null = null

    if (source === 'bilibili' && bvid) {
      audioUrl = await getBilibiliStream(bvid)
    } else if (source === 'netease' && songId) {
      audioUrl = await getNeteaseStream(songId)
    } else if (source === 'qqmusic' && songId) {
      audioUrl = await getQQMusicStream(songId)
    }

    if (!audioUrl) {
      res.status(404).json({ error: '无法获取音频流' })
      return
    }

    res.status(200).json({ audioUrl })
  } catch (err) {
    console.error('Stream error:', err)
    res.status(500).json({ error: '获取音频流失败' })
  }
}