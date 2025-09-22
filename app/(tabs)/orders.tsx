import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, Check, X, Eye } from 'lucide-react-native';
import { useOrderStore } from '@/store/orderStore';
import { generateOrderReceipt } from '@/utils/receiptGenerator';

export default function Orders() {
  const { orders, toggleItemDelivered, deleteOrder } = useOrderStore();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleDeleteOrder = (orderId: string) => {
    Alert.alert(
      'Delete Order',
      'Are you sure you want to delete this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteOrder(orderId),
        },
      ]
    );
  };

  const handleToggleDelivered = (orderId: string, itemId: string) => {
    toggleItemDelivered(orderId, itemId);
  };

  const handleGenerateReceipt = async (order: any) => {
    try {
      await generateOrderReceipt({
        orderId: order.id,
        customerName: order.customerName,
        phoneNumber: order.phoneNumber,
        items: order.items.filter((item: any) => !item.delivered),
        total: order.items
          .filter((item: any) => !item.delivered)
          .reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0),
      });
      Alert.alert('Success', 'Receipt generated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate receipt');
    }
  };

  const renderOrderItem = ({ item: order }: { item: any }) => {
    const isExpanded = expandedOrders.has(order.id);
    const undeliveredItems = order.items.filter((item: any) => !item.delivered);
    const deliveredItems = order.items.filter((item: any) => item.delivered);

    return (
      <View style={styles.orderCard}>
        <TouchableOpacity
          style={styles.orderHeader}
          onPress={() => toggleOrderExpansion(order.id)}
        >
          <View style={styles.orderInfo}>
            <Text style={styles.customerName}>{order.customerName}</Text>
            <Text style={styles.phoneNumber}>{order.phoneNumber}</Text>
            <Text style={styles.orderCode}>Order: {order.orderCode}</Text>
            <Text style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.orderSummary}>
            <Text style={styles.itemCount}>
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.totalAmount}>Rs. {order.total.toFixed(2)}</Text>
            {undeliveredItems.length > 0 && (
              <TouchableOpacity
                style={styles.receiptButton}
                onPress={() => handleGenerateReceipt(order)}
              >
                <Eye size={16} color="#3b82f6" />
                <Text style={styles.receiptButtonText}>Receipt</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.orderDetails}>
            {order.items.map((item: any) => (
              <View key={item.id} style={styles.orderItemRow}>
                <View style={styles.itemImageContainer}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                  ) : (
                    <View style={styles.itemImagePlaceholder}>
                      <Text style={styles.itemImagePlaceholderText}>No Image</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>
                    Rs. {item.unitPrice.toFixed(2)} x {item.quantity} = Rs. {(item.unitPrice * item.quantity).toFixed(2)}
                  </Text>
                  <Text style={[
                    styles.deliveryStatus,
                    item.delivered ? styles.delivered : styles.pending
                  ]}>
                    {item.delivered ? 'Delivered' : 'Pending'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    item.delivered ? styles.deliveredButton : styles.pendingButton
                  ]}
                  onPress={() => handleToggleDelivered(order.id, item.id)}
                >
                  {item.delivered ? (
                    <X size={20} color="#ffffff" />
                  ) : (
                    <Check size={20} color="#ffffff" />
                  )}
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.orderActions}>
              <TouchableOpacity
                style={styles.deleteOrderButton}
                onPress={() => handleDeleteOrder(order.id)}
              >
                <Trash2 size={16} color="#ffffff" />
                <Text style={styles.deleteOrderButtonText}>Delete Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Customer Orders</Text>
      
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No orders yet</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginVertical: 20,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  orderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  orderCode: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  orderSummary: {
    alignItems: 'flex-end',
  },
  itemCount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  receiptButtonText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
    marginLeft: 4,
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 16,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemImageContainer: {
    marginRight: 12,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  itemImagePlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImagePlaceholderText: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  deliveryStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  delivered: {
    color: '#10b981',
  },
  pending: {
    color: '#f59e0b',
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveredButton: {
    backgroundColor: '#ef4444',
  },
  pendingButton: {
    backgroundColor: '#10b981',
  },
  orderActions: {
    alignItems: 'center',
    marginTop: 16,
  },
  deleteOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteOrderButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
  },
});