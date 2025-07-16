import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Modal as RNModal, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const START_MINUTES = 6 * 60; // 6:00am
const END_MINUTES = 23 * 60; // 11:00pm
const TOTAL_DAY_MINUTES = END_MINUTES - START_MINUTES;
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ACTIVITIES = ['Gym', 'Rest/Nap', 'Eat', 'Study', 'Read', 'Religion', 'Social', 'Other'];

// Demo: fake schedule (replace with real data as needed)
const demoSchedule = [
  { days: 'M W F', time: '9:00-9:50' },
  { days: 'M W F', time: '10:00-10:50' },
  { days: 'T TH', time: '11:00-11:50' },
  { days: 'M W F', time: '2:00-2:50' },
  { days: 'M W F', time: '1:00-1:50' },
  { days: 'T TH', time: '1:00-1:50' },
];

const timeStringToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
};
const minutesToTimeString = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
};

const getDailyIntervals = (schedule: { days: string; time: string }[]) => {
  const dayIntervals: { [dayIdx: number]: { scheduled: [number, number][], free: [number, number][] } } = {};
  for (let i = 0; i < 7; i++) {
    dayIntervals[i] = { scheduled: [], free: [] };
  }
  schedule.forEach(event => {
    const dayMap: { [key: string]: number } = { S: 0, M: 1, T: 2, W: 3, TH: 4, F: 5, SA: 6 };
    const daysArr = event.days.split(' ').filter(day => day.trim() !== '');
    let start = START_MINUTES, end = START_MINUTES;
    if (event.time) {
      const match = event.time.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
      if (match) {
        start = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
        end = parseInt(match[3], 10) * 60 + parseInt(match[4], 10);
      } else {
        // Support single time (e.g., '9:00-9:50')
        const parts = event.time.split('-');
        if (parts.length === 2) {
          start = timeStringToMinutes(parts[0]);
          end = timeStringToMinutes(parts[1]);
        }
      }
    }
    daysArr.forEach(dayStr => {
      let dayIdx = dayMap[dayStr] ?? -1;
      if (dayIdx >= 0) {
        const s = Math.max(start, START_MINUTES);
        const e = Math.min(end, END_MINUTES);
        if (e > s) dayIntervals[dayIdx].scheduled.push([s, e]);
      }
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
  const barRefs = useRef<(View | null)[]>([]);

  const getTimeFromX = (x: number, barWidth: number) => {
    const pct = Math.max(0, Math.min(1, x / barWidth));
    const minutes = Math.round(START_MINUTES + pct * TOTAL_DAY_MINUTES);
    return minutesToTimeString(minutes);
  };

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

  const intervals = getDailyIntervals(demoSchedule);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>Free Time</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {DAYS.map((day, dayIdx) => (
          <View key={day} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ width: 48, fontWeight: 'bold', fontSize: 13 }}>{day.slice(0, 3)}</Text>
            <View
              ref={el => { barRefs.current[dayIdx] = el; }}
              style={{ flex: 1, height: 32, justifyContent: 'center', position: 'relative' }}
              {...getBarPanResponder(dayIdx).panHandlers}
            >
              <View style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 18,
                backgroundColor: '#f3f3f3',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#e0e0e0',
                top: 7,
              }} />
              {intervals[dayIdx].scheduled.map(([s, e], i) => {
                const leftPct = ((s - START_MINUTES) / TOTAL_DAY_MINUTES) * 100;
                const widthPct = ((e - s) / TOTAL_DAY_MINUTES) * 100;
                return (
                  <View
                    key={`sched-${s}`}
                    style={{
                      position: 'absolute',
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      height: 18,
                      backgroundColor: '#d1d5db',
                      borderRadius: 12,
                      top: 7,
                    }}
                  />
                );
              })}
              {intervals[dayIdx].free.map(([fStart, fEnd], i) => {
                const leftPct = ((fStart - START_MINUTES) / TOTAL_DAY_MINUTES) * 100;
                const widthPct = ((fEnd - fStart) / TOTAL_DAY_MINUTES) * 100;
                return (
                  <TouchableOpacity
                    key={`free-${fStart}`}
                    style={{
                      position: 'absolute',
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      height: 18,
                      backgroundColor: '#FFA500',
                      borderRadius: 12,
                      top: 7,
                      opacity: 0.92,
                    }}
                    activeOpacity={0.7}
                    onPress={() => setActivityModal({ dayIdx, start: fStart, end: fEnd })}
                  />
                );
              })}
              <View style={{ position: 'absolute', left: 0, top: 28 }}>
                <Text style={{ fontSize: 11, color: '#888' }}>6am</Text>
              </View>
              <View style={{ position: 'absolute', right: 0, top: 28 }}>
                <Text style={{ fontSize: 11, color: '#888' }}>11pm</Text>
              </View>
              {tooltip && tooltip.dayIdx === dayIdx && (
                <View style={{
                  position: 'absolute',
                  left: Math.max(0, Math.min(tooltip.x - 32, Dimensions.get('window').width - 120)),
                  top: -28,
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderWidth: 1,
                  borderColor: '#FFA500',
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 2,
                  shadowOffset: { width: 0, height: 1 },
                  zIndex: 10,
                }}>
                  <Text style={{ color: '#d67b32', fontWeight: 'bold', fontSize: 13 }}>{tooltip.time}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
      {activityModal && (
        <RNModal
          visible={!!activityModal}
          transparent
          animationType="slide"
          onRequestClose={() => setActivityModal(null)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: 320, alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>
                Set Activities for {DAYS[activityModal.dayIdx]} {minutesToTimeString(activityModal.start)}–{minutesToTimeString(activityModal.end)}
              </Text>
              {ACTIVITIES.map(activity => (
                <TouchableOpacity
                  key={activity}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                  onPress={() => setActivityModal(null)}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: '#d67b32',
                    backgroundColor: '#fff',
                    marginRight: 8,
                  }} />
                  <Text>{activity}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={{ marginTop: 16, backgroundColor: '#d67b32', borderRadius: 6, padding: 10, alignItems: 'center', width: 120 }}
                onPress={() => setActivityModal(null)}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </RNModal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#d67b32',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
}); 