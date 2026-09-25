import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import { AppProvider } from "./src/state/AppContext";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import IngredientsScreen from "./src/screens/IngredientsScreen";
import RecipeDetailScreen from "./src/screens/RecipeDetailScreen";
import ResultsScreen from "./src/screens/ResultsScreen";
import WhereToBuyScreen from "./src/screens/WhereToBuyScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "#f4fbf6" },
            headerTitleStyle: { fontWeight: "900", color: "#14392b" },
            headerTintColor: "#14392b",
            contentStyle: { backgroundColor: "#f4fbf6" },
          }}
        >
          <Stack.Screen name="Perfil" component={OnboardingScreen} />
          <Stack.Screen name="Ingredientes" component={IngredientsScreen} />
          <Stack.Screen name="Resultados" component={ResultsScreen} />
          <Stack.Screen name="DetalleReceta" component={RecipeDetailScreen} options={{ title: "Receta" }} />
          <Stack.Screen name="DondeComprar" component={WhereToBuyScreen} options={{ title: "Donde lo consigo" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
