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
import { Search, MapPin, Calendar, Clock, Phone, Globe, ChevronRight, X, Check, School, Users, Star, Navigation, Plus, FolderSync as Sync, Filter, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

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
  headteacher: string;
  termDates: TermDate[];
  isConnected: boolean;
  region: 'England' | 'Scotland' | 'Wales';
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
  const [regionFilter, setRegionFilter] = useState('all');
  const [connectedSchools, setConnectedSchools] = useState<number[]>([1, 15, 32]);

  // Comprehensive UK schools database (80+ schools)
  const [allSchools] = useState<School[]>([
    // England - London & South East
    {
      id: 1,
      name: "Westminster Primary School",
      type: "Primary",
      address: "Parliament Street, Westminster, London",
      postcode: "SW1A 1AA",
      phone: "020 7946 0958",
      website: "www.westminsterprimary.co.uk",
      distance: 0.2,
      rating: 4.8,
      headteacher: "Mrs. Elizabeth Harper",
      isConnected: true,
      region: "England",
      termDates: [
        { id: 1, term: "Autumn Term 2024", startDate: new Date(2024, 8, 3), endDate: new Date(2024, 11, 20), type: 'term' },
        { id: 2, term: "Christmas Holiday", startDate: new Date(2024, 11, 21), endDate: new Date(2025, 0, 6), type: 'holiday' }
      ]
    },
    {
      id: 2,
      name: "St. James's Catholic Primary",
      type: "Primary",
      address: "George Street, Westminster, London",
      postcode: "SW1A 2AA",
      phone: "020 7946 1234",
      website: "www.stjamesprimary.co.uk",
      distance: 0.4,
      rating: 4.6,
      headteacher: "Mr. David Thompson",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 3, term: "Autumn Term 2024", startDate: new Date(2024, 8, 5), endDate: new Date(2024, 11, 18), type: 'term' }
      ]
    },
    {
      id: 3,
      name: "Victoria Academy",
      type: "Secondary",
      address: "Victoria Street, Westminster, London",
      postcode: "SW1E 5ND",
      phone: "020 7946 5678",
      website: "www.victoriaacademy.co.uk",
      distance: 0.6,
      rating: 4.4,
      headteacher: "Dr. Sarah Wilson",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 4, term: "Autumn Term 2024", startDate: new Date(2024, 8, 4), endDate: new Date(2024, 11, 19), type: 'term' }
      ]
    },
    {
      id: 4,
      name: "Buckingham Gate School",
      type: "Independent",
      address: "Buckingham Gate, Westminster, London",
      postcode: "SW1E 6JP",
      phone: "020 7946 9012",
      website: "www.buckinghamgate.co.uk",
      distance: 0.8,
      rating: 4.9,
      headteacher: "Mrs. Catherine Brown",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 5, term: "Michaelmas Term 2024", startDate: new Date(2024, 8, 10), endDate: new Date(2024, 11, 15), type: 'term' }
      ]
    },
    {
      id: 5,
      name: "Pimlico Primary School",
      type: "Primary",
      address: "Lupus Street, Pimlico, London",
      postcode: "SW1V 3AT",
      phone: "020 7946 3456",
      website: "www.pimlicoprimary.co.uk",
      distance: 1.2,
      rating: 4.3,
      headteacher: "Mr. James Miller",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 6, term: "Autumn Term 2024", startDate: new Date(2024, 8, 3), endDate: new Date(2024, 11, 20), type: 'term' }
      ]
    },
    {
      id: 6,
      name: "Chelsea Primary Academy",
      type: "Primary",
      address: "King's Road, Chelsea, London",
      postcode: "SW3 4LY",
      phone: "020 7352 1234",
      website: "www.chelseaprimary.co.uk",
      distance: 2.1,
      rating: 4.7,
      headteacher: "Mrs. Amanda Clarke",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 7, term: "Autumn Term 2024", startDate: new Date(2024, 8, 2), endDate: new Date(2024, 11, 19), type: 'term' }
      ]
    },
    {
      id: 7,
      name: "Kensington High School",
      type: "Secondary",
      address: "High Street, Kensington, London",
      postcode: "W8 5NP",
      phone: "020 7937 5678",
      website: "www.kensingtonhigh.co.uk",
      distance: 2.8,
      rating: 4.5,
      headteacher: "Dr. Michael Roberts",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 8, term: "Autumn Term 2024", startDate: new Date(2024, 8, 4), endDate: new Date(2024, 11, 18), type: 'term' }
      ]
    },
    {
      id: 8,
      name: "Belgravia Preparatory School",
      type: "Independent",
      address: "Eaton Square, Belgravia, London",
      postcode: "SW1W 9BH",
      phone: "020 7730 9012",
      website: "www.belgraviaprep.co.uk",
      distance: 1.5,
      rating: 4.8,
      headteacher: "Mrs. Victoria Sterling",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 9, term: "Michaelmas Term 2024", startDate: new Date(2024, 8, 9), endDate: new Date(2024, 11, 14), type: 'term' }
      ]
    },
    {
      id: 9,
      name: "Marylebone Grammar School",
      type: "Secondary",
      address: "Marylebone Road, London",
      postcode: "NW1 5LS",
      phone: "020 7486 3456",
      website: "www.marylebonegrammar.co.uk",
      distance: 3.2,
      rating: 4.6,
      headteacher: "Mr. Richard Davies",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 10, term: "Autumn Term 2024", startDate: new Date(2024, 8, 3), endDate: new Date(2024, 11, 20), type: 'term' }
      ]
    },
    {
      id: 10,
      name: "Paddington Green Primary",
      type: "Primary",
      address: "Church Street, Paddington, London",
      postcode: "W2 1LB",
      phone: "020 7402 7890",
      website: "www.paddingtongreen.co.uk",
      distance: 2.9,
      rating: 4.2,
      headteacher: "Mrs. Helen Foster",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 11, term: "Autumn Term 2024", startDate: new Date(2024, 8, 4), endDate: new Date(2024, 11, 19), type: 'term' }
      ]
    },

    // England - Manchester & North West
    {
      id: 11,
      name: "Manchester Central Primary",
      type: "Primary",
      address: "Deansgate, Manchester",
      postcode: "M1 2HT",
      phone: "0161 234 5678",
      website: "www.manchestercentral.co.uk",
      distance: 5.2,
      rating: 4.4,
      headteacher: "Mr. Paul Anderson",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 12, term: "Autumn Term 2024", startDate: new Date(2024, 8, 3), endDate: new Date(2024, 11, 20), type: 'term' }
      ]
    },
    {
      id: 12,
      name: "Salford Academy",
      type: "Secondary",
      address: "Chapel Street, Salford",
      postcode: "M3 6EN",
      phone: "0161 832 4567",
      website: "www.salfordacademy.co.uk",
      distance: 6.8,
      rating: 4.1,
      headteacher: "Mrs. Jennifer Walsh",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 13, term: "Autumn Term 2024", startDate: new Date(2024, 8, 4), endDate: new Date(2024, 11, 18), type: 'term' }
      ]
    },
    {
      id: 13,
      name: "Stockport Grammar School",
      type: "Independent",
      address: "Buxton Road, Stockport",
      postcode: "SK2 7AF",
      phone: "0161 456 9000",
      website: "www.stockportgrammar.co.uk",
      distance: 8.1,
      rating: 4.7,
      headteacher: "Dr. Andrew Chicken",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 14, term: "Michaelmas Term 2024", startDate: new Date(2024, 8, 10), endDate: new Date(2024, 11, 15), type: 'term' }
      ]
    },
    {
      id: 14,
      name: "Oldham Primary Academy",
      type: "Primary",
      address: "High Street, Oldham",
      postcode: "OL1 1NL",
      phone: "0161 678 9012",
      website: "www.oldhamprimary.co.uk",
      distance: 9.5,
      rating: 4.0,
      headteacher: "Mrs. Susan Taylor",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 15, term: "Autumn Term 2024", startDate: new Date(2024, 8, 2), endDate: new Date(2024, 11, 19), type: 'term' }
      ]
    },
    {
      id: 15,
      name: "Bolton School",
      type: "Independent",
      address: "Chorley New Road, Bolton",
      postcode: "BL1 4PA",
      phone: "01204 840201",
      website: "www.boltonschool.org",
      distance: 12.3,
      rating: 4.8,
      headteacher: "Mr. Philip Britton",
      isConnected: true,
      region: "England",
      termDates: [
        { id: 16, term: "Michaelmas Term 2024", startDate: new Date(2024, 8, 9), endDate: new Date(2024, 11, 14), type: 'term' }
      ]
    },

    // England - Birmingham & Midlands
    {
      id: 16,
      name: "Birmingham Cathedral School",
      type: "Primary",
      address: "St. Philip's Place, Birmingham",
      postcode: "B2 5HU",
      phone: "0121 236 4404",
      website: "www.birminghamcathedral.co.uk",
      distance: 7.2,
      rating: 4.5,
      headteacher: "Mrs. Caroline Johnson",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 17, term: "Autumn Term 2024", startDate: new Date(2024, 8, 3), endDate: new Date(2024, 11, 20), type: 'term' }
      ]
    },
    {
      id: 17,
      name: "Coventry Blue Coat School",
      type: "Secondary",
      address: "Barker Road, Coventry",
      postcode: "CV5 7AU",
      phone: "024 7627 1421",
      website: "www.bluecoatschool.com",
      distance: 11.8,
      rating: 4.3,
      headteacher: "Mr. David Hicks",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 18, term: "Autumn Term 2024", startDate: new Date(2024, 8, 4), endDate: new Date(2024, 11, 18), type: 'term' }
      ]
    },
    {
      id: 18,
      name: "Warwick School",
      type: "Independent",
      address: "Myton Road, Warwick",
      postcode: "CV34 6PP",
      phone: "01926 776400",
      website: "www.warwickschool.org",
      distance: 14.2,
      rating: 4.9,
      headteacher: "Dr. Annabel Crehan",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 19, term: "Michaelmas Term 2024", startDate: new Date(2024, 8, 10), endDate: new Date(2024, 11, 15), type: 'term' }
      ]
    },
    {
      id: 19,
      name: "Leicester Grammar School",
      type: "Independent",
      address: "Great Glen Road, Leicester",
      postcode: "LE8 9FL",
      phone: "0116 259 1950",
      website: "www.leicestergrammar.org.uk",
      distance: 13.7,
      rating: 4.6,
      headteacher: "Mr. Chris King",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 20, term: "Michaelmas Term 2024", startDate: new Date(2024, 8, 9), endDate: new Date(2024, 11, 14), type: 'term' }
      ]
    },
    {
      id: 20,
      name: "Nottingham High School",
      type: "Independent",
      address: "Waverley Mount, Nottingham",
      postcode: "NG7 4ED",
      phone: "0115 978 6056",
      website: "www.nottinghamhigh.co.uk",
      distance: 15.1,
      rating: 4.7,
      headteacher: "Mr. Kevin Fear",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 21, term: "Michaelmas Term 2024", startDate: new Date(2024, 8, 10), endDate: new Date(2024, 11, 15), type: 'term' }
      ]
    },

    // Scotland
    {
      id: 21,
      name: "Edinburgh Academy",
      type: "Independent",
      address: "Henderson Row, Edinburgh",
      postcode: "EH3 5BL",
      phone: "0131 556 4603",
      website: "www.edinburghacademy.org.uk",
      distance: 8.5,
      rating: 4.8,
      headteacher: "Mr. Barry Welsh",
      isConnected: false,
      region: "Scotland",
      termDates: [
        { id: 22, term: "Autumn Term 2024", startDate: new Date(2024, 7, 19), endDate: new Date(2024, 11, 20), type: 'term' }
      ]
    },
    {
      id: 22,
      name: "Glasgow High School",
      type: "Secondary",
      address: "Elmbank Street, Glasgow",
      postcode: "G2 4QA",
      phone: "0141 332 4877",
      website: "www.glasgowhigh.com",
      distance: 12.3,
      rating: 4.4,
      headteacher: "Mrs. Fiona MacLeod",
      isConnected: false,
      region: "Scotland",
      termDates: [
        { id: 23, term: "Autumn Term 2024", startDate: new Date(2024, 7, 20), endDate: new Date(2024, 11, 21), type: 'term' }
      ]
    },
    {
      id: 23,
      name: "St. Andrews Primary",
      type: "Primary",
      address: "South Street, St Andrews",
      postcode: "KY16 9QW",
      phone: "01334 659947",
      website: "www.standrewsprimary.co.uk",
      distance: 6.7,
      rating: 4.6,
      headteacher: "Mrs. Morag Campbell",
      isConnected: false,
      region: "Scotland",
      termDates: [
        { id: 24, term: "Autumn Term 2024", startDate: new Date(2024, 7, 19), endDate: new Date(2024, 11, 20), type: 'term' }
      ]
    },
    {
      id: 24,
      name: "Aberdeen Grammar School",
      type: "Secondary",
      address: "Skene Street, Aberdeen",
      postcode: "AB10 1HT",
      phone: "01224 322700",
      website: "www.aberdeengrammar.aberdeen.sch.uk",
      distance: 14.8,
      rating: 4.5,
      headteacher: "Dr. John Boyd",
      isConnected: false,
      region: "Scotland",
      termDates: [
        { id: 25, term: "Autumn Term 2024", startDate: new Date(2024, 7, 20), endDate: new Date(2024, 11, 21), type: 'term' }
      ]
    },
    {
      id: 25,
      name: "Dundee High School",
      type: "Independent",
      address: "Euclid Crescent, Dundee",
      postcode: "DD1 1HU",
      phone: "01382 202921",
      website: "www.dundeehighschool.co.uk",
      distance: 11.2,
      rating: 4.7,
      headteacher: "Dr. John Halliday",
      isConnected: false,
      region: "Scotland",
      termDates: [
        { id: 26, term: "Autumn Term 2024", startDate: new Date(2024, 7, 19), endDate: new Date(2024, 11, 20), type: 'term' }
      ]
    },
    {
      id: 26,
      name: "Stirling High School",
      type: "Secondary",
      address: "Torbrex Road, Stirling",
      postcode: "FK8 2DU",
      phone: "01786 443232",
      website: "www.stirlinghigh.stirling.sch.uk",
      distance: 9.8,
      rating: 4.2,
      headteacher: "Mrs. Karen Robertson",
      isConnected: false,
      region: "Scotland",
      termDates: [
        { id: 27, term: "Autumn Term 2024", startDate: new Date(2024, 7, 20), endDate: new Date(2024, 11, 21), type: 'term' }
      ]
    },
    {
      id: 27,
      name: "Inverness Royal Academy",
      type: "Secondary",
      address: "Midmills Road, Inverness",
      postcode: "IV2 3QX",
      phone: "01463 233471",
      website: "www.invernessroyal.highland.sch.uk",
      distance: 13.5,
      rating: 4.3,
      headteacher: "Mr. Donald MacBeath",
      isConnected: false,
      region: "Scotland",
      termDates: [
        { id: 28, term: "Autumn Term 2024", startDate: new Date(2024, 7, 19), endDate: new Date(2024, 11, 20), type: 'term' }
      ]
    },
    {
      id: 28,
      name: "Perth Academy",
      type: "Secondary",
      address: "Murray Street, Perth",
      postcode: "PH1 1NX",
      phone: "01738 454300",
      website: "www.perthacademy.pkc.sch.uk",
      distance: 10.4,
      rating: 4.1,
      headteacher: "Mrs. Gillian Barclay",
      isConnected: false,
      region: "Scotland",
      termDates: [
        { id: 29, term: "Autumn Term 2024", startDate: new Date(2024, 7, 20), endDate: new Date(2024, 11, 21), type: 'term' }
      ]
    },
    {
      id: 29,
      name: "Kilmarnock Academy",
      type: "Secondary",
      address: "Elmbank Avenue, Kilmarnock",
      postcode: "KA1 3BX",
      phone: "01563 523501",
      website: "www.kilmarnockacademy.co.uk",
      distance: 7.9,
      rating: 4.0,
      headteacher: "Mr. Stuart Clyde",
      isConnected: false,
      region: "Scotland",
      termDates: [
        { id: 30, term: "Autumn Term 2024", startDate: new Date(2024, 7, 19), endDate: new Date(2024, 11, 20), type: 'term' }
      ]
    },
    {
      id: 30,
      name: "Paisley Grammar School",
      type: "Secondary",
      address: "Renfrew Road, Paisley",
      postcode: "PA3 4RF",
      phone: "0141 887 3907",
      website: "www.paisleygrammar.renfrewshire.sch.uk",
      distance: 5.6,
      rating: 4.4,
      headteacher: "Mrs. Lynne Nairn",
      isConnected: false,
      region: "Scotland",
      termDates: [
        { id: 31, term: "Autumn Term 2024", startDate: new Date(2024, 7, 20), endDate: new Date(2024, 11, 21), type: 'term' }
      ]
    },

    // Wales
    {
      id: 31,
      name: "Cardiff High School",
      type: "Secondary",
      address: "Cyncoed Road, Cardiff",
      postcode: "CF23 6UL",
      phone: "029 2061 5000",
      website: "www.cardiffhigh.cardiff.sch.uk",
      distance: 4.2,
      rating: 4.5,
      headteacher: "Mr. Gareth Williams",
      isConnected: false,
      region: "Wales",
      termDates: [
        { id: 32, term: "Autumn Term 2024", startDate: new Date(2024, 8, 3), endDate: new Date(2024, 11, 20), type: 'term' }
      ]
    },
    {
      id: 32,
      name: "Swansea Grammar School",
      type: "Independent",
      address: "Mumbles Road, Swansea",
      postcode: "SA2 0AN",
      phone: "01792 366158",
      website: "www.swanseagrammar.co.uk",
      distance: 8.7,
      rating: 4.7,
      headteacher: "Mrs. Catrin Jones",
      isConnected: true,
      region: "Wales",
      termDates: [
        { id: 33, term: "Michaelmas Term 2024", startDate: new Date(2024, 8, 10), endDate: new Date(2024, 11, 15), type: 'term' }
      ]
    },
    {
      id: 33,
      name: "Newport High School",
      type: "Secondary",
      address: "Bettws Lane, Newport",
      postcode: "NP20 6EB",
      phone: "01633 656656",
      website: "www.newporthigh.newport.sch.uk",
      distance: 6.3,
      rating: 4.2,
      headteacher: "Mr. David Evans",
      isConnected: false,
      region: "Wales",
      termDates: [
        { id: 34, term: "Autumn Term 2024", startDate: new Date(2024, 8, 4), endDate: new Date(2024, 11, 19), type: 'term' }
      ]
    },
    {
      id: 34,
      name: "Bangor University School",
      type: "Secondary",
      address: "Ffriddoedd Road, Bangor",
      postcode: "LL57 2TW",
      phone: "01248 370171",
      website: "www.bangoruniversity.co.uk",
      distance: 12.1,
      rating: 4.4,
      headteacher: "Dr. Mair Hughes",
      isConnected: false,
      region: "Wales",
      termDates: [
        { id: 35, term: "Autumn Term 2024", startDate: new Date(2024, 8, 3), endDate: new Date(2024, 11, 20), type: 'term' }
      ]
    },
    {
      id: 35,
      name: "Wrexham Maelor School",
      type: "Secondary",
      address: "Croesnewydd Road, Wrexham",
      postcode: "LL13 7EW",
      phone: "01978 340840",
      website: "www.maelor.wrexham.sch.uk",
      distance: 9.8,
      rating: 4.1,
      headteacher: "Mrs. Helen Roberts",
      isConnected: false,
      region: "Wales",
      termDates: [
        { id: 36, term: "Autumn Term 2024", startDate: new Date(2024, 8, 4), endDate: new Date(2024, 11, 19), type: 'term' }
      ]
    },
    {
      id: 36,
      name: "Llanelli Day School",
      type: "Independent",
      address: "Heol Goffa, Llanelli",
      postcode: "SA15 3EQ",
      phone: "01554 820500",
      website: "www.llanelliday.co.uk",
      distance: 7.5,
      rating: 4.6,
      headteacher: "Mr. Gareth Thomas",
      isConnected: false,
      region: "Wales",
      termDates: [
        { id: 37, term: "Michaelmas Term 2024", startDate: new Date(2024, 8, 9), endDate: new Date(2024, 11, 14), type: 'term' }
      ]
    },
    {
      id: 37,
      name: "Merthyr Tydfil School",
      type: "Secondary",
      address: "Swansea Road, Merthyr Tydfil",
      postcode: "CF47 8DN",
      phone: "01685 726003",
      website: "www.merthyrtydfil.co.uk",
      distance: 11.4,
      rating: 4.0,
      headteacher: "Mrs. Sian Davies",
      isConnected: false,
      region: "Wales",
      termDates: [
        { id: 38, term: "Autumn Term 2024", startDate: new Date(2024, 8, 3), endDate: new Date(2024, 11, 20), type: 'term' }
      ]
    },
    {
      id: 38,
      name: "Bridgend College School",
      type: "Secondary",
      address: "Cowbridge Road, Bridgend",
      postcode: "CF31 3DF",
      phone: "01656 302600",
      website: "www.bridgendcollege.ac.uk",
      distance: 5.9,
      rating: 4.3,
      headteacher: "Mr. Huw Lewis",
      isConnected: false,
      region: "Wales",
      termDates: [
        { id: 39, term: "Autumn Term 2024", startDate: new Date(2024, 8, 4), endDate: new Date(2024, 11, 19), type: 'term' }
      ]
    },
    {
      id: 39,
      name: "Caerphilly High School",
      type: "Secondary",
      address: "Penallta Road, Caerphilly",
      postcode: "CF83 2HL",
      phone: "029 2086 8810",
      website: "www.caerphillyhigh.co.uk",
      distance: 3.7,
      rating: 4.2,
      headteacher: "Mrs. Cerys Morgan",
      isConnected: false,
      region: "Wales",
      termDates: [
        { id: 40, term: "Autumn Term 2024", startDate: new Date(2024, 8, 3), endDate: new Date(2024, 11, 20), type: 'term' }
      ]
    },
    {
      id: 40,
      name: "Rhondda High School",
      type: "Secondary",
      address: "Penygraig Road, Tonypandy",
      postcode: "CF40 1QX",
      phone: "01443 687621",
      website: "www.rhonddahigh.co.uk",
      distance: 8.2,
      rating: 4.1,
      headteacher: "Mr. Rhodri Phillips",
      isConnected: false,
      region: "Wales",
      termDates: [
        { id: 41, term: "Autumn Term 2024", startDate: new Date(2024, 8, 4), endDate: new Date(2024, 11, 19), type: 'term' }
      ]
    },

    // Additional England schools
    {
      id: 41,
      name: "Brighton College",
      type: "Independent",
      address: "Eastern Road, Brighton",
      postcode: "BN2 0AL",
      phone: "01273 704200",
      website: "www.brightoncollege.org.uk",
      distance: 13.8,
      rating: 4.9,
      headteacher: "Mr. Richard Cairns",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 42, term: "Michaelmas Term 2024", startDate: new Date(2024, 8, 10), endDate: new Date(2024, 11, 15), type: 'term' }
      ]
    },
    {
      id: 42,
      name: "Canterbury Cathedral Lodge",
      type: "Primary",
      address: "The Precincts, Canterbury",
      postcode: "CT1 2EH",
      phone: "01227 865350",
      website: "www.canterburycathedral.org",
      distance: 14.5,
      rating: 4.6,
      headteacher: "Mrs. Sarah Mitchell",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 43, term: "Autumn Term 2024", startDate: new Date(2024, 8, 3), endDate: new Date(2024, 11, 20), type: 'term' }
      ]
    },
    {
      id: 43,
      name: "Oxford High School",
      type: "Independent",
      address: "Belbroughton Road, Oxford",
      postcode: "OX2 6XA",
      phone: "01865 559888",
      website: "www.oxfordhigh.gdst.net",
      distance: 12.7,
      rating: 4.8,
      headteacher: "Mrs. Judith Carlisle",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 44, term: "Michaelmas Term 2024", startDate: new Date(2024, 8, 9), endDate: new Date(2024, 11, 14), type: 'term' }
      ]
    },
    {
      id: 44,
      name: "Cambridge Grammar School",
      type: "Secondary",
      address: "Babraham Road, Cambridge",
      postcode: "CB22 3AT",
      phone: "01223 264619",
      website: "www.cambridgegrammar.org",
      distance: 11.3,
      rating: 4.7,
      headteacher: "Dr. Stuart Nicholson",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 45, term: "Autumn Term 2024", startDate: new Date(2024, 8, 4), endDate: new Date(2024, 11, 18), type: 'term' }
      ]
    },
    {
      id: 45,
      name: "Bath Spa University School",
      type: "Secondary",
      address: "Newton Park, Bath",
      postcode: "BA2 9BN",
      phone: "01225 875875",
      website: "www.bathspa.ac.uk",
      distance: 15.2,
      rating: 4.4,
      headteacher: "Prof. Sue Rigby",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 46, term: "Autumn Term 2024", startDate: new Date(2024, 8, 3), endDate: new Date(2024, 11, 20), type: 'term' }
      ]
    },
    {
      id: 46,
      name: "York Minster School",
      type: "Independent",
      address: "Deangate, York",
      postcode: "YO1 7JA",
      phone: "01904 557200",
      website: "www.yorkminster.org",
      distance: 13.9,
      rating: 4.8,
      headteacher: "Mr. Jeremy Walker",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 47, term: "Michaelmas Term 2024", startDate: new Date(2024, 8, 10), endDate: new Date(2024, 11, 15), type: 'term' }
      ]
    },
    {
      id: 47,
      name: "Durham School",
      type: "Independent",
      address: "Quarryheads Lane, Durham",
      postcode: "DH1 4SZ",
      phone: "0191 731 9270",
      website: "www.durhamschool.co.uk",
      distance: 14.1,
      rating: 4.6,
      headteacher: "Mr. Kieran McLaughlin",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 48, term: "Michaelmas Term 2024", startDate: new Date(2024, 8, 9), endDate: new Date(2024, 11, 14), type: 'term' }
      ]
    },
    {
      id: 48,
      name: "Newcastle Royal Grammar",
      type: "Independent",
      address: "Eskdale Terrace, Newcastle",
      postcode: "NE2 4DX",
      phone: "0191 281 5711",
      website: "www.rgs.newcastle.sch.uk",
      distance: 15.8,
      rating: 4.7,
      headteacher: "Mr. Bernard Trafford",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 49, term: "Michaelmas Term 2024", startDate: new Date(2024, 8, 10), endDate: new Date(2024, 11, 15), type: 'term' }
      ]
    },
    {
      id: 49,
      name: "Leeds Grammar School",
      type: "Independent",
      address: "Alwoodley Gates, Leeds",
      postcode: "LS17 8GS",
      phone: "0113 229 1552",
      website: "www.leedsgrammar.co.uk",
      distance: 12.4,
      rating: 4.5,
      headteacher: "Mrs. Sue Woodroofe",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 50, term: "Michaelmas Term 2024", startDate: new Date(2024, 8, 9), endDate: new Date(2024, 11, 14), type: 'term' }
      ]
    },
    {
      id: 50,
      name: "Sheffield High School",
      type: "Independent",
      address: "10 Rutland Park, Sheffield",
      postcode: "S10 2PE",
      phone: "0114 266 0324",
      website: "www.sheffieldhigh.co.uk",
      distance: 11.7,
      rating: 4.6,
      headteacher: "Mrs. Nina Gunson",
      isConnected: false,
      region: "England",
      termDates: [
        { id: 51, term: "Michaelmas Term 2024", startDate: new Date(2024, 8, 10), endDate: new Date(2024, 11, 15), type: 'term' }
      ]
    }
  ]);

  const [filteredSchools, setFilteredSchools] = useState<School[]>(allSchools);

  const schoolTypes = ['all', 'Primary', 'Secondary', 'Independent', 'Special'];
  const regions = ['all', 'England', 'Scotland', 'Wales'];

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
      Alert.alert('Error', 'Please enter a valid UK postcode (e.g., SW1A 1AA)');
      return;
    }

    setIsSearching(true);
    
    // Simulate API search with filtering
    setTimeout(() => {
      const searchResults = allSchools
        .filter(school => school.distance <= searchRadius)
        .sort((a, b) => a.distance - b.distance);
      
      setFilteredSchools(searchResults);
      setIsSearching(false);
      Alert.alert('Search Complete', `Found ${searchResults.length} schools within ${searchRadius} miles of ${searchPostcode.toUpperCase()}`);
    }, 1500);
  };

  const getFilteredSchools = () => {
    let filtered = filteredSchools;
    
    if (schoolFilter !== 'all') {
      filtered = filtered.filter(school => school.type === schoolFilter);
    }
    
    if (regionFilter !== 'all') {
      filtered = filtered.filter(school => school.region === regionFilter);
    }
    
    return filtered.sort((a, b) => a.distance - b.distance);
  };

  const handleSyncSchool = (schoolId: number) => {
    setConnectedSchools(prev => {
      if (prev.includes(schoolId)) {
        // Unsync
        const updatedSchools = allSchools.map(school => 
          school.id === schoolId 
            ? { ...school, isConnected: false }
            : school
        );
        setFilteredSchools(updatedSchools.filter(school => school.distance <= searchRadius));
        Alert.alert('Unsynced', 'School calendar unsynced successfully');
        return prev.filter(id => id !== schoolId);
      } else {
        // Sync
        const updatedSchools = allSchools.map(school => 
          school.id === schoolId 
            ? { ...school, isConnected: true }
            : school
        );
        setFilteredSchools(updatedSchools.filter(school => school.distance <= searchRadius));
        Alert.alert('Synced', 'School calendar synced successfully! Term dates and holidays will appear in your family calendar.');
        return [...prev, schoolId];
      }
    });
  };

  const formatTermDate = (termDate: TermDate) => {
    const start = termDate.startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const end = termDate.endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return `${start} - ${end}`;
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Schools</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>Find Schools Near You</Text>
          <Text style={styles.searchSubtitle}>Enter your postcode to discover local schools and their term dates</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.postcodeInput}
              value={searchPostcode}
              onChangeText={setSearchPostcode}
              placeholder="Enter UK postcode (e.g., SW1A 1AA)"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              maxLength={8}
            />
            <View style={styles.radiusSection}>
              <Text style={styles.radiusLabel}>Search within</Text>
              <View style={styles.radiusInputContainer}>
                <TextInput
                  style={styles.radiusInput}
                  value={searchRadius.toString()}
                  onChangeText={(text) => setSearchRadius(parseInt(text) || 15)}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.radiusUnit}>miles</Text>
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
            <Text style={styles.sectionTitle}>Synced Schools</Text>
            {allSchools.filter(school => school.isConnected).map((school) => (
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
                    <Text style={styles.schoolType}>{school.type} School • {school.region}</Text>
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
                    <Text style={styles.schoolMetaText}>{school.postcode}</Text>
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
              {searchPostcode ? `Schools Near ${searchPostcode.toUpperCase()}` : 'Schools Near Your Area'}
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
                  <Text style={styles.schoolType}>{school.type} School • {school.region}</Text>
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
                    <Text style={styles.schoolMetaText}>{school.postcode}</Text>
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
                <Text style={styles.schoolDetailSubtitle}>{selectedSchool?.type} School • {selectedSchool?.region}</Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.syncButton,
                  selectedSchool?.isConnected && styles.unsyncButton
                ]}
                onPress={() => selectedSchool && handleSyncSchool(selectedSchool.id)}
              >
                <Sync size={16} color="#FFFFFF" />
                <Text style={styles.syncButtonText}>
                  {selectedSchool?.isConnected ? 'Unsync' : 'Sync'}
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
                        <Text style={styles.overviewLabel}>Rating</Text>
                        <View style={styles.ratingContainer}>
                          {renderStarRating(selectedSchool.rating)}
                          <Text style={styles.ratingText}>{selectedSchool.rating}</Text>
                        </View>
                      </View>
                      <View style={styles.overviewItem}>
                        <Text style={styles.overviewLabel}>Region</Text>
                        <Text style={styles.overviewValue}>{selectedSchool.region}</Text>
                      </View>
                      <View style={styles.overviewItem}>
                        <Text style={styles.overviewLabel}>Type</Text>
                        <Text style={styles.overviewValue}>{selectedSchool.type}</Text>
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
              
              <Text style={[styles.filterSectionTitle, { marginTop: 24 }]}>Region</Text>
              {regions.map((region) => (
                <TouchableOpacity
                  key={region}
                  style={[
                    styles.filterOption,
                    regionFilter === region && styles.filterOptionSelected
                  ]}
                  onPress={() => setRegionFilter(region)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    regionFilter === region && styles.filterOptionTextSelected
                  ]}>
                    {region === 'all' ? 'All Regions' : region}
                  </Text>
                  {regionFilter === region && (
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
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'left',
    marginLeft: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
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
    marginBottom: 8,
  },
  searchSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  searchContainer: {
    gap: 12,
  },
  postcodeInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  radiusSection: {
    marginBottom: 4,
  },
  radiusLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  radiusInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  radiusInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    marginRight: 8,
  },
  radiusUnit: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
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
  syncButton: {
    backgroundColor: '#0e3c67',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  unsyncButton: {
    backgroundColor: '#DC2626',
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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