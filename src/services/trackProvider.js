class TrackProvider {
  constructor() {
    this.currentTrack = null;
  }

  getCurrentTrack() {
    return this.currentTrack;
  }

  updateCurrentTrack(track) {
    if (!track || !track.name || !track.artist) {
      return false;
    }

    const normalized = {
      name: String(track.name).trim(),
      artist: String(track.artist).trim(),
      progress: Number(track.progress || 0),
      duration: Number(track.duration || 0),
      isPlaying: Boolean(track.isPlaying),
      id: track.id || null,
      lyrics: typeof track.lyrics === 'string' && track.lyrics.trim() ? String(track.lyrics).trim() : null,
    };

    const changed =
      !this.currentTrack ||
      normalized.name !== this.currentTrack.name ||
      normalized.artist !== this.currentTrack.artist ||
      normalized.duration !== this.currentTrack.duration ||
      normalized.isPlaying !== this.currentTrack.isPlaying ||
      normalized.progress !== this.currentTrack.progress;

    this.currentTrack = normalized;
    return changed;
  }
}

module.exports = TrackProvider;
