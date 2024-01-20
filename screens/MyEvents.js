import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyEvents = () => {
  const [userEmail, setUserEmail] = useState('');
  const [userEvents, setUserEvents] = useState([]);

  useEffect(() => {
    // Fetch user email from AsyncStorage
    const fetchUserEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('user');

        if (storedEmail) {
          setUserEmail(storedEmail);
        }
      } catch (error) {
        console.error('Error fetching user email from AsyncStorage:', error);
      }
    };

    fetchUserEmail();
  }, []);

  useEffect(() => {
    // Fetch events associated with the user's email
    const fetchUserEvents = async () => {
      try {
        const response = await fetch(`http://192.168.137.250:3001/getEventsByEMail?userEmail=${userEmail}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const events = await response.json();

        // Filter events based on the user's email
        const userEvents = events.filter((event) => {
          const eventUserEmail = event.userEmail && typeof event.userEmail === 'string' ?
            JSON.parse(event.userEmail).email :
            null;
          const storedUserEmail = userEmail && typeof userEmail === 'string' ?
            JSON.parse(userEmail).email :
            null;

          return eventUserEmail === storedUserEmail;
        });

        setUserEvents(userEvents);
      } catch (error) {
        console.error('Error fetching user events:', error.message);
      }
    };

    if (userEmail) {
      fetchUserEvents();
    }
  }, [userEmail]);

  // Sport image mapping
  const sportImages = {
    football: require('./football-2-svgrepo-com.png'),
    basketball: require('./basketball-svgrepo-com.png'),
    volleyball: require('./volleyball-svgrepo-com.png'),
    // Add more sports as needed
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Events</Text>
      <FlatList
        data={userEvents}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.eventContainer}>
            <View style={styles.eventHeader}>
              <Image style={styles.image} source={sportImages[item.sport.toLowerCase()]} />
              <Text style={styles.eventHeaderText}>{item.sport}</Text>
            </View>
            <Text style={styles.eventText}>{item.description}</Text>
            <Text style={styles.eventText}>{item.numPersonsNeeded}</Text>
            <Text style={styles.eventText}>{item.dateTime}</Text>
            {/* <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Join Event</Text>
            </TouchableOpacity> */}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  eventContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 1,
      width: -2,
    },
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  image: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  eventHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventText: {
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default MyEvents;
