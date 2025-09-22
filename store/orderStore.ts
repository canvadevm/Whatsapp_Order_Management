import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OrderItem {
  id: string;
  name: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
  delivered: boolean;
}

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  phoneNumber: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
}

interface OrderState {
  orders: Order[];
  orderCounter: number;
  addOrder: (orderData: {
    customerName: string;
    phoneNumber: string;
    items: Omit<OrderItem, 'delivered'>[];
    total: number;
  }) => string;
  toggleItemDelivered: (orderId: string, itemId: string) => void;
  deleteOrder: (orderId: string) => void;
}

const generateOrderCode = (counter: number): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                     'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = monthNames[now.getMonth()];
  
  return `${year}${month}-${counter.toString().padStart(3, '0')}`;
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      orderCounter: 1,
      
      addOrder: (orderData) => {
        const { orders, orderCounter } = get();
        const orderId = Date.now().toString();
        const orderCode = generateOrderCode(orderCounter);
        
        const order: Order = {
          id: orderId,
          orderCode,
          customerName: orderData.customerName,
          phoneNumber: orderData.phoneNumber,
          items: orderData.items.map(item => ({ ...item, delivered: false })),
          total: orderData.total,
          createdAt: new Date().toISOString(),
        };
        
        set({ 
          orders: [order, ...orders],
          orderCounter: orderCounter + 1
        });
        
        return orderId;
      },
      
      toggleItemDelivered: (orderId, itemId) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  items: order.items.map((item) =>
                    item.id === itemId
                      ? { ...item, delivered: !item.delivered }
                      : item
                  ),
                }
              : order
          ),
        }));
      },
      
      deleteOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== orderId),
        }));
      },
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);