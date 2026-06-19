#!/usr/bin/env node

/**
 * Spotify OAuth認証スクリプト
 * 初回セットアップ時に実行して、RefreshTokenを取得します
 */

const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');
require('dotenv').config();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:8888/callback';

// スコープ
const scopes = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-modify-playback-state',
];

console.log('🎵 Spotify OAuth 認証スクリプト\n');

if (!clientId || !clientSecret) {
  console.error('❌ エラー: SPOTIFY_CLIENT_ID と SPOTIFY_CLIENT_SECRET を .env に設定してください');
  process.exit(1);
}

// ステップ1: 認可URLを生成
const authUrl = new url.URL('https://accounts.spotify.com/authorize');
authUrl.searchParams.append('client_id', clientId);
authUrl.searchParams.append('response_type', 'code');
authUrl.searchParams.append('redirect_uri', redirectUri);
authUrl.searchParams.append('scope', scopes.join(' '));

console.log('📌 以下のURLをブラウザで開いてください:\n');
console.log(authUrl.toString());
console.log('\n✅ ログイン後、ブラウザが localhost:8888 にリダイレクトされます。');
console.log('⏳ 認可コードを待機中...\n');

// ステップ2: リダイレクトURIでコードを受け取る
// HTTPS サーバーの場合は証明書が必要
let server;

const requestHandler = async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const query = parsedUrl.query;

  if (query.code) {
    // ステップ3: コードをアクセストークンに交換
    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        querystring.stringify({
          grant_type: 'authorization_code',
          code: query.code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;

      // トークンをキャッシュに保存
      const cacheDir = path.join(__dirname, '..', '.spotify-cache');
      fs.writeFileSync(
        cacheDir,
        JSON.stringify({
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenExpiry: Date.now() + expires_in * 1000,
        })
      );

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <title>認証成功</title>
          <style>
            body { font-family: Arial; text-align: center; margin-top: 50px; }
            .success { color: green; font-size: 20px; }
            .info { color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="success">✅ Spotify認証成功！</div>
          <p class="info">このウィンドウを閉じてアプリケーションを起動してください。</p>
          <p class="info">アクセストークン有効期限: ${Math.round(expires_in / 60)} 分</p>
        </body>
        </html>
      `);

      console.log('✅ 認証成功！');
      console.log('📁 トークンは .spotify-cache に保存されました。');
      console.log('\n🚀 次のコマンドでアプリを起動してください:');
      console.log('   npm start');

      server.close();
      process.exit(0);
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <title>認証失敗</title>
          <style>
            body { font-family: Arial; text-align: center; margin-top: 50px; }
            .error { color: red; font-size: 20px; }
            .info { color: #666; margin-top: 20px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="error">❌ 認証失敗</div>
          <p class="info">${error.message}</p>
          <p>詳細はコンソールを確認してください。</p>
        </body>
        </html>
      `);

      console.error('❌ 認証エラー:', error.message);
      server.close();
      process.exit(1);
    }
  } else if (query.error) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <title>エラー</title>
      </head>
      <body>
        <h1>❌ エラー: ${query.error}</h1>
        <p>${query.error_description || ''}</p>
      </body>
      </html>
    `);

    console.error('❌ Spotifyエラー:', query.error);
    server.close();
    process.exit(1);
  } else {
    res.writeHead(400);
    res.end('Invalid request');
  }
};

// HTTPS または HTTP サーバーを起動
if (redirectUri.startsWith('https')) {
  // HTTPS の場合は自己署名証明書を使用
  const certDir = path.join(__dirname, '.certs');
  const keyPath = path.join(certDir, 'key.pem');
  const certPath = path.join(certDir, 'cert.pem');
  
  // 証明書が存在しなければ生成
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log('🔐 HTTPS 用の自己署名証明書を生成しています...\n');
    
    try {
      // selfsigned パッケージで証明書を生成
      const pems = selfsigned.generate([{ name: 'commonName', value: 'localhost' }], {
        days: 365,
        algorithm: 'sha256',
        keySize: 4096,
        extensions: [{
          name: 'subjectAltName',
          altNames: [
            { type: 2, value: 'localhost' },
            { type: 2, value: '127.0.0.1' },
            { type: 7, ip: '127.0.0.1' }
          ]
        }]
      });
      
      if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true });
      }
      
      fs.writeFileSync(keyPath, pems.private);
      fs.writeFileSync(certPath, pems.cert);
      console.log('✅ 証明書を生成しました。\n');
    } catch (e) {
      console.error('❌ 証明書の生成に失敗しました:', e.message);
      process.exit(1);
    }
  }
  
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const privateKey = fs.readFileSync(keyPath);
    const certificate = fs.readFileSync(certPath);
    const options = { key: privateKey, cert: certificate };
    
    server = https.createServer(options, requestHandler);
    console.log('🌐 HTTPS リダイレクトサーバーが https://localhost:8888 で待機しています...');
  } else {
    console.error('❌ HTTPS 証明書が見つかりません。');
    process.exit(1);
  }
} else {
  // HTTP の場合
  server = http.createServer(requestHandler);
  console.log('🌐 リダイレクトサーバーが http://localhost:8888 で待機しています...');
}

server.listen(8888);

// タイムアウト設定（10分）
setTimeout(() => {
  console.error('❌ タイムアウト: 認可コードが受け取れませんでした');
  server.close();
  process.exit(1);
}, 10 * 60 * 1000);
