import React from 'react';
import { ScrollView, View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { 
  Moon, 
  Sun, 
  Smartphone, 
  Store, 
  Users, 
  Bell, 
  Shield, 
  LogOut,
  ChevronRight 
} from 'lucide-react-native';
import GlassCard from '@/components/GlassCard';
import ThemedButton from '@/components/ThemedButton';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';

export default function Settings() {
  const systemColorScheme = useColorScheme();
  const { theme, setTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const isDark = activeTheme === 'dark';

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const themeOptions = [
    { key: 'system', label: 'System', icon: Smartphone },
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
  ] as const;

  const styles = createStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          {user && (
            <Text style={styles.subtitle}>
              Logged in as {user.email}
            </Text>
          )}
        </View>

        {/* Theme Settings */}
        <GlassCard style={styles.sectionCard} isDark={isDark}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.key;
            
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.settingItem,
                  isSelected && styles.settingItemSelected
                ]}
                onPress={() => setTheme(option.key)}
              >
                <View style={styles.settingLeft}>
                  <Icon 
                    size={20} 
                    color={isSelected ? '#06b6d4' : (isDark ? '#94a3b8' : '#64748b')} 
                  />
                  <Text style={[
                    styles.settingText,
                    isSelected && styles.settingTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </View>
                <View style={[
                  styles.radioButton,
                  isSelected && styles.radioButtonSelected
                ]}>
                  {isSelected && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </GlassCard>

        {/* Business Settings */}
        <GlassCard style={styles.sectionCard} isDark={isDark}>
          <Text style={styles.sectionTitle}>Business</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Store size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <Text style={styles.settingText}>Business Profile</Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#94a3b8' : '#64748b'} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Users size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <Text style={styles.settingText}>Manage Staff</Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#94a3b8' : '#64748b'} />
          </TouchableOpacity>
        </GlassCard>

        {/* Notifications */}
        <GlassCard style={styles.sectionCard} isDark={isDark}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: '#767577', true: '#06b6d4' }}
              thumbColor={'#ffffff'}
            />
          </View>
        </GlassCard>

        {/* Security */}
        <GlassCard style={styles.sectionCard} isDark={isDark}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Shield size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <Text style={styles.settingText}>Change Password</Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#94a3b8' : '#64748b'} />
          </TouchableOpacity>
        </GlassCard>

        {/* Account Actions */}
        <View style={styles.actionsContainer}>
          <ThemedButton
            title="Logout"
            onPress={handleLogout}
            icon={LogOut}
            variant="danger"
            style={styles.logoutButton}
            isDark={isDark}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 WhatsApp Order Manager</Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: isDark ? '#94a3b8' : '#64748b',
  },
  scrollView: {
    flex: 1,
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#0f172a',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  settingItemSelected: {
    backgroundColor: isDark ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.05)',
    borderRadius: 12,
    marginHorizontal: -4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: isDark ? '#ffffff' : '#0f172a',
    marginLeft: 12,
  },
  settingTextSelected: {
    color: '#06b6d4',
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: isDark ? '#374151' : '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#06b6d4',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#06b6d4',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  logoutButton: {
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 14,
    color: isDark ? '#94a3b8' : '#64748b',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: isDark ? '#6b7280' : '#9ca3af',
  },
  bottomPadding: {
    height: 100,
  },
});