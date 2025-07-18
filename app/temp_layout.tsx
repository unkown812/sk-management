import { Drawer } from 'expo-router/drawer';
import { StyleSheet } from 'react-native'; 
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const DrawerLayout = () => {
  return (
    <GestureHandlerRootView>
      <Drawer>
        <Drawer.Screen name='Dashboard' options={
          {
            drawerLabel: 'DashBoard',
            drawerIcon: () => 
            <Ionicons 
              name='home'  
              size={24} 
              color='#1fffff'
            />
          }
        } />
        <Drawer.Screen name='Students' options={
          {
            drawerLabel: 'Students',
            drawerIcon: () => 
            <Ionicons 
              name='home'  
              size={24} 
              color='#1fffff'
            />
          }
        } />
        <Drawer.Screen name='Fees' options={
          {
            drawerLabel: 'Fees',
            drawerIcon: () => 
            <Ionicons 
              name='home'  
              size={24} 
              color='#1fffff'
            />
          }
        } />
        <Drawer.Screen name='Attendance' options={
          {
            drawerLabel: 'Attendance',
            drawerIcon: () => 
            <Ionicons 
              name='home'  
              size={24} 
              color='#1fffff'
            />
          }
        } />
        <Drawer.Screen name='Performance' options={
          {
            drawerLabel: 'Performance',
            drawerIcon: () => 
            <Ionicons 
              name='home'  
              size={24} 
              color='#1fffff'
            />
          }
        } />
      </Drawer>
    </GestureHandlerRootView>
  )
};

export default DrawerLayout;