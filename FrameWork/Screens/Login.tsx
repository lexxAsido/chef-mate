import React, { useContext, useState } from 'react';
import { auth, db } from '../Services/Firebase.client';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { setUser } from '../Redux/userSlice';
import { useDispatch } from 'react-redux';
import { doc, getDoc } from 'firebase/firestore';
import { showPreloader, hidePreloader } from '../Redux/preloaderSlice';
import { ThemeContext } from '../Context/ThemeContext';



const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Too short').required('Password is required'),
});

interface LoginProps {
  navigation: any;
}

const Login: React.FC<LoginProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useContext(ThemeContext);

  return (
    <SafeAreaView className="flex-1" style={{backgroundColor: theme === 'dark' ? '#000' : '#E94E1B'}}>
      <View className="m-5">
        <TouchableOpacity className="flex flex-row mt-8 gap-3 items-center"
          onPress={()=> navigation.navigate("Welcome")}>
          <FontAwesome5 name="arrow-left" size={12} color="black" style={{ backgroundColor: theme === 'dark' ? '#E94E1B' : '#fff', padding: 3, borderRadius: 3 }} />
          <Text className="text-white font-soraBold"> Login with Email</Text>
        </TouchableOpacity>

        <View className=" h-[20rem] mt-24 rounded-lg p-5"
            style={{elevation: 20,
            shadowColor: "black",
            shadowOpacity: 0.1,
            shadowRadius: 10,
            backgroundColor:theme === 'dark' ? '#343434' : '#fff'
            }}>
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            

            onSubmit={async (values) => {
                try {
                  dispatch(showPreloader())
                  const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
                  const user = userCredential.user;
  
                  
                  const userDoc = await getDoc(doc(db, 'users', user.uid));
  
                  if (userDoc.exists()) {
                    const userData = userDoc.data();
                    dispatch(setUser({
                      uid: user.uid,
                      email: user.email,
                      displayName: user.displayName,
                      fullname: userData.fullname,
                    }));
                    navigation.navigate('HomeScreen'); 
                  } else {
                    console.log('No user document found');
                  }
                } catch (error) {
                  console.log('Invalid Crtedentials:', error);
                  Alert.alert("Invalid Email or Password")
                } finally {
                  dispatch(hidePreloader())
                }
              }}

              
          >
            {({ handleChange, handleBlur, handleSubmit, values, touched, errors }) => (
              <View>
                <View className="flex flex-row gap-2 mb-4 items-center">
                <SimpleLineIcons name="login" size={20} color="green" />
                    <Text className="font-soraBold text-sm" style={{color:theme === 'dark' ? '#fff' : '#000'}}>Get Started</Text>
                </View>

                <TextInput
                  label="Enter Email Address"
                  mode="outlined"
                  activeOutlineColor="black"
                  left={<TextInput.Icon icon="email" color="green" size={20}/>}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  error={touched.email && !!errors.email}
                  style={{ marginTop: 10, fontSize: 12, }}
                />
                {touched.email && errors.email && (
                  <Text className="text-red-500 text-xs">{errors.email}</Text>
                )}

                <TextInput
                  label="Enter Password"
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  activeOutlineColor="black"
                  left={<TextInput.Icon icon="lock" color="green" size={20}/>}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  // placeholderTextColor={theme === 'dark' ? 'red' : '#000'}
                  value={values.password}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  error={touched.password && !!errors.password}
                  style={{ marginTop: 10, fontSize: 12, marginBottom:16, }}
                />
                {touched.password && errors.password && (
                  <Text className="text-red-500 text-xs">{errors.password}</Text>
                )}

                <Button
                  mode="contained"
                  onPress={()=>handleSubmit()}
                  className="bg-[#E94E1B]"
                  buttonColor='#E94E1B'
                
                >
                  Login
                </Button>

              </View>
            )}
          </Formik>
        </View>

            <TouchableOpacity className='mt-10 p-3 rounded-lg flex flex-row gap-3 items-center' style={{backgroundColor:theme === 'dark' ? '#343434' : '#fff'}}
            onPress={()=> navigation.navigate('ForgotPassword')}>
                <FontAwesome5 name="user-lock" size={24} color="#E94E1B" />
                <Text className='font-sora' style={{color:theme === 'dark' ? '#fff' : '#000'}}>Forgot Passsword?</Text>
                
            </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Login;
