import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useUser } from '../../context/UserContext';

interface HeaderProps {
  openSidebar: () => void;
  navigation?: any; 
}

const Header: React.FC<HeaderProps> = ({ openSidebar, navigation }) => {
  const { user } = useUser();

  const handleSettingsPress = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Settings');
    } 
  };

  const logo = require('../../assets/images/logo.png');

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={openSidebar}
        accessibilityLabel="Open sidebar"
        style={styles.menuButton}
      >
        {/* Replaced Menu icon with text placeholder */}
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.titleText}>SK Tutorials</Text>
      </View>

      <View style={styles.userMenuContainer}>
        <TouchableOpacity
          onPress={handleSettingsPress}
          accessibilityLabel="Open user menu"
          style={styles.userButton}
        >
          <View style={styles.userInitialCircle}>
            <Text style={styles.userInitialText}>
              {user?.name?.charAt(0) || 'A'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: '#6b7280',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  userMenuContainer: {
    marginLeft: 16,
  },
  userButton: {
    padding: 8,
  },
  userInitialCircle: {
    backgroundColor: '#3b82f6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitialText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Header;