import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Video as LucideIcon } from 'lucide-react-native';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  isDark: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: LucideIcon;
}

export default function ThemedButton({ 
  title, 
  onPress, 
  style, 
  isDark, 
  disabled = false, 
  variant = 'primary',
  icon: Icon
}: ThemedButtonProps) {
  const styles = createStyles(isDark, variant, disabled);

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {Icon && <Icon size={20} color={styles.text.color} style={styles.icon} />}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (isDark: boolean, variant: string, disabled: boolean) => {
  const getBackgroundColor = () => {
    if (disabled) return isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(156, 163, 175, 0.5)';
    
    switch (variant) {
      case 'danger':
        return '#ef4444';
      case 'secondary':
        return isDark ? 'rgba(55, 65, 81, 0.8)' : 'rgba(229, 231, 235, 0.8)';
      default:
        return '#06b6d4';
    }
  };

  const getTextColor = () => {
    if (disabled) return isDark ? '#6b7280' : '#9ca3af';
    if (variant === 'secondary') return isDark ? '#ffffff' : '#0f172a';
    return '#ffffff';
  };

  return StyleSheet.create({
    button: {
      backgroundColor: getBackgroundColor(),
      borderRadius: 25,
      paddingVertical: 16,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: variant === 'primary' ? '#06b6d4' : 'transparent',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: disabled ? 0 : 0.3,
      shadowRadius: 8,
      elevation: disabled ? 0 : 8,
    },
    text: {
      color: getTextColor(),
      fontSize: 16,
      fontWeight: '600',
    },
    icon: {
      marginRight: 8,
    },
  });
};