import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { UserProvider } from '../context/UserContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // const

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
      </ThemeProvider>
    </UserProvider>
  );
}
