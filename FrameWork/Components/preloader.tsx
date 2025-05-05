import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';

import LottieView from 'lottie-react-native';
import { RootState } from '../Redux/store';

const { width, height } = Dimensions.get('window');

export default function Preloader() {
  const isLoading = useSelector((state: RootState) => state.preloader.isLoading);

  if (!isLoading) return null;

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/chefmate.json')}
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  animation: {
    width: 150,
    height: 150,
  },
});
