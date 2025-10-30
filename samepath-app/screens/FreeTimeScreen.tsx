import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Modal as RNModal, PanResponder, Alert, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ApiService from '../services/ApiService';

const START_MINUTES = 6 * 60; // 6:00am
const END_MINUTES = 23 * 60; // 11:00pm
const TOTAL_DAY_MINUTES = END_MINUTES - START_MINUTES;
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ACTIVITIES = ['Gym', 'Rest/Nap', 'Eat', 'Study', 'Read', 'Religion', 'Social', 'Other'];

const timeStringToMinutes = (time: string) => {
  // Handles "8:00", "8:00 AM", "8:00PM"
  const match = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?$/);
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
    else if (c === 'S') result.push(6); // fallback Sat
    i += 1;
  }
  return Array.from(new Set(result)).sort();
};

const getDailyIntervals = (schedule: { days: string; time: string }[]) => {
  const dayIntervals: { [dayIdx: number]: { scheduled: [number, number][], free: [number, number][] } } = {};
  for (let i = 0; i < 7; i++) {
    dayIntervals[i] = { scheduled: [], free: [] };
  }
  schedule.forEach(event => {
    const days = parseDays(event.days || '');
    let start = START_MINUTES, end = START_MINUTES;
    if (event.time) {
      // Flexible time parsing: "8:00-8:50", "8:00 AM - 8:50 PM"
      const parts = event.time.split('-');
      if (parts.length === 2) {
        const sMin = timeStringToMinutes(parts[0]);
        const eMin = timeStringToMinutes(parts[1]);
        if (!isNaN(sMin) && !isNaN(eMin)) {
          start = sMin; end = eMin;
        }
      }
    }
    days.forEach(dayIdx => {
      const s = Math.max(start, START_MINUTES);
      const e = Math.min(end, END_MINUTES);
      if (e > s) dayIntervals[dayIdx].scheduled.push([s, e]);
    });
  });
  for (let i = 0; i < 7; i++) {
    const scheduled = dayIntervals[i].scheduled.sort((a, b) => a[0] - b[0]);
    let free: [number, number][] = [];
    let prevEnd = START_MINUTES;
    for (const [s, e] of scheduled) {
      if (s > prevEnd) free.push([prevEnd, s]);
      prevEnd = Math.max(prevEnd, e);
    }
    if (prevEnd < END_MINUTES) free.push([prevEnd, END_MINUTES]);
    dayIntervals[i].free = free;
  }
  return dayIntervals;
};

