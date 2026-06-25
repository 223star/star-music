// 通过 Vercel 代理调用各平台 API（解决 CORS 问题）

const PROXY = '/api/proxy?url='

async function proxyFetch(url: string): Promise<any> {
  const res = await fetch(PROXY + encodeURIComponent(url))
  if (!res.ok) throw new Error(`代理请求失败: ${res.status}`)
  return res.json()
}

// 搜索网易云音乐
export async function searchNetease(keyword: string): Promise<any[]> {
  try {
    const url = `https://music.163.com/api/search/get/web?csrf_token=&s=${encodeURIComponent(keyword)}&type=1&offset=0&limit=30`
    const data = await proxyFetch(url)
    if (data.code !== 200 || !data.result?.songs) return []
    return data.result.songs.map((song: any) => ({
      id: String(song.id),
      title: song.name,
      artist: song.artists?.map((a: any) => a.name).join(', ') || '未知',
      cover: song.album?.picUrl || `https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg`,
      duration: (song.duration / 1000) || 0,
      source: 'netease' as const,
      songId: String(song.id),
      audioUrl: `https://music.163.com/song/media/outer/url?id=${song.id}.mp3`
    }))
  } catch (err) {
    console.error('网易云搜索失败:', err)
    return []
  }
}

// 搜索QQ音乐
export async function searchQQMusic(keyword: string): Promise<any[]> {
  try {
    const url = `https://c.y.qq.com/splcloud/fcgi-bin/smartbox_new.fcg?is_xml=0&format=json&key=${encodeURIComponent(keyword)}&loginUin=0&hostUin=0`
    const data = await proxyFetch(url)
    if (data.code !== 0 || !data.data?.song?.itemlist) return []
    return data.data.song.itemlist.map((item: any) => ({
      id: item.mid || item.id,
      title: item.name,
      artist: item.singer || '未知',
      cover: `https://y.qq.com/music/photo_new/T002R300x300M000${item.mid || item.id}.jpg`,
      duration: 0,
      source: 'qqmusic' as const,
      songId: item.mid || item.id,
      audioUrl: `https://ws.stream.qqmusic.qq.com/${item.mid || item.id}.m4a?fromtag=46`
    }))
  } catch (err) {
    console.error('QQ音乐搜索失败:', err)
    return []
  }
}

// 获取歌词
export async function fetchLyrics(title: string, artist: string): Promise<Array<{ time: number; text: string }>> {
  try {
    const searchUrl = `https://music.163.com/api/search/get/web?csrf_token=&s=${encodeURIComponent(title + ' ' + artist)}&type=1&offset=0&limit=5`
    const searchData = await proxyFetch(searchUrl)
    if (searchData.code !== 200 || !searchData.result?.songs?.length) return []

    const songId = searchData.result.songs[0].id
    const lrcUrl = `https://music.163.com/api/song/lyric?id=${songId}&lv=1&kv=1&tv=-1`
    const lrcData = await proxyFetch(lrcUrl)
    if (lrcData.code !== 200 || !lrcData.lrc?.lyric) return []

    const lines = lrcData.lrc.lyric.split('\n')
    const result: Array<{ time: number; text: string }> = []
    const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/
    for (const line of lines) {
      const match = line.match(regex)
      if (match) {
        const m = parseInt(match[1]), s = parseInt(match[2])
        const ms = match[3].length === 3 ? parseInt(match[3]) : parseInt(match[3]) * 10
        const time = m * 60 + s + ms / 1000
        const text = line.replace(regex, '').trim()
        if (text) result.push({ time, text })
      }
    }
    return result.sort((a, b) => a.time - b.time)
  } catch (err) {
    console.error('获取歌词失败:', err)
    return []
  }
}

// 全平台搜索
export async function searchAll(keyword: string): Promise<any[]> {
  const [netease, qqmusic] = await Promise.all([searchNetease(keyword), searchQQMusic(keyword)])
  const all = [...netease, ...qqmusic]
  const seen = new Set<string>()
  return all.filter(t => {
    const key = t.title + t.artist
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}