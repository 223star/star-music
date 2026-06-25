// 极简代理：/api/proxy?url=xxx
// 浏览器 → Vercel（同源无CORS）→ 目标API
// 支持重试、超时、Header转发

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', '*')

  if (req.method === 'OPTIONS') { res.status(200).end(); return }

  const target = req.query.url as string
  if (!target) { res.status(400).json({ error: 'url required' }); return }

  const decodedUrl = decodeURIComponent(target)
  const maxRetries = 2
  let lastError: any = null

  // 根据目标 URL 动态选择 Referer
  const referer = decodedUrl.includes('c.y.qq.com')
    ? 'https://y.qq.com'
    : 'https://music.163.com'

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      const resp = await fetch(decodedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Referer': referer,
        }
      })
      clearTimeout(timeout)

      const text = await resp.text()

      // 尝试返回 JSON
      try { res.json(JSON.parse(text)); return }
      catch { res.status(200).send(text); return }

    } catch (err: any) {
      lastError = err
      console.error(`[Vercel代理] 尝试 ${attempt + 1}/${maxRetries + 1} 失败:`, err.message, `URL: ${decodedUrl.substring(0, 80)}`)

      if (attempt < maxRetries) {
        // 等待 1 秒后重试
        await new Promise(r => setTimeout(r, 1000))
      }
    }
  }

  res.status(502).json({
    error: `代理请求失败（已重试 ${maxRetries} 次）`,
    detail: lastError?.message || '未知错误'
  })
}