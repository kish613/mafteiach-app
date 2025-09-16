import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import SearchResultsScreen from "../screens/SearchResultsScreen";

export type SearchStackParamList = {
  Home: undefined;
  SearchResults: undefined;
};

const Stack = createNativeStackNavigator<SearchStackParamList>();

export default function SearchStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen 
        name="SearchResults" 
        component={SearchResultsScreen}
        options={{
          presentation: "card",
        }}
      />
    </Stack.Navigator>
  );
}