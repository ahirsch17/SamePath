import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export default function PreferencesScreen() {
  const [shareSchedule, setShareSchedule] = useState(true);
  const [shareFreeTime, setShareFreeTime] = useState(true);
  const [showActivityPrefs, setShowActivityPrefs] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Preferences</Text>
      <View style={styles.prefRow}>
        <Text style={styles.label}>Share my schedule with friends</Text>
        <Switch value={shareSchedule} onValueChange={setShareSchedule} />
      </View>
      <View style={styles.prefRow}>
        <Text style={styles.label}>Allow others to see my free time</Text>
        <Switch value={shareFreeTime} onValueChange={setShareFreeTime} />
      </View>
      <View style={styles.prefRow}>
        <Text style={styles.label}>Show my activity preferences</Text>
        <Switch value={showActivityPrefs} onValueChange={setShowActivityPrefs} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, color: '#d67b32' },
  prefRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  label: { fontSize: 16, color: '#333', flex: 1, marginRight: 12 },
}); 