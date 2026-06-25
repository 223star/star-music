// 极简代理：/api/proxy?url=xxx
// 浏览器 → Vercel（同源无CORS）→ 目标API

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', '*')

  if (req.method === 'OPTIONS') { res.status(200).end(); return }

  const target = req.query.url as string
  if (!target) { res.status(400).json({ error: 'url required' }); return }

  try {
    const resp = await fetch(decodeURIComponent(target), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://music.163.com',
      }
    })
    const text = await resp.text()
    // 尝试返回JSON
    try { res.json(JSON.parse(text)) }
    catch { res.status(200).send(text) }
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}