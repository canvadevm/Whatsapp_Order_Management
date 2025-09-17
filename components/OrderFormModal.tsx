import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Plus, Minus, Trash2 } from 'lucide-react-native';
import GlassCard from './GlassCard';
import ThemedButton from './ThemedButton';
import { useOrderStore } from '@/store/orderStore';
import { useProductStore } from '@/store/productStore';
import { useCustomerStore } from '@/store/customerStore';

interface OrderFormModalProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
}

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export default function OrderFormModal({ visible, onClose, isDark }: OrderFormModalProps) {
  const { addOrder } = useOrderStore();
  const { products } = useProductStore();
  const { customers } = useCustomerStore();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [showProductSelect, setShowProductSelect] = useState(false);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addProduct = (product: typeof products[0]) => {
    const existingItem = orderItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setOrderItems(items =>
        items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems(items => [...items, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
      }]);
    }
    setShowProductSelect(false);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setOrderItems(items =>
      items.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setOrderItems(items => items.filter(item => item.productId !== productId));
  };

  const resetForm = () => {
    setSelectedCustomerId('');
    setOrderItems([]);
    setNotes('');
    setShowCustomerSelect(false);
    setShowProductSelect(false);
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      Alert.alert('Error', 'Please select a customer');
      return;
    }

    if (orderItems.length === 0) {
      Alert.alert('Error', 'Please add at least one product');
      return;
    }

    setLoading(true);
    try {
      addOrder({
        customerId: selectedCustomerId,
        customerName: selectedCustomer!.name,
        items: orderItems,
        total,
        notes: notes || undefined,
      });

      resetForm();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(isDark);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create New Order</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={isDark ? '#ffffff' : '#0f172a'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.formCard} isDark={isDark}>
            {/* Customer Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Customer *</Text>
              <TouchableOpacity 
                style={styles.selector}
                onPress={() => setShowCustomerSelect(!showCustomerSelect)}
              >
                <Text style={styles.selectorText}>
                  {selectedCustomer ? selectedCustomer.name : 'Select Customer'}
                </Text>
              </TouchableOpacity>
              
              {showCustomerSelect && (
                <View style={styles.dropdown}>
                  {customers.map((customer) => (
                    <TouchableOpacity
                      key={customer.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedCustomerId(customer.id);
                        setShowCustomerSelect(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{customer.name}</Text>
                      <Text style={styles.dropdownSubtext}>{customer.phone}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Products */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Products *</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowProductSelect(!showProductSelect)}
              >
                <Plus size={20} color="#06b6d4" />
                <Text style={styles.addButtonText}>Add Product</Text>
              </TouchableOpacity>

              {showProductSelect && (
                <View style={styles.dropdown}>
                  {products.filter(p => p.stock > 0).map((product) => (
                    <TouchableOpacity
                      key={product.id}
                      style={styles.dropdownItem}
                      onPress={() => addProduct(product)}
                    >
                      <Text style={styles.dropdownText}>{product.name}</Text>
                      <Text style={styles.dropdownSubtext}>
                        ${product.price.toFixed(2)} • Stock: {product.stock}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {orderItems.map((item) => (
                <View key={item.productId} style={styles.orderItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.productName}</Text>
                    <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus size={16} color={isDark ? '#ffffff' : '#0f172a'} />
                    </TouchableOpacity>
                    
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus size={16} color={isDark ? '#ffffff' : '#0f172a'} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeItem(item.productId)}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Notes */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="WhatsApp message link or additional notes..."
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Total */}
            {orderItems.length > 0 && (
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
            )}
          </GlassCard>
        </ScrollView>

        <View style={styles.footer}>
          <ThemedButton
            title="Cancel"
            onPress={() => {
              resetForm();
              onClose();
            }}
            variant="secondary"
            style={styles.cancelButton}
            isDark={isDark}
          />
          <ThemedButton
            title={loading ? "Creating..." : "Create Order"}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.saveButton}
            isDark={isDark}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#0f172a',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formCard: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#0f172a',
    marginBottom: 8,
  },
  selector: {
    backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectorText: {
    fontSize: 16,
    color: isDark ? '#ffffff' : '#0f172a',
  },
  dropdown: {
    backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
    color: isDark ? '#ffffff' : '#0f172a',
  },
  dropdownSubtext: {
    fontSize: 14,
    color: isDark ? '#94a3b8' : '#64748b',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#06b6d4',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#06b6d4',
    marginLeft: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
    borderRadius: 12,
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: isDark ? '#ffffff' : '#0f172a',
  },
  itemPrice: {
    fontSize: 14,
    color: '#06b6d4',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#0f172a',
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  input: {
    backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: isDark ? '#ffffff' : '#0f172a',
  },
  textArea: {
    height: 80,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#0f172a',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#06b6d4',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});