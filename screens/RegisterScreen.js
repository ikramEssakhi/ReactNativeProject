import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { ScrollView, View, Text, TextInput, Button, StyleSheet, Image, Alert } from 'react-native';

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sex, setSex] = useState('');
  const [favoriteSport, setFavoriteSport] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    try {
      const response = await fetch('http://172.17.36.23:3001/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          email,
          firstName,
          lastName,
          phoneNumber,
          sex,
          favoriteSport,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Registration successful:', result);
        Alert.alert('Registration successful', result.message);

        // Handle successful registration, e.g., navigate to another screen
      } else {
        console.error('Registration failed:', result.message);
        // Handle registration failure, e.g., display an error message
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Handle network or other errors
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('./logo3.gif')} style={styles.image} />
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="numeric"
      />
    
      <View style={styles.row}>
        <Picker
          selectedValue={sex}
          onValueChange={(itemValue, itemIndex) => setSex(itemValue)}
          dropdownIconColor="orange"
          style={styles.picker}
        >
          <Picker.Item label="Sexe" value="" style={styles.pickerItem} />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Male" value="male" />
        </Picker>

        <Picker
          selectedValue={favoriteSport}
          onValueChange={(itemValue, itemIndex) => setFavoriteSport(itemValue)}
          style={styles.picker}
          dropdownIconColor="orange"
        >
          <Picker.Item label="Favorite Sport" value="" style={styles.pickerItem} />
          <Picker.Item label="Football" value="football" />
          <Picker.Item label="Basketball" value="basketball" />
          <Picker.Item label="Volleyball" value="volleyball" />
          <Picker.Item label="Cycling" value="cycling" />
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button title="Register" onPress={handleRegister} color="black" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  image: {
    width: '50%',
    height: 220,
    resizeMode: 'cover',
    marginBottom: 60,
    marginLeft: 100,
  },
  picker: {
    height: 30,
    marginBottom: 5,
    marginLeft: -15,
    width: 200,
    fontWeight: '100',
    fontSize: 12,
  },
  pickerItem: {
    color: 'gray',
  },
});

export default RegisterScreen;
