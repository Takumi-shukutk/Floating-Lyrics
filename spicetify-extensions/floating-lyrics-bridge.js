// Floating Lyrics - Spicetify extension
// Place this file in your Spicetify Extensions folder (see README instructions)

class FloatingLyricsBridge {
  constructor() {
    this.interval = null;
    this.onEnabled();
  }

  onEnabled() {
    this.interval = setInterval(() => this.sendTrackInfo(), 500);
  }

  onDisabled() {
    clearInterval(this.interval);
  }

  extractTrackInfo(track) {
    if (!track) return null;

    const rawTrack = track.metadata || track;

    const name = rawTrack.name || rawTrack.title || rawTrack.trackName || '';
    const artists = rawTrack.artists || rawTrack.artist || rawTrack.artists?.items || [];

    const artistNames = Array.isArray(artists)
      ? artists.map((artist) => (artist?.name || artist?.title || String(artist))).filter(Boolean)
      : String(artists).
          split(',')
          .map((name) => name.trim())
          .filter(Boolean);

    const artist = Array.isArray(artistNames) ? artistNames.join(', ') : artistNames;

    return {
      name: String(name || '').trim(),
      artist: String(artist || '').trim(),
      duration: Number(rawTrack.duration || rawTrack.length || rawTrack.duration_ms || 0),
      id: rawTrack.uri || rawTrack.id || null,
    };
  }

  sendTrackInfo() {
    try {
      const track = Spicetify.Player.data.track || Spicetify.Player.data.track?.metadata;
      const info = this.extractTrackInfo(track);
      if (!info || !info.name || !info.artist) return;

      const payload = {
        ...info,
        progress: Spicetify.Player.getProgress?.() || 0,
        isPlaying: Spicetify.Player.isPlaying?.() || false,
      };

      console.log('FloatingLyricsBridge sending track:', payload);

      fetch('http://127.0.0.1:8889/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {
        // Electron app may not be running; ignore
      });
    } catch (e) {
      console.error('FloatingLyricsBridge error:', e);
    }
  }
}

new FloatingLyricsBridge();
