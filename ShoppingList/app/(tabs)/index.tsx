import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ShoppingList = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // Load items when component mounts
  useEffect(() => {
    loadItems();
  }, []);

  // Load items from AsyncStorage
  const loadItems = async () => {
    try {
      const savedItems = await AsyncStorage.getItem('shoppingItems');
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load items');
    }
  };

  // Save items to AsyncStorage
  const saveItems = async (newItems) => {
    try {
      await AsyncStorage.setItem('shoppingItems', JSON.stringify(newItems));
    } catch (error) {
      Alert.alert('Error', 'Failed to save items');
    }
  };

  // Add new item
  const handleAddItem = async () => {
    if (!newItem.trim()) {
      Alert.alert('Error', 'Please enter an item');
      return;
    }

    const newItemObject = {
      id: Date.now().toString(),
      text: newItem.trim()
    };

    const updatedItems = [...items, newItemObject];
    setItems(updatedItems);
    await saveItems(updatedItems);
    setNewItem('');
  };

  // Delete item
  const handleDeleteItem = async (id) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            const updatedItems = items.filter(item => item.id !== id);
            setItems(updatedItems);
            await saveItems(updatedItems);
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Start editing
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  // Save edit
  const handleSaveEdit = async (id) => {
    if (!editText.trim()) {
      Alert.alert('Error', 'Item cannot be empty');
      return;
    }

    const updatedItems = items.map(item =>
      item.id === id ? { ...item, text: editText.trim() } : item
    );
    setItems(updatedItems);
    await saveItems(updatedItems);
    setEditingId(null);
    setEditText('');
  };

  // Render item
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      {editingId === item.id ? (
        // Edit mode
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editText}
            onChangeText={setEditText}
            autoFocus
          />
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={() => handleSaveEdit(item.id)}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Display mode
        <View style={styles.itemContainer}>
          <Text style={styles.itemText}>{item.text}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => handleStartEdit(item)}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() => handleDeleteItem(item.id)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
      <Text style={styles.title}>Shopping List</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Add new item..."
          onSubmitEditing={handleAddItem}
        />
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={handleAddItem}
        >
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#212529',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  list: {
    flex: 1,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#0d6efd',
  },
  editButton: {
    backgroundColor: '#ffc107',
  },
  saveButton: {
    backgroundColor: '#198754',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ShoppingList;