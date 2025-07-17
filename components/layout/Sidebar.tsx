import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useUser } from '../../context/UserContext';
// Replace lucide-react icons with react-native-vector-icons or placeholders
import { MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';

interface SidebarProps {
  onClose?: () => void;
  navigation?: any;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, navigation }) => {
  const { logout } = useUser();

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
            style={styles.navItem}
            onPress={() => handleNavigate(item.route)}
          >
            {item.icon}
            <Text style={styles.navText}>{item.name}</Text>
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
    backgroundColor: '#6b7280', // gray-500
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
    color: '#111827', // gray-900
  },
  closeButton: {
    padding: 8,
  },
  navContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  navText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151', // gray-700
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#d1d5db', // gray-300
    padding: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#dc2626', // red-600
  },
});

export default Sidebar;
