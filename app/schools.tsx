import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
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
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Search, MapPin, Calendar, Clock, Phone, Globe, ChevronRight, X, Check, School, Users, Star, Navigation, Plus, FolderSync as Sync, Filter, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useSchools } from '@/hooks/useSchools';
import { useSchoolEvents } from '@/hooks/useSchoolEvents';
import { useAppEvents } from '@/hooks/useAppEvents';
import { School as SchoolType } from '@/types/schools';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/theme/colors';

const { width } = Dimensions.get('window');

export default function Schools() {
  const params = useLocalSearchParams();
  const { token, user } = useAuth();
  const { triggerRefresh } = useAppEvents();
  const [searchPostcode, setSearchPostcode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [miles, setMiles] = useState(15); // Default to 15 miles
  const [isSearching, setIsSearching] = useState(false);
  const [showSchoolDetail, setShowSchoolDetail] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolType | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [connectedSchools, setConnectedSchools] = useState<string[]>([]);
  const [syncingSchools, setSyncingSchools] = useState<string[]>([]);
  const [modalSyncStatus, setModalSyncStatus] = useState<{[schoolId: string]: boolean}>({});
  
  // Use the schools hook
  const {
    schools,
    loading,
    error,
    pagination,
    refetch,
    fetchSchools,
    loadMore,
    hasMore,
    toggleSchoolSync
  } = useSchools(token || '', {
    page: 1,
    limit: 20,
    search: searchQuery,
    postcode: searchPostcode,
    miles: miles
  });

  // Use the school events hook
  const { schoolDetails, events, loading: eventsLoading, error: eventsError, fetchSchoolEvents } = useSchoolEvents();

  // Auto-fetch events when school is selected
  useEffect(() => {
    if (selectedSchool && token && showSchoolDetail) {
      handleViewSchoolEvents(selectedSchool);
    }
  }, [selectedSchool, showSchoolDetail, token]);

  const schoolTypes = ['all', 'Primary', 'Secondary', 'Independent', 'Special'];
  const regions = ['all', 'England', 'Scotland', 'Wales'];

  const validatePostcode = (postcode: string) => {
    // UK postcode regex pattern
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
    return postcodeRegex.test(postcode.replace(/\s/g, ''));
  };

  // Search functionality
  const handleSearch = async () => {
    setIsSearching(true);
    try {
      await fetchSchools({
        page: 1,
        limit: 20,
        search: searchQuery.trim() || undefined,
        postcode: searchPostcode.trim() || undefined,
        miles: miles
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Reset search functionality
  const resetSearch = () => {
    setSearchQuery('');
    setSearchPostcode('');
    setMiles(15); // Reset to default
  };

  // Show all schools functionality
  const handleShowAll = async () => {
    setIsSearching(true);
    try {
      await fetchSchools({
        page: 1,
        limit: 20,
        search: undefined,
        postcode: undefined
      });
    } catch (error) {
      console.error('Show all error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search and show all schools
  const clearAndShowAll = async () => {
    setSearchQuery('');
    setSearchPostcode('');
    setMiles(15); // Reset to default
    setIsSearching(true);
    try {
      await fetchSchools({
        page: 1,
        limit: 20,
        search: "",
        postcode: "",
        miles: 15
      });
    } catch (error) {
      console.error('Clear and show all error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // On mount, if postcode param exists, set it
  useEffect(() => {
    if (token && params && typeof params.postcode === 'string' && params.postcode.trim() !== '') {
      setSearchPostcode(params.postcode);
    } else if (token) {
      handleShowAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, params?.postcode]);

  // When searchPostcode is set from param, trigger search
  useEffect(() => {
    if (token && params && typeof params.postcode === 'string' && params.postcode.trim() !== '' && searchPostcode === params.postcode) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchPostcode, token, params?.postcode]);


  // Filter schools based on current filters
  const getFilteredSchools = () => {
    let filtered = schools;
    
    if (schoolFilter !== 'all') {
      filtered = filtered.filter(school => {
        const schoolType = school.type.toLowerCase();
        switch (schoolFilter) {
          case 'primary':
            return schoolType.includes('primary');
          case 'secondary':
            return schoolType.includes('secondary') || schoolType.includes('high');
          case 'independent':
            return schoolType.includes('independent') || schoolType.includes('private');
          case 'special':
            return schoolType.includes('special');
          default:
            return true;
        }
      });
    }
    
    if (regionFilter !== 'all') {
      filtered = filtered.filter(school => {
        const la = school.la.toLowerCase();
        switch (regionFilter) {
          case 'england':
            return !la.includes('wales') && !la.includes('scotland');
          case 'wales':
            return la.includes('wales') || la.includes('cardiff') || la.includes('swansea') || la.includes('newport');
          case 'scotland':
            return la.includes('scotland') || la.includes('edinburgh') || la.includes('glasgow');
          default:
            return true;
        }
      });
    }
    
    return filtered;
  };

  const handleConnectSchool = async (schoolId: string) => {
    if (!user?._id) {
      Alert.alert('Error', 'Please log in to sync school events');
      return;
    }

    // Check the current sync state BEFORE making the API call
    const currentSchool = schools.find(school => school._id === schoolId) || selectedSchool;
    const wasSyncedBefore = currentSchool?.syncedToCalendar?.includes(user._id) || false;

    try {
      const success = await toggleSchoolSync(schoolId, user._id);
      if (success) {
        // The toggleSchoolSync function already updates the schools state
        // We just need to update the selectedSchool to match the updated school from the list
        const updatedSchool = schools.find(school => school._id === schoolId);
        if (updatedSchool && selectedSchool && selectedSchool._id === schoolId) {
          setSelectedSchool(updatedSchool);
        }
        
        // Update connected schools state for UI consistency
        setConnectedSchools(prev => 
          prev.includes(schoolId) 
            ? prev.filter(id => id !== schoolId)
            : [...prev, schoolId]
        );
        
        // Update modal sync status state
        setModalSyncStatus(prev => ({
          ...prev,
          [schoolId]: !wasSyncedBefore
        }));

        // Trigger refresh for all calendar-related components
        triggerRefresh('events');
        
        // Show appropriate success message based on the action performed
        // If the school was synced before the action, it means we just unsynced it
        if (wasSyncedBefore) {
          Alert.alert('Success', 'School calendar unsynced successfully! School events have been removed from your calendar.');
        } else {
          Alert.alert('Success', 'School calendar synced successfully! All school events will appear in your calendar.');
        }
      } else {
        Alert.alert('Error', 'Failed to sync school calendar. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling school sync:', error);
      Alert.alert('Error', 'Failed to sync/unsync school events. Please try again.');
    }
  };

  const handleViewSchoolEvents = async (school: SchoolType) => {
    if (!token) {
      Alert.alert('Error', 'Authentication token not available');
      return;
    }
    
    await fetchSchoolEvents(school._id, token);
  };

  const formatAddress = (address: SchoolType['address']) => {
    const parts = [
      address.street,
      address.locality,
      address.address3,
      address.town,
      address.county
    ].filter(part => part && part.trim() !== '');
    
    const addressString = parts.join(', ');
    const postcodeString = address.postcode && address.postcode.trim() ? ` ${address.postcode}` : '';
    
    return addressString + postcodeString || 'Address not available';
  };

  const renderSchoolCard = ({ item: school }: { item: SchoolType }) => {
    const isConnected = school.syncedToCalendar.includes(user?._id || '');
    
    return (
      <TouchableOpacity 
        style={styles.schoolCard}
        onPress={() => {
          setSelectedSchool(school);
          // Initialize modal sync status for this school
          setModalSyncStatus(prev => ({
            ...prev,
            [school._id]: school.syncedToCalendar?.includes(user?._id || '') || false
          }));
          setShowSchoolDetail(true);
        }}
      >
        <View style={styles.schoolHeader}>
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{school.name}</Text>
            <Text style={styles.schoolType}>{school.type || 'School'}</Text>
            <Text style={styles.schoolAddress}>{formatAddress(school.address)}</Text>
          </View>
          <View style={styles.schoolActions}>
            <TouchableOpacity 
              style={[styles.connectButton, isConnected && styles.connectedButton]}
              onPress={() => handleConnectSchool(school._id)}
            >
              {isConnected ? (
                <Sync size={16} color="#FFFFFF" />
              ) : (
                <Sync size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            <ChevronRight size={20} color="#6B7280" />
          </View>
        </View>
        
        <View style={styles.schoolDetails}>
          {school.la && school.la.trim() && (
            <View style={styles.schoolDetailItem}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.schoolDetailText}>{school.la}</Text>
            </View>
          )}
          {school.contact.tel && school.contact.tel.trim() && (
            <View style={styles.schoolDetailItem}>
              <Phone size={14} color="#6B7280" />
              <Text style={styles.schoolDetailText}>{school.contact.tel}</Text>
            </View>
          )}
          {school.contact.web && school.contact.web.trim() && (
            <View style={styles.schoolDetailItem}>
              <Globe size={14} color="#6B7280" />
              <Text style={styles.schoolDetailText}>{school.contact.web}</Text>
            </View>
          )}
        </View>

        {/* Events and Holidays Summary */}
        {(school.events.length > 0 || school.holidays.length > 0) && (
          <View style={styles.schoolEventsSummary}>
            {school.events.length > 0 && (
              <View style={styles.eventSummaryItem}>
                <Calendar size={12} color="#0e3c67" />
                <Text style={styles.eventSummaryText}>
                  {school.events.length} term{school.events.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
            {school.holidays.length > 0 && (
              <View style={styles.eventSummaryItem}>
                <Star size={12} color="#F59E0B" />
                <Text style={styles.eventSummaryText}>
                  {school.holidays.length} holiday{school.holidays.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSchoolDetail = () => {
    if (!selectedSchool) return null;
    
    return (
      <Modal
        visible={showSchoolDetail}
        animationType="slide"
        presentationStyle="pageSheet"
      >
          <LinearGradient
            colors={COLORS.gradientBackground as any}
            style={styles.container}
            locations={[0, 0, 1]}
          >
            <SafeAreaView style={styles.modalContainer}>
                      <LinearGradient
                        colors={COLORS.gradientHero as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.modalHeader}
                      >
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowSchoolDetail(false)}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>School Details</Text>
            <View style={styles.modalSpacer} />
          </LinearGradient>
          
          <ScrollView 
            style={styles.modalContent}
            contentContainerStyle={{
              paddingBottom: Platform.OS === 'android' ? 60 : 20
            }}
          >
            <View style={styles.schoolDetailCard}>
              <Text style={styles.schoolDetailName}>{selectedSchool.name}</Text>
              <Text style={styles.schoolDetailType}>{selectedSchool.type}</Text>
              
              <View style={styles.schoolDetailSection}>
                <Text style={styles.schoolDetailSectionTitle}>Address</Text>
                <Text style={styles.schoolDetailSectionText}>{formatAddress(selectedSchool.address)}</Text>
              </View>
              
              {selectedSchool.la && selectedSchool.la.trim() && (
                <View style={styles.schoolDetailSection}>
                  <Text style={styles.schoolDetailSectionTitle}>Local Authority</Text>
                  <Text style={styles.schoolDetailSectionText}>{selectedSchool.la}</Text>
                </View>
              )}
              
              {selectedSchool.contact.tel && selectedSchool.contact.tel.trim() && (
                <View style={styles.schoolDetailSection}>
                  <Text style={styles.schoolDetailSectionTitle}>Phone</Text>
                  <Text style={styles.schoolDetailSectionText}>{selectedSchool.contact.tel}</Text>
                </View>
              )}
              
              {selectedSchool.contact.web && selectedSchool.contact.web.trim() && (
                <View style={styles.schoolDetailSection}>
                  <Text style={styles.schoolDetailSectionTitle}>Website</Text>
                  <Text style={styles.schoolDetailSectionText}>{selectedSchool.contact.web}</Text>
                </View>
              )}
              
              {selectedSchool.contact.head.firstName && selectedSchool.contact.head.firstName.trim() && (
                <View style={styles.schoolDetailSection}>
                  <Text style={styles.schoolDetailSectionTitle}>Head Teacher</Text>
                  <Text style={styles.schoolDetailSectionText}>
                    {selectedSchool.contact.head.title && selectedSchool.contact.head.title.trim() ? `${selectedSchool.contact.head.title} ` : ''}
                    {selectedSchool.contact.head.firstName} {selectedSchool.contact.head.lastName}
                  </Text>
                </View>
              )}
              
              {/* Sync Button */}
              
              <View style={styles.syncSection}>
                
                <TouchableOpacity 
                  style={[
                    styles.syncButton, 
                    (modalSyncStatus[selectedSchool._id] !== undefined 
                      ? modalSyncStatus[selectedSchool._id] 
                      : selectedSchool.syncedToCalendar?.includes(user?._id || '')) && styles.syncedButton
                  ]}
                  onPress={() => handleConnectSchool(selectedSchool._id)}
                >
                  <Sync size={20} color="#FFFFFF" />
                  <Text style={styles.syncButtonText}>
                    {(modalSyncStatus[selectedSchool._id] !== undefined 
                      ? modalSyncStatus[selectedSchool._id] 
                      : selectedSchool.syncedToCalendar?.includes(user?._id || '')) ? 'Unsync Calendar' : 'Sync Calendar'}
                  </Text>
                </TouchableOpacity>
                
                {/* Sync Banner */}
                {(modalSyncStatus[selectedSchool._id] !== undefined 
                  ? modalSyncStatus[selectedSchool._id] 
                  : selectedSchool.syncedToCalendar?.includes(user?._id || '')) ? (
                  <View style={styles.syncBanner}>
                    <Calendar size={16} color="#0e3c67" />
                    <Text style={styles.syncBannerText}>
                      All school events are now synced to your calendar
                    </Text>
                  </View>
                ) : (
                  <View style={styles.syncInfoBanner}>
                    <Calendar size={16} color="#6B7280" />
                    <Text style={styles.syncInfoBannerText}>
                      Sync to add all school events to your calendar
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* School Terms Section */}
            {selectedSchool.events && selectedSchool.events.length > 0 && (
              <View style={styles.eventsSection}>
                <Text style={styles.eventsSectionTitle}>School Terms</Text>
                <View style={styles.eventsContainer}>
                  {selectedSchool.events.map((term) => (
                    <View key={term._id} style={styles.termCard}>
                      <View style={styles.termHeader}>
                        <Text style={styles.termTitle}>{term.name}</Text>
                      </View>
                      
                      <View style={styles.termDetails}>
                        <View style={styles.termDetailRow}>
                          <Calendar size={16} color="#6B7280" />
                          <Text style={styles.termDetailText}>
                            {new Date(term.startDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })} - {new Date(term.endDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* School Holidays Section */}
            {selectedSchool.holidays && selectedSchool.holidays.length > 0 && (
              <View style={styles.eventsSection}>
                <Text style={styles.eventsSectionTitle}>School Holidays</Text>
                <View style={styles.eventsContainer}>
                  {selectedSchool.holidays.map((holiday) => (
                    <View key={holiday._id} style={styles.holidayCard}>
                      <View style={styles.holidayHeader}>
                        <Text style={styles.holidayTitle}>{holiday.name}</Text>
                      </View>
                      
                      <View style={styles.holidayDetails}>
                        <View style={styles.holidayDetailRow}>
                          <Star size={16} color="#F59E0B" />
                          <Text style={styles.holidayDetailText}>
                            {new Date(holiday.startDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })} - {new Date(holiday.endDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Legacy Events Section (for API events) */}
            {eventsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#0e3c67" />
                <Text style={styles.loadingText}>Loading events...</Text>
              </View>
            ) : eventsError ? (
              <View style={styles.eventsErrorContainer}>
                <Text style={styles.eventsErrorTitle}>Error loading events</Text>
                <Text style={styles.eventsErrorText}>{eventsError}</Text>
              </View>
            ) : events.length > 0 ? (
              <View style={styles.eventsSection}>
                <Text style={styles.eventsSectionTitle}>Additional Events</Text>
                <View style={styles.eventsContainer}>
                  <Text style={styles.eventsCount}>({events.length} events)</Text>
                  {events.map((event) => (
                    <View key={event._id} style={styles.eventCard}>
                      <View style={styles.eventHeader}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <View style={[styles.eventTypeBadge, { backgroundColor: event.color }]}>
                          <Text style={styles.eventTypeText}>{event.eventType}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.eventDetails}>
                        <View style={styles.eventDetailRow}>
                          <Calendar size={16} color="#6B7280" />
                          <Text style={styles.eventDetailText}>
                            {new Date(event.eventDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </Text>
                        </View>
                        
                        <View style={styles.eventDetailRow}>
                          <Clock size={16} color="#6B7280" />
                          <Text style={styles.eventDetailText}>
                            {event.startTime} - {event.endTime}
                          </Text>
                        </View>
                        
                        {event.location && (
                          <View style={styles.eventDetailRow}>
                            <MapPin size={16} color="#6B7280" />
                            <Text style={styles.eventDetailText}>{event.location}</Text>
                          </View>
                        )}
                        
                        {event.description && (
                          <Text style={styles.eventDescription}>{event.description}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : (!selectedSchool.events || selectedSchool.events.length === 0) && (!selectedSchool.holidays || selectedSchool.holidays.length === 0) ? (
              <View style={styles.eventsSection}>
                <View style={styles.noEventsContainer}>
                  <Calendar size={32} color="#9CA3AF" />
                  <Text style={styles.noEventsTitle}>No Events Found</Text>
                  <Text style={styles.noEventsText}>
                    This school doesn't have any events yet.
                  </Text>
                </View>
              </View>
            ) : null}
          </ScrollView>
            </SafeAreaView>
        </LinearGradient>
      </Modal>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.filterModalOverlay}>
        <View style={styles.filterModalContent}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filter Schools</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>School Type</Text>
            {schoolTypes.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.filterOption, schoolFilter === type.toLowerCase() && styles.filterOptionActive]}
                onPress={() => setSchoolFilter(type.toLowerCase())}
              >
                <Text style={[styles.filterOptionText, schoolFilter === type.toLowerCase() && styles.filterOptionTextActive]}>
                  {type}
                </Text>
                {schoolFilter === type.toLowerCase() && <Check size={16} color="#0e3c67" />}
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Region</Text>
            {regions.map(region => (
              <TouchableOpacity
                key={region}
                style={[styles.filterOption, regionFilter === region.toLowerCase() && styles.filterOptionActive]}
                onPress={() => setRegionFilter(region.toLowerCase())}
              >
                <Text style={[styles.filterOptionText, regionFilter === region.toLowerCase() && styles.filterOptionTextActive]}>
                  {region}
                </Text>
                {regionFilter === region.toLowerCase() && <Check size={16} color="#0e3c67" />}
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.applyFilterButton}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.applyFilterButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const filteredSchools = getFilteredSchools();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
                <LinearGradient
                  colors={COLORS.gradientHero as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.header}
                >
      
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schools</Text>
        <View style={styles.filterButtonPlaceholder} />
      </LinearGradient>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by school name..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              // Auto-search when field is cleared
              if (text.trim() === '') {
                clearAndShowAll();
              }
            }}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearAndShowAll}
            >
              <X size={16} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.postcodeContainer}>
          <MapPin size={20} color="#6B7280" />
          <TextInput
            style={styles.postcodeInput}
            placeholder="Postcode (e.g., NP20 6WJ)"
            value={searchPostcode}
            onChangeText={(text) => {
              setSearchPostcode(text);
              // Auto-search when field is cleared
              if (text.trim() === '') {
                clearAndShowAll();
              }
            }}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
          />
          {searchPostcode.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearAndShowAll}
            >
              <X size={16} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Miles Slider */}
        {searchPostcode.trim() && (
          <View style={styles.milesContainer}>
            <View style={styles.milesHeader}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.milesLabel}>Search radius: {Math.round(miles)} miles</Text>
            </View>
            <Slider
              style={styles.milesSlider}
              minimumValue={1}
              maximumValue={50}
              value={miles}
              onValueChange={setMiles}
              step={1}
              minimumTrackTintColor="#0e3c67"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#0e3c67"
            />
            <View style={styles.milesRange}>
              <Text style={styles.milesRangeText}>1 mile</Text>
              <Text style={styles.milesRangeText}>50 miles</Text>
            </View>
          </View>
        )}
        
        
        <View style={styles.searchActions}>
          
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={isSearching}
          >
                                <LinearGradient
                      colors={COLORS.gradientHero as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.searchButton2}
                    >

            {isSearching ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Search size={16} color="#FFFFFF" />
            )}
            <Text style={styles.searchButtonText}>
              {isSearching 
                ? 'Searching...' 
                : (searchQuery.trim() || searchPostcode.trim() 
                    ? `Search within ${Math.round(miles)} miles` 
                    : 'Show Schools')
              }
            </Text>
                      </LinearGradient>

          </TouchableOpacity>
          {(searchQuery.trim() || searchPostcode.trim()) && (
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={clearAndShowAll}
            >
              <X size={16} color="#6B7280" />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results Section */}
                <LinearGradient
                  colors={COLORS.gradientBackground as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.resultsSection}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            {loading ? 'Searching...' : `${pagination.total} Schools Found`}
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && schools.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0e3c67" />
            <Text style={styles.loadingText}>Searching schools...</Text>
          </View>
        ) : filteredSchools.length > 0 ? (
          <FlatList
            data={filteredSchools}
            renderItem={renderSchoolCard}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: Platform.OS === 'android' ? 60 : 20
            }}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refetch}
                colors={['#0e3c67']}
              />
            }
            onEndReached={hasMore ? loadMore : undefined}
            onEndReachedThreshold={0.1}
            ListFooterComponent={
              hasMore ? (
                <View style={styles.loadMoreContainer}>
                  <ActivityIndicator size="small" color="#0e3c67" />
                  <Text style={styles.loadMoreText}>Loading more schools...</Text>
                </View>
              ) : null
            }
          />
        ) : schools.length === 0 ? (
          <View style={styles.emptyState}>
            <School size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No Schools Found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery.trim() || searchPostcode.trim() 
                ? 'Try searching with a different postcode or school name'
                : 'Click "Show Schools" to load all available schools'
              }
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleSearch}>
              <Search size={16} color="#FFFFFF" />
              <Text style={styles.emptyStateButtonText}>
                {searchQuery.trim() || searchPostcode.trim() ? 'Search Again' : 'Show Schools'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Filter size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No Schools Match Filters</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try adjusting your filters or search criteria
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton} 
              onPress={() => {
                setSchoolFilter('all');
                setRegionFilter('all');
              }}
            >
              <X size={16} color="#FFFFFF" />
              <Text style={styles.emptyStateButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      {renderSchoolDetail()}
      {renderFilterModal()}
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  postcodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  postcodeInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  milesContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  milesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  milesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  milesSlider: {
    width: '100%',
    height: 40,
  },
  milesRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  milesRangeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  searchActions: {
    flexDirection: 'row',
    gap: 12,
  },
  searchButton: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: 16,
    // paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    shadowColor: '#0e3c67',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
    searchButton2: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#0e3c67',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButton: {
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resetButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  resultsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  resultsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F3FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  showAllButtonText: {
    color: '#0e3c67',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  schoolCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  schoolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  schoolInfo: {
    flex: 1,
    marginRight: 12,
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
    marginBottom: 4,
  },
  schoolAddress: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  schoolActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0e3c67',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  connectedButton: {
    backgroundColor: '#22C55E',
  },
  schoolEventsSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  eventSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventSummaryText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 4,
    fontWeight: '500',
  },
  schoolDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  schoolDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  schoolDetailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0e3c67',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    backgroundColor: 'transparent',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSpacer: {
    width: 40,
    height: 40,
  },
  syncSection: {
    marginTop: 20,
    gap: 12,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  syncedButton: {
    backgroundColor: '#22C55E',
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0e3c67',
    gap: 8,
  },
  syncBannerText: {
    color: '#0e3c67',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  syncInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6B7280',
    gap: 8,
    borderWidth: 0.5,
    borderColor: '#6B7280',

  },
  syncInfoBannerText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  modalHeaderSpacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  schoolDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  schoolDetailName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  schoolDetailType: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  schoolDetailSection: {
    marginBottom: 16,
  },
  schoolDetailSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  schoolDetailSectionText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  // School events section styles
  eventsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  eventsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  eventsCount: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  // School events modal styles
  eventsContainer: {
    paddingVertical: 16,
  },
  eventsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  eventDetails: {
    gap: 8,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  eventDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 20,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  noEventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  noEventsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  eventsErrorContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  eventsErrorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  eventsErrorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Term and Holiday card styles
  termCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0e3c67',
    borderWidth: 0.5,
    borderColor: '#0e3c67',

  },
  termHeader: {
    marginBottom: 8,
  },
  termTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0e3c67',
  },
  termDetails: {
    gap: 8,
  },
  termDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  termDetailText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  holidayCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderWidth: 0.5,
    borderColor: '#F59E0B',

  },
  holidayHeader: {
    marginBottom: 8,
  },
  holidayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  holidayDetails: {
    gap: 8,
  },
  holidayDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  holidayDetailText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  // Filter modal styles
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: '#E6F3FF',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#6B7280',
  },
  filterOptionTextActive: {
    color: '#0e3c67',
    fontWeight: '600',
  },
  applyFilterButton: {
    backgroundColor: '#0e3c67',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  applyFilterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
