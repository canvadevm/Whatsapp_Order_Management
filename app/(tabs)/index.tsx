import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Image,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Minus, Camera, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useOrderStore } from '@/store/orderStore';
import { useCustomerStore } from '@/store/customerStore';
import { generateOrderReceipt } from '@/utils/receiptGenerator';

interface OrderItem {
  id: string;
  name: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
}

export default function NewOrder() {
  const { addOrder } = useOrderStore();
  const { customers, addCustomer, searchCustomers } = useCustomerStore();
  
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (customerName.length > 0 || phoneNumber.length > 0) {
      const suggestions = searchCustomers(customerName, phoneNumber);
      setCustomerSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [customerName, phoneNumber]);

  const selectCustomer = (customer: any) => {
    setCustomerName(customer.name);
    setPhoneNumber(customer.phone);
    setShowSuggestions(false);
  };

  const addOrderItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      name: '',
      image: null,
      unitPrice: 0,
      quantity: 1,
    };
    setOrderItems([...orderItems, newItem]);
  };

  const updateOrderItem = (id: string, field: keyof OrderItem, value: any) => {
    setOrderItems(items =>
      items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeOrderItem = (id: string) => {
    setOrderItems(items => items.filter(item => item.id !== id));
  };

  const pickImage = async (itemId: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateOrderItem(itemId, 'image', result.assets[0].uri);
    }
  };

  const updateQuantity = (id: string, increment: boolean) => {
    const item = orderItems.find(item => item.id === id);
    if (item) {
      const newQuantity = increment ? item.quantity + 1 : Math.max(1, item.quantity - 1);
      updateOrderItem(id, 'quantity', newQuantity);
    }
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  };

  const submitOrder = async () => {
    if (!customerName || !phoneNumber) {
      Alert.alert('Error', 'Please enter customer name and phone number');
      return;
    }

    if (orderItems.length === 0) {
      Alert.alert('Error', 'Please add at least one item');
      return;
    }

    const invalidItems = orderItems.filter(item => !item.name || item.unitPrice <= 0);
    if (invalidItems.length > 0) {
      Alert.alert('Error', 'Please fill in all item details');
      return;
    }

    try {
      // Add or update customer
      const existingCustomer = customers.find(c => c.phone === phoneNumber);
      if (!existingCustomer) {
        addCustomer({
          name: customerName,
          phone: phoneNumber,
        });
      }

      // Add order
      const orderId = addOrder({
        customerName,
        phoneNumber,
        items: orderItems,
        total: calculateTotal(),
      });

      // Generate receipt
      await generateOrderReceipt({
        orderId,
        customerName,
        phoneNumber,
        items: orderItems,
        total: calculateTotal(),
      });

      // Reset form
      setCustomerName('');
      setPhoneNumber('');
      setOrderItems([]);
      
      Alert.alert('Success', 'Order created and receipt generated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create order');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>New Order</Text>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Customer Name</Text>
            <TextInput
              style={styles.input}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Enter customer name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          {/* Customer Suggestions */}
          {showSuggestions && (
            <View style={styles.suggestionsContainer}>
              {customerSuggestions.map((customer) => (
                <TouchableOpacity
                  key={customer.id}
                  style={styles.suggestionItem}
                  onPress={() => selectCustomer(customer)}
                >
                  <Text style={styles.suggestionName}>{customer.name}</Text>
                  <Text style={styles.suggestionPhone}>{customer.phone}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            <TouchableOpacity style={styles.addButton} onPress={addOrderItem}>
              <Plus size={20} color="#ffffff" />
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          {orderItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.itemHeader}>
                <TextInput
                  style={styles.itemNameInput}
                  value={item.name}
                  onChangeText={(text) => updateOrderItem(item.id, 'name', text)}
                  placeholder="Item name"
                />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeOrderItem(item.id)}
                >
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>

              <View style={styles.itemContent}>
                <TouchableOpacity
                  style={styles.imageContainer}
                  onPress={() => pickImage(item.id)}
                >
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Camera size={24} color="#6b7280" />
                      <Text style={styles.imagePlaceholderText}>Add Image</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.itemDetails}>
                  <View style={styles.priceQuantityRow}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.label}>Unit Price</Text>
                      <TextInput
                        style={styles.priceInput}
                        value={item.unitPrice.toString()}
                        onChangeText={(text) => updateOrderItem(item.id, 'unitPrice', parseFloat(text) || 0)}
                        placeholder="0"
                        keyboardType="decimal-pad"
                      />
                    </View>

                    <View style={styles.quantityContainer}>
                      <Text style={styles.label}>Quantity</Text>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateQuantity(item.id, false)}
                        >
                          <Minus size={16} color="#6b7280" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateQuantity(item.id, true)}
                        >
                          <Plus size={16} color="#6b7280" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View style={styles.totalPriceContainer}>
                    <Text style={styles.totalPriceLabel}>Total: </Text>
                    <Text style={styles.totalPriceValue}>
                      Rs. {(item.unitPrice * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        {orderItems.length > 0 && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount:</Text>
              <Text style={styles.summaryValue}>Rs. {calculateTotal().toFixed(2)}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={submitOrder}>
          <Text style={styles.submitButtonText}>Submit Order</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginVertical: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  suggestionsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginTop: 8,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  suggestionPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 8,
  },
  orderItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemNameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginRight: 12,
  },
  deleteButton: {
    padding: 8,
  },
  itemContent: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  itemDetails: {
    flex: 1,
  },
  priceQuantityRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  priceContainer: {
    flex: 1,
    marginRight: 12,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  quantityContainer: {
    flex: 1,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  quantityButton: {
    padding: 12,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  totalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalPriceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  totalPriceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  summaryContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3b82f6',
  },
  submitButton: {
    backgroundColor: '#10b981',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});