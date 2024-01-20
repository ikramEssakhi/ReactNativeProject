import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { ScrollView, View, Text, TextInput, Button, StyleSheet, Image, Alert} from 'react-native';
import { Slider } from 'react-native-elements';
const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sex, setSex] = useState('');
  const [favoriteSport, setFavoriteSport] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [competence, setCompetence] = useState(50); // Initial competence level
  const [about, setAbout] = useState('');

  const handleRegister = async () => {
    try {
      const response = await fetch('http://192.168.137.250:3001/register', {
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
          competence,
          about,
          

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
   {/* Slider for Competence Level */}
   <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Competence Level:</Text>
        <Slider
          style={styles.slider}
          value={competence}
          minimumValue={0}
          maximumValue={100}
          thumbTintColor="orange" 
  minimumTrackTintColor="orange" 
  thumbStyle={{ width: 10, height: 10 }}

          onValueChange={(value) => setCompetence(value)}
        />
        <Text>{Math.round(competence)}%</Text>
      </View>
      <TextInput
        style={styles.textarea}
        placeholder="Tell us about yourself..."
        multiline={true}
        numberOfLines={4}
        value={about}
        onChangeText={setAbout}
      />
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
  sliderContainer: {
    marginVertical: 20,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
    // Reduce the size of the slider handle (thumb)
    thumbStyle: {
      width: 5,
      height: 5,
      borderRadius: 10,
    },
  },
  textarea: {
    height: 80, // You can adjust the height as needed
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
});

export default RegisterScreen;
