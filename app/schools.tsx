import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  FlatList,
  Alert,
  Dimensions
} from 'react-native';
import { Search, MapPin, Calendar, Clock, Phone, Globe, ChevronRight, X, Check, School, Users, Star, Navigation, Plus, FolderSync as Sync, Filter } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface School {
  id: number;
  name: string;
  type: 'Primary' | 'Secondary' | 'Independent' | 'Special';
  address: string;
  postcode: string;
  phone: string;
  website: string;
  distance: number;
  rating: number;
  pupils: number;
  ageRange: string;
  headteacher: string;
  termDates: TermDate[];
  isConnected: boolean;
}

interface TermDate {
  id: number;
  term: string;
  startDate: Date;
  endDate: Date;
  type: 'term' | 'holiday';
}

export default function Schools() {
  const [searchPostcode, setSearchPostcode] = useState('');
  const [searchRadius, setSearchRadius] = useState(15);
  const [isSearching, setIsSearching] = useState(false);
  const [showSchoolDetail, setShowSchoolDetail] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [connectedSchools, setConnectedSchools] = useState<number[]>([]);

  // Sample UK schools data
  const [schools, setSchools] = useState<School[]>([
    {
      id: 1,
      name: "Oakwood Primary School",
      type: "Primary",
      address: "123 Oak Street, Manchester",
      postcode: "M1 2AB",
      phone: "0161 234 5678",
      website: "www.oakwoodprimary.co.uk",
      distance: 0.8,
      rating: 4.5,
      pupils: 420,
      ageRange: "4-11 years",
      headteacher: "Mrs. Sarah Thompson",
      isConnected: true,
      termDates: [
        {
          id: 1,
          term: "Autumn Term 2024",
          startDate: new Date(2024, 8, 3), // September 3
          endDate: new Date(2024, 11, 20), // December 20
          type: 'term'
        },
        {
          id: 2,
          term: "Christmas Holiday",
          startDate: new Date(2024, 11, 21), // December 21
          endDate: new Date(2025, 0, 6), // January 6
          type: 'holiday'
        },
        {
          id: 3,
          term: "Spring Term 2025",
          startDate: new Date(2025, 0, 7), // January 7
          endDate: new Date(2025, 2, 28), // March 28
          type: 'term'
        },
        {
          id: 4,
          term: "Easter Holiday",
          startDate: new Date(2025, 2, 29), // March 29
          endDate: new Date(2025, 3, 13), // April 13
          type: 'holiday'
        },
        {
          id: 5,
          term: "Summer Term 2025",
          startDate: new Date(2025, 3, 14), // April 14
          endDate: new Date(2025, 6, 18), // July 18
          type: 'term'
        },
        {
          id: 6,
          term: "Summer Holiday",
          startDate: new Date(2025, 6, 19), // July 19
          endDate: new Date(2025, 8, 1), // September 1
          type: 'holiday'
        }
      ]
    },
    {
      id: 2,
      name: "Manchester Grammar School",
      type: "Independent",
      address: "456 Grammar Road, Manchester",
      postcode: "M2 3CD",
      phone: "0161 345 6789",
      website: "www.manchestergrammar.co.uk",
      distance: 2.3,
      rating: 4.8,
      pupils: 1200,
      ageRange: "7-18 years",
      headteacher: "Dr. James Wilson",
      isConnected: false,
      termDates: [
        {
          id: 7,
          term: "Michaelmas Term 2024",
          startDate: new Date(2024, 8, 10),
          endDate: new Date(2024, 11, 15),
          type: 'term'
        },
        {
          id: 8,
          term: "Christmas Holiday",
          startDate: new Date(2024, 11, 16),
          endDate: new Date(2025, 0, 8),
          type: 'holiday'
        }
      ]
    },
    {
      id: 3,
      name: "Riverside Secondary School",
      type: "Secondary",
      address: "789 River Lane, Manchester",
      postcode: "M3 4EF",
      phone: "0161 456 7890",
      website: "www.riverside-secondary.co.uk",
      distance: 1.5,
      rating: 4.2,
      pupils: 980,
      ageRange: "11-16 years",
      headteacher: "Mr. David Brown",
      isConnected: false,
      termDates: [
        {
          id: 9,
          term: "Autumn Term 2024",
          startDate: new Date(2024, 8, 5),
          endDate: new Date(2024, 11, 19),
          type: 'term'
        }
      ]
    }
  ]);

  const schoolTypes = ['all', 'Primary', 'Secondary', 'Independent', 'Special'];

  const validatePostcode = (postcode: string) => {
    // UK postcode regex pattern
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
    return postcodeRegex.test(postcode.replace(/\s/g, ''));
  };

  const handleSearch = async () => {
    if (!searchPostcode.trim()) {
      Alert.alert('Error', 'Please enter a postcode');
      return;
    }

    if (!validatePostcode(searchPostcode)) {
      Alert.alert('Error', 'Please enter a valid UK postcode (e.g., M1 2AB)');
      return;
    }

    setIsSearching(true);
    
    // Simulate API search
    setTimeout(() => {
      setIsSearching(false);
      Alert.alert('Search Complete', `Found ${schools.length} schools within ${searchRadius} miles of ${searchPostcode.toUpperCase()}`);
    }, 1500);
  };

  const getFilteredSchools = () => {
    if (schoolFilter === 'all') return schools;
    return schools.filter(school => school.type === schoolFilter);
  };

  const handleConnectSchool = (schoolId: number) => {
    setConnectedSchools(prev => {
      if (prev.includes(schoolId)) {
        // Disconnect
        setSchools(prevSchools => 
          prevSchools.map(school => 
            school.id === schoolId 
              ? { ...school, isConnected: false }
              : school
          )
        );
        Alert.alert('Disconnected', 'School calendar disconnected successfully');
        return prev.filter(id => id !== schoolId);
      } else {
        // Connect
        setSchools(prevSchools => 
          prevSchools.map(school => 
            school.id === schoolId 
              ? { ...school, isConnected: true }
              : school
          )
        );
        Alert.alert('Connected', 'School calendar synced successfully! Term dates and holidays will appear in your family calendar.');
        return [...prev, schoolId];
      }
    });
  };

  const formatTermDate = (termDate: TermDate) => {
    const start = termDate.startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const end = termDate.endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return `${start} - ${end}`;
  };

  const getUpcomingTermDates = (school: School) => {
    const now = new Date();
    return school.termDates
      .filter(term => term.endDate >= now)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 2);
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" size={14} color="#F59E0B" fill="none" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={14} color="#E5E7EB" fill="none" />
      );
    }

    return <View style={styles.starRating}>{stars}</View>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Schools</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>Find Schools Near You</Text>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchPostcode}
                onChangeText={setSearchPostcode}
                placeholder="Enter UK postcode (e.g., M1 2AB)"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                maxLength={8}
              />
              <View style={styles.radiusContainer}>
                <Text style={styles.radiusLabel}>Within</Text>
                <TextInput
                  style={styles.radiusInput}
                  value={searchRadius.toString()}
                  onChangeText={(text) => setSearchRadius(parseInt(text) || 15)}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.radiusLabel}>miles</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={isSearching}
            >
              <Search size={20} color="#FFFFFF" />
              <Text style={styles.searchButtonText}>
                {isSearching ? 'Searching...' : 'Search'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Connected Schools */}
        {connectedSchools.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connected Schools</Text>
            {schools.filter(school => school.isConnected).map((school) => (
              <TouchableOpacity 
                key={school.id} 
                style={[styles.schoolCard, styles.connectedSchoolCard]}
                onPress={() => {
                  setSelectedSchool(school);
                  setShowSchoolDetail(true);
                }}
              >
                <View style={styles.schoolHeader}>
                  <View style={styles.schoolInfo}>
                    <Text style={styles.schoolName}>{school.name}</Text>
                    <Text style={styles.schoolType}>{school.type} School</Text>
                  </View>
                  <View style={styles.connectedBadge}>
                    <Sync size={16} color="#059669" />
                    <Text style={styles.connectedText}>Synced</Text>
                  </View>
                </View>
                <View style={styles.schoolMeta}>
                  <View style={styles.schoolMetaItem}>
                    <MapPin size={14} color="#6B7280" />
                    <Text style={styles.schoolMetaText}>{school.distance} miles away</Text>
                  </View>
                  <View style={styles.schoolMetaItem}>
                    <Users size={14} color="#6B7280" />
                    <Text style={styles.schoolMetaText}>{school.pupils} pupils</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Search Results */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Schools Near {searchPostcode.toUpperCase() || 'Your Area'}
            </Text>
            <Text style={styles.resultsCount}>
              {getFilteredSchools().length} schools found
            </Text>
          </View>

          {getFilteredSchools().map((school) => (
            <TouchableOpacity 
              key={school.id} 
              style={styles.schoolCard}
              onPress={() => {
                setSelectedSchool(school);
                setShowSchoolDetail(true);
              }}
            >
              <View style={styles.schoolHeader}>
                <View style={styles.schoolInfo}>
                  <Text style={styles.schoolName}>{school.name}</Text>
                  <Text style={styles.schoolType}>{school.type} School</Text>
                </View>
                <View style={styles.schoolActions}>
                  {renderStarRating(school.rating)}
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </View>
              
              <View style={styles.schoolDetails}>
                <View style={styles.schoolMeta}>
                  <View style={styles.schoolMetaItem}>
                    <MapPin size={14} color="#6B7280" />
                    <Text style={styles.schoolMetaText}>{school.distance} miles away</Text>
                  </View>
                  <View style={styles.schoolMetaItem}>
                    <Users size={14} color="#6B7280" />
                    <Text style={styles.schoolMetaText}>{school.pupils} pupils</Text>
                  </View>
                  <View style={styles.schoolMetaItem}>
                    <School size={14} color="#6B7280" />
                    <Text style={styles.schoolMetaText}>{school.ageRange}</Text>
                  </View>
                </View>
                
                <Text style={styles.schoolAddress}>{school.address}</Text>
                
                {school.isConnected && (
                  <View style={styles.syncStatus}>
                    <Sync size={14} color="#059669" />
                    <Text style={styles.syncStatusText}>Calendar synced</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* School Detail Modal */}
        <Modal
          visible={showSchoolDetail}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.schoolDetailHeader}>
              <TouchableOpacity 
                onPress={() => setShowSchoolDetail(false)}
                style={styles.backButton}
              >
                <X size={24} color="#0e3c67" />
              </TouchableOpacity>
              <View style={styles.schoolDetailInfo}>
                <Text style={styles.schoolDetailTitle}>{selectedSchool?.name}</Text>
                <Text style={styles.schoolDetailSubtitle}>{selectedSchool?.type} School</Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.connectButton,
                  selectedSchool?.isConnected && styles.disconnectButton
                ]}
                onPress={() => selectedSchool && handleConnectSchool(selectedSchool.id)}
              >
                <Text style={[
                  styles.connectButtonText,
                  selectedSchool?.isConnected && styles.disconnectButtonText
                ]}>
                  {selectedSchool?.isConnected ? 'Disconnect' : 'Connect'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.schoolDetailContent}>
              {selectedSchool && (
                <>
                  {/* School Overview */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>School Overview</Text>
                    <View style={styles.overviewGrid}>
                      <View style={styles.overviewItem}>
                        <Text style={styles.overviewLabel}>Distance</Text>
                        <Text style={styles.overviewValue}>{selectedSchool.distance} miles</Text>
                      </View>
                      <View style={styles.overviewItem}>
                        <Text style={styles.overviewLabel}>Pupils</Text>
                        <Text style={styles.overviewValue}>{selectedSchool.pupils}</Text>
                      </View>
                      <View style={styles.overviewItem}>
                        <Text style={styles.overviewLabel}>Age Range</Text>
                        <Text style={styles.overviewValue}>{selectedSchool.ageRange}</Text>
                      </View>
                      <View style={styles.overviewItem}>
                        <Text style={styles.overviewLabel}>Rating</Text>
                        <View style={styles.ratingContainer}>
                          {renderStarRating(selectedSchool.rating)}
                          <Text style={styles.ratingText}>{selectedSchool.rating}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Contact Information */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Contact Information</Text>
                    <View style={styles.contactItem}>
                      <MapPin size={20} color="#6B7280" />
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactLabel}>Address</Text>
                        <Text style={styles.contactValue}>{selectedSchool.address}</Text>
                        <Text style={styles.contactValue}>{selectedSchool.postcode}</Text>
                      </View>
                    </View>
                    <View style={styles.contactItem}>
                      <Phone size={20} color="#6B7280" />
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactLabel}>Phone</Text>
                        <Text style={styles.contactValue}>{selectedSchool.phone}</Text>
                      </View>
                    </View>
                    <View style={styles.contactItem}>
                      <Globe size={20} color="#6B7280" />
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactLabel}>Website</Text>
                        <Text style={styles.contactValue}>{selectedSchool.website}</Text>
                      </View>
                    </View>
                    <View style={styles.contactItem}>
                      <School size={20} color="#6B7280" />
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactLabel}>Headteacher</Text>
                        <Text style={styles.contactValue}>{selectedSchool.headteacher}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Term Dates */}
                  <View style={styles.detailSection}>
                    <View style={styles.termDatesHeader}>
                      <Text style={styles.detailSectionTitle}>Term Dates & Holidays</Text>
                      {selectedSchool.isConnected && (
                        <View style={styles.syncBadge}>
                          <Sync size={14} color="#059669" />
                          <Text style={styles.syncBadgeText}>Auto-sync enabled</Text>
                        </View>
                      )}
                    </View>
                    
                    {selectedSchool.termDates.map((termDate) => (
                      <View key={termDate.id} style={styles.termDateCard}>
                        <View style={styles.termDateHeader}>
                          <Text style={styles.termDateName}>{termDate.term}</Text>
                          <View style={[
                            styles.termTypeBadge,
                            termDate.type === 'holiday' ? styles.holidayBadge : styles.termBadge
                          ]}>
                            <Text style={[
                              styles.termTypeText,
                              termDate.type === 'holiday' ? styles.holidayText : styles.termText
                            ]}>
                              {termDate.type === 'holiday' ? 'Holiday' : 'Term'}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.termDateMeta}>
                          <Calendar size={16} color="#6B7280" />
                          <Text style={styles.termDateText}>{formatTermDate(termDate)}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Calendar Integration */}
                  {selectedSchool.isConnected && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Calendar Integration</Text>
                      <View style={styles.integrationCard}>
                        <View style={styles.integrationIcon}>
                          <Calendar size={24} color="#059669" />
                        </View>
                        <View style={styles.integrationInfo}>
                          <Text style={styles.integrationTitle}>Automatic Sync Active</Text>
                          <Text style={styles.integrationDescription}>
                            School term dates and holidays are automatically added to your family calendar. 
                            You'll receive notifications for upcoming terms and holiday periods.
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          animationType="slide"
          presentationStyle="formSheet"
        >
          <SafeAreaView style={styles.filterModalContainer}>
            <View style={styles.filterModalHeader}>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.filterCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.filterTitle}>Filter Schools</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.filterDone}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterContent}>
              <Text style={styles.filterSectionTitle}>School Type</Text>
              {schoolTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    schoolFilter === type && styles.filterOptionSelected
                  ]}
                  onPress={() => setSchoolFilter(type)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    schoolFilter === type && styles.filterOptionTextSelected
                  ]}>
                    {type === 'all' ? 'All Schools' : `${type} Schools`}
                  </Text>
                  {schoolFilter === type && (
                    <Check size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </SafeAreaView>
        </Modal>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  searchContainer: {
    gap: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  radiusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  radiusLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  radiusInput: {
    width: 30,
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: '#0e3c67',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#0e3c67',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  schoolCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  connectedSchoolCard: {
    borderWidth: 2,
    borderColor: '#D1FAE5',
    backgroundColor: '#F0FDF4',
  },
  schoolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  schoolType: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  schoolActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  connectedText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  schoolDetails: {
    gap: 8,
  },
  schoolMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  schoolMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  schoolMetaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  schoolAddress: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  syncStatusText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  starRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  // School Detail Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  schoolDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  schoolDetailInfo: {
    flex: 1,
  },
  schoolDetailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  schoolDetailSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  connectButton: {
    backgroundColor: '#0e3c67',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disconnectButton: {
    backgroundColor: '#DC2626',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disconnectButtonText: {
    color: '#FFFFFF',
  },
  schoolDetailContent: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  overviewItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  contactInfo: {
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
    lineHeight: 22,
  },
  termDatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  syncBadgeText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  termDateCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0e3c67',
  },
  termDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  termDateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  termTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  termBadge: {
    backgroundColor: '#E6F3FF',
  },
  holidayBadge: {
    backgroundColor: '#FEE2E2',
  },
  termTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  termText: {
    color: '#0e3c67',
  },
  holidayText: {
    color: '#DC2626',
  },
  termDateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  termDateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  integrationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    gap: 12,
  },
  integrationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  integrationInfo: {
    flex: 1,
  },
  integrationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
  },
  integrationDescription: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  // Filter Modal
  filterModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterCancel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  filterDone: {
    fontSize: 16,
    color: '#0e3c67',
    fontWeight: '600',
  },
  filterContent: {
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  filterOptionSelected: {
    backgroundColor: '#0e3c67',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});