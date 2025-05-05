import React, { useContext, useState } from 'react';
import { SafeAreaView, Text, View, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Button, Checkbox, TextInput } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { auth, db } from '../Services/Firebase.client';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { setUser } from '../Redux/userSlice';
import { doc, setDoc } from 'firebase/firestore';
import { showPreloader, hidePreloader } from '../Redux/preloaderSlice';
import { ThemeContext } from '../Context/ThemeContext';


const SignUpSchema = Yup.object().shape({
  fullname: Yup.string().required('Full name is required'),
  displayname: Yup.string().required('Display name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
  terms: Yup.boolean().oneOf([true], 'You must accept the terms'),
});

interface SignUpProps {
  navigation: any;
}

const SignUp: React.FC<SignUpProps> = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
   const { theme } = useContext(ThemeContext);

  return (
    <SafeAreaView className="flex-1" style={{backgroundColor: theme === 'dark' ? '#000' : '#E94E1B'}}>
      <View className="mx-5">

        <TouchableOpacity className="flex flex-row mt-10 gap-3 items-center"
          onPress={() => navigation.navigate('Welcome')}>
          <FontAwesome5 name="arrow-left" size={12} color="black" style={{ backgroundColor: theme === 'dark' ? '#E94E1B' : '#fff', padding: 3, borderRadius: 3 }} />
          <Text className="text-white font-soraBold" > Create An Account</Text>
        </TouchableOpacity>

        <View className=" h-[39rem] mt-10 rounded-lg p-5"
         style={{elevation: 20,
          shadowColor: "black",
          shadowOpacity: 0.1,
          shadowRadius: 10,
          backgroundColor:theme === 'dark' ? '#343434' : '#fff'
          }}>
          <Formik
            initialValues={{
              fullname: '',
              displayname: '',
              email: '',
              password: '',
              confirmPassword: '',
              terms: false,
            }}
            validationSchema={SignUpSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                dispatch(showPreloader())
                const { email, password, displayname, fullname } = values;
            
              
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
                // Update displayName in Firebase Auth profile
                await updateProfile(userCredential.user, {
                  displayName: displayname,
                });
            
                const user = userCredential.user;
            
                // Save user info to Firestore
                await setDoc(doc(db, 'users', user.uid), {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  fullname: fullname,
                });
            
               
                dispatch(setUser({
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  fullname:fullname
                }));
            
                navigation.navigate('HomeScreen');
            
              } catch (error: any) {
                console.error('Firebase signup error:', error.message);
              } finally {
                setSubmitting(false);
                dispatch(hidePreloader())
              }
            }}
            
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
              <View>

                <View className="flex flex-row gap-2 mb-4 items-center">
                  <FontAwesome5 name="user" size={16} color="green" />
                  <Text className="font-soraBold text-sm" style={{color:theme === 'dark' ? '#fff' : '#000'}}>Create An Account</Text>
                </View>

                <TextInput
                  label="Enter Full Name"
                  mode="outlined"
                  activeOutlineColor="black"
                  left={<TextInput.Icon icon="account" color="green" size={20} />}
                  onChangeText={handleChange('fullname')}
                  onBlur={handleBlur('fullname')}
                  value={values.fullname}
                  error={touched.fullname && !!errors.fullname}
                  style={{ fontSize: 12 }}
                />
                {touched.fullname && errors.fullname && (
                  <Text className="text-red-500 text-xs">{errors.fullname}</Text>
                )}

                <TextInput
                  label="Enter Display Name"
                  mode="outlined"
                  activeOutlineColor="black"
                  left={<TextInput.Icon icon="account-circle" color="green" size={20} />}
                  onChangeText={handleChange('displayname')}
                  onBlur={handleBlur('displayname')}
                  value={values.displayname}
                  error={touched.displayname && !!errors.displayname}
                  style={{ marginTop: 10, fontSize: 12 }}
                />
                {touched.displayname && errors.displayname && (
                  <Text className="text-red-500 text-xs">{errors.displayname}</Text>
                )}

                <TextInput
                  label="Enter Email Address"
                  mode="outlined"
                  activeOutlineColor="black"
                  left={<TextInput.Icon icon="email" color="green" size={20} />}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  error={touched.email && !!errors.email}
                  style={{ marginTop: 10, fontSize: 12 }}
                />
                {touched.email && errors.email && (
                  <Text className="text-red-500 text-xs">{errors.email}</Text>
                )}

                <TextInput
                  label="Enter Password"
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  activeOutlineColor="black"
                  left={<TextInput.Icon icon="lock" color="green" size={20} />}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  error={touched.password && !!errors.password}
                  style={{ marginTop: 10, fontSize: 12 }}
                />

                <TextInput
                  label="Confirm Password"
                  mode="outlined"
                  secureTextEntry={!showConfirmPassword}
                  activeOutlineColor="black"
                  left={<TextInput.Icon icon="lock-check" color="green" size={20} />}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? "eye-off" : "eye"}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  }
                  value={values.confirmPassword}
                  error={touched.confirmPassword && !!errors.confirmPassword}
                  style={{ marginTop: 10, fontSize: 12 }}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <Text className="text-red-500 text-xs">{errors.confirmPassword}</Text>
                )}

                <View className="flex flex-row items-center mt-4">
                  <Checkbox
                    status={values.terms ? 'checked' : 'unchecked'}
                    onPress={() => setFieldValue('terms', !values.terms)}
                    color="#E94E1B"
                  />
                  <TouchableOpacity onPress={() => setFieldValue('terms', !values.terms)}>
                    <Text className="text-xs" style={{color:theme === 'dark' ? '#fff' : '#000'}}>I agree to the Terms of Service</Text>
                  </TouchableOpacity>
                </View>
                {touched.terms && errors.terms && (
                  <Text className="text-red-500 text-xs">{errors.terms}</Text>
                )}

                <Button
                  mode="contained"
                  onPress={()=>handleSubmit()}
                  
                  contentStyle={{ paddingVertical: 3 }}
                  buttonColor='#E94E1B'
                >
                  Create Account
                </Button>

              </View>
            )}
          </Formik>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignUp;
