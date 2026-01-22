import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Web Container Constraint - NOW FULL WIDTH */}
        <View style={Platform.OS === 'web' ? {
          width: '100%',
          flex: 1,
          // Removed maxWidth constraint
        } : { flex: 1 }
        }>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
          </Stack>
        </View>
      </View>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
