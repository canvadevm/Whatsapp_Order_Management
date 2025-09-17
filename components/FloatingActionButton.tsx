import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Video as LucideIcon } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

interface FloatingActionButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  isDark: boolean;
}

export default function FloatingActionButton({ icon: Icon, onPress, isDark }: FloatingActionButtonProps) {
  const styles = createStyles(isDark);

  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
      <BlurView intensity={20} style={styles.blurView}>
        <Icon size={24} color="#ffffff" />
      </BlurView>
    </TouchableOpacity>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  blurView: {
    flex: 1,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
  },
});