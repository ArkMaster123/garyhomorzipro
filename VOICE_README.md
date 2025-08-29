# Voice Functionality for Gary Chat

This document describes the voice functionality that has been added to Gary's chat interface, including speech-to-text and text-to-speech capabilities using Microsoft's VibeVoice-1.5B model.

## Features

### 🎤 Speech-to-Text (STT)
- **Microphone Button**: A cute mic icon in the chat input area
- **Voice Input**: Speak your messages instead of typing
- **Real-time Recognition**: Uses the Web Speech API for instant transcription
- **Visual Feedback**: Red microphone when actively listening

### 🔊 Text-to-Speech (TTS)
- **Voice Responses**: Gary's responses are spoken aloud when enabled
- **VibeVoice Integration**: Uses Microsoft's high-quality TTS model
- **Automatic Playback**: Responses are automatically spoken when they arrive
- **Multi-speaker Support**: Can handle different voice personas

### ⚙️ Voice Settings
- **Global Toggle**: Enable/disable voice functionality in chat header
- **Persistent Settings**: Voice preferences saved in localStorage
- **Visual Indicators**: Clear icons show voice status

## How to Use

### 1. Enable Voice
- Click the voice toggle button in the chat header (Volume2/VolumeX icon)
- When enabled, you'll see "Voice On" and responses will be spoken

### 2. Use Speech-to-Text
- Click the microphone button in the chat input area
- Speak your message clearly
- The button turns red while listening
- Your speech is transcribed to text automatically

### 3. Hear Voice Responses
- With voice enabled, Gary's responses are automatically spoken
- No additional action needed - just listen!

## Technical Implementation

### Components
- **`useVoice` Hook**: Manages voice state and functionality
- **`useVoiceResponse` Hook**: Automatically speaks assistant messages
- **Voice API Route**: `/api/voice/speak` for TTS generation
- **UI Integration**: Buttons and indicators throughout the interface

### APIs Used
- **Web Speech API**: For speech recognition (STT)
- **VibeVoice-1.5B**: For high-quality text-to-speech
- **Replicate API**: To access the VibeVoice model

### Environment Variables
```bash
REPLICATE_API_TOKEN=your_replicate_token_here
```

## Browser Compatibility

### Speech Recognition (STT)
- ✅ Chrome/Edge (webkitSpeechRecognition)
- ✅ Safari (webkitSpeechRecognition)
- ❌ Firefox (not supported)

### Text-to-Speech (TTS)
- ✅ All modern browsers (via Audio API)
- ✅ Automatic fallback handling

## Testing

Visit `/voice-test` to test the voice functionality:
- Toggle voice on/off
- Test speech recognition
- Test text-to-speech
- View real-time status

## Troubleshooting

### Speech Recognition Issues
- Ensure microphone permissions are granted
- Check browser compatibility
- Try refreshing the page

### Voice Response Issues
- Verify `REPLICATE_API_TOKEN` is set
- Check network connectivity
- Ensure voice is enabled in settings

### Audio Playback Issues
- Check system volume
- Ensure audio isn't muted
- Try refreshing the page

## Future Enhancements

- [ ] Multiple voice personas for different chat modes
- [ ] Voice speed and pitch controls
- [ ] Language selection for international users
- [ ] Offline voice processing capabilities
- [ ] Voice activity detection for hands-free operation

## Security & Privacy

- Voice data is processed locally for STT
- TTS requests are sent to VibeVoice API
- No voice data is stored permanently
- All API calls use secure HTTPS connections

## Performance Notes

- Speech recognition is real-time and lightweight
- TTS generation may take 5-30 seconds depending on text length
- Audio files are cached temporarily for better performance
- Voice settings are persisted locally for faster access
