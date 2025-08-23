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
  Calendar,
  Clock,
  MapPin,
  User,
  Edit3,
  Trash2,
  Share,
  Phone,
  Navigation,
  Users
} from 'lucide-react-native';

export default function ScheduleDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Mock schedule data - in real app, fetch based on ID
  const scheduleData = {
    1: {
      id: 1,
      name: "Weekend with Dad",
      startDate: new Date(2024, 7, 24),
      endDate: new Date(2024, 7, 25),
      parent: "secondary",
      location: "Dad's House",
      address: "456 Oak Avenue, Manchester M3 4EF",
      activities: "Swimming, Film night, Cooking together",
      notes: "Pick up at 6 PM Friday, drop off Sunday 7 PM",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      color: "#F59E0B",
      parentName: "Michael Johnson",
      parentPhone: "+44 7700 900456",
      children: ["Emma", "Jack"],
      status: "upcoming"
    },
    2: {
      id: 2,
      name: "School Week",
      startDate: new Date(2024, 7, 26),
      endDate: new Date(2024, 7, 30),
      parent: "primary",
      location: "Home",
      address: "123 Main Street, Manchester M1 2AB",
      activities: "School, homework, piano lessons",
      notes: "Regular school routine",
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      color: "#0e3c67",
      parentName: "Sarah Johnson",
      parentPhone: "+44 7700 900123",
      children: ["Emma", "Jack"],
      status: "active"
    }
  };

  const schedule = scheduleData[id as keyof typeof scheduleData] || scheduleData[1];

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = startDate.toLocaleDateString('en-GB', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long' 
    });
    const end = endDate.toLocaleDateString('en-GB', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long' 
    });
    return `${start} - ${end}`;
  };

  const getParentLabel = (parentType: string) => {
    return parentType === 'primary' ? 'Primary Parent (You)' : 'Secondary Parent';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'upcoming': return '#F59E0B';
      case 'completed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const handleEdit = () => {
    Alert.alert('Edit Schedule', 'Edit functionality would open here');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Schedule deleted successfully');
            router.back();
          }
        }
      ]
    );
  };

  const handleShare = () => {
    Alert.alert('Share Schedule', 'Share functionality would open here');
  };

  const handleGetDirections = () => {
    Alert.alert('Directions', 'Navigation app would open here');
  };

  const handleCall = () => {
    Alert.alert('Call', `Would call ${schedule.parentPhone}`);
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
          <Text style={styles.headerTitle}>Schedule Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton} onPress={handleShare}>
              <Share size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton} onPress={handleEdit}>
              <Edit3 size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Schedule Hero */}
        <View style={styles.scheduleHero}>
          <View style={[styles.scheduleColorStripe, { backgroundColor: schedule.color }]} />
          <View style={styles.scheduleHeroContent}>
            <Image source={{ uri: schedule.avatar }} style={styles.scheduleHeroAvatar} />
            <View style={styles.scheduleHeroInfo}>
              <Text style={styles.scheduleHeroTitle}>{schedule.name}</Text>
              <Text style={styles.scheduleHeroDate}>
                {formatDateRange(schedule.startDate, schedule.endDate)}
              </Text>
              <View style={[styles.scheduleStatusBadge, { backgroundColor: getStatusColor(schedule.status) }]}>
                <Text style={styles.scheduleStatusText}>{getStatusText(schedule.status)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Schedule Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Schedule Information</Text>
          
          <View style={styles.detailCard}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Calendar size={20} color="#0e3c67" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>
                  {formatDateRange(schedule.startDate, schedule.endDate)}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <MapPin size={20} color="#0e3c67" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{schedule.location}</Text>
                <Text style={styles.detailSubvalue}>{schedule.address}</Text>
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
                <Text style={styles.detailLabel}>Responsible Parent</Text>
                <Text style={styles.detailValue}>{getParentLabel(schedule.parent)}</Text>
                <Text style={styles.detailSubvalue}>{schedule.parentName}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Users size={20} color="#0e3c67" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Children</Text>
                <Text style={styles.detailValue}>{schedule.children.join(', ')}</Text>
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
                <Text style={styles.contactLabel}>Parent Contact</Text>
                <Text style={styles.contactValue}>{schedule.parentName}</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Phone size={20} color="#0e3c67" />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Phone Number</Text>
                <Text style={styles.contactValue}>{schedule.parentPhone}</Text>
              </View>
              <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                <Phone size={16} color="#0e3c67" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Activities */}
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>Planned Activities</Text>
          <View style={styles.activitiesCard}>
            <Text style={styles.activitiesText}>{schedule.activities}</Text>
          </View>
        </View>

        {/* Notes */}
        {schedule.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{schedule.notes}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editScheduleButton} onPress={handleEdit}>
            <Edit3 size={20} color="#FFFFFF" />
            <Text style={styles.editScheduleText}>Edit Schedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteScheduleButton} onPress={handleDelete}>
            <Trash2 size={20} color="#DC2626" />
            <Text style={styles.deleteScheduleText}>Delete</Text>
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
  scheduleHero: {
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
  scheduleColorStripe: {
    height: 6,
  },
  scheduleHeroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  scheduleHeroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  scheduleHeroInfo: {
    flex: 1,
  },
  scheduleHeroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  scheduleHeroDate: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  scheduleStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  scheduleStatusText: {
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
  activitiesSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  activitiesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activitiesText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
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
  editScheduleButton: {
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
  editScheduleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteScheduleButton: {
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
  deleteScheduleText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});