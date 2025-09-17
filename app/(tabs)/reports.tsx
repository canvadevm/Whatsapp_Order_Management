import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { TrendingUp, Package, Users, DollarSign, Calendar, Download } from 'lucide-react-native';
import GlassCard from '@/components/GlassCard';
import QuickStatsCard from '@/components/QuickStatsCard';
import ThemedButton from '@/components/ThemedButton';
import { useThemeStore } from '@/store/themeStore';
import { useOrderStore } from '@/store/orderStore';
import { useProductStore } from '@/store/productStore';
import { useCustomerStore } from '@/store/customerStore';

const screenWidth = Dimensions.get('window').width;

export default function Reports() {
  const systemColorScheme = useColorScheme();
  const { theme } = useThemeStore();
  const { orders } = useOrderStore();
  const { products } = useProductStore();
  const { customers } = useCustomerStore();
  
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const isDark = activeTheme === 'dark';

  // Calculate analytics data
  const totalRevenue = orders
    .filter(order => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total, 0);

  const completedOrders = orders.filter(order => order.status === 'delivered').length;

  // Last 7 days sales data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const salesData = last7Days.map(date => {
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === date.toDateString() && order.status !== 'cancelled';
    });
    return dayOrders.reduce((sum, order) => sum + order.total, 0);
  });

  const labels = last7Days.map(date => 
    date.toLocaleDateString('en', { weekday: 'short' })
  );

  // Top selling products
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  
  orders.forEach(order => {
    if (order.status !== 'cancelled') {
      order.items.forEach(item => {
        const existing = productSales.get(item.productId) || { 
          name: item.productName, 
          quantity: 0, 
          revenue: 0 
        };
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
        productSales.set(item.productId, existing);
      });
    }
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const chartConfig = {
    backgroundGradientFrom: isDark ? '#0f172a' : '#ffffff',
    backgroundGradientTo: isDark ? '#1e293b' : '#f8fafc',
    color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.7,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
      fill: isDark ? '#94a3b8' : '#64748b',
    },
    propsForBackgroundLines: {
      stroke: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
    },
  };

  const styles = createStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Reports & Analytics</Text>
        </View>

        <View style={styles.statsContainer}>
          <QuickStatsCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            color="#10b981"
            isDark={isDark}
            style={styles.fullWidthCard}
          />
          <QuickStatsCard
            title="Total Orders"
            value={orders.length.toString()}
            icon={Package}
            color="#06b6d4"
            isDark={isDark}
          />
          <QuickStatsCard
            title="Completed"
            value={completedOrders.toString()}
            icon={TrendingUp}
            color="#8b5cf6"
            isDark={isDark}
          />
          <QuickStatsCard
            title="Customers"
            value={customers.length.toString()}
            icon={Users}
            color="#f59e0b"
            isDark={isDark}
          />
        </View>

        <GlassCard style={styles.chartCard} isDark={isDark}>
          <Text style={styles.cardTitle}>Sales Trend (Last 7 Days)</Text>
          {salesData.some(value => value > 0) ? (
            <LineChart
              data={{
                labels,
                datasets: [
                  {
                    data: salesData,
                  },
                ],
              }}
              width={screenWidth - 80}
              height={200}
              chartConfig={chartConfig}
              style={styles.chart}
              bezier
            />
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyChartText}>No sales data available</Text>
            </View>
          )}
        </GlassCard>

        <GlassCard style={styles.chartCard} isDark={isDark}>
          <Text style={styles.cardTitle}>Top Selling Products</Text>
          {topProducts.length > 0 ? (
            <View style={styles.topProductsList}>
              {topProducts.map((product, index) => (
                <View key={product.name} style={styles.topProductItem}>
                  <View style={styles.productRank}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productStats}>
                      {product.quantity} sold • ${product.revenue.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyChartText}>No product data available</Text>
            </View>
          )}
        </GlassCard>

        <GlassCard style={styles.exportCard} isDark={isDark}>
          <Text style={styles.cardTitle}>Export Data</Text>
          <Text style={styles.exportDescription}>
            Download your business data for external analysis
          </Text>
          <ThemedButton
            title="Export to CSV"
            onPress={() => {/* Export functionality */}}
            icon={Download}
            style={styles.exportButton}
            isDark={isDark}
          />
        </GlassCard>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 20,
  },
  fullWidthCard: {
    width: '100%',
  },
  chartCard: {
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
  chart: {
    borderRadius: 16,
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 16,
    color: isDark ? '#94a3b8' : '#64748b',
  },
  topProductsList: {
    gap: 12,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
    borderRadius: 12,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#0f172a',
    marginBottom: 2,
  },
  productStats: {
    fontSize: 14,
    color: isDark ? '#94a3b8' : '#64748b',
  },
  exportCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    alignItems: 'center',
  },
  exportDescription: {
    fontSize: 16,
    color: isDark ? '#94a3b8' : '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  exportButton: {
    minWidth: 160,
  },
  bottomPadding: {
    height: 100,
  },
});