import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import HomeScreen from "./src/screens/HomeScreen";
import QRScannerScreen from "./src/screens/QRScannerScreen";
import CreateListingScreen from "./src/screens/CreateListingScreen";
import ListingPreviewScreen from "./src/screens/ListingPreviewScreen";
import { AppStateProvider } from "./src/hooks/useAppState";
import { useAppState } from "./src/hooks/useAppState";
import { t } from "./src/i18n";
import { RootStackParamList } from "./src/types/navigation";
import { theme } from "./src/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <NavigationShell />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}

function NavigationShell() {
  const { language } = useAppState();

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.primary
        }
      }}
    >
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerBackTitle: t(language, "nav.back"),
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.text },
          headerTintColor: theme.colors.text,
          contentStyle: { backgroundColor: theme.colors.background }
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: t(language, "nav.homeTitle") }} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ title: t(language, "nav.scanQrTitle") }} />
        <Stack.Screen
          name="CreateListing"
          component={CreateListingScreen}
          options={{ title: t(language, "nav.createListingTitle") }}
        />
        <Stack.Screen
          name="ListingPreview"
          component={ListingPreviewScreen}
          options={{ title: t(language, "nav.previewTitle") }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
