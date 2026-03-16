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
import { RootStackParamList } from "./src/types/navigation";
import { theme } from "./src/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
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
            },
            fonts: {
              regular: { fontFamily: "System", fontWeight: "400" },
              medium: { fontFamily: "System", fontWeight: "500" },
              bold: { fontFamily: "System", fontWeight: "700" },
              heavy: { fontFamily: "System", fontWeight: "800" }
            }
          }}
        >
          <StatusBar style="light" />
          <Stack.Navigator
            screenOptions={{
              headerBackTitle: "Back",
              headerStyle: { backgroundColor: theme.colors.surface },
              headerTitleStyle: { color: theme.colors.text },
              headerTintColor: theme.colors.text,
              contentStyle: { backgroundColor: theme.colors.background }
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Marketplace Hub" }} />
            <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ title: "Scan Desktop QR" }} />
            <Stack.Screen name="CreateListing" component={CreateListingScreen} options={{ title: "Create Listing" }} />
            <Stack.Screen name="ListingPreview" component={ListingPreviewScreen} options={{ title: "Listing Preview" }} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
