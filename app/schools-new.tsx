import React, { useState, useEffect } from 'react';
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
  RefreshControl
} from 'react-native';
import { Search, MapPin, Calendar, Clock, Phone, Globe, ChevronRight, X, Check, School, Users, Star, Navigation, Plus, FolderSync as Sync, Filter, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useSchools } from '@/hooks/useSchools';
import { School as SchoolType } from '@/types/schools';

const { width } = Dimensions.get('window');

export default function Schools() {
  const { token } = useAuth();
  const [searchPostcode, setSearchPostcode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSchoolDetail, setShowSchoolDetail] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolType | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [connectedSchools, setConnectedSchools] = useState<string[]>([]);
  
  // Use the schools hook
  const {
    schools,
    loading,
    error,
    pagination,
    refetch,
    fetchSchools,
    loadMore,
    hasMore
  } = useSchools(token || '', {
    page: 1,
    limit: 20,
    search: searchQuery,
    postcode: searchPostcode
  });

  const schoolTypes = ['all', 'Primary', 'Secondary', 'Independent', 'Special'];
  const regions = ['all', 'England', 'Scotland', 'Wales'];

  const validatePostcode = (postcode: string) => {
    // UK postcode regex pattern
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
    return postcodeRegex.test(postcode.replace(/\s/g, ''));
  };

  // Search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim() && !searchPostcode.trim()) {
      Alert.alert('Search Required', 'Please enter a school name or postcode to search');
      return;
    }
    
    setIsSearching(true);
    try {
      await fetchSchools({
        page: 1,
        limit: 20,
        search: searchQuery.trim(),
        postcode: searchPostcode.trim()
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

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

  const handleConnectSchool = (schoolId: string) => {
    setConnectedSchools(prev => {
      if (prev.includes(schoolId)) {
        Alert.alert('Success', 'School calendar synced successfully! Term dates and holidays will appear in your family calendar.');
        return prev;
      }
      return [...prev, schoolId];
    });
  };

  const formatAddress = (address: SchoolType['address']) => {
    const parts = [
      address.street,
      address.locality,
      address.address3,
      address.town,
      address.county
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ') + (address.postcode ? ` ${address.postcode}` : '');
  };

  const renderSchoolCard = ({ item: school }: { item: SchoolType }) => {
    const isConnected = connectedSchools.includes(school._id);
    
    return (
      <TouchableOpacity 
        style={styles.schoolCard}
        onPress={() => {
          setSelectedSchool(school);
          setShowSchoolDetail(true);
        }}
      >
        <View style={styles.schoolHeader}>
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{school.name}</Text>
            <Text style={styles.schoolType}>{school.type}</Text>
            <Text style={styles.schoolAddress}>{formatAddress(school.address)}</Text>
          </View>
          <View style={styles.schoolActions}>
            <TouchableOpacity 
              style={[styles.connectButton, isConnected && styles.connectedButton]}
              onPress={() => handleConnectSchool(school._id)}
            >
              {isConnected ? (
                <Check size={16} color="#FFFFFF" />
              ) : (
                <Plus size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            <ChevronRight size={20} color="#6B7280" />
          </View>
        </View>
        
        <View style={styles.schoolDetails}>
          <View style={styles.schoolDetailItem}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.schoolDetailText}>{school.la}</Text>
          </View>
          {school.contact.tel && (
            <View style={styles.schoolDetailItem}>
              <Phone size={14} color="#6B7280" />
              <Text style={styles.schoolDetailText}>{school.contact.tel}</Text>
            </View>
          )}
          {school.contact.web && (
            <View style={styles.schoolDetailItem}>
              <Globe size={14} color="#6B7280" />
              <Text style={styles.schoolDetailText}>{school.contact.web}</Text>
            </View>
          )}
        </View>
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
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowSchoolDetail(false)}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>School Details</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.schoolDetailCard}>
              <Text style={styles.schoolDetailName}>{selectedSchool.name}</Text>
              <Text style={styles.schoolDetailType}>{selectedSchool.type}</Text>
              
              <View style={styles.schoolDetailSection}>
                <Text style={styles.schoolDetailSectionTitle}>Address</Text>
                <Text style={styles.schoolDetailSectionText}>{formatAddress(selectedSchool.address)}</Text>
              </View>
              
              <View style={styles.schoolDetailSection}>
                <Text style={styles.schoolDetailSectionTitle}>Local Authority</Text>
                <Text style={styles.schoolDetailSectionText}>{selectedSchool.la}</Text>
              </View>
              
              {selectedSchool.contact.tel && (
                <View style={styles.schoolDetailSection}>
                  <Text style={styles.schoolDetailSectionTitle}>Phone</Text>
                  <Text style={styles.schoolDetailSectionText}>{selectedSchool.contact.tel}</Text>
                </View>
              )}
              
              {selectedSchool.contact.web && (
                <View style={styles.schoolDetailSection}>
                  <Text style={styles.schoolDetailSectionTitle}>Website</Text>
                  <Text style={styles.schoolDetailSectionText}>{selectedSchool.contact.web}</Text>
                </View>
              )}
              
              {selectedSchool.contact.head.firstName && (
                <View style={styles.schoolDetailSection}>
                  <Text style={styles.schoolDetailSectionTitle}>Head Teacher</Text>
                  <Text style={styles.schoolDetailSectionText}>
                    {selectedSchool.contact.head.title} {selectedSchool.contact.head.firstName} {selectedSchool.contact.head.lastName}
                  </Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={[styles.connectSchoolButton, connectedSchools.includes(selectedSchool._id) && styles.connectedSchoolButton]}
              onPress={() => {
                handleConnectSchool(selectedSchool._id);
                setShowSchoolDetail(false);
              }}
            >
              {connectedSchools.includes(selectedSchool._id) ? (
                <>
                  <Check size={20} color="#FFFFFF" />
                  <Text style={styles.connectSchoolButtonText}>Connected</Text>
                </>
              ) : (
                <>
                  <Plus size={20} color="#FFFFFF" />
                  <Text style={styles.connectSchoolButtonText}>Connect School</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
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
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schools</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by school name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        
        <View style={styles.postcodeContainer}>
          <MapPin size={20} color="#6B7280" />
          <TextInput
            style={styles.postcodeInput}
            placeholder="Postcode (e.g., NP20 6WJ)"
            value={searchPostcode}
            onChangeText={setSearchPostcode}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Search size={16} color="#FFFFFF" />
              <Text style={styles.searchButtonText}>Search</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Results Section */}
      <View style={styles.resultsSection}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            {loading ? 'Searching...' : `${pagination.total} Schools Found`}
          </Text>
          {schools.length > 0 && (
            <TouchableOpacity style={styles.syncButton}>
              <Sync size={16} color="#0e3c67" />
              <Text style={styles.syncButtonText}>Sync All</Text>
            </TouchableOpacity>
          )}
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
              Try searching with a different postcode or school name
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleSearch}>
              <Search size={16} color="#FFFFFF" />
              <Text style={styles.emptyStateButtonText}>Search Again</Text>
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
      </View>

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
  searchButton: {
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
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F3FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  syncButtonText: {
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
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    backgroundColor: '#0e3c67',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
  connectSchoolButton: {
    backgroundColor: '#0e3c67',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 20,
    shadowColor: '#0e3c67',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  connectedSchoolButton: {
    backgroundColor: '#22C55E',
  },
  connectSchoolButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
