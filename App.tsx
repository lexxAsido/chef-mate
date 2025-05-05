
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { ThemeProvider } from './FrameWork/Context/ThemeContext';
import { store } from './FrameWork/Redux/store';
import { Provider } from 'react-redux';
import './global.css';
import Preloader from './FrameWork/Components/preloader';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Sora_400Regular, Sora_700Bold } from '@expo-google-fonts/sora';
import { StackNavigator } from './FrameWork/Navigation/stack';

SplashScreen.preventAutoHideAsync();


export default function App() {
  const [fontsLoaded] = useFonts({
    SoraRegular: Sora_400Regular,
    SoraBold: Sora_700Bold,
    'PlaywriteSA': require('./assets/fonts/PlaywriteAUSA-VariableFont_wght.ttf'),
  });

  useEffect  (() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); 
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; 
  }
  return (
    
    <Provider store={store}>
      <ThemeProvider>
        <View className=' flex-1'>
        <StatusBar style="auto" />
        <Preloader/>
        <StackNavigator/>
        </View>
      </ThemeProvider>
    </Provider>

  );
}

