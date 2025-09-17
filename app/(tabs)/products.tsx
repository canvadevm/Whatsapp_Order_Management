import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Search, Plus, Package, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import { Image } from 'expo-image';
import GlassCard from '@/components/GlassCard';
import FloatingActionButton from '@/components/FloatingActionButton';
import ThemedButton from '@/components/ThemedButton';
import { useThemeStore } from '@/store/themeStore';
import { useProductStore, Product } from '@/store/productStore';
import ProductFormModal from '@/components/ProductFormModal';

export default function Products() {
  const systemColorScheme = useColorScheme();
  const { theme } = useThemeStore();
  const { products, deleteProduct } = useProductStore();
  
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const isDark = activeTheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProduct(productId),
        },
      ]
    );
  };

  const styles = createStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color={isDark ? '#94a3b8' : '#64748b'} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <GlassCard key={product.id} style={styles.productCard} isDark={isDark}>
              {product.image ? (
                <Image source={{ uri: product.image }} style={styles.productImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Package size={40} color={isDark ? '#94a3b8' : '#64748b'} />
                </View>
              )}
              
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                <Text style={[
                  styles.stockText,
                  product.stock <= 5 && styles.lowStockText
                ]}>
                  Stock: {product.stock}
                </Text>
              </View>

              <View style={styles.productActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setEditingProduct(product)}
                >
                  <Edit size={16} color="#06b6d4" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteProduct(product.id)}
                >
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))}
        </View>

        {filteredProducts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Package size={60} color={isDark ? '#94a3b8' : '#64748b'} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No products found' : 'No products yet'}
            </Text>
            {!searchQuery && (
              <ThemedButton
                title="Add Your First Product"
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

      <ProductFormModal
        visible={showAddModal || !!editingProduct}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(undefined);
        }}
        product={editingProduct}
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
  },
  productsGrid: {
    paddingHorizontal: 20,
    gap: 15,
  },
  productCard: {
    padding: 15,
    marginBottom: 15,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  placeholderImage: {
    width: '100%',
    height: 120,
    backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#0f172a',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#06b6d4',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#0f172a',
    marginBottom: 4,
  },
  stockText: {
    fontSize: 14,
    color: isDark ? '#94a3b8' : '#64748b',
  },
  lowStockText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)',
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