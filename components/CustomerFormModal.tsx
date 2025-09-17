import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import GlassCard from './GlassCard';
import ThemedButton from './ThemedButton';
import { useCustomerStore, Customer } from '@/store/customerStore';

interface CustomerFormModalProps {
  visible: boolean;
  onClose: () => void;
  customer?: Customer;
  isDark: boolean;
}

export default function CustomerFormModal({ visible, onClose, customer, isDark }: CustomerFormModalProps) {
  const { addCustomer, updateCustomer } = useCustomerStore();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setAddress(customer.address || '');
    } else {
      resetForm();
    }
  }, [customer, visible]);

  const resetForm = () => {
    setName('');
    setPhone('');
    setAddress('');
  };

  const handleSubmit = async () => {
    if (!name || !phone) {
      Alert.alert('Error', 'Please fill in name and phone number');
      return;
    }

    setLoading(true);
    try {
      const customerData = {
        name,
        phone,
        address: address || undefined,
      };

      if (customer) {
        updateCustomer(customer.id, customerData);
      } else {
        addCustomer(customerData);
      }

      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(isDark);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={isDark ? '#ffffff' : '#0f172a'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.formCard} isDark={isDark}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Customer Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter customer name"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Delivery Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter delivery address (optional)"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </GlassCard>
        </ScrollView>

        <View style={styles.footer}>
          <ThemedButton
            title="Cancel"
            onPress={onClose}
            variant="secondary"
            style={styles.cancelButton}
            isDark={isDark}
          />
          <ThemedButton
            title={loading ? "Saving..." : (customer ? "Update" : "Add Customer")}
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