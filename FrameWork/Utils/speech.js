
import * as Speech from 'expo-speech';

export const readOutLoud = (text) => {
  Speech.speak(text, {
    language: 'en',
    rate: 1.0
  });
};

export const stopSpeaking = () => {
  Speech.stop();
};
