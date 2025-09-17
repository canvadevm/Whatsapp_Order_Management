import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Search, Plus, Users, MessageCircle, CreditCard as Edit, Trash2, Phone } from 'lucide-react-native';
import GlassCard from '@/components/GlassCard';
import FloatingActionButton from '@/components/FloatingActionButton';
import ThemedButton from '@/components/ThemedButton';
import { useThemeStore } from '@/store/themeStore';
import { useCustomerStore, Customer } from '@/store/customerStore';
import CustomerFormModal from '@/components/CustomerFormModal';

export default function Customers() {
  const systemColorScheme = useColorScheme();
  const { theme } = useThemeStore();
  const { customers, deleteCustomer } = useCustomerStore();
  
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const isDark = activeTheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  const handleDeleteCustomer = (customerId: string) => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to delete this customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCustomer(customerId),
        },
      ]
    );
  };

  const openWhatsApp = (phone: string) => {
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}`;
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Error', 'Unable to open WhatsApp');
    });
  };

  const callCustomer = (phone: string) => {
    const phoneUrl = `tel:${phone}`;
    Linking.openURL(phoneUrl).catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  };

  const styles = createStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color={isDark ? '#94a3b8' : '#64748b'} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredCustomers.map((customer) => (
          <GlassCard key={customer.id} style={styles.customerCard} isDark={isDark}>
            <View style={styles.customerHeader}>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerPhone}>{customer.phone}</Text>
                {customer.address && (
                  <Text style={styles.customerAddress}>{customer.address}</Text>
                )}
              </View>
            </View>

            <View style={styles.customerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openWhatsApp(customer.phone)}
              >
                <MessageCircle size={16} color="#25d366" />
                <Text style={styles.actionText}>WhatsApp</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => callCustomer(customer.phone)}
              >
                <Phone size={16} color="#06b6d4" />
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setEditingCustomer(customer)}
              >
                <Edit size={16} color="#f59e0b" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteCustomer(customer.id)}
              >
                <Trash2 size={16} color="#ef4444" />
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        ))}

        {filteredCustomers.length === 0 && (
          <View style={styles.emptyContainer}>
            <Users size={60} color={isDark ? '#94a3b8' : '#64748b'} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No customers found' : 'No customers yet'}
            </Text>
            {!searchQuery && (
              <ThemedButton
                title="Add Your First Customer"
                onPress={() => setShowAddModal(true)}
                style={styles.emptyButton}
                isDark={isDark}
              />
            )}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <FloatingActionButton
        icon={Plus}
        onPress={() => setShowAddModal(true)}
        isDark={isDark}
      />

      <CustomerFormModal
        visible={showAddModal || !!editingCustomer}
        onClose={() => {
          setShowAddModal(false);
          setEditingCustomer(undefined);
        }}
        customer={editingCustomer}
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
  searchContainer: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
    borderRadius: 25,
    paddingHorizontal: 45,
    paddingVertical: 15,
    fontSize: 16,
    color: isDark ? '#ffffff' : '#0f172a',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  customerCard: {
    padding: 20,
    marginBottom: 15,
  },
  customerHeader: {
    marginBottom: 15,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#0f172a',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 16,
    color: '#06b6d4',
    marginBottom: 4,
  },
  customerAddress: {
    fontSize: 14,
    color: isDark ? '#94a3b8' : '#64748b',
    lineHeight: 20,
  },
  customerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    color: isDark ? '#ffffff' : '#0f172a',
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
    marginBottom: 30,
  },
  emptyButton: {
    paddingHorizontal: 30,
  },
  bottomPadding: {
    height: 100,
  },
});