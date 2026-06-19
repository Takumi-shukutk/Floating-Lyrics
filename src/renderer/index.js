// グローバル状態
let currentTrackData = null;
let currentLyricsLines = [];
let currentLineIndex = -1;
let currentProgress = 0;
let totalDuration = 0;

// DOM要素
const titleBar = document.getElementById('title-bar');
const trackTitle = document.getElementById('track-title');
const lyricsContent = document.getElementById('lyrics-content');
const container = document.querySelector('.container');
const pinBtn = document.getElementById('pin-btn');
const minBtn = document.getElementById('min-btn');
const closeBtn = document.getElementById('close-btn');

// ウィンドウ移動機能
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

titleBar.addEventListener('mousedown', (e) => {
  isDragging = true;
  dragOffset = { x: e.clientX, y: e.clientY };
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const deltaX = e.clientX - dragOffset.x;
    const deltaY = e.clientY - dragOffset.y;
    window.electronAPI.setWindowPosition(
      Math.round(window.screenX + deltaX),
      Math.round(window.screenY + deltaY)
    );
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// ボタンイベント
pinBtn.addEventListener('click', () => {
  const isPinned = pinBtn.classList.toggle('pinned');
  window.electronAPI.toggleAlwaysOnTop(isPinned);
  pinBtn.style.opacity = isPinned ? '1' : '0.6';
});

minBtn.addEventListener('click', () => {
  window.electronAPI.minimizeWindow();
});

closeBtn.addEventListener('click', () => {
  window.electronAPI.closeWindow();
});

// 背景の明るさを検出して文字色を自動反転
function detectBackgroundBrightness() {
  // スクリーン全体の色情報を取得するのは難しいため、
  // ユーザーの時間や設定に基づいて判定
  const hour = new Date().getHours();
  const isDarkHours = hour >= 19 || hour <= 7;

  if (!isDarkHours && currentTrackData) {
    container.classList.add('light-bg');
  } else {
    container.classList.remove('light-bg');
  }
}

// 歌詞を行ごとに分割
function parseLyrics(lyricsText) {
  if (!lyricsText) return [];
  return lyricsText.split('\n').filter(line => line.trim());
}

// 時間に基づいて現在の歌詞行を計算
function calculateCurrentLineIndex(progress, duration) {
  if (currentLyricsLines.length === 0) return -1;

  // 簡易的な計算: 歌詞行数で時間を均等分割
  const lineCount = currentLyricsLines.length;
  const progressPercent = duration > 0 ? progress / duration : 0;
  const index = Math.floor(progressPercent * lineCount);

  return Math.min(index, lineCount - 1);
}

// 歌詞を表示更新
function updateLyricsDisplay() {
  if (currentLyricsLines.length === 0) {
    lyricsContent.innerHTML =
      '<div class="lyrics-line placeholder">歌詞を読み込み中...</div>';
    return;
  }

  const newIndex = calculateCurrentLineIndex(currentProgress, totalDuration);

  // 必要な場合のみ再レンダリング
  if (newIndex === currentLineIndex) return;

  currentLineIndex = newIndex;

  // 表示する歌詞行（現在行 ± 1行）
  const startIdx = Math.max(0, newIndex - 1);
  const endIdx = Math.min(currentLyricsLines.length - 1, newIndex + 1);

  let html = '';
  for (let i = startIdx; i <= endIdx; i++) {
    const line = currentLyricsLines[i];
    let className = 'lyrics-line';

    if (i === newIndex) {
      className += ' current';
    } else if (i === newIndex + 1) {
      className += ' next';
    }

    html += `<div class="${className}">${escapeHtml(line)}</div>`;
  }

  lyricsContent.innerHTML = html;
}

// HTMLエスケープ
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// 歌詞データ更新
async function updateTrackAndLyrics() {
  try {
    const data = await window.electronAPI.getCurrentTrackLyrics();

    if (!data) {
      trackTitle.textContent = 'Spotify を待機中...';
      lyricsContent.innerHTML =
        '<div class="lyrics-line placeholder">Spotify を起動して音楽を再生してください</div>';
      return;
    }

    if (currentTrackData?.trackName !== data.trackName) {
      // 新しい曲に切り替わった
      currentTrackData = data;
      currentLyricsLines = parseLyrics(data.lyrics);
      currentLineIndex = -1;
      currentProgress = 0;
      totalDuration = data.duration;

      trackTitle.textContent = `${data.artist} - ${data.trackName}`;
      detectBackgroundBrightness();
    }

    // 再生位置を更新
    currentProgress = data.progress;
    totalDuration = data.duration;

    if (data.isPlaying) {
      updateLyricsDisplay();
    }
  } catch (error) {
    console.error('歌詞更新エラー:', error);
  }
}

// 初期化
window.electronAPI.onUpdateLyrics(() => {
  updateTrackAndLyrics();
});

// 初回読み込み
updateTrackAndLyrics();

// 定期的な更新（500ms毎）
setInterval(updateTrackAndLyrics, 500);
