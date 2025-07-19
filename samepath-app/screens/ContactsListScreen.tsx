import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// import * as ApiService from '../services/ApiService';

export default function ContactsListScreen() {
  // TODO: Fetch contacts from backend using ApiService when endpoint is available
  // For now, show a placeholder
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Contacts</Text>
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Contacts feature coming soon.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#d67b32',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 16,
  },
});
