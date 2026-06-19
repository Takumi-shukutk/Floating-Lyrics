const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../utils/config');

class SpotifyService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:8888/callback';
    this.cachePath = path.join(__dirname, '../../.spotify-cache');
    this.baseURL = 'https://api.spotify.com/v1';
  }

  /**
   * Spotify APIの認証
   * セットアップ後、保存されたトークンを使用
   */
  async authenticate() {
    try {
      // キャッシュされたトークンがあれば読み込む
      if (fs.existsSync(this.cachePath)) {
        const cached = JSON.parse(fs.readFileSync(this.cachePath, 'utf8'));
        this.accessToken = cached.accessToken;
        this.refreshToken = cached.refreshToken;
        this.tokenExpiry = cached.tokenExpiry;

        // トークンが有効期限切れの場合は更新
        if (Date.now() >= this.tokenExpiry) {
          await this.refreshAccessToken();
        }

        return this.accessToken !== null;
      }

      // キャッシュなし: 認証情報が必要
      console.warn('Spotify認証情報が見つかりません。');
      console.warn('.envファイルに SPOTIFY_CLIENT_ID と SPOTIFY_CLIENT_SECRET を設定してください。');
      return false;
    } catch (error) {
      console.error('認証エラー:', error);
      return false;
    }
  }

  /**
   * アクセストークンの更新
   */
  async refreshAccessToken() {
    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        null,
        {
          params: {
            grant_type: 'refresh_token',
            refresh_token: this.refreshToken,
            client_id: this.clientId,
            client_secret: this.clientSecret,
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;

      // 新しいrefresh_tokenがあれば更新
      if (response.data.refresh_token) {
        this.refreshToken = response.data.refresh_token;
      }

      this.saveTokenCache();
      return true;
    } catch (error) {
      console.error('トークン更新エラー:', error);
      return false;
    }
  }

  /**
   * トークンをキャッシュに保存
   */
  saveTokenCache() {
    try {
      const cacheDir = path.dirname(this.cachePath);
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      fs.writeFileSync(
        this.cachePath,
        JSON.stringify({
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
          tokenExpiry: this.tokenExpiry,
        })
      );
    } catch (error) {
      console.error('キャッシュ保存エラー:', error);
    }
  }

  /**
   * 現在再生中の曲を取得
   */
  async getCurrentTrack() {
    try {
      if (!this.accessToken) return null;

      // トークン有効期限チェック
      if (Date.now() >= this.tokenExpiry) {
        await this.refreshAccessToken();
      }

      const response = await axios.get(`${this.baseURL}/me/player/currently-playing`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        timeout: config.api.spotifyTimeout,
      });

      if (!response.data || !response.data.item) {
        return null;
      }

      const item = response.data.item;
      return {
        name: item.name,
        artist: item.artists.map((a) => a.name).join(', '),
        progress: response.data.progress_ms,
        duration: item.duration_ms,
        isPlaying: response.data.is_playing,
        id: item.id,
      };
    } catch (error) {
      console.error('現在の曲取得エラー:', error.message);
      return null;
    }
  }
}

module.exports = SpotifyService;
