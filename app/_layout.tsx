import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { UserProvider } from '../context/UserContext';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';

export default function RootLayout() {
  // const DrawerLayout = () => {
  //   return <Drawer/>;
  // };
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });


  if (!loaded) {
    return null;
  }


  return (
    <UserProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)/index" options={{ headerShown: false }} />
          <Stack.Screen name="Dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="Fees" options={{ headerShown: false }} />
          <Stack.Screen name="Performance" options={{ headerShown: false }} />
          <Stack.Screen name="Settings" options={{ headerShown: false }} />
          <Stack.Screen name="Login" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        {/* <StatusBar style="auto" /> */}
        {/* <Drawer>
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
        </Drawer> */}
      </ThemeProvider>
    </UserProvider>
  );
}
