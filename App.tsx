import { useCallback, useState, useEffect } from 'react';
import { Text, View, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});


export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string>(null);
  const [notification, setNotification] = useState<any>({});

 	const registerForPushNotificationsAsync = useCallback(async () => {
		if (Device.isDevice) {
			const { status: existingStatus } =
				await Notifications.getPermissionsAsync();
			let finalStatus = existingStatus;
			if (existingStatus !== 'granted') {
				const { status } =
					await Notifications.requestPermissionsAsync();
				finalStatus = status;
			}
			if (finalStatus !== 'granted') {
				alert('Failed to get push token for push notification!');
				return;
			}
			const token = (await Notifications.getExpoPushTokenAsync()).data;
			console.log(token);
			setExpoPushToken(token);
		} else {
			alert('Must use physical device for Push Notifications');
		}

		if (Platform.OS === 'android') {
			Notifications.setNotificationChannelAsync('default', {
				name: 'default',
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: '#FF231F7C',
			});
		}
	}, []);

  const handleNotification = useCallback((notf)=>{
    setNotification(notf);
  },[]);

  const handleNotificationResponse = useCallback((resp)=>{
    console.log(resp);
  },[]);

  useEffect(()=>{
    registerForPushNotificationsAsync().then(console.log);
  },[]);

  useEffect(()=>{
    Notifications.addNotificationReceivedListener(handleNotification);
    
    Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
  },[handleNotification,handleNotificationResponse]);

	return (
		
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Your expo push token: {expoPushToken}</Text>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text>Title: {notification?.request?.content?.title}</Text>
          <Text>Body: {notification?.request?.content?.body}</Text>
          <Text>Data: {JSON.stringify(notification?.request?.content?.data)}</Text>
        </View>
      </View>
	);
}