// RequestsList.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [myEvents, setMyEvents] = useState([]);


  useEffect(() => {
    // Fetch requests from the server when the component mounts
    fetchRequests();
    fetchMyEvents();

  }, []);
  const fetchMyEvents = async () => {
    try {
      // Fetch events associated with the user's email
      const response = await fetch('http://192.168.1.9:3001/getEvents'); // Update the endpoint
      console.log('Response Status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const events = await response.json();
      console.log('Fetched events:', events);

      // Filter events based on the user's email
      const userEmail = await AsyncStorage.getItem('user');; // Replace with the actual user email
      const userEvents = events.filter((event) => event.userEmail === userEmail);

      console.log('User events:', userEvents);
      setMyEvents(userEvents);
    } catch (error) {
      console.error('Error fetching user events:', error.message);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://192.168.1.9:3001/getRequests'); // Update the endpoint
      const result = await response.json();

      if (response.ok) {
        // Fetch user details for each request
        const requestsWithUsers = await Promise.all(
          result.map(async (request) => {
            const userResponse = await fetch(`http://192.168.1.9:3001/getUser/${request.userId}`);
            const userResult = await userResponse.json();

            if (userResponse.ok) {
              // Combine request and user details
              return { ...request, user: userResult };
            } else {
              console.error('Failed to fetch user details:', userResult.message);
              return request;
            }
          })
        );

        setRequests(requestsWithUsers);
      } else {
        console.error('Failed to fetch requests:', result.message);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };
  const handleAccept = async (eventId, userId) => {
    try {
      const response = await fetch('http://192.168.1.9:3001/acceptRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, userId }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        // Refresh the requests list after accepting
        await fetchRequests();
        console.log('Accept request successful:', result.message);
      } else {
        Alert.alert('Error', result.message);
        console.error('Error accepting request:', result.message);
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };
  
  const handleRefuse = async (eventId, userId) => {
    try {
      const response = await fetch('http://192.168.1.9:3001/refuseRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, userId }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        // Refresh the requests list after refusing
        await fetchRequests();
        console.log('Refuse request successful:', result.message);
      } else {
        Alert.alert('Error', result.message);
        console.error('Error refusing request:', result.message);
      }
    } catch (error) {
      console.error('Error refusing request:', error);
    }
  };
  
  

  const renderItem = ({ item }) => {
    // Check if the event ID exists in myEvents
    const isMyEvent = myEvents.some((event) => event._id === item.eventId);
  
    // Display the request only if it's associated with the user's events
    if (isMyEvent) {
      return (
        <View style={styles.requestItem}>
          <Text>{`Event ID: ${item.eventId}`}</Text>
          <Text>{`User ID: ${item.userId}`}</Text>
          {item.user && (
            <View>
              <Text>{`User Email: ${item.user.email}`}</Text>
              <Text>{`User First Name: ${item.user.firstName}`}</Text>
              <Text>{`User Last Name: ${item.user.lastName}`}</Text>
              <Text>{`User Phone Number: ${item.user.phoneNumber}`}</Text>
              <Text>{`User Favorite Sport: ${item.user.favoriteSport}`}</Text>
              {/* Add more user details as needed */}
            </View>
          )}
          <Text>{`Status: ${item.status}`}</Text>
          <View style={styles.buttonContainer}>
          <TouchableOpacity
  style={[styles.acceptButton, item.status === 'Accepted' || item.status === 'Refused' ? styles.disabledButton : null]}
  onPress={() => handleAccept(item.eventId, item.userId)}
  disabled={item.status === 'Accepted' || item.status === 'Refused'}
>
  <Text style={styles.buttonText}>Accept</Text>
</TouchableOpacity>
<TouchableOpacity
  style={[styles.refuseButton, item.status === 'Accepted' || item.status === 'Refused' ? styles.disabledButton : null]}
  onPress={() => handleRefuse(item.eventId, item.userId)}
  disabled={item.status === 'Accepted' || item.status === 'Refused'}
>
  <Text style={styles.buttonText}>Refuse</Text>
</TouchableOpacity>

          </View>
          {/* Add more details as needed */}
        </View>
      );
    } else {
      // Event not associated with the user, return null to render nothing
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Requests List</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item._id} // Assuming _id is the unique identifier for requests
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  requestItem: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  refuseButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: 'gray', // You can set a different color or style for disabled buttons
    opacity: 0.7, // Adjust the opacity to visually indicate that the button is disabled
  },
  
});

export default RequestsList;
