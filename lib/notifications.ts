import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const REMINDER_TAG = "lienghaaseng-gentle-reminder";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

async function prepareChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("gentle-reminders", {
      name: "溫和練習提示",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 120],
      lightColor: "#EF6257",
    });
  }
}

export async function cancelGentleReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter((item) => item.content.data?.tag === REMINDER_TAG).map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
}

export async function scheduleGentleReminder() {
  await prepareChannel();
  const permissions = await Notifications.getPermissionsAsync();
  if (!permissions.granted) return false;
  await cancelGentleReminders();
  await Notifications.scheduleNotificationAsync({
    content: { title: "想練吓聲？", body: "唔使練好耐，揀一個舒服嘅短練習就得。", data: { tag: REMINDER_TAG, url: "/(tabs)" } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3 * 24 * 60 * 60, repeats: false, channelId: "gentle-reminders" },
  });
  return true;
}

export async function requestGentleReminderPermission() {
  await prepareChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}
