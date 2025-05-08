import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { showPreloader, hidePreloader } from '../Redux/preloaderSlice';
import { db } from '../Services/Firebase.client';
import { getAuth } from 'firebase/auth';
import { ThemeContext } from '../Context/ThemeContext';



interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  summary?: string;
  ingredients?:string;
  source?: string
}

const Favorite = () => {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    dispatch(showPreloader());

    const user = getAuth().currentUser;
    if (!user) {
      console.error('User not authenticated');
      dispatch(hidePreloader());
      return;
    }

    const favoritesRef = collection(db, 'users', user.uid, 'favorites');
    console.log('Listening to favorites from path:', `users/${user.uid}/favorites`);

    const unsubscribe = onSnapshot(
      favoritesRef,
      (snapshot) => {
        const fetchedFavorites: Recipe[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedFavorites.push({
            id: data.id,
            title: data.title,
            image: data.image,
            readyInMinutes: data.readyInMinutes,
          });
        });

        setFavorites(fetchedFavorites);
        AsyncStorage.setItem('favorites', JSON.stringify(fetchedFavorites));
        dispatch(hidePreloader()); // ✅ hide preloader after successful fetch
      },
      (error) => {
        console.error('Error fetching favorites:', error);
        AsyncStorage.getItem('favorites').then((localData) => {
          if (localData) {
            setFavorites(JSON.parse(localData));
          }
        }).finally(() => {
          dispatch(hidePreloader()); // ✅ hide preloader even if error
        });
      }
    );

    // ✅ cleanup listener when screen unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  const renderFavorite = ({ item }: { item: Recipe }) => {
    return (
      <TouchableOpacity
        style={{backgroundColor: theme === 'dark' ? '#343434' : '#f8f8f8',borderRadius: 10,
          padding: 12,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 7,
          elevation: 5,}}
        onPress={() => {
           const recipeDetails: Recipe = {
             id: item.id,
             title: item.title,
             image: item.image,
             readyInMinutes: item.readyInMinutes,
             summary: item.summary || 'No summary available',
             ingredients: Array.isArray(item.ingredients)
             ? item.ingredients.join(', ')
             : item.ingredients || 'No ingredients listed',
             source: item.source || 'api',
           };
       
           navigation.navigate('RecipeDetailScreen', { recipe: recipeDetails });
         }}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={{ marginTop: 8 }}>
          <Text style={{ color: theme === 'dark' ? '#fff' : '#000'}} className='font-soraBold'>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{flex:1, padding:10, backgroundColor: theme === 'dark' ? '#000' : '#f8f8f8',}}>
      <Text className='text-2xl font-soraBold text-center my-10 mx-5 rounded-md bg-[#E94E1B] py-2 text-white'>My Favorites</Text>

      {favorites.length === 0 ? (
        <Text style={{ color: theme === 'dark' ? '#fff' : '#000'}}>No favorite recipes yet.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFavorite}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default Favorite;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    // backgroundColor: theme === 'dark' ? '#343434' : '#f8f8f8'
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 7,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  time: {
    color: '#fff',
  },
});
