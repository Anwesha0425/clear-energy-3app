import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PendingActionsScreen } from '../screens/PendingActionsScreen';
import { colors } from '@clear-energy/shared';

export type RootStackParamList = { PendingActions: undefined };
const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="PendingActions" component={PendingActionsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
