import React, { useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Modal } from 'react-native';
import Sidebar from './Sidebar';
import Header from './Header';

import BottomNavigation from './BottomNavigation';

interface LayoutProps {
  children: React.ReactNode;
  navigation?: any;
}

const Layout: React.FC<LayoutProps> = ({ children, navigation }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Modal
        visible={sidebarOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSidebarOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSidebarOpen(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <View style={styles.sidebarContainer}>
          <Sidebar onClose={() => setSidebarOpen(false)} navigation={navigation} />
        </View>
      </Modal>

      <Header openSidebar={() => setSidebarOpen(true)} navigation={navigation} />

      <View style={styles.content}>
        {children}
      </View>

      <BottomNavigation navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(75, 85, 99, 0.6)', 
  },
  sidebarContainer: {
    position: 'relative',
    top: 0,
    bottom: 0,
    left: 0,
    width: 280,
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 2, height: 0 },
  },
  content: {
    flex: 1,
    marginTop: 64, 
  },
});

export default Layout;
