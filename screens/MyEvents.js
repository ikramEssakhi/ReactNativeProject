import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyEvents = () => {
  const [userEmail, setUserEmail] = useState('');
  const [userEvents, setUserEvents] = useState([]);

  useEffect(() => {
    // Fetch user email from AsyncStorage
    const fetchUserEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('user');
        console.log('Stored Email:', storedEmail);

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
        const response = await fetch(`http://192.168.1.9:3001/getEventsByEMail?userEmail=${userEmail}`);
        console.log('Response Status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const events = await response.json();
        console.log('Fetched events:', events);

        // Filter events based on the user's email
        const userEvents = events.filter((event) => {
          const eventUserEmail = event.userEmail && typeof event.userEmail === 'string' ?
            JSON.parse(event.userEmail).email :
            null;
          const storedUserEmail = userEmail && typeof userEmail === 'string' ?
            JSON.parse(userEmail).email :
            null;

          console.log('Event user email:', eventUserEmail);
          console.log('User email:', storedUserEmail);
          return eventUserEmail === storedUserEmail;
        });

        console.log('User events:', userEvents);
        setUserEvents(userEvents);
      } catch (error) {
        console.error('Error fetching user events:', error.message);
      }
    };

    if (userEmail) {
      fetchUserEvents();
    }
  }, [userEmail]);

  return (
    <View>
      <Text style={styles.header}>My Events</Text>
      <FlatList
        data={userEvents}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.eventContainer}>
            <Text style={styles.eventText}>Id: {item._id}</Text>
            <Text style={styles.eventText}>Sport: {item.sport}</Text>
            <Text style={styles.eventText}>Description: {item.description}</Text>
            {/* Add more event details as needed */}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventContainer: {
    backgroundColor: 'lightblue',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  eventText: {
    fontSize: 16,
  },
});

export default MyEvents;
