import React, { useContext, useEffect, useState } from 'react';
import {View,Text,TextInput,Image,TouchableOpacity,ActivityIndicator,FlatList,Platform,} from 'react-native';
import { searchRecipes, Recipe } from '../Services/Spoonacular';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/stack';
import Favorite from './Favorite';
import Profile from './Profile';
import { ThemeContext } from '../Context/ThemeContext';
import CreateRecipe from './CreateRecipe';
import { db } from '../Services/Firebase.client';
import { collection, onSnapshot, query as firestoreQuery, orderBy, DocumentData } from 'firebase/firestore';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HomeScreen'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const Home: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useContext(ThemeContext);
  const [firebaseRecipes, setFirebaseRecipes] = useState<Recipe[]>([]);
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);

  useEffect(() => {
    fetchInitialRecipes();
  }, []);

  const fetchInitialRecipes = async () => {
    setLoading(true);
    try {
      const results = await searchRecipes('popular');
      setRecipes(results);
    } catch (err) {
      console.error(err);
      setError('Unable to load recipes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = firestoreQuery(collection(db, 'recipes'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userRecipes: Recipe[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          title: data.title,
          image: data.imageUrl,
          instructions: data.instructions,
          ingredients: data.ingredients,
          summary:data.summary,
          createdBy: data.createdBy,
          source: 'user',
          readyInMinutes: data.readyInMinutes || 30,
        };
      });

      setFirebaseRecipes(userRecipes);
    }, (error) => {
      console.error(error);
      setError('Unable to load recipes from Firebase.');
    });

    return () => unsubscribe(); // Cleanup
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');
    try {
      const results = await searchRecipes(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => {
    const plainSummary = item.summary?.replace(/<\/?[^>]+(>|$)/g, '') || '';
    const shortSummary = plainSummary.length > 100 ? plainSummary.slice(0, 100) + '...' : plainSummary;

    return (
      // onPress={() => navigation.navigate('RecipeDetailScreen', { id: item.id })}
      <TouchableOpacity
    onPress={() => {
    const recipeDetails: Recipe = {
      id: item.id,
      title: item.title,
      image: item.image,
      readyInMinutes: item.readyInMinutes,
      summary: item.summary || 'No summary available',
      ingredients: item.ingredients || [],
      source: item.source || 'api',
    };

    navigation.navigate('RecipeDetailScreen', { recipe: recipeDetails });
  }}
  style={{
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: theme === 'dark' ? '#343434' : '#f8f8f8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  }}
>
  <Image
    source={{ uri: item.image }}
    style={{ width: '100%', height: 160, borderRadius: 8 }}
    resizeMode="cover"
  />
  <Text
    style={{
      marginTop: 8,
      color: theme === 'dark' ? '#E94E1B' : '#000',
    }}
    className="text-lg font-soraBold mb-3"
  >
    {item.title}
  </Text>
  <Text style={{ color: theme === 'dark' ? '#fff' : '#000', marginBottom: 4 }} className="text-sm font-sora">
    Ready in {item.readyInMinutes ?? 'N/A'} mins
  </Text>
  {shortSummary && (
    <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }} className="text-sm font-sora">
      {shortSummary}
    </Text>
  )}
</TouchableOpacity>


    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme === 'dark' ? '#000' : '#fff',
        paddingHorizontal: 16,
      }}
    >
      <Text
        className="text-2xl font-soraBold text-center mb-3"
        style={{ marginTop: Platform.OS === 'ios' ? 36 : 28, color: theme === 'dark' ? '#fff' : '#000' }}
      >
        Discover Recipes
      </Text>

      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TextInput
          placeholder="Search by ingredient or cuisine..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme === 'dark' ? '#aaa' : '#000'}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            color: theme === 'dark' ? '#fff' : '#000',
          }}
        />
        <TouchableOpacity
          onPress={handleSearch}
          style={{
            marginLeft: 8,
            backgroundColor: '#E94E1B',
            paddingHorizontal: 16,
            justifyContent: 'center',
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#E94E1B" />}
      {error && <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>}

      <FlatList
        data={searchResults.length > 0 ? searchResults : firebaseRecipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRecipeCard}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

// --- BOTTOM TABS ---
const Tab = createBottomTabNavigator();

export function HomeScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Favorite') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'CreateRecipe') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          }

          return <Ionicons name={iconName} size={focused ? 28 : 23} color={color} />;
        },
        tabBarActiveTintColor: '#E94E1B',
        tabBarInactiveTintColor: 'green',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Favorite" component={Favorite} options={{ title: 'Favorites' }} />
      <Tab.Screen name="CreateRecipe" component={CreateRecipe} options={{ title: 'Add Recipe' }} />
      <Tab.Screen name="Profile" component={Profile} options={{ title: 'Account' }} />
    </Tab.Navigator>
  );
}
