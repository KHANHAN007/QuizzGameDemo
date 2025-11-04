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
            correct: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', // Success bell
            wrong: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3', // Error buzzer
            click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Click
            submit: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Success notification
            complete: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Completion fanfare
            tick: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' // Tick sound
        }

        const url = soundUrls[soundName]
        if (!url) return

        // Create or reuse audio element
        if (!this.soundEffects[soundName]) {
            this.soundEffects[soundName] = new Audio(url)
            this.soundEffects[soundName].volume = 0.5
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