export default function FreeTimeScreen() {
  const [tooltip, setTooltip] = useState<{ dayIdx: number; x: number; time: string } | null>(null);
  const [activityModal, setActivityModal] = useState<{ dayIdx: number; start: number; end: number } | null>(null);
  const [activityPrefs, setActivityPrefs] = useState<Record<string, Record<string, boolean>>>({});
  const [schedule, setSchedule] = useState<any[]>([]);
  const [friendsFree, setFriendsFree] = useState<{ [friendId: number]: { [dayIdx: number]: [number, number][] } }>({});
  const [loading, setLoading] = useState(true);
  const barRefs = useRef<(View | null)[]>([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      const user_id = await AsyncStorage.getItem('user_id');
      if (!user_id) {
        Alert.alert('Error', 'User not logged in.');
        setLoading(false);
        return;
      }
      try {
        const response = await ApiService.getSchedule(Number(user_id));
        setSchedule(response.data.schedule || []);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch schedule.');
      }
      setLoading(false);
    };
    fetchSchedule();
    // load stored activity preferences
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('free_time_activity_prefs');
        if (raw) setActivityPrefs(JSON.parse(raw));
      } catch {}
    })();
    // fetch friends' schedules to compute free overlaps
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
            const free = getDailyIntervals(schResp.data?.schedule || []);
            const perDay: { [dayIdx: number]: [number, number][] } = {};
            for (let d = 0; d < 7; d++) perDay[d] = free[d].free;
            map[fid] = perDay;
          } catch {}
        }
        setFriendsFree(map);
      } catch {}
    })();
  }, []);

  const getBarPanResponder = (dayIdx: number) => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: evt => {
      const bar = barRefs.current[dayIdx];
      if (bar) {
        bar.measure((fx, fy, width, height, px, py) => {
          const x = evt.nativeEvent.pageX - px;
          setTooltip({ dayIdx, x, time: getTimeFromX(x, width) });
        });
      }
    },
    onPanResponderMove: evt => {
      const bar = barRefs.current[dayIdx];
      if (bar) {
        bar.measure((fx, fy, width, height, px, py) => {
          const x = evt.nativeEvent.pageX - px;
          setTooltip({ dayIdx, x, time: getTimeFromX(x, width) });
        });
      }
    },
    onPanResponderRelease: () => setTooltip(null),
    onPanResponderTerminate: () => setTooltip(null),
  });

  const getTimeFromX = (x: number, barWidth: number) => {
    const pct = Math.max(0, Math.min(1, x / barWidth));
    const minutes = Math.round(START_MINUTES + pct * TOTAL_DAY_MINUTES);
    return `${Math.floor(minutes / 60)}:${(minutes % 60).toString().padStart(2, '0')}`;
  };

  // Convert API schedule to intervals
  const intervals = getDailyIntervals(schedule);

  const getBlockKey = (dayIdx: number, start: number, end: number) => `${dayIdx}:${start}-${end}`;
  // default selected unless explicitly turned off
  const isActivitySelected = (key: string, activity: string) => activityPrefs[key]?.[activity] !== false;
  const toggleActivity = async (key: string, activity: string) => {
    setActivityPrefs(prev => {
      const next = { ...prev } as Record<string, Record<string, boolean>>;
      next[key] = next[key] ? { ...next[key] } : {};
      const current = next[key][activity];
      // toggle between true and false, defaulting to true when undefined
      next[key][activity] = !(current !== false);
      AsyncStorage.setItem('free_time_activity_prefs', JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

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

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Free Time Blocks</Text>
          <Text style={styles.headerSubtitle}>Plan your activities around your schedule</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <Ionicons name="refresh" size={32} color="#6366f1" />
              <Text style={styles.loadingText}>Loading your schedule...</Text>
            </View>
          </View>
        ) : (
          <>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="time" size={24} color="#6366f1" />
                <Text style={styles.summaryTitle}>This Week's Free Time</Text>
              </View>
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {DAYS.reduce((total, day, idx) => total + intervals[idx].free.length, 0)}
                  </Text>
                  <Text style={styles.statLabel}>Free Blocks</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {Math.round(DAYS.reduce((total, day, idx) => 
                      total + intervals[idx].free.reduce((sum, [start, end]) => sum + (end - start), 0), 0) / 60)}
                  </Text>
                  <Text style={styles.statLabel}>Total Hours</Text>
                </View>
              </View>
            </View>

            {/* Daily Schedule */}
            {DAYS.map((day, dayIdx) => (
              <View key={day} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayName}>{day}</Text>
                  <Text style={styles.dayStats}>
                    {intervals[dayIdx].free.length} free blocks
                  </Text>
                </View>
                
                <View style={styles.timelineContainer}>
                  <View
                    ref={el => { barRefs.current[dayIdx] = el; }}
                    style={styles.timelineBar}
                    {...getBarPanResponder(dayIdx).panHandlers}
                  >
                    {/* Background track */}
                    <View style={styles.timelineTrack} />
                    
                    {/* Scheduled blocks */}
                    {intervals[dayIdx].scheduled.map(([s, e], i) => {
                      const leftPct = ((s - START_MINUTES) / TOTAL_DAY_MINUTES) * 100;
                      const widthPct = ((e - s) / TOTAL_DAY_MINUTES) * 100;
                      return (
                        <View
                          key={`sched-${s}`}
                          style={[styles.scheduledBlock, {
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                          }]}
                        />
                      );
                    })}
                    
                    {/* Friends overlap blocks (aggregate any friend) - render first so free blocks are on top */}
                    {(() => {
                      const overlaps: [number, number][] = [];
                      const myFree = intervals[dayIdx].free;
                      // union of overlaps with any friend
                      for (const fid of Object.keys(friendsFree)) {
                        const friendFree = friendsFree[Number(fid)]?.[dayIdx] || [];
                        overlaps.push(...intersectIntervals(myFree, friendFree));
                      }
                      return overlaps.map(([s, e]) => {
                        const leftPct = ((s - START_MINUTES) / TOTAL_DAY_MINUTES) * 100;
                        const widthPct = ((e - s) / TOTAL_DAY_MINUTES) * 100;
                        return (
                          <View
                            key={`overlap-${s}-${e}`}
                            style={[styles.overlapBlock, { left: `${leftPct}%`, width: `${widthPct}%`, zIndex: 1 }]}
                            pointerEvents="none"
                          />
                        );
                      });
                    })()}

                    {/* Free time blocks - render on top for clickability */}
                    {intervals[dayIdx].free.map(([fStart, fEnd], i) => {
                      const leftPct = ((fStart - START_MINUTES) / TOTAL_DAY_MINUTES) * 100;
                      const widthPct = ((fEnd - fStart) / TOTAL_DAY_MINUTES) * 100;
                      return (
                        <TouchableOpacity
                          key={`free-${fStart}`}
                          style={[styles.freeBlock, {
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                            zIndex: 2,
                          }]}
                          activeOpacity={0.8}
                          onPress={() => setActivityModal({ dayIdx, start: fStart, end: fEnd })}
                        />
                      );
                    })}
                    
                    {/* Time markers */}
                    <View style={styles.timeMarker}>
                      <Text style={styles.timeLabel}>6am</Text>
                    </View>
                    <View style={[styles.timeMarker, { right: 0, left: 'auto' }]}>
                      <Text style={styles.timeLabel}>11pm</Text>
                    </View>
                    
                    {/* Tooltip */}
                    {tooltip && tooltip.dayIdx === dayIdx && (
                      <View style={[styles.tooltip, {
                        left: Math.max(0, Math.min(tooltip.x - 32, Dimensions.get('window').width - 120)),
                      }]}>
                        <Text style={styles.tooltipText}>{tooltip.time}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Activity Modal */}
      {activityModal && (
        <RNModal
          visible={!!activityModal}
          transparent
          animationType="slide"
          onRequestClose={() => setActivityModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Set Activities for {DAYS[activityModal.dayIdx]}
              </Text>
              <Text style={styles.modalTime}>
                {`${Math.floor(activityModal.start / 60)}:${(activityModal.start % 60).toString().padStart(2, '0')} - ${Math.floor(activityModal.end / 60)}:${(activityModal.end % 60).toString().padStart(2, '0')}`}
              </Text>
              <View style={styles.activityList}>
                {ACTIVITIES.map(activity => {
                  const key = getBlockKey(activityModal.dayIdx, activityModal.start, activityModal.end);
                  const selected = isActivitySelected(key, activity);
                  return (
                    <TouchableOpacity
                      key={activity}
                      style={styles.activityOption}
                      onPress={() => toggleActivity(key, activity)}
                    >
                      <View style={[styles.activityCheckbox, selected && { backgroundColor: '#6366f1' }]} />
                      <Text style={styles.activityOptionText}>{activity}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setActivityModal(null)}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </RNModal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
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
    marginTop: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
  },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  dayStats: {
    fontSize: 12,
    color: '#64748b',
  },
  timelineContainer: {
    marginBottom: 16,
  },
  timelineBar: {
    height: 40,
    position: 'relative',
  },
  timelineTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    top: 8,
  },
  scheduledBlock: {
    position: 'absolute',
    height: 24,
    backgroundColor: '#cbd5e1',
    borderRadius: 12,
    top: 8,
  },
  freeBlock: {
    position: 'absolute',
    height: 24,
    backgroundColor: 'rgba(99,102,241,0.25)',
    borderRadius: 12,
    top: 8,
  },
  overlapBlock: {
    position: 'absolute',
    height: 24,
    backgroundColor: 'rgba(16,185,129,0.5)',
    borderRadius: 12,
    top: 8,
  },
  timeMarker: {
    position: 'absolute',
    top: 36,
  },
  timeLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  tooltip: {
    position: 'absolute',
    top: -32,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#f59e0b',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  tooltipText: {
    color: '#f59e0b',
    fontWeight: '600',
    fontSize: 12,
  },
  freeTimeDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  timeSlot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  timeSlotText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 320,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalTime: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  activityList: {
    width: '100%',
    marginBottom: 20,
  },
  activityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6366f1',
    backgroundColor: '#fff',
    marginRight: 12,
  },
  activityOptionText: {
    fontSize: 16,
    color: '#1e293b',
  },
  modalButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
}); 