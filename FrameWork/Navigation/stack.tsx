import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ForgotPassword from "../Screens/ForgotPassword";
import {HomeScreen} from "../Screens/HomeScreen";
import Login from "../Screens/Login";
import SignUp from "../Screens/SignuUp";
import Welcome from "../Screens/Welcome";
import { NavigationContainer } from "@react-navigation/native";
import RecipeDetailScreen from "../Screens/RecipeDetailScreen";
import Favorite from "../Screens/Favorite";
import Profile from "../Screens/Profile";
import AddRecipe from "../Screens/AddRecipe";
import CreateRecipe from "../Screens/CreateRecipe";
import { Recipe, RecipeDetails } from "../Services/Spoonacular";


export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  CreateRecipe: undefined;
  Profile: undefined;
  Favorite: undefined;
  AddRecipe: undefined;
  HomeScreen: undefined;
  // RecipeDetailScreen: { id: number; recipe?: RecipeDetails & { source?: string } };
  RecipeDetailScreen: { recipe: Recipe };
  ForgotPassword: undefined;
};


const Stack = createNativeStackNavigator<RootStackParamList>();

export function StackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
        <Stack.Screen name="CreateRecipe" component={CreateRecipe} options={{ headerShown: false }} />
        <Stack.Screen name="AddRecipe" component={AddRecipe } options={{ headerShown: false }} />
        <Stack.Screen name="Favorite" component={Favorite} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false, title: "" }} />
        <Stack.Screen name="RecipeDetailScreen" component={RecipeDetailScreen} options={{ headerShown: false, title: "" }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false, title: "" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
