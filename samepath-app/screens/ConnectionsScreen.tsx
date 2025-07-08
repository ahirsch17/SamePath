import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Connections: undefined;
  Contacts: undefined;
};

export default function ConnectionsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Connections'>>();
  const [syncContacts, setSyncContacts] = useState(false);
  const [connectSnapchat, setConnectSnapchat] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const logo = require('../assets/SamePathLogo.png');

  const handleContinue = () => {
    if (!syncContacts) {
      Alert.alert('Contacts permission required', 'You must enable contact sync to continue.');
      return;
    }

    navigation.navigate('Contacts');
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Image source={logo} style={styles.logo} resizeMode="contain" />
              <Text style={styles.mainHeader}>Build your{"\n"}<Text style={styles.bold}>Connections List</Text></Text>

      <Text style={styles.description}>
        We’ll check your contacts and/or Snapchat friends to see if anyone else on SamePath is someone you already know.
        This doesn’t share your activity or private info — it just helps seed your matches.
        {"\n\n"}Enabling both contacts and location helps us match more accurately. You can change this anytime in Settings.
      </Text>

      <View style={styles.switchRow}>
        <Switch value={syncContacts} onValueChange={setSyncContacts} />
        <Text style={styles.switchText}>Sync phone contacts</Text>
      </View>

      <View style={styles.switchRow}>
        <Switch value={connectSnapchat} onValueChange={setConnectSnapchat} />
        <Text style={styles.switchText}>Connect Snapchat</Text>
      </View>

      <View style={styles.switchRow}>
        <Switch value={locationEnabled} onValueChange={setLocationEnabled} />
        <Text style={styles.switchText}>Enable Location</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, !syncContacts && styles.disabledButton]}
        onPress={handleContinue}
        disabled={!syncContacts}
      >
        <Text style={styles.buttonText}>Continue (1/2)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 60,
    paddingHorizontal: 25,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 80,
    left: 25,
    zIndex: 1,
  },
  logo: {
    width: 240,
    height: 80,
    alignSelf: 'center',
    marginBottom: 20,
  },
  mainHeader: {
    fontSize: 26,
    textAlign: 'center',
    color: '#222',
    marginBottom: 10,
  },
  bold: {
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    marginBottom: 25,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  button: {
    backgroundColor: '#222e36',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 30,
  },
  disabledButton: {
    backgroundColor: '#bbb',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
