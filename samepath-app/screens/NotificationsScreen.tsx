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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ApiService from '../services/ApiService';

interface Notification {
  id: string;
  type: 'friend_request' | 'course_match' | 'schedule_update';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    // For now, we'll show sample notifications
    // In the future, this would fetch from the API
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'friend_request',
        title: 'New Friend Request',
        message: 'John Doe wants to be your friend',
        timestamp: '2 minutes ago',
        read: false,
        data: { userId: 1, userName: 'John Doe' }
      },
      {
        id: '2',
        type: 'course_match',
        title: 'Course Match Found!',
        message: 'You and Sarah Wilson are both in MATH 101',
        timestamp: '1 hour ago',
        read: false,
        data: { courseName: 'MATH 101', userName: 'Sarah Wilson' }
      },
      {
        id: '3',
        type: 'schedule_update',
        title: 'Schedule Update',
        message: 'Your CS 1114 class has been moved to Room 205',
        timestamp: '3 hours ago',
        read: true,
        data: { courseName: 'CS 1114', newRoom: 'Room 205' }
      }
    ];
    
    setNotifications(sampleNotifications);
    setLoading(false);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const handleFriendRequest = async (notification: Notification, accept: boolean) => {
    const user_id = await AsyncStorage.getItem('user_id');
    if (!user_id) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    try {
      if (accept) {
        await ApiService.acceptFriendRequest(Number(user_id), notification.data.userId);
        Alert.alert('Success', 'Friend request accepted!');
      } else {
        // TODO: Add reject friend request API call
        Alert.alert('Request Declined', 'Friend request declined.');
      }
      
      // Remove the notification
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    } catch (error: any) {
      console.log('Friend request error:', error);
      Alert.alert('Error', 'Failed to process friend request.');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return 'person-add';
      case 'course_match':
        return 'people';
      case 'schedule_update':
        return 'calendar';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'friend_request':
        return '#4CAF50';
      case 'course_match':
        return '#2196F3';
      case 'schedule_update':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  const formatTime = (timestamp: string) => {
    return timestamp; // For now, just return as is
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={() => setNotifications([])}
        >
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="refresh" size={32} color="#d67b32" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptyText}>No new notifications</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <View 
              key={notification.id} 
              style={[
                styles.notificationCard,
                !notification.read && styles.unreadCard
              ]}
            >
              <View style={styles.notificationHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={getNotificationIcon(notification.type)} 
                    size={24} 
                    color={getNotificationColor(notification.type)} 
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>{formatTime(notification.timestamp)}</Text>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </View>

              {/* Action buttons for friend requests */}
              {notification.type === 'friend_request' && !notification.read && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleFriendRequest(notification, true)}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.declineButton]}
                    onPress={() => handleFriendRequest(notification, false)}
                  >
                    <Ionicons name="close" size={16} color="#FF4444" />
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Tap to mark as read for other notifications */}
              {notification.type !== 'friend_request' && !notification.read && (
                <TouchableOpacity
                  style={styles.markReadButton}
                  onPress={() => markAsRead(notification.id)}
                >
                  <Text style={styles.markReadText}>Mark as Read</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 60,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#d67b32',
    fontWeight: '500',
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#d67b32',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d67b32',
    marginLeft: 8,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  declineButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  declineButtonText: {
    color: '#FF4444',
    fontWeight: '600',
    fontSize: 14,
  },
  markReadButton: {
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  markReadText: {
    color: '#d67b32',
    fontWeight: '500',
    fontSize: 14,
  },
}); 