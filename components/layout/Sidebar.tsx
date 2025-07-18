import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useUser } from '../../context/UserContext';
import { MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';

interface SidebarProps {
  onClose?: () => void;
  navigation?: any;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, navigation }) => {
  const { logout } = useUser();
  const [selectedRoute, setSelectedRoute] = useState('Dashboard');

  const navItems = [
    { name: 'Dashboard', icon: <MaterialIcons name="dashboard" size={20} color="#374151" />, route: 'Dashboard' },
    { name: 'Students', icon: <FontAwesome5 name="user-graduate" size={20} color="#374151" />, route: 'Students' },
    { name: 'Fees', icon: <MaterialIcons name="credit-card" size={20} color="#374151" />, route: 'Fees' },
    { name: 'Attendance', icon: <MaterialIcons name="event-available" size={20} color="#374151" />, route: 'Attendance' },
    { name: 'Performance', icon: <MaterialIcons name="trending-up" size={20} color="#374151" />, route: 'Performance' },
    { name: 'Courses', icon: <MaterialIcons name="book" size={20} color="#374151" />, route: 'Courses' },
    { name: 'Settings', icon: <Feather name="settings" size={20} color="#374151" />, route: 'Settings' },
  ];

  const handleNavigate = (route: string) => {
    setSelectedRoute(route);
    if (navigation && navigation.navigate) {
      navigation.navigate(route);
      if (onClose) onClose();
    } else {
      console.warn(`Navigation to ${route} not implemented`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
          <Text style={styles.title}>SK Tutorials</Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="Close sidebar">
            <MaterialIcons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView style={styles.navContainer}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={[styles.navItem, selectedRoute === item.route && styles.navItemSelected]}
            onPress={() => handleNavigate(item.route)}
          >
            {item.icon}
            <Text style={[styles.navText, selectedRoute === item.route && styles.navTextSelected]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  title: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
    marginLeft: 'auto',
  },
  navContainer: {
    flex: 1,
    width: '100%',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  navItemSelected: {
    backgroundColor: '#2563eb', // blue-600
  },
  navText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  navTextSelected: {
    color: '#fff',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    paddingVertical: 16,
    width: '100%',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#dc2626',
  },
});

export default Sidebar;
