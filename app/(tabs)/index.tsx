import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { TrendingUp, Package, ShoppingCart, TriangleAlert as AlertTriangle, Plus } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import GlassCard from '@/components/GlassCard';
import FloatingActionButton from '@/components/FloatingActionButton';
import QuickStatsCard from '@/components/QuickStatsCard';
import { useThemeStore } from '@/store/themeStore';
import { useOrderStore } from '@/store/orderStore';
import { useProductStore } from '@/store/productStore';

export default function Dashboard() {
  const systemColorScheme = useColorScheme();
  const { theme } = useThemeStore();
  const { orders } = useOrderStore();
  const { products } = useProductStore();
  
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const isDark = activeTheme === 'dark';

  // Calculate stats
  const todayOrders = orders.filter(order => {
    const today = new Date().toDateString();
    return new Date(order.createdAt).toDateString() === today;
  });

  const todaySales = todayOrders.reduce((sum, order) => {
    return order.status !== 'cancelled' ? sum + order.total : sum;
  }, 0);

  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const lowStockProducts = products.filter(product => product.stock <= 5).length;

  const styles = createStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Welcome back! Here's your business overview</Text>
        </View>

        <View style={styles.statsContainer}>
          <QuickStatsCard
            title="Today's Sales"
            value={`$${todaySales.toFixed(2)}`}
            icon={TrendingUp}
            color="#10b981"
            isDark={isDark}
          />
          <QuickStatsCard
            title="New Orders"
            value={todayOrders.length.toString()}
            icon={ShoppingCart}
            color="#06b6d4"
            isDark={isDark}
          />
          <QuickStatsCard
            title="Pending Orders"
            value={pendingOrders.toString()}
            icon={ShoppingCart}
            color="#f59e0b"
            isDark={isDark}
          />
          <QuickStatsCard
            title="Low Stock"
            value={lowStockProducts.toString()}
            icon={AlertTriangle}
            color="#ef4444"
            isDark={isDark}
          />
        </View>

        <GlassCard style={styles.recentOrdersCard} isDark={isDark}>
          <Text style={styles.cardTitle}>Recent Orders</Text>
          {orders.slice(0, 5).map((order) => (
            <View key={order.id} style={styles.orderItem}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderCustomer}>{order.customerName}</Text>
                <Text style={styles.orderStatus}>{order.status}</Text>
              </View>
              <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
            </View>
          ))}
          {orders.length === 0 && (
            <Text style={styles.emptyText}>No orders yet</Text>
          )}
        </GlassCard>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <FloatingActionButton
        icon={Plus}
        onPress={() => {/* Navigate to new order */}}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: isDark ? '#94a3b8' : '#64748b',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 20,
  },
  recentOrdersCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#0f172a',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
  },
  orderInfo: {
    flex: 1,
  },
  orderCustomer: {
    fontSize: 16,
    fontWeight: '500',
    color: isDark ? '#ffffff' : '#0f172a',
  },
  orderStatus: {
    fontSize: 14,
    color: '#06b6d4',
    textTransform: 'capitalize',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#0f172a',
  },
  emptyText: {
    textAlign: 'center',
    color: isDark ? '#94a3b8' : '#64748b',
    fontSize: 16,
    paddingVertical: 20,
  },
  bottomPadding: {
    height: 100,
  },
});