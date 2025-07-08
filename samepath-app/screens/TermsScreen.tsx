import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function TermsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Use</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.text}>
          Welcome to SamePath!
          {"\n\n"}
          By using this app, you agree to the following terms, which explain how your schedule and preferences are used to help you connect with others:
          {"\n\n"}
          1. SamePath will extract your class schedule and any events you add in order to match you with students who share similar time blocks. These overlaps are used to suggest spontaneous and relevant opportunities to connect.
          {"\n\n"}
          2. Only limited information is used: your name, VT email, and class schedule. We do not access or store your grades, academic history, or personal student data beyond what is needed for schedule-based matching.
          {"\n\n"}
          3. It's recommended to allow schedule and free time matching for the app to work accurately. The more overlap data you allow, the better your suggestions will be. You can update your privacy settings at any time in the app.
          {"\n\n"}
          4. If you enable location services, we may suggest meetups based on your general on-campus proximity (e.g. "You and Jordan are both near Newman Library — want to study together?"). Your live location is never visible to anyone and is never saved.
          {"\n\n"}
          5. Nobody ever sees your full schedule. Matches are made only when mutual overlap occurs during time blocks you've marked as open (e.g. gym, study, eat). If you choose not to match with someone, neither of you will receive suggestions about each other — and nobody is notified.
          {"\n\n"}
          6. If someone disappears from your matches, that doesn't mean they said "no" — they might have changed their availability, turned off a feature, or updated their preferences.
          {"\n\n"}
          7. Use this app respectfully. Misuse, harassment, or attempting to violate another user's privacy settings will result in account removal.
          {"\n\n"}
          8. You may receive occasional updates, feature notices, or reminders to check your schedule. These are designed to improve your experience.
          {"\n\n"}
          By continuing, you acknowledge these terms and understand that your privacy is in your control at all times.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 60,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  scroll: {
    paddingBottom: 30,
  },
  text: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
});
