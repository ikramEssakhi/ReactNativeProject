import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import * as Location from 'expo-location';

const HomeScreen = ({ navigation }) => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [desLatitude, setDesLatitude] = useState(null);
  const [desLongitude, setDesLongitude] = useState(null);
  const [coords, setCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [time, setTime] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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
      const response = await fetch('http://172.17.36.23:3001/getEvents');
      const result = await response.json();

      if (response.ok) {
        setEvents(result);
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
  return (
    <View style={{ flex: 1 }}>
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
          {events.map((event) => (
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
  modalContainer: {
    flex: 0.5, // Set the desired flex value
    justifyContent: 'flex-end',
    backgroundColor: 'white',
    padding: 20,
    marginTop:400
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
});

export default HomeScreen;
//https://rn.mobile.ant.design/components/tab-bar/