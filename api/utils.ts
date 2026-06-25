// Bilibili API 工具
// 使用 bilibili-api 或直接调用B站公开接口

const BILIBILI_API = 'https://api.bilibili.com'

// 搜索B站视频
export async function searchBilibili(keyword: string, page = 1): Promise<any[]> {
  try {
    const url = `${BILIBILI_API}/x/web-interface/search/type?search_type=video&keyword=${encodeURIComponent(keyword)}&page=${page}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    })
    const data = await res.json()
    if (data.code !== 0 || !data.data?.result) return []

    return data.data.result.map((item: any) => ({
      id: item.bvid,
      title: item.title.replace(/<[^>]+>/g, ''),
      artist: item.author,
      cover: item.pic,
      duration: item.duration,
      source: 'bilibili',
      cid: item.cid || 0
    }))
  } catch (err) {
    console.error('B站搜索失败:', err)
    return []
  }
}

// 获取B站视频音频流
export async function getBilibiliStream(bvid: string): Promise<string | null> {
  try {
    // 先获取视频信息（含cid）
    const infoUrl = `${BILIBILI_API}/x/web-interface/view?bvid=${bvid}`
    const infoRes = await fetch(infoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    })
    const infoData = await infoRes.json()
    if (infoData.code !== 0) return null

    const cid = infoData.data.cid

    // 获取播放地址
    const playUrl = `${BILIBILI_API}/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=16&type=mp4&platform=html5&high_quality=1`
    const playRes = await fetch(playUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    })
    const playData = await playRes.json()
    if (playData.code !== 0) return null

    // 优先取音频流，没有则取视频流
    const audio = playData.data?.dash?.audio
    if (audio && audio.length > 0) {
      return audio[0].baseUrl || audio[0].base_url
    }

    // 备选：视频流URL
    const video = playData.data?.durl?.[0]?.url
    return video || null
  } catch (err) {
    console.error('获取B站音频流失败:', err)
    return null
  }
}

// 搜索网易云音乐
export async function searchNetease(keyword: string, page = 1): Promise<any[]> {
  try {
    // 使用网易云公开搜索接口
    const url = `https://music.163.com/api/search/get/web?csrf_token=hlpretag=&hlposttag=&s=${encodeURIComponent(keyword)}&type=1&offset=${(page - 1) * 30}&limit=30`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://music.163.com'
      }
    })
    const data = await res.json()
    if (data.code !== 200 || !data.result?.songs) return []

    return data.result.songs.map((song: any) => ({
      id: String(song.id),
      title: song.name,
      artist: song.artists?.map((a: any) => a.name).join(', ') || '未知',
      cover: song.album?.picUrl || `https://p2.music.126.net/${song.album?.picId}/yymusic/obj/w_${song.album?.size || 320}x${song.album?.size || 320}/pic/photo_album.jpg`,
      duration: song.duration / 1000,
      source: 'netease',
      songId: String(song.id)
    }))
  } catch (err) {
    console.error('网易云搜索失败:', err)
    return []
  }
}

// 获取网易云歌曲播放地址
export async function getNeteaseStream(songId: string): Promise<string | null> {
  try {
    // 使用 https://music.163.com/song/media/outer/url?id=${songId}.mp3
    // 这是网易云官方允许的站外播放方式
    return `https://music.163.com/song/media/outer/url?id=${songId}.mp3`
  } catch {
    return null
  }
}

// 搜索QQ音乐
export async function searchQQMusic(keyword: string, page = 1): Promise<any[]> {
  try {
    const url = `https://c.y.qq.com/splcloud/fcgi-bin/smartbox_new.fcg?is_xml=0&format=json&key=${encodeURIComponent(keyword)}&loginUin=0&hostUin=0`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://y.qq.com'
      }
    })
    const data = await res.json()
    if (data.code !== 0 || !data.data?.song?.itemlist) return []

    return data.data.song.itemlist.map((item: any) => ({
      id: item.id || item.mid,
      title: item.name || item.title,
      artist: item.singer?.map((s: any) => s.name).join(', ') || '未知',
      cover: `https://y.qq.com/music/photo_new/T002R300x300M000${item.album_mid || item.album?.mid}.jpg`,
      duration: item.interval || 0,
      source: 'qqmusic',
      songId: item.mid || item.id
    }))
  } catch (err) {
    console.error('QQ音乐搜索失败:', err)
    return []
  }
}

// 获取QQ音乐播放地址
export async function getQQMusicStream(mid: string): Promise<string | null> {
  try {
    // QQ音乐公开播放链接
    return `https://ws.stream.qqmusic.qq.com/${mid}.m4a?fromtag=46`
  } catch {
    return null
  }
}

// 获取歌词（网易云）
export async function getLyrics(title: string, artist: string): Promise<Array<{ time: number; text: string }>> {
  try {
    // 先搜索歌曲
    const searchUrl = `https://music.163.com/api/search/get/web?csrf_token=&s=${encodeURIComponent(title + ' ' + artist)}&type=1&offset=0&limit=5`
    const searchRes = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://music.163.com'
      }
    })
    const searchData = await searchRes.json()
    if (searchData.code !== 200 || !searchData.result?.songs?.length) return []

    const songId = searchData.result.songs[0].id

    // 获取歌词
    const lrcUrl = `https://music.163.com/api/song/lyric?id=${songId}&lv=1&kv=1&tv=-1`
    const lrcRes = await fetch(lrcUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://music.163.com'
      }
    })
    const lrcData = await lrcRes.json()
    if (lrcData.code !== 200 || !lrcData.lrc?.lyric) return []

    // 解析LRC
    const lines = lrcData.lrc.lyric.split('\n')
    const result: Array<{ time: number; text: string }> = []
    const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/

    for (const line of lines) {
      const match = line.match(regex)
      if (match) {
        const m = parseInt(match[1])
        const s = parseInt(match[2])
        const ms = match[3].length === 3 ? parseInt(match[3]) : parseInt(match[3]) * 10
        const time = m * 60 + s + ms / 1000
        const text = line.replace(regex, '').trim()
        if (text) {
          result.push({ time, text })
        }
      }
    }

    return result.sort((a, b) => a.time - b.time)
  } catch (err) {
    console.error('获取歌词失败:', err)
    return []
  }
}