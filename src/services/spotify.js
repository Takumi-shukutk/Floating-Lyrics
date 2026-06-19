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
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:8888/callback';
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

        console.log('✅ キャッシュからトークンを読み込みました');

        // トークンが有効期限切れの場合は更新
        if (Date.now() >= this.tokenExpiry) {
          console.log('⏰ キャッシュのトークンが有効期限切れです');
          await this.refreshAccessToken();
        }

        return this.accessToken !== null;
      }

      // キャッシュなし: 認証情報が必要
      console.error('❌ Spotify認証情報が見つかりません。');
      console.error('   .spotify-cache ファイルが存在しません。');
      console.error('   以下を実行してください: npm run setup-auth');
      return false;
    } catch (error) {
      console.error('❌ 認証エラー:', error.message);
      return false;
    }
  }

  /**
   * アクセストークンの更新
   */
  async refreshAccessToken() {
    try {
      console.log('🔑 トークンを更新中...');
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
      console.log('✅ トークンを更新しました');
      return true;
    } catch (error) {
      console.error('❌ トークン更新エラー:');
      console.error('   ステータスコード:', error.response?.status);
      console.error('   エラーメッセージ:', error.response?.data?.error || error.message);
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
      if (!this.accessToken) {
        console.error('❌ アクセストークンが設定されていません');
        return null;
      }

      // トークン有効期限チェック
      if (Date.now() >= this.tokenExpiry) {
        console.log('🔄 トークンの有効期限切れ。更新中...');
        await this.refreshAccessToken();
      }

      const response = await axios.get(`${this.baseURL}/me/player/currently-playing`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        timeout: config.api.spotifyTimeout,
      });

      if (!response.data || !response.data.item) {
        console.warn('⚠️ 現在再生中の曲がありません');
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
      console.error('❌ 現在の曲取得エラー:');
      console.error('   ステータスコード:', error.response?.status);
      console.error('   エラーメッセージ:', error.response?.data?.error?.message || error.message);
      console.error('   Spotify エラー詳細:', error.response?.data);
      console.error('   リクエスト URL:', error.config?.url);
      console.error('   ヘッダー:', {
        Authorization: error.config?.headers?.Authorization ? '(トークン設定済み)' : '(トークンなし)'
      });
      
      // 403 エラーの追加情報
      if (error.response?.status === 403) {
        console.error('\n📌 403 エラーについて:');
        console.error('   • Spotify で曲を再生していますか？');
        console.error('   • Spotify のアクティブなデバイスがありますか？');
        console.error('   • アプリのスコープが正しいですか？');
        console.error('   詳細: https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track');
      }
      
      return null;
    }
  }
}

module.exports = SpotifyService;
