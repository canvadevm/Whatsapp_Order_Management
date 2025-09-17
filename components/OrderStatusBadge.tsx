import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderStatus } from '@/store/orderStore';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  isDark: boolean;
}

const statusColors = {
  pending: { bg: '#fef3c7', text: '#f59e0b', darkBg: '#451a03', darkText: '#fbbf24' },
  confirmed: { bg: '#dbeafe', text: '#3b82f6', darkBg: '#1e3a8a', darkText: '#60a5fa' },
  packed: { bg: '#e0e7ff', text: '#6366f1', darkBg: '#312e81', darkText: '#818cf8' },
  delivered: { bg: '#d1fae5', text: '#10b981', darkBg: '#064e3b', darkText: '#34d399' },
  cancelled: { bg: '#fee2e2', text: '#ef4444', darkBg: '#7f1d1d', darkText: '#f87171' },
};

export default function OrderStatusBadge({ status, isDark }: OrderStatusBadgeProps) {
  const colors = statusColors[status];
  
  const styles = StyleSheet.create({
    badge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      backgroundColor: isDark ? colors.darkBg : colors.bg,
    },
    text: {
      fontSize: 12,
      fontWeight: '600',
      color: isDark ? colors.darkText : colors.text,
      textTransform: 'capitalize',
    },
  });

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}