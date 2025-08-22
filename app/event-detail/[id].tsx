import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft,
  Clock,
  MapPin,
  User,
  Edit3,
  Trash2,
  Share,
  Calendar,
  Phone,
  Navigation
} from 'lucide-react-native';

export default function EventDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Mock event data - in real app, fetch based on ID
  const eventData = {
    1: {
      id: 1,
      title: "Emma's Piano Lesson",
      time: "4:00 PM - 5:00 PM",
      startTime: "16:00",
      endTime: "17:00",
      location: "Music Academy",
      address: "123 Music Street, Manchester M1 4AB",
      child: "Emma",
      color: "#22C55E",
      avatar: "https://images.pexels.com/photos/1169084/pexels-photo-1169084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      status: "upcoming",
      notes: "Remember to bring music sheets and practice book",
      instructor: "Mrs. Williams",
      phone: "+44 161 123 4567",
      type: "activity",
      recurring: "Weekly on Thursdays"
    },
    2: {
      id: 2,
      title: "School Assembly",
      time: "9:00 AM - 10:00 AM",
      startTime: "09:00",
      endTime: "10:00",
      location: "Oakwood Primary",
      address: "456 School Lane, Manchester M2 5CD",
      child: "Both",
      color: "#3B82F6",
      avatar: "https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      status: "completed",
      notes: "Annual sports day assembly - parents welcome",
      instructor: "Head Teacher",
      phone: "+44 161 987 6543",
      type: "school",
      recurring: "One-time event"
    }
  };

  const event = eventData[id as keyof typeof eventData] || eventData[1];

  const handleEdit = () => {
    Alert.alert('Edit Event', 'Edit functionality would open here');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Event deleted successfully');
            router.back();
          }
        }
      ]
    );
  };

  const handleShare = () => {
    Alert.alert('Share Event', 'Share functionality would open here');
  };

  const handleGetDirections = () => {
    Alert.alert('Directions', 'Navigation app would open here');
  };

  const handleCall = () => {
    Alert.alert('Call', `Would call ${event.phone}`);
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
          <Text style={styles.headerTitle}>Event Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton} onPress={handleShare}>
              <Share size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton} onPress={handleEdit}>
              <Edit3 size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Event Hero */}
        <View style={styles.eventHero}>
          <View style={[styles.eventColorStripe, { backgroundColor: event.color }]} />
          <View style={styles.eventHeroContent}>
            <Image source={{ uri: event.avatar }} style={styles.eventHeroAvatar} />
            <View style={styles.eventHeroInfo}>
              <Text style={styles.eventHeroTitle}>{event.title}</Text>
              <Text style={styles.eventHeroTime}>{event.time}</Text>
              <View style={[styles.eventStatusBadge, { backgroundColor: getStatusColor(event.status) }]}>
                <Text style={styles.eventStatusText}>{getStatusText(event.status)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Event Information</Text>
          
          <View style={styles.detailCard}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Clock size={20} color="#0e3c67" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{event.time}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <MapPin size={20} color="#0e3c67" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{event.location}</Text>
                <Text style={styles.detailSubvalue}>{event.address}</Text>
              </View>
              <TouchableOpacity style={styles.actionButton} onPress={handleGetDirections}>
                <Navigation size={16} color="#0e3c67" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <User size={20} color="#0e3c67" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Attendee</Text>
                <Text style={styles.detailValue}>{event.child}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Calendar size={20} color="#0e3c67" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Recurring</Text>
                <Text style={styles.detailValue}>{event.recurring}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <User size={20} color="#0e3c67" />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Instructor/Contact</Text>
                <Text style={styles.contactValue}>{event.instructor}</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Phone size={20} color="#0e3c67" />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Phone Number</Text>
                <Text style={styles.contactValue}>{event.phone}</Text>
              </View>
              <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                <Phone size={16} color="#0e3c67" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notes */}
        {event.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{event.notes}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editEventButton} onPress={handleEdit}>
            <Edit3 size={20} color="#FFFFFF" />
            <Text style={styles.editEventText}>Edit Event</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteEventButton} onPress={handleDelete}>
            <Trash2 size={20} color="#DC2626" />
            <Text style={styles.deleteEventText}>Delete Event</Text>
          </TouchableOpacity>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventHero: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  eventColorStripe: {
    height: 6,
  },
  eventHeroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  eventHeroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  eventHeroInfo: {
    flex: 1,
  },
  eventHeroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  eventHeroTime: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  eventStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  eventStatusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailsSection: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  detailSubvalue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  notesSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notesText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  editEventButton: {
    flex: 1,
    backgroundColor: '#0e3c67',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#0e3c67',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  editEventText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteEventButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteEventText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});