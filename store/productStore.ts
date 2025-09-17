import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  createdAt: string;
}

interface ProductState {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Omit<Product, 'id' | 'createdAt'>>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, stock: number) => void;
}

// Sample data
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'High-quality Bluetooth headphones with noise cancellation',
    price: 99.99,
    stock: 15,
    category: 'Electronics',
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=500',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Cotton T-Shirt',
    description: 'Comfortable 100% cotton t-shirt available in multiple colors',
    price: 24.99,
    stock: 3,
    category: 'Clothing',
    image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=500',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Coffee Beans',
    description: 'Premium arabica coffee beans, freshly roasted',
    price: 18.50,
    stock: 25,
    category: 'Food & Beverages',
    image: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=500',
    createdAt: new Date().toISOString(),
  },
];

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: sampleProducts,
      
      addProduct: (productData) => {
        const product: Product = {
          ...productData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          products: [...state.products, product],
        }));
      },
      
      updateProduct: (id, productData) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? { ...product, ...productData }
              : product
          ),
        }));
      },
      
      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        }));
      },
      
      updateStock: (id, stock) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? { ...product, stock }
              : product
          ),
        }));
      },
    }),
    {
      name: 'product-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);