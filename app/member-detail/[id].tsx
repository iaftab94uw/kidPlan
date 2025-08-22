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
  Mail,
  School,
  Camera,
  Heart
} from 'lucide-react-native';

export default function MemberDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Mock member data - in real app, fetch based on ID
  const memberData = {
    1: {
      id: 1,
      name: "Emma Johnson",
      role: "Daughter",
      age: "8 years old",
      school: "Oakwood Primary School",
      avatar: "https://images.pexels.com/photos/1169084/pexels-photo-1169084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      color: "#22C55E",
      type: "child",
      favoriteActivities: ["Piano", "Ballet", "Reading", "Swimming"],
      allergies: "None",
      emergencyContact: "Sarah Johnson - +44 7700 900123",
      upcomingEvents: [
        {
          id: 1,
          title: "Piano Lesson",
          time: "4:00 PM",
          location: "Music Academy",
          date: "Today"
        },
        {
          id: 2,
          title: "Ballet Class",
          time: "10:00 AM",
          location: "Dance Studio",
          date: "Tomorrow"
        }
      ],
      recentPhotos: [
        "https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
        "https://images.pexels.com/photos/8613364/pexels-photo-8613364.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
        "https://images.pexels.com/photos/1346155/pexels-photo-1346155.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2"
      ]
    },
    2: {
      id: 2,
      name: "Jack Johnson",
      role: "Son",
      age: "6 years old",
      school: "Oakwood Primary School",
      avatar: "https://images.pexels.com/photos/1765110/pexels-photo-1765110.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      color: "#F97316",
      type: "child",
      favoriteActivities: ["Football", "Drawing", "Lego", "Cycling"],
      allergies: "Nuts",
      emergencyContact: "Sarah Johnson - +44 7700 900123",
      upcomingEvents: [
        {
          id: 3,
          title: "Football Practice",
          time: "6:00 PM",
          location: "Community Center",
          date: "Today"
        }
      ],
      recentPhotos: [
        "https://images.pexels.com/photos/1346155/pexels-photo-1346155.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
        "https://images.pexels.com/photos/1146603/pexels-photo-1146603.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2"
      ]
    }
  };

  const member = memberData[id as keyof typeof memberData] || memberData[1];

  const handleEdit = () => {
    Alert.alert('Edit Member', 'Edit functionality would open here');
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove Family Member',
      `Are you sure you want to remove ${member.name} from the family?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Family member removed successfully');
            router.back();
          }
        }
      ]
    );
  };

  const handleShare = () => {
    Alert.alert('Share Profile', 'Share functionality would open here');
  };

  const handleCall = () => {
    const phone = member.emergencyContact.split(' - ')[1];
    Alert.alert('Call', `Would call ${phone}`);
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
          <Text style={styles.headerTitle}>Family Member</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton} onPress={handleShare}>
              <Share size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton} onPress={handleEdit}>
              <Edit3 size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Member Hero */}
        <View style={styles.memberHero}>
          <View style={[styles.memberColorStripe, { backgroundColor: member.color }]} />
          <View style={styles.memberHeroContent}>
            <Image source={{ uri: member.avatar }} style={styles.memberHeroAvatar} />
            <View style={styles.memberHeroInfo}>
              <Text style={styles.memberHeroName}>{member.name}</Text>
              <Text style={styles.memberHeroRole}>{member.role}</Text>
              <Text style={styles.memberHeroAge}>{member.age}</Text>
            </View>
          </View>
        </View>

        {/* Member Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.detailCard}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <School size={20} color="#0e3c67" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>School</Text>
                <Text style={styles.detailValue}>{member.school}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Heart size={20} color="#0e3c67" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Favorite Activities</Text>
                <Text style={styles.detailValue}>{member.favoriteActivities.join(', ')}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <User size={20} color="#0e3c67" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Allergies</Text>
                <Text style={styles.detailValue}>{member.allergies}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Phone size={20} color="#0e3c67" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Emergency Contact</Text>
                <Text style={styles.detailValue}>{member.emergencyContact}</Text>
              </View>
              <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                <Phone size={16} color="#0e3c67" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          
          {member.upcomingEvents.map((event) => (
            <TouchableOpacity 
              key={event.id} 
              style={styles.eventCard}
              onPress={() => router.push(`/event-detail/${event.id}`)}
            >
              <View style={[styles.eventColorBar, { backgroundColor: member.color }]} />
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
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
                    <Calendar size={16} color="#6B7280" />
                    <Text style={styles.eventMetaText}>{event.date}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Photos */}
        <View style={styles.photosSection}>
          <View style={styles.photosSectionHeader}>
            <Text style={styles.sectionTitle}>Recent Photos</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/(tabs)/photos')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
            {member.recentPhotos.map((photo, index) => (
              <TouchableOpacity key={index} style={styles.photoItem}>
                <Image source={{ uri: photo }} style={styles.photoImage} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.addPhotoItem}
              onPress={() => router.push('/(tabs)/photos')}
            >
              <Camera size={24} color="#6B7280" />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editMemberButton} onPress={handleEdit}>
            <Edit3 size={20} color="#FFFFFF" />
            <Text style={styles.editMemberText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteMemberButton} onPress={handleDelete}>
            <Trash2 size={20} color="#DC2626" />
            <Text style={styles.deleteMemberText}>Remove</Text>
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
  memberHero: {
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
  memberColorStripe: {
    height: 6,
  },
  memberHeroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  memberHeroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  memberHeroInfo: {
    flex: 1,
  },
  memberHeroName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  memberHeroRole: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  memberHeroAge: {
    fontSize: 14,
    color: '#6B7280',
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
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
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
  eventContent: {
    flex: 1,
    padding: 16,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  eventMeta: {
    gap: 4,
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
  photosSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  photosSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0e3c67',
    fontWeight: '500',
  },
  photosScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  photoItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  addPhotoItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginRight: 12,
  },
  addPhotoText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  editMemberButton: {
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
  editMemberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteMemberButton: {
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
  deleteMemberText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});