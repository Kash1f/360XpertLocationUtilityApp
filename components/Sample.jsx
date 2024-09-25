/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react';
import { Alert, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import messaging from '@react-native-firebase/messaging';
import Geolocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Home from './components/Home';
import Setting from './components/Setting';
import { Linking } from 'react-native';

const Stack = createStackNavigator();
const NAVIGATION_IDS = ['home', 'settings'];

function App() {
  useEffect(() => {
    const requestUserPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        await requestLocationPermission();
      }
    };

    const requestLocationPermission = async () => {
      const permissionForeground = Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      });

      const permissionBackground = Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_ALWAYS,
      });

      // Check foreground permission first
      const resultForeground = await check(permissionForeground);

      if (resultForeground === RESULTS.GRANTED) {
        console.log('Foreground location permission granted');

        // If the user has granted foreground permission, check background permission
        const resultBackground = await check(permissionBackground);

        if (resultBackground === RESULTS.GRANTED) {
          console.log('Background location permission granted');
        } else if (resultBackground === RESULTS.DENIED || resultBackground === RESULTS.BLOCKED) {
          console.log('Requesting background location permission...');
          await request(permissionBackground);
        }
      } else if (resultForeground === RESULTS.DENIED || resultForeground === RESULTS.BLOCKED) {
        console.log('Requesting foreground location permission...');
        await request(permissionForeground);
      }
    };

    const getToken = async () => {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
    };

    const handleBackgroundMessage = async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
      await handleLocationBasedTask(remoteMessage);
    };

    const handleForegroundMessage = async (remoteMessage) => {
      console.log('A new FCM message arrived!', remoteMessage);
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      await handleLocationBasedTask(remoteMessage);
    };

    const handleLocationBasedTask = async (remoteMessage) => {
      const locationPermission = await checkLocationPermission();
      if (locationPermission === RESULTS.GRANTED) {
        const location = await getCurrentLocation();
        if (location) {
          logLocation(location);
        }
      } else if (locationPermission === RESULTS.DENIED) {
        console.log('Location permission denied, requesting permission...');
        await requestLocationPermission();
      }
    };

    const checkLocationPermission = async () => {
      const permissionForeground = Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      });

      return check(permissionForeground);
    };

    const getCurrentLocation = () => {
      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => {
            console.error('Error getting location:', error);
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      });
    };

    const logLocation = (location) => {
      console.log("Location sent:", {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    };

    requestUserPermission();
    getToken();
    

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      handleLocationBasedTask(remoteMessage);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
          handleLocationBasedTask(remoteMessage);
        }
      });

    messaging().setBackgroundMessageHandler(handleBackgroundMessage);
    const unsubscribe = messaging().onMessage(handleForegroundMessage);

    return unsubscribe;
  }, []);

  function buildDeepLinkFromNotificationData(data) {
    const navigationId = data?.navigationId;
    if (!NAVIGATION_IDS.includes(navigationId)) {
      console.warn('Unverified navigationId', navigationId);
      return null;
    }
    if (navigationId === 'home') {
      return 'myapp://home';
    }
    if (navigationId === 'settings') {
      return 'myapp://settings';
    }

    return null;
  }

  const linking = {
    prefixes: ['myapp://'],
    config: {
      screens: {
        Home: 'home',
        Settings: 'settings',
      },
    },
    async getInitialURL() {
      const url = await Linking.getInitialURL();
      if (typeof url === 'string') {
        return url;
      }
      const message = await messaging().getInitialNotification();
      const deeplinkURL = buildDeepLinkFromNotificationData(message?.data);
      if (typeof deeplinkURL === 'string') {
        return deeplinkURL;
      }
    },
    subscribe(listener) {
      const onReceiveURL = ({url}) => listener(url);
      const linkingSubscription = Linking.addEventListener('url', onReceiveURL);
      const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
        const url = buildDeepLinkFromNotificationData(remoteMessage.data);
        if (typeof url === 'string') {
          listener(url);
        }
      });

      return () => {
        linkingSubscription.remove();
        unsubscribe();
      };
    },
  };

  return (
    <NavigationContainer
      linking={linking}
      fallback={<ActivityIndicator animating />}
    >
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home Screen" component={Home} />
        <Stack.Screen name="Settings" component={Setting} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;