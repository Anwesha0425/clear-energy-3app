import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TodaysOrdersScreen } from '../screens/TodaysOrdersScreen';
import { colors } from '@clear-energy/shared';

export type RootStackParamList = {
  TodaysOrders: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // we render our own header in each screen
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="TodaysOrders" component={TodaysOrdersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
