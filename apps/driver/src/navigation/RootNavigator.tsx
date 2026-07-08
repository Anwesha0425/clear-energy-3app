import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TodaysTripScreen } from '../screens/TodaysTripScreen';
import { colors } from '@clear-energy/shared';

export type RootStackParamList = { TodaysTrip: undefined };
const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="TodaysTrip" component={TodaysTripScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
