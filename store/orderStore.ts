import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'card';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'status' | 'paymentStatus' | 'createdAt' | 'updatedAt'>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updatePaymentStatus: (id: string, paymentStatus: PaymentStatus, paymentMethod?: PaymentMethod) => void;
  deleteOrder: (id: string) => void;
}

// Sample data
const sampleOrders: Order[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'John Doe',
    items: [
      {
        productId: '1',
        productName: 'Wireless Headphones',
        price: 99.99,
        quantity: 1,
      },
    ],
    total: 99.99,
    status: 'pending',
    paymentStatus: 'unpaid',
    notes: 'Customer called about delivery time',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    customerId: '2',
    customerName: 'Jane Smith',
    items: [
      {
        productId: '2',
        productName: 'Cotton T-Shirt',
        price: 24.99,
        quantity: 2,
      },
      {
        productId: '3',
        productName: 'Coffee Beans',
        price: 18.50,
        quantity: 1,
      },
    ],
    total: 68.48,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    customerId: '3',
    customerName: 'Mike Johnson',
    items: [
      {
        productId: '3',
        productName: 'Coffee Beans',
        price: 18.50,
        quantity: 3,
      },
    ],
    total: 55.50,
    status: 'confirmed',
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString(), // Today
    updatedAt: new Date().toISOString(),
  },
];

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: sampleOrders,
      
      addOrder: (orderData) => {
        const order: Order = {
          ...orderData,
          id: Date.now().toString(),
          status: 'pending',
          paymentStatus: 'unpaid',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          orders: [order, ...state.orders],
        }));
      },
      
      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id
              ? { ...order, status, updatedAt: new Date().toISOString() }
              : order
          ),
        }));
      },
      
      updatePaymentStatus: (id, paymentStatus, paymentMethod) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id
              ? { 
                  ...order, 
                  paymentStatus, 
                  paymentMethod,
                  updatedAt: new Date().toISOString() 
                }
              : order
          ),
        }));
      },
      
      deleteOrder: (id) => {
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== id),
        }));
      },
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);