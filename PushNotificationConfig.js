import PushNotification from 'react-native-push-notification';

PushNotification.configure({
  onRegister: function (token) {
    console.log("TOKEN:", token);
  },

  onNotification: function (notification) {
    console.log("NOTIFICATION:", notification);

    // Required for iOS
    // notification.finish(PushNotificationAndroid.FetchResult.NoData);
  },

  // Android only
  senderID: "YOUR-FCM-SENDER-ID",

  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  popInitialNotification: true,
  requestPermissions: true,
});
