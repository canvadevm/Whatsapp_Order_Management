import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  isDark: boolean;
}

export default function GlassCard({ children, style, isDark }: GlassCardProps) {
  return (
    <View style={[styles.container, style]}>
      <BlurView
        intensity={isDark ? 20 : 30}
        style={[styles.blurView, getGlassStyles(isDark)]}
      >
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurView: {
    borderRadius: 20,
    borderWidth: 1,
  },
});

const getGlassStyles = (isDark: boolean) => ({
  backgroundColor: isDark ? 'rgba(17, 24, 39, 0.3)' : 'rgba(255, 255, 255, 0.3)',
  borderColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
});