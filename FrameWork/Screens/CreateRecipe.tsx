import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, Image, Modal, Alert, TouchableOpacity, ScrollView, SafeAreaView
} from 'react-native';
import { Button } from 'react-native-paper';
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query as firestoreQuery, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../Services/Firebase.client';
import { ThemeContext } from '../Context/ThemeContext';
import { useDispatch } from 'react-redux';
import { hidePreloader, showPreloader } from '../Redux/preloaderSlice';
import { SimpleLineIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import { updateDoc } from 'firebase/firestore';
import * as Animatable from 'react-native-animatable';
import { where } from 'firebase/firestore';



interface Recipe {
  id: string;
  title: string;
  image: string;
  instructions: string;
  ingredients: string;
  summary: string;
  createdBy: any;
  source: string;
  readyInMinutes: number;
}

const CreateRecipe = () => {
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  


  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
  
    const q = firestoreQuery(
      collection(db, 'recipes'),
      where('createdBy.uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userRecipes: Recipe[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            image: data.imageUrl,
            instructions: data.instructions,
            ingredients: data.ingredients,
            summary: data.summary,
            createdBy: data.createdBy,
            source: 'user',
            readyInMinutes: data.readyInMinutes || 30,
          };
        });
  
        setRecipes(userRecipes);
      },
      (error) => {
        console.error(error);
        Alert.alert('Error', 'Unable to load recipes from Firebase.');
      }
    );
  
    return () => unsubscribe();
  }, []);
  

  const handleSubmit = async () => {
    const user = auth.currentUser;
    dispatch(showPreloader());
  
    if (!user) {
      dispatch(hidePreloader());
      Alert.alert('Authentication Error', 'User not logged in');
      return;
    }
  
    try {
      if (isEditing && editId) {
        await updateDoc(doc(db, 'recipes', editId), {
          title,
          summary,
          imageUrl,
          ingredients,
          instructions,
          updatedAt: serverTimestamp(),
        });
        Alert.alert('Success', 'Recipe updated successfully!');
      } else {
        await addDoc(collection(db, 'recipes'), {
          title,
          summary,
          imageUrl,
          ingredients,
          instructions,
          source: 'firebase',
          createdBy: {
            uid: user.uid,
            displayName: user.displayName || 'Anonymous',
          },
          createdAt: serverTimestamp(),
        });
        Alert.alert('Success', 'Recipe uploaded successfully!');
      }
  
      setTitle('');
      setSummary('');
      setImageUrl('');
      setIngredients('');
      setInstructions('');
      setEditId(null);
      setIsEditing(false);
      setModalVisible(false);
      dispatch(hidePreloader());
    } catch (error) {
      console.error('Error saving recipe:', error);
      dispatch(hidePreloader());
      Alert.alert('Error', 'Something went wrong while saving the recipe');
    }
  };
  

  const handleDelete = async (id: string) => {
    dispatch(showPreloader());
    try {
      await deleteDoc(doc(db, 'recipes', id));
      Alert.alert('Deleted', 'Recipe deleted successfully');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      Alert.alert('Error', 'Failed to delete recipe');
    } finally {
      dispatch(hidePreloader());
    }
  };
  

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <View style={{
      backgroundColor: theme === 'dark' ? '#343434' : '#fff',
      margin: 10,
      padding: 15,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      elevation: 4
    }}>
      <Image source={{ uri: item.image }} style={{ width: '100%', height: 200, borderRadius: 10 }} resizeMode="cover" />
      <Text style={{ color: theme === 'dark' ? '#fff' : '#000', fontWeight: 'bold', marginTop: 10 }}>{item.title}</Text>
      <Text style={{ color: '#999' }}>{item.summary}</Text>

      <View style={{  marginTop: 10, gap: 10 }} className='flex flex-row items-center'>
        
        <TouchableOpacity className='flex flex-row items-center bg-[#0b883b] p-2 gap-2 rounded-lg'
          onPress={() => {
          setIsEditing(true);
          setEditId(item.id);
          setTitle(item.title);
          setSummary(item.summary);
          setImageUrl(item.image);
          setIngredients(item.ingredients);
          setInstructions(item.instructions);
          setModalVisible(true);
        }}>
          <Text className='text-white font-soraBold'>Edit</Text>
          <Feather name="edit" size={15} color="white" />
        </TouchableOpacity>

        {/* <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <AntDesign name="delete" size={24} color="#E94E1B" />
        </TouchableOpacity> */}

        <TouchableOpacity
          onPress={() => {
            setSelectedId(item.id);
            setDeleteModalVisible(true);
          }}
        >
          <AntDesign name="delete" size={24} color="#E94E1B" />
        </TouchableOpacity>

        
      </View>
      <Modal
          transparent
          animationType="fade"
          visible={deleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <View style={{
              backgroundColor: theme === 'dark' ? '#222' : '#fff',
              padding: 20,
              borderRadius: 10,
              width: '80%',
              alignItems: 'center'
            }}>
              <Text className='font-soraBold mb-3 text-center' style={{color:theme === 'dark' ? '#fff' : '#000'}}>
                Are you sure you want to delete this recipe?
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                <TouchableOpacity
                  onPress={() => {
                    if (selectedId) handleDelete(selectedId);
                    setDeleteModalVisible(false);
                  }}
                  style={{
                    backgroundColor: '#E94E1B',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 5,
                  }}
                >
                  <Text className='font-soraBold text-sm text-white'>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setDeleteModalVisible(false)}
                  style={{
                    backgroundColor: '#aaa',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 5,
                  }}
                >
                  <Text className='font-soraBold text-sm'>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#000' : '#E94E1B' }}>

        <Animatable.View animation="pulse" iterationCount="infinite">
          <TouchableOpacity className='mt-10 flex flex-row gap-2 justify-center items-center bg-white py-2 mx-20 rounded-lg mb-5'
            onPress={() => setModalVisible(true)}>
          <Text className='text-green-700 font-soraBold'>
            Create Recipe
          </Text>
          <SimpleLineIcons name="plus" size={20} color="green" />
          </TouchableOpacity>
        </Animatable.View>
        {
          recipes.length === 0 ? (
            <View style={{}} className='flex-1 justify-center '>
              <Text style={{
                color: theme === 'dark' ? '#000' : '#fff',
                textAlign: 'center',
                paddingHorizontal: 20
              }} className='font-soraBold'>
                You have no personal recipes yet. Please Create Your Recipe .
              </Text>
            </View>
          ) : (
            <FlatList
              data={recipes}
              keyExtractor={(item) => item.id}
              renderItem={renderRecipe}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          )
        }

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#000' : '#E94E1B', }} >
          <View
            style={{
              marginHorizontal: 20,
              backgroundColor: theme === 'dark' ? '#343434' : '#fff',
              borderRadius: 10,
              padding: 20,
              elevation: 5,
            }} className='mt-24'
          >
            <Text style={{ color: theme === 'dark' ? '#fff' : '#000', fontWeight: 'bold' }}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Recipe Title"
              placeholderTextColor={theme === 'dark' ? '#999' : '#888'}
              style={{
                borderWidth: 1,
                marginBottom: 12,
                padding: 8,
                color: theme === 'dark' ? '#fff' : '#000', 
                borderColor: theme === 'dark' ? '#555' : '#ccc',
                backgroundColor: theme === 'dark' ? '#222' : '#fff',
              }}
            />
            <Text style={{ color: theme === 'dark' ? '#fff' : '#000', fontWeight: 'bold' }}>Summary</Text>
            <TextInput 
              value={summary}  
              onChangeText={setSummary} 
              placeholder="Recipe Summary" 
              placeholderTextColor={theme === 'dark' ? '#999' : '#888'}
              style={{
                borderWidth: 1,
                marginBottom: 12,
                padding: 8,
                color: theme === 'dark' ? '#fff' : '#000', 
                borderColor: theme === 'dark' ? '#555' : '#ccc',
                backgroundColor: theme === 'dark' ? '#222' : '#fff',
              }}
            />

            <Text style={{ color: theme === 'dark' ? '#fff' : '#000', fontWeight: 'bold' }}>Image URL</Text>
            <TextInput 
              value={imageUrl} 
              onChangeText={setImageUrl} 
              placeholder="https://..." 
              placeholderTextColor={theme === 'dark' ? '#999' : '#888'}
              style={{
                borderWidth: 1,
                marginBottom: 12,
                padding: 8,
                color: theme === 'dark' ? '#fff' : '#000', 
                borderColor: theme === 'dark' ? '#555' : '#ccc',
                backgroundColor: theme === 'dark' ? '#222' : '#fff',
              }}
            />

            <Text style={{ color: theme === 'dark' ? '#fff' : '#000', fontWeight: 'bold' }}>Ingredients</Text>
            <TextInput 
            value={ingredients} 
            onChangeText={setIngredients} 
            placeholder="List ingredients" 
            placeholderTextColor={theme === 'dark' ? '#999' : '#888'}
            multiline 
            style={{
              borderWidth: 1,
              marginBottom: 12,
              padding: 8,
              color: theme === 'dark' ? '#fff' : '#000', 
              borderColor: theme === 'dark' ? '#555' : '#ccc',
              backgroundColor: theme === 'dark' ? '#222' : '#fff',
            }}
          />

            <Text style={{ color: theme === 'dark' ? '#fff' : '#000', fontWeight: 'bold' }}>Instructions</Text>
            <TextInput 
              value={instructions} 
              onChangeText={setInstructions} 
              placeholder="Instructions" 
              placeholderTextColor={theme === 'dark' ? '#999' : '#888'}
              multiline 
              style={{
                borderWidth: 1,
                marginBottom: 12,
                padding: 8,
                color: theme === 'dark' ? '#fff' : '#000', 
                borderColor: theme === 'dark' ? '#555' : '#ccc',
                backgroundColor: theme === 'dark' ? '#222' : '#fff',
              }}
            />

            <Button mode="contained" onPress={handleSubmit} buttonColor="#E94E1B">
              Submit Recipe
            </Button>

            <Button
              mode="text"
              onPress={() => {
                setModalVisible(false);
                setIsEditing(false);
                setEditId(null);
                setTitle('');
                setSummary('');
                setImageUrl('');
                setIngredients('');
                setInstructions('');
              }}
              textColor="#E94E1B"
              style={{ marginTop: 10 }}
            >
              Cancel
            </Button>

          </View>
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
};

export default CreateRecipe;
