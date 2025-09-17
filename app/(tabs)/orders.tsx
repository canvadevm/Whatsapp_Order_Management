import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Plus, Package, Clock, CircleCheck as CheckCircle, Truck, X } from 'lucide-react-native';
import GlassCard from '@/components/GlassCard';
import FloatingActionButton from '@/components/FloatingActionButton';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { useThemeStore } from '@/store/themeStore';
import { useOrderStore, Order, OrderStatus } from '@/store/orderStore';
import OrderFormModal from '@/components/OrderFormModal';

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  packed: Package,
  delivered: CheckCircle,
  cancelled: X,
};

export default function Orders() {
  const systemColorScheme = useColorScheme();
  const { theme } = useThemeStore();
  const { orders, updateOrderStatus } = useOrderStore();
  
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const isDark = activeTheme === 'dark';

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    Alert.alert(
      'Update Order Status',
      `Change status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: () => updateOrderStatus(orderId, newStatus),
        },
      ]
    );
  };

  const styles = createStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterContainer}
        >
          {(['all', 'pending', 'confirmed', 'packed', 'delivered', 'cancelled'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                selectedStatus === status && styles.filterButtonActive
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text style={[
                styles.filterText,
                selectedStatus === status && styles.filterTextActive
              ]}>
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredOrders.map((order) => (
          <GlassCard key={order.id} style={styles.orderCard} isDark={isDark}>
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderCustomer}>{order.customerName}</Text>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.orderMeta}>
                <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                <OrderStatusBadge status={order.status} isDark={isDark} />
              </View>
            </View>

            <View style={styles.orderItems}>
              {order.items.map((item, index) => (
                <Text key={index} style={styles.orderItem}>
                  {item.quantity}x {item.productName}
                </Text>
              ))}
            </View>

            {order.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{order.notes}</Text>
              </View>
            )}

            <View style={styles.orderActions}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(['pending', 'confirmed', 'packed', 'delivered', 'cancelled'] as OrderStatus[])
                  .filter(status => status !== order.status)
                  .map((status) => {
                    const Icon = statusIcons[status];
                    return (
                      <TouchableOpacity
                        key={status}
                        style={styles.statusButton}
                        onPress={() => handleStatusUpdate(order.id, status)}
                      >
                        <Icon size={16} color="#06b6d4" />
                        <Text style={styles.statusButtonText}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            </View>
          </GlassCard>
        ))}

        {filteredOrders.length === 0 && (
          <View style={styles.emptyContainer}>
            <Package size={60} color={isDark ? '#94a3b8' : '#64748b'} />
            <Text style={styles.emptyText}>
              {selectedStatus === 'all' ? 'No orders yet' : `No ${selectedStatus} orders`}
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <FloatingActionButton
        icon={Plus}
        onPress={() => setShowAddModal(true)}
        isDark={isDark}
      />

      <OrderFormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#0f172a',
    marginBottom: 20,
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#06b6d4',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#94a3b8' : '#64748b',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  orderCard: {
    padding: 20,
    marginBottom: 15,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  orderInfo: {
    flex: 1,
  },
  orderCustomer: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#0f172a',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: isDark ? '#94a3b8' : '#64748b',
  },
  orderMeta: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#0f172a',
    marginBottom: 8,
  },
  orderItems: {
    marginBottom: 15,
  },
  orderItem: {
    fontSize: 14,
    color: isDark ? '#94a3b8' : '#64748b',
    marginBottom: 2,
  },
  notesContainer: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#06b6d4',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: isDark ? '#94a3b8' : '#64748b',
  },
  orderActions: {
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
    paddingTop: 15,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)',
    marginRight: 10,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#06b6d4',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: isDark ? '#94a3b8' : '#64748b',
    marginTop: 20,
  },
  bottomPadding: {
    height: 100,
  },
});