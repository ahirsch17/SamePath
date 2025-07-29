import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ApiService from '../services/ApiService';

interface Friend {
  id: number;
  name: string;
  email: string;
  status: 'friend' | 'pending_sent' | 'pending_received';
}

export default function FriendsScreen() {
  const navigation = useNavigation();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchUserId, setSearchUserId] = useState('');

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    setLoading(true);
    const user_id = await AsyncStorage.getItem('user_id');
    if (!user_id) {
      Alert.alert('Error', 'User not logged in.');
      setLoading(false);
      return;
    }

    // For now, we'll show a placeholder since we need to implement
    // friend list retrieval from the API
    setFriends([
      { id: 1, name: 'John Doe', email: 'john@example.com', status: 'friend' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'pending_sent' },
      { id: 3, name: 'Bob Wilson', email: 'bob@example.com', status: 'pending_received' },
    ]);
    setLoading(false);
  };

  const sendFriendRequest = async () => {
    const user_id = await AsyncStorage.getItem('user_id');
    if (!user_id || !searchUserId) {
      Alert.alert('Error', 'Please enter a user ID to send friend request.');
      return;
    }

    try {
      const response = await ApiService.sendFriendRequest(Number(user_id), Number(searchUserId));
      Alert.alert('Success', 'Friend request sent successfully!');
      setSearchUserId('');
      loadFriends(); // Refresh the list
    } catch (error: any) {
      console.log('Send friend request error:', error);
      let errorMessage = 'Failed to send friend request.';
      if (error.response && error.response.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      Alert.alert('Error', errorMessage);
    }
  };

  const acceptFriendRequest = async (friendId: number) => {
    const user_id = await AsyncStorage.getItem('user_id');
    if (!user_id) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    try {
      const response = await ApiService.acceptFriendRequest(Number(user_id), friendId);
      Alert.alert('Success', 'Friend request accepted!');
      loadFriends(); // Refresh the list
    } catch (error: any) {
      console.log('Accept friend request error:', error);
      let errorMessage = 'Failed to accept friend request.';
      if (error.response && error.response.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      Alert.alert('Error', errorMessage);
    }
  };

  const removeFriend = async (friendId: number) => {
    const user_id = await AsyncStorage.getItem('user_id');
    if (!user_id) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.removeFriend(Number(user_id), friendId);
              Alert.alert('Success', 'Friend removed successfully.');
              loadFriends(); // Refresh the list
            } catch (error: any) {
              console.log('Remove friend error:', error);
              let errorMessage = 'Failed to remove friend.';
              if (error.response && error.response.data) {
                if (error.response.data.error) {
                  errorMessage = error.response.data.error;
                } else if (error.response.data.message) {
                  errorMessage = error.response.data.message;
                }
              }
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'friend':
        return '#4CAF50';
      case 'pending_sent':
        return '#FF9800';
      case 'pending_received':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'friend':
        return 'Friend';
      case 'pending_sent':
        return 'Request Sent';
      case 'pending_received':
        return 'Request Received';
      default:
        return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Add Friend Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Friend</Text>
          <View style={styles.addFriendContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter User ID"
              value={searchUserId}
              onChangeText={setSearchUserId}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={sendFriendRequest}
              disabled={!searchUserId}
            >
              <Text style={styles.addButtonText}>Send Request</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Friends List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Friends</Text>
          {loading ? (
            <Text style={styles.loadingText}>Loading friends...</Text>
          ) : friends.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No friends yet</Text>
              <Text style={styles.emptySubtext}>Send friend requests to connect with others!</Text>
            </View>
          ) : (
            friends.map((friend) => (
              <View key={friend.id} style={styles.friendCard}>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendEmail}>{friend.email}</Text>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(friend.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(friend.status) }]}>
                      {getStatusText(friend.status)}
                    </Text>
                  </View>
                </View>
                <View style={styles.friendActions}>
                  {friend.status === 'pending_received' && (
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => acceptFriendRequest(friend.id)}
                    >
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                  )}
                  {friend.status === 'friend' && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeFriend(friend.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 60,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 15,
  },
  addFriendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  addButton: {
    backgroundColor: '#d67b32',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  friendCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  friendEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  friendActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  removeButton: {
    padding: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
}); 