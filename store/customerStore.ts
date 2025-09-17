import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  createdAt: string;
}

interface CustomerState {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Omit<Customer, 'id' | 'createdAt'>>) => void;
  deleteCustomer: (id: string) => void;
}

// Sample data
const sampleCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+1234567890',
    address: '123 Main St, City, State 12345',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '+1987654321',
    address: '456 Oak Ave, Town, State 67890',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Mike Johnson',
    phone: '+1122334455',
    createdAt: new Date().toISOString(),
  },
];

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      customers: sampleCustomers,
      
      addCustomer: (customerData) => {
        const customer: Customer = {
          ...customerData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          customers: [...state.customers, customer],
        }));
      },
      
      updateCustomer: (id, customerData) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === id
              ? { ...customer, ...customerData }
              : customer
          ),
        }));
      },
      
      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((customer) => customer.id !== id),
        }));
      },
    }),
    {
      name: 'customer-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);