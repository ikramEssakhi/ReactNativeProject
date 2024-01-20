import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView, TextInput, Alert, Image  } from 'react-native';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import * as Location from 'expo-location';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons,MaterialIcons  } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [desLatitude, setDesLatitude] = useState(null);
  const [desLongitude, setDesLongitude] = useState(null);
  const [coords, setCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [time, setTime] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    fetchEvents();
    getLocation();
    loadCurrentUser();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('Permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://192.168.137.250:3001/getEvents');
      const result = await response.json();

      if (response.ok) {
        setEvents(result);
        setFilteredEvents(result);
      } else {
        console.error('Failed to fetch events:', result.message);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const calculateShortestPath = async (event) => {
    if (latitude != null && longitude != null) {
      const startLoc = `${latitude},${longitude}`;
      const desLoc = `${event.location.latitude},${event.location.longitude}`;
      try {
        const apiKey = 'AIzaSyDcELAMQ7jNEno3GYitHGQza2O8wuye-Ok';
        const resp = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${desLoc}&key=${apiKey}`
        );

        const respJson = await resp.json();

        if (!respJson.routes || respJson.routes.length === 0) {
          console.log('No routes found:', respJson);
          return;
        }

        const response = respJson.routes[0];

        if (!response.legs || response.legs.length === 0) {
          console.log('No legs found in the route');
          return;
        }

        const distanceTime = response.legs[0];
        const distance = distanceTime.distance.text;
        const time = distanceTime.duration.text;

        const points = polyline.decode(response.overview_polyline.points);
        const newCoords = points.map((point) => ({
          latitude: point[0],
          longitude: point[1],
        }));

        setCoords(newCoords);
        setDistance(distance);
        setTime(time);
        setRouteCoordinates(newCoords);
      } catch (error) {
        console.log('Error: ', error);
      }
    }
  };

  const handleMarkerPress = (event) => {
    setRouteCoordinates([]);
    calculateShortestPath(event);
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const handleSearch = () => {
    const filtered = events.filter((event) =>
      event.sport.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredEvents(filtered);
  };

  const sendRequestToJoin = async () => {
    try {
      const userEmail = await AsyncStorage.getItem('user');
      const userObject = JSON.parse(userEmail);
      const { email } = userObject;

      const response = await fetch('http://192.168.137.250:3001/sendRequestToJoin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: selectedEvent._id,
          userId: email,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Request sent successfully:', result);
        Alert.alert('Request sent successfully', result.message);
      } else {
        console.error('Failed to send request:', result.message);
      }
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  const [currentUser, setCurrentUser] = useState(null);
  const loadCurrentUser = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        setCurrentUser(JSON.parse(user));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };
  return (
    <View style={{ flex: 1 }}>
      {/* Icon to toggle sidebar */}
      <TouchableOpacity style={styles.sidebarToggle} onPress={toggleSidebar}>
        <AntDesign name={sidebarVisible ? 'close' : 'menuunfold'} size={24} color="black" />
      </TouchableOpacity>

      {/* Side Navigation Bar */}
      {sidebarVisible && currentUser && (
        <View style={styles.sideNavBar}>
            <TouchableOpacity >
            <Image
              source={
                currentUser.sex === 'male'
                  ? require('./male-avatar-boy-face-man-user-9-svgrepo-com.png')
                  : require('./female-avatar-girl-face-woman-user-2-svgrepo-com.png')
              }
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>{currentUser.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('profile')}>
          <Text style={styles.buttonText}>   <Ionicons name="person-circle-outline" size={20} color="black" />Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('PostEvent')}>
            <Text style={styles.buttonText}><Ionicons name="add-circle-outline" size={20} color="black" />Ajouter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('MyEvents')}>
            <Text style={styles.buttonText}><MaterialIcons name="event" size={20} color="black" /> Evenements</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Demandes')}>
            <Text style={styles.buttonText}><MaterialIcons name="description" size={20} color="black" /> Demandes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={handleLogout}>
            <Text style={styles.buttonText}><AntDesign name="logout" size={18} color="black" /> Quitter</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map and other components */}
      <View style={{ flex: 1 }}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name"
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <AntDesign name="search1" size={20} color="gray" style={styles.searchIcon} />
          </TouchableOpacity>
        </View>
        {latitude !== null && longitude !== null && (
          <MapView
            showsUserLocation
            style={{ flex: 1 }}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {filteredEvents.map((event) => (
              <Marker
                key={event._id}
                coordinate={{
                  latitude: event.location.latitude,
                  longitude: event.location.longitude,
                }}
                title={event.sport}
                description={event.description}
                onPress={() => handleMarkerPress(event)}
              >
                <Callout>
                  <View>
                    <Text style={{ fontWeight: 'bold' }}>{event.sport}</Text>
                    <Text>{event.description}</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeWidth={3}
                strokeColor="#00F"
              />
            )}
          </MapView>
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={{ fontWeight: 'bold', fontSize: 20 }}> ⚽  {selectedEvent?.sport}  ⚽</Text>
              <Text>Description: {selectedEvent?.description}</Text>
              <Text>Nombre de personnes :{selectedEvent?.numPersonsNeeded}</Text>
              <Text>dateTime :{selectedEvent?.dateTime}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.joinButton}
              onPress={sendRequestToJoin}
            >
              <Text style={styles.buttonText}>Send request to join</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarToggle: {
    position: 'absolute',
    top: -40,
    right: 20,
    zIndex: 2,
  },
  sideNavBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: 160,
    backgroundColor: 'white',  
    paddingVertical: 20,
    paddingHorizontal: 10,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    justifyContent: 'flex-start',
    width: '100%', 
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 9, 
  },
  profileImage: {
    width: 120, // Adjust the width and height according to your preference
    height: 120,
    borderRadius: 60, // Make it half of the width/height to create a circle
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  DemButton: {
    position: 'absolute',
    bottom: 16,
    right: 300,
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  EvsButton: {
    position: 'absolute',
    bottom: 16,
    right: 200,
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    justifyContent: 'flex-end',
    backgroundColor: 'white',
    padding: 20,
    marginTop:400,height:380,borderRadius:50
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  closeButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    margin: 10,
    borderRadius: 10,
    elevation: 2,
    zIndex: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  profileName: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color:'black',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    zIndex: 1,
  },
  searchButton: {
    fontSize: 16,
    width:60,
    marginRight:-30,
    zIndex: 1,
  },
  joinButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 10,
    marginTop: -30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 16,
    right: 100,
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
