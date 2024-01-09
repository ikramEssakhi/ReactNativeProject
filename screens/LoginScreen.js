// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert,Image } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  
  const handleLogin = async () => {
    try {
      const response = await fetch('http://172.17.36.23:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const result = await response.json();
        // Display success message or user data
        Alert.alert('Success', result.message);
        // Navigate to the "Home" screen
        navigation.navigate('Home');
      } else {
        // Display error message
        const result = await response.json();
        Alert.alert('Login Failed mot de pass false', result.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred during login.');
    }
  };

  return (
    <View style={styles.container}>
         <Image
        source={require('./logo3.gif')} // Replace 'path_to_your_image.jpg' with the actual path to your image
        style={styles.image}
      />
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
<Button title="Login" onPress={handleLogin} color="black" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width:130
  },
  image: {
    width: '50%', // Use '100%' for full width
    height: 220, // Adjust the height based on your design
    resizeMode: 'cover', // or 'contain' based on your preference
    marginBottom: 60,
    marginLeft: 100
  },
});

export default LoginScreen;
