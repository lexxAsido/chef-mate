import React, { useContext, useState } from 'react';
import { View, TextInput, Text, ScrollView, Alert, SafeAreaView } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../Services/Firebase.client';
import { ThemeContext } from '../Context/ThemeContext';
import { hidePreloader, showPreloader } from '../Redux/preloaderSlice';
import { useDispatch } from 'react-redux';
import { Button } from 'react-native-paper';



interface CreateRecipeProps {
  navigation: any;
}

const CreateRecipe: React.FC<CreateRecipeProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
   const { theme } = useContext(ThemeContext);
   const dispatch = useDispatch();

   const handleSubmit = async () => {
    const user = auth.currentUser;
    dispatch(showPreloader());
  
    if (!user) {
      dispatch(hidePreloader());
      Alert.alert('Authentication Error', 'User not logged in');
      return;
    }
  
    try {
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
       
      setTitle('');
      setImageUrl('');
      setIngredients('');
      setInstructions('');

      dispatch(hidePreloader());
      Alert.alert('Success', 'Recipe uploaded successfully!');
      navigation.navigate("Home"); 
    } catch (error) {
      console.error('Error adding recipe:', error);
      dispatch(hidePreloader()); 
      Alert.alert('Error', 'Something went wrong while uploading the recipe');
    }
  };
  

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#000' : '#E94E1B' }}>

        <View className='mx-5 rounded-lg mt-20 '
            style={{backgroundColor: theme === 'dark' ? '#343434' : '#fff',
            shadowColor: '#fff',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 10, padding:24}}>
            <Text className='font-soraBold text-md mb-2' style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Title:</Text>
            <TextInput
                placeholder="Recipe Title"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={theme === 'dark' ? '#999' : '#000'}
                style={{ borderWidth: 1, marginBottom: 12, padding: 8, color: "#999" }}
                />

            <Text className='font-soraBold text-md mb-2' style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Summary:</Text>
            <TextInput
                placeholder="Recipe Summary"
                value={summary}
                onChangeText={setSummary}
                placeholderTextColor={theme === 'dark' ? '#999' : '#000'}
                style={{ borderWidth: 1, marginBottom: 12, padding: 8, color: "#999" }}
                />

            <Text className='font-soraBold text-md mb-2' style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Image URL:</Text>
            <TextInput
                placeholder="https://your-image-link-url.jpg"
                value={imageUrl}
                onChangeText={setImageUrl}
                style={{ borderWidth: 1, marginBottom: 12, padding: 8, color: "#999" }}
                placeholderTextColor={theme === 'dark' ? '#999' : '#000'}
            />

                <Text className='font-soraBold text-md mb-2' style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Ingredients: (one per line)</Text>
                <TextInput
                    placeholder="tomatoes"
                    value={ingredients}
                    onChangeText={setIngredients}
                    multiline
                    numberOfLines={5}
                    placeholderTextColor={theme === 'dark' ? '#999' : '#000'}
                    style={{ borderWidth: 1, marginBottom: 12, padding: 8, color: "#999" }}
                    />


            <Text className='font-soraBold text-md mb-2' style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Instructions:</Text>
            <TextInput
                placeholder="Step-by-step instructions"
                value={instructions}
                onChangeText={setInstructions}
                multiline
                numberOfLines={5}
                placeholderTextColor={theme === 'dark' ? '#999' : '#000'}
                style={{ borderWidth: 1, marginBottom: 20, padding: 8 , color: "#999"}}
                />

            <Button mode='contained' onPress={handleSubmit} buttonColor='#E94E1B' style={{}}>
              Submit Recipes
            </Button>
        </View>
    </ScrollView>
  );
};

export default CreateRecipe;
