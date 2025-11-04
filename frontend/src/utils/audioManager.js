// Audio Manager for Quiz Fun
// Uses Web Audio API and HTML5 Audio

class AudioManager {
    constructor() {
        this.bgMusic = null
        this.soundEffects = {}
        this.isMuted = localStorage.getItem('quiz_audio_muted') === 'true'
        this.bgMusicEnabled = localStorage.getItem('quiz_bgmusic_enabled') !== 'false' // default true

        // Initialize audio context
        if (typeof window !== 'undefined') {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        }
    }

    // Load background music
    loadBackgroundMusic(url) {
        if (this.bgMusic) {
            this.bgMusic.pause()
        }

        this.bgMusic = new Audio(url)
        this.bgMusic.loop = true
        this.bgMusic.volume = 0.3 // 30% volume for background

        if (this.bgMusicEnabled && !this.isMuted) {
            this.playBackgroundMusic()
        }
    }

    // Play background music
    playBackgroundMusic() {
        if (this.bgMusic && this.bgMusicEnabled && !this.isMuted) {
            this.bgMusic.play().catch(err => {
                console.log('Background music play prevented:', err)
            })
        }
    }

    // Pause background music
    pauseBackgroundMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause()
        }
    }

    // Toggle background music
    toggleBackgroundMusic() {
        this.bgMusicEnabled = !this.bgMusicEnabled
        localStorage.setItem('quiz_bgmusic_enabled', this.bgMusicEnabled)

        if (this.bgMusicEnabled) {
            this.playBackgroundMusic()
        } else {
            this.pauseBackgroundMusic()
        }

        return this.bgMusicEnabled
    }

    // Play sound effect
    playSound(soundName) {
        if (this.isMuted) return

        const soundUrls = {
            // Chỉ dùng 3 file local
            highScore: '/music/Am_thanh_chuc_mung_chien_thang-www_tiengdong_com.mp3', // Điểm cao >=80%
            lowScore: '/music/Am_thanh_tra_loi_sai-www_tiengdong_com.mp3', // Điểm thấp <80%
        }

        const url = soundUrls[soundName]
        if (!url) return

        // Create or reuse audio element
        if (!this.soundEffects[soundName]) {
            this.soundEffects[soundName] = new Audio(url)
            this.soundEffects[soundName].volume = 0.6
        }

        // Reset and play
        const sound = this.soundEffects[soundName]
        sound.currentTime = 0
        sound.play().catch(err => {
            console.log('Sound effect play prevented:', err)
        })
    }

    // Toggle mute
    toggleMute() {
        this.isMuted = !this.isMuted
        localStorage.setItem('quiz_audio_muted', this.isMuted)

        if (this.isMuted) {
            this.pauseBackgroundMusic()
        } else if (this.bgMusicEnabled) {
            this.playBackgroundMusic()
        }

        return this.isMuted
    }

    // Check if muted
    isMutedStatus() {
        return this.isMuted
    }

    // Check if background music is enabled
    isBgMusicEnabled() {
        return this.bgMusicEnabled
    }

    // Cleanup
    destroy() {
        this.pauseBackgroundMusic()
        Object.values(this.soundEffects).forEach(sound => {
            sound.pause()
            sound.src = ''
        })
        this.soundEffects = {}
    }
}

// Singleton instance
const audioManager = new AudioManager()

export default audioManager
