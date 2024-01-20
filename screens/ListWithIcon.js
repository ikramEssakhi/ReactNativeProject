import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Image, Text, Alert } from 'react-native';

const ListWithIcon = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

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

  const getAvatarImage = (sex) => {
    return sex === 'male'
      ? require('./male-avatar-boy-face-man-user-9-svgrepo-com.png')
      : require('./female-avatar-girl-face-woman-user-2-svgrepo-com.png');
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

  return (
    <FlatList
      style={styles.container}
      enableEmptySections={true}
      data={requests}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => {
        return (
          <TouchableOpacity>
            <View style={styles.box}>
              <Image style={styles.image} source={getAvatarImage(item.user.sex)} />
              <View style={styles.info}>
                <Text style={styles.name}>{`${item.user.firstName} ${item.user.lastName}`}</Text>
                <Text>{`Event ID: ${item.eventId}`}</Text>
                <Text>{`User ID: ${item.userId}`}</Text>
                <Text>{`Status: ${item.status}`}</Text>

                <View style={styles.row}>
                  <View style={styles.iconContainer}>
                    <TouchableOpacity onPress={() => handleAccept(item.eventId, item.userId)}>
                      <Image
                        style={styles.icon}
                        source={require('./like-svgrepo-com.png')}
                      />
                    </TouchableOpacity>
                    <Text style={styles.iconFonts}>Accept</Text>
                  </View>

                  <View style={styles.iconContainer}>
                    <TouchableOpacity onPress={() => handleRefuse(item.eventId, item.userId)}>
                      <Image
                        style={styles.icon}
                        source={require('./dislike-svgrepo-com.png')}
                      />
                      <Text style={styles.iconFonts}>Refuse</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    paddingTop: 50,
  },
  icon: {
    width: 30,
    height: 30,
  },
  image: {
    width: 100,
    height: 100,
  },
  box: {
    marginTop: 10,
    marginHorizontal: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 1,
      width: -2,
    },
    elevation: 2,
  },
  info: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    marginTop: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 40,
    marginTop: 10,
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
  },
  iconFonts: {
    color: 'gray',
  },
  red: {
    color: '#FF4500',
  },
});

export default ListWithIcon;
