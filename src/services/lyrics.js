const axios = require('axios');
const config = require('../utils/config');

/**
 * 歌詞取得サービス
 * 複数のプロバイダーから歌詞を取得
 */
class LyricsService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * 歌詞を取得
   */
  async getLyrics(trackName, artist) {
    try {
      const cacheKey = `${trackName}|${artist}`;

      // キャッシュをチェック
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // プロバイダーから歌詞を取得（複数を試す）
      let lyrics = await this.getLyricsFromGenius(trackName, artist);
      
      if (!lyrics) {
        lyrics = await this.getLyricsFromMusixmatch(trackName, artist);
      }

      if (!lyrics) {
        lyrics = await this.getLyricsFromLyricsOvh(trackName, artist);
      }

      if (lyrics) {
        // キャッシュに保存（最大100項目）
        if (this.cache.size >= 100) {
          const firstKey = this.cache.keys().next().value;
          this.cache.delete(firstKey);
        }
        this.cache.set(cacheKey, lyrics);
      }

      return lyrics || '歌詞が見つかりません';
    } catch (error) {
      console.error('歌詞取得エラー:', error.message);
      return '歌詞を読み込めませんでした';
    }
  }

  /**
   * Genius APIから歌詞を取得
   */
  async getLyricsFromGenius(trackName, artist) {
    try {
      // 注: Genius APIはアクセストークンが必要
      // デモンストレーション用のプレースホルダー
      const geniusToken = process.env.GENIUS_API_KEY;
      if (!geniusToken) {
        return null;
      }

      const response = await axios.get(
        'https://api.genius.com/search',
        {
          params: {
            q: `${trackName} ${artist}`,
            access_token: geniusToken,
          },
          timeout: config.api.lyricsTimeout,
        }
      );

      if (response.data.response.hits.length === 0) {
        return null;
      }

      // Genius APIは検索のみで歌詞は別途スクレイピングが必要
      // ここでは簡略化のためスキップ
      return null;
    } catch (error) {
      console.error('Genius取得エラー:', error.message);
      return null;
    }
  }

  /**
   * Musixmatch APIから歌詞を取得
   */
  async getLyricsFromMusixmatch(trackName, artist) {
    try {
      const apiKey = process.env.MUSIXMATCH_API_KEY;
      if (!apiKey) {
        return null;
      }

      const response = await axios.get(
        'https://api.musixmatch.com/ws/1.1/matcher.lyrics.get',
        {
          params: {
            q_track: trackName,
            q_artist: artist,
            apikey: apiKey,
          },
          timeout: config.api.lyricsTimeout,
        }
      );

      const lyrics = response.data.message.body.lyrics?.lyrics_body;
      return lyrics || null;
    } catch (error) {
      console.error('Musixmatch取得エラー:', error.message);
      return null;
    }
  }

  /**
   * lyrics.ovh APIから歌詞を取得（無料、認証不要）
   */
  async getLyricsFromLyricsOvh(trackName, artist) {
    try {
      // URLエンコード
      const cleanTrackName = trackName.split('(')[0].trim();
      const cleanArtist = artist.split(',')[0].trim();

      const response = await axios.get(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTrackName)}`,
        {
          timeout: config.api.lyricsTimeout,
        }
      );

      return response.data.lyrics || null;
    } catch (error) {
      console.error('Lyrics.ovh取得エラー:', error.message);
      return null;
    }
  }
}

module.exports = LyricsService;
