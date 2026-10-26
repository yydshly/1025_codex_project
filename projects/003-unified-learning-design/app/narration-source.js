// Generated public audio metadata. No API credentials are included.
export const narrationSource=Object.freeze({
  "provider": "MiniMax",
  "model": "speech-2.8-hd",
  "voice": "Chinese (Mandarin)_Gentle_Senior",
  "speed": 0.95,
  "files": {
    "types": "types-e696e455796b.wav",
    "legend": "legend-9c38c46e16a5.wav",
    "ramp-ready": "ramp-ready-53ecbd5b052e.wav",
    "ramp-bottom-1": "ramp-bottom-1-c5a247e4deba.wav",
    "ramp-bottom-2": "ramp-bottom-2-d87167bda3f2.wav",
    "ramp-bottom-3": "ramp-bottom-3-297d6f4b7e47.wav",
    "ramp-loss-1": "ramp-loss-1-f22d72a44326.wav",
    "ramp-loss-2": "ramp-loss-2-6160359f4e1a.wav",
    "ramp-loss-3": "ramp-loss-3-26ec13103c5e.wav",
    "spring-ready": "spring-ready-f3341b0c62e2.wav",
    "spring-apex": "spring-apex-1b660f3f14c3.wav",
    "spring-land": "spring-land-b963bc6bf447.wav",
    "outro": "outro-b79f02b99183.wav"
  }
});
export function narrationUrl(id){const file=narrationSource.files[id];if(!file)throw new Error("Missing narration clip: "+id);return new URL("./voice/minimax/"+file,import.meta.url).href;}
