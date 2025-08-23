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
  Clock,
  MapPin,
  User,
  Plus,
  Filter
} from 'lucide-react-native';

export default function TodaySchedule() {
  const router = useRouter();
  
  const [filter, setFilter] = useState('all'); // 'all', 'emma', 'jack'

  const todayEvents = [
    {
      id: 1,
      title: "Emma's Piano Lesson",
      time: "4:00 PM - 5:00 PM",
      location: "Music Academy",
      child: "Emma",
      color: "#22C55E",
      avatar: "https://images.pexels.com/photos/1169084/pexels-photo-1169084.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      status: "upcoming",
      notes: "Remember to bring music sheets"
    },
    {
      id: 2,
      title: "School Assembly",
      time: "9:00 AM - 10:00 AM",
      location: "Oakwood Primary",
      child: "Both",
      color: "#3B82F6",
      avatar: "https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      status: "completed",
      notes: "Annual sports day assembly"
    },
    {
      id: 3,
      title: "Football Practice",
      time: "6:00 PM - 7:30 PM",
      location: "Community Center",
      child: "Jack",
      color: "#F97316",
      avatar: "https://images.pexels.com/photos/1765110/pexels-photo-1765110.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      status: "upcoming",
      notes: "Bring water bottle and boots"
    },
    {
      id: 4,
      title: "Dentist Appointment",
      time: "2:00 PM - 2:30 PM",
      location: "Smile Dental Clinic",
      child: "Emma",
      color: "#8B5CF6",
      avatar: "https://images.pexels.com/photos/1169084/pexels-photo-1169084.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      status: "upcoming",
      notes: "Regular checkup"
    },
    {
      id: 5,
      title: "Homework Time",
      time: "7:30 PM - 8:30 PM",
      location: "Home",
      child: "Both",
      color: "#06B6D4",
      avatar: "https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      status: "upcoming",
      notes: "Maths and English homework"
    }
  ];

  const getFilteredEvents = () => {
    if (filter === 'all') return todayEvents;
    if (filter === 'emma') return todayEvents.filter(event => event.child === 'Emma' || event.child === 'Both');
    if (filter === 'jack') return todayEvents.filter(event => event.child === 'Jack' || event.child === 'Both');
    return todayEvents;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'upcoming': return '#F59E0B';
      case 'in-progress': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'upcoming': return 'Upcoming';
      case 'in-progress': return 'In Progress';
      default: return 'Unknown';
    }
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
          <Text style={styles.headerTitle}>Today's Schedule</Text>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Date Header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-GB', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long',
              year: 'numeric'
            })}
          </Text>
          <Text style={styles.eventCount}>{getFilteredEvents().length} events</Text>
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
              filter === 'emma' && styles.filterButtonActive
            ]}
            onPress={() => setFilter('emma')}
          >
            <Text style={[
              styles.filterButtonText,
              filter === 'emma' && styles.filterButtonTextActive
            ]}>Emma</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'jack' && styles.filterButtonActive
            ]}
            onPress={() => setFilter('jack')}
          >
            <Text style={[
              styles.filterButtonText,
              filter === 'jack' && styles.filterButtonTextActive
            ]}>Jack</Text>
          </TouchableOpacity>
        </View>

        {/* Events List */}
        <View style={styles.eventsSection}>
          {getFilteredEvents().map((event) => (
            <TouchableOpacity 
              key={event.id} 
              style={styles.eventCard}
              onPress={() => router.push(`/event-detail/${event.id}`)}
            >
              <View style={[styles.eventColorBar, { backgroundColor: event.color }]} />
              <Image source={{ uri: event.avatar }} style={styles.eventAvatar} />
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(event.status)}</Text>
                  </View>
                </View>
                <View style={styles.eventMeta}>
                  <View style={styles.eventMetaItem}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.eventMetaText}>{event.time}</Text>
                  </View>
                  <View style={styles.eventMetaItem}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={styles.eventMetaText}>{event.location}</Text>
                  </View>
                  <View style={styles.eventMetaItem}>
                    <User size={16} color="#6B7280" />
                    <Text style={styles.eventMetaText}>{event.child}</Text>
                  </View>
                </View>
                {event.notes && (
                  <Text style={styles.eventNotes}>{event.notes}</Text>
                )}
              </View>
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
  dateHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  eventCount: {
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
  eventsSection: {
    padding: 20,
  },
  eventCard: {
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
  },
  eventColorBar: {
    width: 4,
  },
  eventAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: 16,
  },
  eventContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventMeta: {
    gap: 8,
    marginBottom: 8,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventMetaText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  eventNotes: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
  },
  bottomSpacing: {
    height: 32,
  },
});