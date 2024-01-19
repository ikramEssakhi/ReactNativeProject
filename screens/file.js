import React from 'react'
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native'

const items = [
  {
    id: 1,
    name: 'Apples',
    price: 0.99,
    image: 'https://www.bootdey.com/image/280x280/FF00FF/000000',
  },
  {
    id: 2,
    name: 'Bananas',
    price: 0.79,
    image: 'https://www.bootdey.com/image/280x280/00BFFF/000000',
  },
  {
    id: 3,
    name: 'Bread',
    price: 2.99,
    image: 'https://www.bootdey.com/image/280x280/20B2AA/000000',
  },
]

const Requests = () => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://www.bootdey.com/image/280x280/ffb3ff/000000' }} style={styles.backgroundImage} />
      <Text style={styles.title}>Grocery List</Text>
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.item}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Add to Cart</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Add to Wishlist</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 20,
    color: '#fff',
    marginHorizontal:20,
  },
  card: {
    marginHorizontal:20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 20,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 16,
    color: '#999',
  },
  buttons: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#FFC107',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default Requests