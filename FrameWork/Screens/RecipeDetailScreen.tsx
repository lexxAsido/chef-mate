import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { getRecipeDetails, getRecipeInformation, RecipeDetails } from '../Services/Spoonacular';
import { readOutLoud, stopSpeaking } from '../Utils/speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { getFirestore, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/stack';
import { ThemeContext } from '../Context/ThemeContext';

const db = getFirestore();

type RecipeDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'RecipeDetailScreen'>;

const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({ route, navigation }) => {
  
  const { recipe: passedRecipe } = route.params;



  const [loading, setLoading] = useState(passedRecipe?.source === 'firebase' ? false : true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const { theme } = useContext(ThemeContext);
  
  const isValidRecipe = (obj: any): obj is RecipeDetails => {
    return obj && typeof obj.id !== 'undefined' && Array.isArray(obj.ingredients);
  };
  
  const [recipe, setRecipe] = useState<RecipeDetails | null>(
    passedRecipe?.source === 'firebase' && isValidRecipe(passedRecipe) ? passedRecipe : null
  );
  

  useEffect(() => {
    if (!passedRecipe || passedRecipe.source !== 'firebase') {
      fetchRecipe();
    }
    checkIfFavorite();
    return () => stopSpeaking();
  }, []);

  const fetchRecipe = async () => {
    setLoading(true);
    try {
      let recipeId = passedRecipe?.id;
  
      // Convert to number if it's a string
      if (typeof recipeId === 'string') {
        recipeId = parseInt(recipeId, 10);
      }
  
      console.log("recipeId:", recipeId);
  
      if (!recipeId || isNaN(recipeId)) {
        throw new Error('Invalid recipe ID');
      }
  
      const data = await getRecipeInformation(recipeId); // now it's guaranteed to be a number
  
      const recipeWithIngredients: RecipeDetails = {
        ...data,
        extendedIngredients: data.extendedIngredients || [],
      };
  
      setRecipe(recipeWithIngredients);
    } catch (err) {
      console.error(err);
      setError('Failed to load recipe details.');
    } finally {
      setLoading(false);
    }
  };
  
  
  
  
  

  const stripHtml = (html: string) => html.replace(/<\/?[^>]+(>|$)/g, '');

  const handleSpeakInstructions = () => {
    if (recipe?.instructions) {
      const text = stripHtml(recipe.instructions);
      readOutLoud(text);
    } else {
      Alert.alert('No instructions available to read.');
    }
  };

  const handleAddToFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
      
      // Ensure recipe?.id is a number
      const recipeId = typeof recipe?.id === 'string' ? parseInt(recipe?.id, 10) : recipe?.id;
  
      const existing = favorites.find((fav: any) => fav.id === recipeId);
  
      const newFavorite = {
        id: recipeId,
        title: recipe?.title,
        image: recipe?.image,
        summary: recipe?.summary,
        source: passedRecipe?.source || 'api',
      };
  
      if (existing) {
        const updatedFavorites = favorites.filter((fav: any) => fav.id !== recipeId);
        await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        setIsFavorite(false);
        Alert.alert('Removed from favorites');
        await removeFavoriteFromFirestore(recipeId);
      } else {
        await AsyncStorage.setItem('favorites', JSON.stringify([...favorites, newFavorite]));
        setIsFavorite(true);
        Alert.alert('Added to favorites!');
        await saveFavoriteToFirestore(newFavorite);
      }
    } catch (error) {
      console.error('Error managing favorites', error);
    }
  };
  

  const saveFavoriteToFirestore = async (favorite: any) => {
    try {
      const user = getAuth().currentUser;
      if (!user) return;
      const userId = user.uid;
      await setDoc(doc(db, 'users', userId, 'favorites', favorite.id.toString()), favorite);
    } catch (error) {
      console.error('Error saving favorite to Firestore:', error);
    }
  };

  const removeFavoriteFromFirestore = async (recipeId: number | undefined) => {
    try {
      const user = getAuth().currentUser;
      if (!user || !recipeId) return;
      const userId = user.uid;
      await deleteDoc(doc(db, 'users', userId, 'favorites', recipeId.toString()));
    } catch (error) {
      console.error('Error removing favorite from Firestore:', error);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
  
      const recipeId = recipe?.id || passedRecipe?.id;
      const exists = favorites.find((fav: any) => fav.id === recipeId);
  
      setIsFavorite(!!exists);
    } catch (error) {
      console.error('Error checking favorites', error);
    }
  };
  

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme === 'dark' ? '#000' : '#fff',
        paddingHorizontal: 16,
        padding: Platform.OS === 'ios' ? 32 : 16,
      }}
    >
      <TouchableOpacity
        className="flex flex-row my-5 gap-3 items-center"
        onPress={() => navigation.goBack()}
      >
        <FontAwesome5
          name="arrow-left"
          size={12}
          color="black"
          style={{
            backgroundColor: theme === 'dark' ? '#E94E1B' : '#fff',
            padding: 3,
            borderRadius: 3,
          }}
        />
        <Text className="font-soraBold text-lg" style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
          Recipe Details
        </Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#E94E1B" />
      ) : error ? (
        <Text style={{ color: 'red', fontSize: 16 }}>{error}</Text>
      ) : recipe ? (
        <View>
          <Image
            source={{ uri: recipe.image }}
            style={{ width: '100%', height: 200, borderRadius: 10 }}
            resizeMode="cover"
          />
          <Text style={{ color: theme === 'dark' ? '#E94E1B' : '#000' }} className="text-lg font-soraBold mt-7">
            {recipe.title}
          </Text>

          <Text style={{ marginTop: 16, fontSize: 14, color: theme === 'dark' ? '#fff' : '#000' }}>
            {stripHtml(recipe.summary)}
          </Text>

          <Text
            style={{ marginTop: 24, marginBottom: 8, color: theme === 'dark' ? '#E94E1B' : '#000' }}
            className="font-soraBold text-lg"
          >
            Ingredients
          </Text>
          {recipe.extendedIngredients?.map((ing, index) => (
            <Text key={index} style={{ fontSize: 14, marginBottom: 4, color: theme === 'dark' ? '#fff' : '#000' }}>
              • {ing.original}
            </Text>
          ))}

          <Text
            style={{ marginTop: 24, marginBottom: 8, color: theme === 'dark' ? '#E94E1B' : '#000' }}
            className="font-soraBold text-lg"
          >
            Instructions
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 22, color: theme === 'dark' ? '#fff' : '#000' }}>
            {stripHtml(recipe.instructions || 'No instructions provided.')}
          </Text>

          <View style={{ flexDirection: 'row', marginTop: 12, marginBottom: 28 }}>
            <TouchableOpacity
              onPress={handleAddToFavorites}
              style={{
                backgroundColor: isFavorite ? '#ff6666' : '#E94E1B',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                marginRight: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color="#fff" />
              <Text style={{ color: '#fff', marginLeft: 8, fontWeight: 'bold' }}>
                {isFavorite ? 'Remove' : 'Favorite'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSpeakInstructions}
              style={{
                backgroundColor: 'green',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="volume-high-outline" size={20} color="#fff" />
              <Text style={{ color: '#fff', marginLeft: 8, fontWeight: 'bold' }}>Read Aloud</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
};

export default RecipeDetailScreen;
