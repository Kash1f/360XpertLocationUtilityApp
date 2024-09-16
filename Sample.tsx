/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */

import { Text } from 'react-native';
import { useEffect } from 'react';
// import { ActivityIndicator } from 'react-native';
import messaging from '@react-native-firebase/messaging';
// import Geolocation from 'react-native-geolocation-service';
// import { NavigationContainer } from '@react-navigation/native';
// import { Linking } from 'react-native';
// import { createStackNavigator } from '@react-navigation/stack';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Home from './components/Home';
// import Setting from './components/Setting';
import { Alert, View } from 'react-native';
// const Stack = createStackNavigator();
// const NAVIGATION_IDS = ['home', 'settings'];

// type NotificationData = {
//   navigationId?: string;
// };

// function buildDeepLinkFromNotificationData(data: NotificationData | null): string | null {
//   const navigationId = data?.navigationId;
//   if (!navigationId || !NAVIGATION_IDS.includes(navigationId)) {
//     console.warn('Unverified navigationId', navigationId);
//     return null;
//   }
//   if (navigationId === 'home') {
//     return 'myapp://home';
//   }
//   if (navigationId === 'settings') {
//     return 'myapp://settings';
//   }
//   return null;
// }

// const linking = {
//   prefixes: ['myapp://'],
//   config: {
//     screens: {
//       Home: 'home',
//       Settings: 'settings',
//     },
//   },
//   async getInitialURL() {
//     const url = await Linking.getInitialURL();
//     if (typeof url === 'string') {
//       return url;
//     }
//     const message = await messaging().getInitialNotification();
//     // const deeplinkURL = buildDeepLinkFromNotificationData(message?.data || null);
//     // if (typeof deeplinkURL === 'string') {
//     //   return deeplinkURL;
//     // }
//     return message;
//   },
//   subscribe(listener: (url: string) => void) {
//     const onReceiveURL = ({ url }: { url: string }) => listener(url);
//     const linkingSubscription = Linking.addEventListener('url', onReceiveURL);

//     messaging().setBackgroundMessageHandler(async remoteMessage => {
//       console.log('Message handled in the background!', remoteMessage);
//       await handleLocationUpdate('background');
//     });

//     const foreground = messaging().onMessage(async remoteMessage => {
//       console.log('A new FCM message arrived!', remoteMessage);
//       await handleLocationUpdate('foreground');
//     });

//     const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
//       console.log('Notification caused app to open', remoteMessage);
//       const url = buildDeepLinkFromNotificationData(remoteMessage.data || null);
//       if (typeof url === 'string') {
//         listener(url);
//       }
//       handleLocationUpdate('background');
//     });

//     return () => {
//       linkingSubscription.remove();
//       unsubscribe();
//       foreground();
//     };
//   },
// };

// async function handleLocationUpdate(state: 'foreground' | 'background') {
//   const locationPreference = await AsyncStorage.getItem('locationPreference');
//   if (locationPreference !== 'always' && state === 'background') {
//     console.log('Location tracking not enabled for background');
//     return;
//   }

//   const hasLocationPermission = await requestLocationPermission();
//   if (!hasLocationPermission) return;

//   Geolocation.getCurrentPosition(
//     position => {
//       const { latitude, longitude } = position.coords;
//       console.log(`Location in ${state}:`, latitude, longitude);
//       // Here you can send the location to your server or perform any other action
//     },
//     error => {
//       console.log(error.code, error.message);
//     },
//     { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
//   );
// }

// async function requestLocationPermission(): Promise<boolean> {
//   if (Platform.OS === 'android') {
//     try {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         {
//           title: 'Location Access Required',
//           message: 'This App needs to Access your location',
//           buttonPositive: 'OK',
//           buttonNegative: 'Cancel',
//           buttonNeutral: 'Ask Me Later',
//         },
//       );
//       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//         return true;
//       } else {
//         ToastAndroid.show('Location Permission Denied', ToastAndroid.SHORT);
//         return false;
//       }
//     } catch (err) {
//       console.warn(err);
//       return false;
//     }
//   }
//   return true;
// }


function App() {


  useEffect(() => {
    const requestUserPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
    };

    requestUserPermission();

    const getToken = async () => {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
    };
    getToken();

    // Listen to whether the notification caused the app to open from background state
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
    });

    // Check if notification caused the app to open from a quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
        }
      });

    // Foreground message handler
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);


  // return (
{/* <NavigationContainer
//  linking={linking}
 fallback={<ActivityIndicator animating />}>
 <Stack.Navigator initialRouteName="Home">
   <Stack.Screen name="Home" component={Home} />
   <Stack.Screen name="Settings" component={Setting} />
 </Stack.Navigator>
</NavigationContainer>  */}


// );

        //  };

        return (
          <View>
            <Text>Firebase Push Notifications Demo</Text>
          </View>
        );
      };
export default App;
