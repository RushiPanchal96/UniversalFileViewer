import React, { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import mobileAds from 'react-native-google-mobile-ads';

import RecentFilesScreen from './src/screens/RecentFilesScreen';
import ConverterScreen from './src/screens/ConverterScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      if (Platform.Version >= 30) {
        // Android 11+ MANAGE_EXTERNAL_STORAGE
        await PermissionsAndroid.request(
          'android.permission.MANAGE_EXTERNAL_STORAGE'
        );
      } else {
        // Android 10 and below
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
      }
    } catch (err) {
      console.warn('Permission request error:', err);
    }
  }
};

export default function App() {
  useEffect(() => {
    // Initialize Google Mobile Ads SDK safely
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('AdMob initialization complete', adapterStatuses);
      })
      .catch(error => {
        console.error('AdMob init error', error);
      });

    // Request required storage permissions
    requestPermissions();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen name="Recent Files" component={RecentFilesScreen} />
          <Tab.Screen name="Converter" component={ConverterScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
