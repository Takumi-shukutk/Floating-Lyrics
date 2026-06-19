// Floating Lyrics - Spicetify extension
// Place this file in your Spicetify Extensions folder (see README instructions)

class FloatingLyricsBridge {
  constructor() {
    this.interval = null;
  }

  onEnabled() {
    this.interval = setInterval(() => this.sendTrackInfo(), 500);
  }

  onDisabled() {
    clearInterval(this.interval);
  }

  sendTrackInfo() {
    try {
      const track = Spicetify.Player.data.track;
      if (!track) return;

      const payload = {
        name: track.name,
        artist: (track?.artist || (track?.artists || [])).map?.(a => a.name).join(', ') || track.artist || '',
        progress: Spicetify.Player.getProgress?.() || 0,
        duration: track.duration || 0,
        isPlaying: Spicetify.Player.isPlaying?.() || false,
        id: track.uri || null,
      };

      fetch('http://127.0.0.1:8889/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {
        // Electron app may not be running; ignore
      });
    } catch (e) {
      // swallow
    }
  }
}

new FloatingLyricsBridge();
