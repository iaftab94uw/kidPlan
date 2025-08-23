import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Filter,
  ChevronRight
} from 'lucide-react-native';

export default function WeekSchedule() {
  const router = useRouter();
  
  const [filter, setFilter] = useState('all'); // 'all', 'primary', 'secondary'

  const weekSchedules = [
    {
      id: 1,
      name: "Weekend with Dad",
      startDate: new Date(2024, 7, 24),
      endDate: new Date(2024, 7, 25),
      parent: "secondary",
      location: "Dad's House",
      activities: "Swimming, Film night, Cooking together",
      notes: "Pick up at 6 PM Friday, drop off Sunday 7 PM",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      color: "#F59E0B"
    },
    {
      id: 2,
      name: "School Week",
      startDate: new Date(2024, 7, 26),
      endDate: new Date(2024, 7, 30),
      parent: "primary",
      location: "Home",
      activities: "School, homework, piano lessons",
      notes: "Regular school routine",
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      color: "#0e3c67"
    },
    {
      id: 3,
      name: "Grandparents Visit",
      startDate: new Date(2024, 8, 1),
      endDate: new Date(2024, 8, 3),
      parent: "secondary",
      location: "Grandparents House",
      activities: "Baking, gardening, story time",
      notes: "Annual summer visit",
      avatar: "https://images.pexels.com/photos/1146754/pexels-photo-1146754.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      color: "#10B981"
    },
    {
      id: 4,
      name: "Holiday Week",
      startDate: new Date(2024, 8, 15),
      endDate: new Date(2024, 8, 22),
      parent: "primary",
      location: "Cornwall",
      activities: "Beach, hiking, sightseeing",
      notes: "Family holiday - both parents",
      avatar: "https://images.pexels.com/photos/1146603/pexels-photo-1146603.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      color: "#8B5CF6"
    }
  ];

  const getFilteredSchedules = () => {
    if (filter === 'all') return weekSchedules;
    return weekSchedules.filter(schedule => schedule.parent === filter);
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const end = endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return `${start} - ${end}`;
  };

  const getParentLabel = (parentType: string) => {
    return parentType === 'primary' ? 'You' : 'Co-Parent';
  };

  const getParentBadgeColor = (parentType: string) => {
    return parentType === 'primary' ? '#E6F3FF' : '#FEF3C7';
  };

  const getParentTextColor = (parentType: string) => {
    return parentType === 'primary' ? '#0e3c67' : '#F59E0B';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>This Week's Schedule</Text>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Week Overview */}
        <View style={styles.weekOverview}>
          <Text style={styles.weekTitle}>
            Week of {new Date().toLocaleDateString('en-GB', { 
              day: 'numeric', 
              month: 'long',
              year: 'numeric'
            })}
          </Text>
          <Text style={styles.scheduleCount}>{getFilteredSchedules().length} schedules</Text>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setFilter('all')}
          >
            <Text style={[
              styles.filterButtonText,
              filter === 'all' && styles.filterButtonTextActive
            ]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'primary' && styles.filterButtonActive
            ]}
            onPress={() => setFilter('primary')}
          >
            <Text style={[
              styles.filterButtonText,
              filter === 'primary' && styles.filterButtonTextActive
            ]}>Primary Parent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'secondary' && styles.filterButtonActive
            ]}
            onPress={() => setFilter('secondary')}
          >
            <Text style={[
              styles.filterButtonText,
              filter === 'secondary' && styles.filterButtonTextActive
            ]}>Secondary Parent</Text>
          </TouchableOpacity>
        </View>

        {/* Schedules List */}
        <View style={styles.schedulesSection}>
          {getFilteredSchedules().map((schedule) => (
            <TouchableOpacity 
              key={schedule.id} 
              style={styles.scheduleCard}
              onPress={() => router.push(`/schedule-detail/${schedule.id}`)}
            >
              <View style={[styles.scheduleColorBar, { backgroundColor: schedule.color }]} />
              <Image source={{ uri: schedule.avatar }} style={styles.scheduleAvatar} />
              <View style={styles.scheduleContent}>
                <View style={styles.scheduleHeader}>
                  <Text style={styles.scheduleName}>{schedule.name}</Text>
                  <View style={[
                    styles.scheduleParentBadge, 
                    { backgroundColor: getParentBadgeColor(schedule.parent) }
                  ]}>
                    <Text style={[
                      styles.scheduleParentText,
                      { color: getParentTextColor(schedule.parent) }
                    ]}>
                      {getParentLabel(schedule.parent)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.scheduleDate}>
                  {formatDateRange(schedule.startDate, schedule.endDate)}
                </Text>
                <View style={styles.scheduleMeta}>
                  <View style={styles.scheduleMetaItem}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={styles.scheduleMetaText}>{schedule.location}</Text>
                  </View>
                </View>
                <Text style={styles.scheduleActivities}>{schedule.activities}</Text>
                {schedule.notes && (
                  <View style={styles.scheduleNotes}>
                    <Text style={styles.scheduleNotesText}>{schedule.notes}</Text>
                  </View>
                )}
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    backgroundColor: '#0e3c67',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekOverview: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  scheduleCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#0e3c67',
    borderColor: '#0e3c67',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  schedulesSection: {
    padding: 20,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    overflow: 'hidden',
    alignItems: 'center',
  },
  scheduleColorBar: {
    width: 4,
    height: '100%',
    minHeight: 120,
  },
  scheduleAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: 16,
  },
  scheduleContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  scheduleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  scheduleParentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scheduleParentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  scheduleMeta: {
    marginBottom: 8,
  },
  scheduleMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleMetaText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  scheduleActivities: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  scheduleNotes: {
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
  },
  scheduleNotesText: {
    fontSize: 12,
    color: '#6B7280',
  },
  bottomSpacing: {
    height: 32,
  },
});