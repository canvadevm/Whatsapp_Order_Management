import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

interface CustomerState {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  searchCustomers: (name: string, phone: string) => Customer[];
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: [],
      
      addCustomer: (customerData) => {
        const { customers } = get();
        const existingCustomer = customers.find(c => c.phone === customerData.phone);
        
        if (!existingCustomer) {
          const customer: Customer = {
            ...customerData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
          };
          set({ customers: [...customers, customer] });
        }
      },
      
      searchCustomers: (name: string, phone: string) => {
        const { customers } = get();
        return customers.filter(customer => 
          customer.name.toLowerCase().includes(name.toLowerCase()) ||
          customer.phone.includes(phone)
        );
      },
    }),
    {
      name: 'customer-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);