// RequestsList.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
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
      const response = await fetch('http://192.168.137.250:3001/getEvents'); // Update the endpoint
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
      const response = await fetch('http://192.168.137.250:3001/getRequests'); // Update the endpoint
      const result = await response.json();

      if (response.ok) {
        // Fetch user details for each request
        const requestsWithUsers = await Promise.all(
          result.map(async (request) => {
            const userResponse = await fetch(`http://192.168.137.250:3001/getUser/${request.userId}`);
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
      const response = await fetch('http://192.168.137.250:3001/acceptRequest', {
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
      const response = await fetch('http://192.168.137.250:3001/refuseRequest', {
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
  
  const getAvatarImage = (sex) => {
    return sex === 'male'
      ? require('./male-avatar-boy-face-man-user-9-svgrepo-com.png')
      : require('./female-avatar-girl-face-woman-user-2-svgrepo-com.png');
  };

  const renderItem = ({ item }) => {
    const isMyEvent = myEvents.some((event) => event._id === item.eventId);
  
    return (
      <TouchableOpacity style={styles.itemContainer}>
        <View style={styles.itemBox}>
          <Image style={styles.itemImage} source={getAvatarImage(item.user.sex)} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{`${item.user.firstName} ${item.user.lastName}`}</Text>
            <Text>{`Event ID: ${item.eventId}`}</Text>
            <Text>{`User ID: ${item.userId}`}</Text>
            <Text>{`Status: ${item.status}`}</Text>
            {item.user && (
              <View style={styles.userInfo}>
                <Text>{`User Email: ${item.user.email}`}</Text>
                <Text>{`User Phone Number: ${item.user.phoneNumber}`}</Text>
                <Text>{`User Favorite Sport: ${item.user.favoriteSport}`}</Text>
              </View>
            )}
            <View style={styles.itemRow}>
              <TouchableOpacity
                style={[
                  styles.itemIconContainer,
                  { backgroundColor: item.status === 'Accepted' ? 'lightgreen' : 'white' },
                ]}
                onPress={() => handleAccept(item.eventId, item.userId)}
                disabled={item.status === 'Accepted' || item.status === 'Refused'}
              >
                <Image style={styles.itemIcon} source={require('./like-svgrepo-com.png')} />
                <Text style={styles.itemIconText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.itemIconContainer,
                  { backgroundColor: item.status === 'Refused' ? 'lightcoral' : 'white' },
                ]}
                onPress={() => handleRefuse(item.eventId, item.userId)}
                disabled={item.status === 'Accepted' || item.status === 'Refused'}
              >
                <Image style={styles.itemIcon} source={require('./dislike-svgrepo-com.png')} />
                <Text style={styles.itemIconText}>Refuse</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
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
  itemContainer: {
    marginVertical: 10,
  },
  itemBox: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 10,
    borderRadius: 5,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 1,
      width: -2,
    },
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'column',
  },
  itemName: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
  },
  userInfo: {
    marginVertical: 5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  itemIconContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'gray',
  },
  itemIcon: {
    width: 30,
    height: 30,
  },
  itemIconText: {
    color: 'gray',
  },
  
});

export default RequestsList;
