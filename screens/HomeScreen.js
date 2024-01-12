  import React, { useState, useEffect } from 'react';
  import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView, TextInput,Alert } from 'react-native';
  import MapView, { Marker, Callout } from 'react-native-maps';
  import polyline from '@mapbox/polyline';
  import * as Location from 'expo-location';
  import { AntDesign } from '@expo/vector-icons'; 
  import AsyncStorage from '@react-native-async-storage/async-storage';


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

    useEffect(() => {
      // Fetch events from the server when the component mounts
      fetchEvents();
      getLocation();
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
        const response = await fetch('http://192.168.1.11:3001/getEvents');
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

    const mergeCoords = () => {
      const hasStartAndEnd = latitude != null && desLatitude != null;
      if (hasStartAndEnd) {
        const concatStart = `${latitude},${longitude}`;
        const concatEnd = `${desLatitude},${desLongitude}`;
        getDirections(concatStart, concatEnd);
      }
    };

    const getDirections = async (startLoc, desLoc) => {
      try {
        const apiKey = 'AIzaSyDcELAMQ7jNEno3GYitHGQza2O8wuye';
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
      } catch (error) {
        console.log('Error: ', error);
      }
    };

    const handleMarkerPress = (event) => {
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
        // Retrieve user email from AsyncStorage
        const userEmail = await AsyncStorage.getItem('user');
        const userObject = JSON.parse(userEmail);
        const { email } = userObject;

        const response = await fetch('http://192.168.1.11:3001/sendRequestToJoin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: selectedEvent._id,
            userId: email, // Send user email as userId
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
        // Clear AsyncStorage items
        await AsyncStorage.removeItem('user');

        // Redirect to the login screen
        navigation.navigate('Login');
      } catch (error) {
        console.error('Error logging out:', error);
      }
    };
    return (
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
            {/* Render markers for events */}
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
                    {/* Add more details as needed */}
                  </View>
                </Callout>
              </Marker>
            ))}
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
              {/* Add more details as needed */}
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

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('PostEvent')}
        >
          <Text style={styles.buttonText}>ADD</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.DemButton}
          onPress={() => navigation.navigate('Demandes')}
        >
          <Text style={styles.buttonText}>Demandes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.EvsButton}
          onPress={() => navigation.navigate('MyEvents')}
        >
          <Text style={styles.buttonText}>Events</Text>
        </TouchableOpacity>


      </View>
    );
  };


  const styles = StyleSheet.create({
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
      color: 'white',
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
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
    },
    searchButton: {
      fontSize: 16,
      width:60,
      marginRight:-30
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
  //https://rn.mobile.ant.design/components/tab-bar/