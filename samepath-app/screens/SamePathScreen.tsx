import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ApiService from '../services/ApiService';

export default function SamePathScreen() {
  const navigation = useNavigation();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [friendsFree, setFriendsFree] = useState<{ [friendId: number]: { [dayIdx: number]: [number, number][] } }>({});
  const [todayPlan, setTodayPlan] = useState<Array<{ type: 'class' | 'free'; start: number; end: number; data?: any; overlapCount?: number }>>([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      let user_id = await AsyncStorage.getItem('user_id');
      
      // If no user_id, show error
      if (!user_id) {
        Alert.alert('Error', 'User not logged in properly. Please log in again.');
        setLoading(false);
        return;
      }
      
      try {
        const response = await ApiService.getSchedule(Number(user_id));
        // Handle the new API response format
        if (response.data && response.data.schedule) {
          setSchedule(response.data.schedule || []);
        } else if (response.data && Array.isArray(response.data)) {
          setSchedule(response.data);
        } else {
          setSchedule([]);
        }
      } catch (error) {
        console.log('Error fetching schedule:', error);
        Alert.alert('Error', 'Failed to fetch schedule.');
      }
      setLoading(false);
    };
    fetchSchedule();
  }, []);

  const isFocused = useIsFocused();

  const formatTime12Hour = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const h12 = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
    const ampm = hours < 12 ? 'AM' : 'PM';
    return `${h12}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  const fetchPending = useCallback(async () => {
      try {
        const user_id = await AsyncStorage.getItem('user_id');
        if (!user_id) return;
        const resp = await ApiService.getFriendsList(Number(user_id));
        const items = Array.isArray(resp.data?.friends) ? resp.data.friends : [];
        const count = items.filter((f: any) => f.status === 'pending_received').length;
        setPendingRequests(count);
      } catch (e) {
        // ignore badge errors
      }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [isFocused, fetchPending]);

  // Helpers for time/day parsing
  const timeStringToMinutes = (time: string) => {
    const match = time?.trim()?.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?$/);
    if (!match) return NaN;
    let hours = parseInt(match[1], 10);
    const mins = match[2] ? parseInt(match[2], 10) : 0;
    const ampm = match[3]?.toLowerCase();
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    return hours * 60 + mins;
  };
  const parseDays = (daysStr: string): number[] => {
    if (!daysStr) return [];
    const s = daysStr.replace(/\s+/g, '').toUpperCase();
    const result: number[] = [];
    let i = 0;
    while (i < s.length) {
      if (s.startsWith('TH', i)) { result.push(4); i += 2; continue; }
      if (s.startsWith('SA', i)) { result.push(6); i += 2; continue; }
      if (s.startsWith('SU', i)) { result.push(0); i += 2; continue; }
      const c = s[i];
      if (c === 'M') result.push(1);
      else if (c === 'T') result.push(2);
      else if (c === 'W') result.push(3);
      else if (c === 'F') result.push(5);
      else if (c === 'S') result.push(6);
      i += 1;
    }
    return Array.from(new Set(result)).sort();
  };
  const START_MINUTES = 6 * 60;
  const END_MINUTES = 23 * 60;
  const intersectIntervals = (a: [number, number][], b: [number, number][]) => {
    const res: [number, number][] = [];
    let i = 0, j = 0;
    const sa = a.slice().sort((x, y) => x[0] - y[0]);
    const sb = b.slice().sort((x, y) => x[0] - y[0]);
    while (i < sa.length && j < sb.length) {
      const [aS, aE] = sa[i];
      const [bS, bE] = sb[j];
      const start = Math.max(aS, bS);
      const end = Math.min(aE, bE);
      if (end > start) res.push([start, end]);
      if (aE < bE) i++; else j++;
    }
    return res;
  };

  // Fetch friends' free intervals once
  useEffect(() => {
    (async () => {
      try {
        const user_id = await AsyncStorage.getItem('user_id');
        if (!user_id) return;
        const friendsResp = await ApiService.getFriendsList(Number(user_id));
        const accepted = (friendsResp.data?.friends || []).filter((f: any) => (f.status === 'accepted' || f.status === 'friend'));
        const map: { [friendId: number]: { [dayIdx: number]: [number, number][] } } = {};
        for (const f of accepted) {
          const fid = Number(f.id ?? f.user_id);
          if (!fid) continue;
          try {
            const schResp = await ApiService.getSchedule(fid);
            const scheduleArr = schResp.data?.schedule || [];
            // build free intervals per day for friend
            const perDay: { [dayIdx: number]: [number, number][] } = { 0: [],1: [],2: [],3: [],4: [],5: [],6: [] } as any;
            const dayToBusy: { [dayIdx: number]: [number, number][] } = { 0: [],1: [],2: [],3: [],4: [],5: [],6: [] } as any;
            for (const ev of scheduleArr) {
              const days = parseDays(ev.days || ev.day || '');
              const parts = String(ev.time || '').split('-');
              if (parts.length !== 2) continue;
              const s = timeStringToMinutes(parts[0]);
              const e = timeStringToMinutes(parts[1]);
              if (isNaN(s) || isNaN(e)) continue;
              days.forEach(d => { dayToBusy[d].push([Math.max(s, START_MINUTES), Math.min(e, END_MINUTES)]); });
            }
            for (let d = 0; d < 7; d++) {
              const busy = (dayToBusy[d] || []).sort((a,b)=>a[0]-b[0]);
              let free: [number, number][] = [];
              let prev = START_MINUTES;
              for (const [s,e] of busy) { if (s>prev) free.push([prev,s]); prev=Math.max(prev,e); }
              if (prev<END_MINUTES) free.push([prev, END_MINUTES]);
              perDay[d] = free;
            }
            map[fid] = perDay;
          } catch {}
        }
        setFriendsFree(map);
      } catch {}
    })();
  }, []);

  // Build today's plan from schedule + free + overlaps
  useEffect(() => {
    const buildPlan = async () => {
      // Determine today index (0=Sun)
      const todayIdx = new Date().getDay();
      // Build today's class intervals
      const busy: Array<{ start: number; end: number; item: any }> = [];
      for (const ev of schedule) {
        const days = parseDays(ev.days || ev.day || '');
        if (!days.includes(todayIdx)) continue;
        const parts = String(ev.time || '').split('-');
        if (parts.length !== 2) continue;
        const s = timeStringToMinutes(parts[0]);
        const e = timeStringToMinutes(parts[1]);
        if (isNaN(s) || isNaN(e)) continue;
        busy.push({ start: s, end: e, item: ev });
      }
      busy.sort((a,b)=>a.start-b.start);
      // Free intervals
      const free: [number, number][] = [];
      let prev = START_MINUTES;
      for (const b of busy) { if (b.start>prev) free.push([prev, b.start]); prev=Math.max(prev,b.end); }
      if (prev<END_MINUTES) free.push([prev, END_MINUTES]);
      // From now to end of day
      const now = new Date();
      const nowMin = now.getHours()*60 + now.getMinutes();
      const plan: Array<{ type:'class'|'free'; start:number; end:number; data?:any; overlapCount?:number }> = [];
      // Merge busy and free into sequence
      let fi = 0, bi = 0;
      const pushIfAfterNow = (entry:any) => { if (entry.end > nowMin) { if (entry.start < nowMin) entry.start = nowMin; plan.push(entry); } };
      while (fi < free.length || bi < busy.length) {
        const f = fi < free.length ? free[fi] : null;
        const b = bi < busy.length ? busy[bi] : null;
        if (f && (!b || f[0] <= b.start)) { pushIfAfterNow({ type:'free', start:f[0], end:f[1] }); fi++; }
        else if (b) { pushIfAfterNow({ type:'class', start:b.start, end:b.end, data:b.item }); bi++; }
      }
      // Compute friend overlap count for free entries
      const ff = Object.values(friendsFree);
      const withOverlap = plan.map(entry => {
        if (entry.type !== 'free') return entry;
        let count = 0;
        const userFreeInterval: [number, number][] = [[entry.start, entry.end]];
        for (const friend of ff) {
          const fFree = friend?.[todayIdx] || [];
          if (fFree.length === 0) continue;
          // Check if any of friend's free intervals overlap with this user's free interval
          for (const fInterval of fFree) {
            const overlaps = intersectIntervals(userFreeInterval, [fInterval]);
            if (overlaps.length > 0) {
              count++;
              break; // Only count each friend once per free block
            }
          }
        }
        return { ...entry, overlapCount: count };
      });
      setTodayPlan(withOverlap);
    };
    buildPlan();
  }, [schedule, friendsFree]);


  return (
    <View style={styles.container}>
      {/* Modern Header with Gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/SamePathLogo.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Notifications' as never)}
            >
              <View style={styles.notificationContainer}>
                <Ionicons name="notifications" size={24} color="#ffffff" />
                {pendingRequests > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {pendingRequests > 9 ? '9+' : String(pendingRequests)}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Network' as never)}
            >
              <Ionicons name="people" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Preferences' as never)}
            >
              <Ionicons name="settings" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.welcomeSubtext}>Ready to make the most of your day?</Text>
        </View>

        {/* Today's Timeline - Integrated */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>Today's Timeline</Text>
          </View>
          {loading ? (
            <View style={styles.loadingCard}>
              <Ionicons name="refresh" size={24} color="#6366f1" />
              <Text style={styles.loadingText}>Loading your schedule...</Text>
            </View>
          ) : todayPlan.length === 0 ? (
            <View style={styles.noClassCard}>
              <Text style={styles.noClassText}>No items for the rest of today</Text>
            </View>
          ) : (
            todayPlan.map((item, idx) => (
              <View key={`timeline-${idx}`} style={[styles.planItem, item.type === 'free' ? styles.planFree : styles.planClass]}>
                <View style={styles.planTimeCol}>
                  <Text style={styles.planTime}>{formatTime12Hour(item.start)}</Text>
                  <Text style={styles.planTime}>{formatTime12Hour(item.end)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  {item.type === 'class' ? (
                    <>
                      <Text style={styles.planTitle}>{item.data?.courseName || item.data?.name || 'Class'}</Text>
                      <Text style={styles.planSub}>{item.data?.location || item.data?.room || 'Location TBD'}</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.planTitle}>Free time</Text>
                      <Text style={styles.planSub}>
                        {item.overlapCount ? `${item.overlapCount} friend${item.overlapCount>1?'s':''} also free` : 'No overlaps'}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid" size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Schedule' as never)}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="calendar" size={28} color="#6366f1" />
              </View>
              <Text style={styles.actionTitle}>Schedule</Text>
              <Text style={styles.actionSubtitle}>View your classes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('FreeTime' as never)}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="time" size={28} color="#f59e0b" />
              </View>
              <Text style={styles.actionTitle}>Free Time</Text>
              <Text style={styles.actionSubtitle}>Find activities</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('CRNLookup' as never)}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="search" size={28} color="#ef4444" />
              </View>
              <Text style={styles.actionTitle}>Course Lookup</Text>
              <Text style={styles.actionSubtitle}>Find classes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Network' as never)}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="people" size={28} color="#8b5cf6" />
              </View>
              <Text style={styles.actionTitle}>Network</Text>
              <Text style={styles.actionSubtitle}>Connect with friends</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Suggested Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>Suggested Activities</Text>
          </View>
          <View style={styles.activityList}>
            <TouchableOpacity style={styles.activityCard}>
              <View style={styles.activityIcon}>
                <Ionicons name="fitness" size={20} color="#fff" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Hit the gym</Text>
                <Text style={styles.activityLocation}>McComas Hall</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.activityCard}>
              <View style={styles.activityIcon}>
                <Ionicons name="library" size={20} color="#fff" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Study session</Text>
                <Text style={styles.activityLocation}>Newman Library</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.activityCard}>
              <View style={styles.activityIcon}>
                <Ionicons name="restaurant" size={20} color="#fff" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Grab lunch</Text>
                <Text style={styles.activityLocation}>D2 Dining Hall</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#667eea',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    width: 120,
    height: 40,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  nextClassCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  classIcon: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  classInfo: {
    flex: 1,
  },
  nextClassTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  nextClassTime: {
    fontSize: 14,
    color: '#64748b',
  },
  classLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextClassLocation: {
    fontSize: 14,
    color: '#6366f1',
    marginLeft: 4,
    fontWeight: '500',
  },
  noClassCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noClassIcon: {
    marginBottom: 12,
  },
  noClassText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  noClassSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  activityList: {
    gap: 12,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  activityLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  planItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  planFree: {
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  planClass: {
    borderLeftWidth: 4,
    borderLeftColor: '#94a3b8',
  },
  planTimeCol: {
    width: 64,
    marginRight: 12,
  },
  planTime: {
    fontSize: 12,
    color: '#64748b',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  planSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
}); 