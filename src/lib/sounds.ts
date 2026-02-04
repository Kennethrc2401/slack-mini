/**
 * Sound Notification Utilities
 * Handles audio playback for notifications
 */

class SoundManager {
    private audio: HTMLAudioElement | null = null;
    private soundEnabled: boolean = true;

    constructor() {
        if (typeof window !== "undefined") {
            this.audio = new Audio();
        }
    }

    /**
     * Set whether sounds are enabled
     */
    setSoundEnabled(enabled: boolean) {
        this.soundEnabled = enabled;
    }

    /**
     * Play a notification sound
     */
    playNotificationSound(soundPath: string = "/sounds/slick-notification.mp3") {
        if (!this.soundEnabled || !this.audio) {
            return;
        }

        try {
            this.audio.src = soundPath;
            this.audio.volume = 0.5; // Set to 50% volume
            this.audio.play().catch((error) => {
                console.error("Error playing notification sound:", error);
            });
        } catch (error) {
            console.error("Error setting up notification sound:", error);
        }
    }

    /**
     * Play a mention sound (slightly different/louder)
     */
    playMentionSound() {
        if (!this.soundEnabled || !this.audio) {
            return;
        }

        try {
            this.audio.src = "/sounds/opening-message-tone.mp3";
            this.audio.volume = 0.7; // Slightly louder for mentions
            this.audio.play().catch((error) => {
                console.error("Error playing mention sound:", error);
            });
        } catch (error) {
            console.error("Error setting up mention sound:", error);
        }
    }

    /**
     * Play a message sent sound
     */
    playSentSound() {
        if (!this.soundEnabled || !this.audio) {
            return;
        }

        try {
            this.audio.src = "/sounds/message-tone-in-the-end.mp3";
            this.audio.volume = 0.3; // Quieter for sent messages
            this.audio.play().catch((error) => {
                console.error("Error playing sent sound:", error);
            });
        } catch (error) {
            console.error("Error setting up sent sound:", error);
        }
    }
}

// Export singleton instance
export const soundManager = new SoundManager();

// Helper functions for easier use
export const playNotificationSound = () => soundManager.playNotificationSound();
export const playMentionSound = () => soundManager.playMentionSound();
export const playSentSound = () => soundManager.playSentSound();
export const setSoundEnabled = (enabled: boolean) => soundManager.setSoundEnabled(enabled);
