import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user details when the component mounts
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      // Get the user email from AsyncStorage
      const userEmailString = await AsyncStorage.getItem('user');
      
      // Parse the JSON string to extract the email
      const userEmailObject = JSON.parse(userEmailString);
      const userEmail = userEmailObject.email;
  
      console.log('User Email:', userEmail);
  
      // Fetch user details based on the email
      const response = await fetch(`http://192.168.137.250:3001/getUser/${userEmail}`);
      const userData = await response.json();
  
      if (response.ok) {
        setUser(userData);
      } else {
        console.error('Failed to fetch user details:', userData.message);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };
  
  
  if (!user) {
    // Render loading or placeholder while user data is being fetched
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }


  // Determine the avatar source based on the user's gender (assuming user has a 'sex' property)
  const avatarSource = user.sex === 'male'
    ? require('./male-avatar-boy-face-man-user-9-svgrepo-com.png')
    : require('./female-avatar-girl-face-woman-user-2-svgrepo-com.png');

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image
          source={avatarSource}
          style={styles.avatar}
        />
        <Text style={styles.name}>{`${user.firstName} ${user.lastName}`}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Email:</Text>
        <Text style={styles.infoValue}>{user.email}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Phone Number:</Text>
        <Text style={styles.infoValue}>{user.phoneNumber}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Favorite Sport:</Text>
        <Text style={styles.infoValue}>{user.favoriteSport}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Competences Level:</Text>
        <Text style={styles.infoValue}>{user.competence}%</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>About:</Text>
        <Text style={styles.infoValue}>{user.about}</Text>
      </View>
      
      {/* Add more user details as needed */}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  infoContainer: {
    marginTop: 20,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  infoValue: {
    marginTop: 5,
  },
});

export default ProfileScreen;
