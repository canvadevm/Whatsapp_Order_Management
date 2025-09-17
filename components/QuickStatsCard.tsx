import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Video as LucideIcon } from 'lucide-react-native';
import GlassCard from './GlassCard';

interface QuickStatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  isDark: boolean;
  style?: ViewStyle;
}

export default function QuickStatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  isDark,
  style 
}: QuickStatsCardProps) {
  const styles = createStyles(isDark);

  return (
    <GlassCard style={[styles.card, style]} isDark={isDark}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Icon size={24} color={color} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.value}>{value}</Text>
      </View>
    </GlassCard>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 160,
    padding: 16,
  },
  content: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    color: isDark ? '#94a3b8' : '#64748b',
    fontWeight: '500',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#0f172a',
  },
});