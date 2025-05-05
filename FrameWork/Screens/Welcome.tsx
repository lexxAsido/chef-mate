import { Image, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { ThemeContext } from '../Context/ThemeContext';



interface WelcomeProps {
  navigation: any;
}

const Welcome: React.FC<WelcomeProps> = ({ navigation }) => {
   const { theme } = useContext(ThemeContext);
  return (
    <View className='flex-1'
      style={{backgroundColor: theme === 'dark' ? '#000' : '#E94E1B'}}>

    <View className='flex justify-center flex-1  items-center'>
        <Image source={require("../../assets/chefmate.png")} style={{width:120, height:130, borderRadius:15}} resizeMode="contain"/>
       
       <TouchableOpacity className='flex flex-row w-[20rem] justify-evenly py-3 rounded-lg mt-5 items-center' style={{ backgroundColor: theme === 'dark' ? '#343434' : '#fff'}}
       onPress={()=> navigation.navigate("SignUp")}>
       <MaterialIcons name="account-box" size={24} color="#4CAF50" />
        <Text className='font-playwrite text-md' style={{color:theme === 'dark' ? '#fff' : '#000'}}>Create An Account</Text>
        <FontAwesome6 name="kitchen-set" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
       </TouchableOpacity>

       <TouchableOpacity className='flex flex-row  w-[20rem] justify-evenly py-2 rounded-lg mt-5 items-center' style={{ backgroundColor: theme === 'dark' ? '#343434' : '#fff'}}
       onPress={()=>navigation.navigate('Login')}>
       <MaterialIcons name="mail" size={24} color="#4CAF50" />
        <Text className='font-playwrite text-sm' style={{color:theme === 'dark' ? '#fff' : '#000'}}>Login With Email</Text>
        <FontAwesome6 name="kitchen-set" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
       </TouchableOpacity>

    </View>
        <Text className='mb-5 font-soraBold text-center text-sm ' style={{color:theme === 'dark' ? '#fff' : '#000'}}>By Continuing, you agreee to ChefMate Terms of Use and Privacy Policy</Text>
    </View>
  )
}

export default Welcome