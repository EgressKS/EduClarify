/**
 * Text-to-Speech Service using Web Speech API
 * Provides reliable speech synthesis without external dependencies
 */

export interface TTSConfig {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export class TextToSpeechService {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();

  constructor() {
    this.synth = window.speechSynthesis;
  }

  /**
   * Speak text using Web Speech API
   */
  speak(text: string, config: TTSConfig = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error("Speech synthesis not supported"));
        return;
      }

      // Cancel any ongoing speech
      this.stop();

      this.currentUtterance = new SpeechSynthesisUtterance(text);

      // Configure voice
      const voices = this.synth.getVoices();
      if (config.voice) {
        const selectedVoice = voices.find((v) => v.name === config.voice);
        if (selectedVoice) {
          this.currentUtterance.voice = selectedVoice;
        }
      } else {
        // Use first English voice as default
        const englishVoice = voices.find((v) => v.lang.startsWith("en"));
        if (englishVoice) {
          this.currentUtterance.voice = englishVoice;
        }
      }

      // Configure speech parameters
      this.currentUtterance.rate = config.rate || 1.0;
      this.currentUtterance.pitch = config.pitch || 1.0;
      this.currentUtterance.volume = config.volume || 1.0;

      // Event handlers
      this.currentUtterance.onstart = () => {
        this.isSpeaking = true;
        this.emit("start", { text });
        console.log("[TTS] Started speaking:", text);
      };

      this.currentUtterance.onend = () => {
        this.isSpeaking = false;
        this.emit("end", { text });
        console.log("[TTS] Finished speaking");
        resolve();
      };

      this.currentUtterance.onerror = (event) => {
        this.isSpeaking = false;
        this.emit("error", { error: event.error });
        console.error("[TTS] Error:", event.error);
        reject(new Error(event.error));
      };

      // Start speaking
      this.synth.speak(this.currentUtterance);
    });
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.emit("stop", {});
    }
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.synth?.getVoices() || [];
  }

  /**
   * Add event listener
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }
}

// Export singleton instance
export const ttsService = new TextToSpeechService();
