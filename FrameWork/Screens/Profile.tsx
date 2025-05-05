import { FontAwesome, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import React, { useContext, useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  Modal,
  Button,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../Redux/store';
import { setUser } from '../Redux/userSlice';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemeContext } from '../Context/ThemeContext';
import { hidePreloader, showPreloader } from '../Redux/preloaderSlice';

interface ProfileProps {
  navigation: any;
}

const avatarImages = [
  'https://api.dicebear.com/7.x/adventurer/png?seed=20',
  'https://api.dicebear.com/7.x/adventurer/png?seed=2',
  'https://api.dicebear.com/7.x/adventurer/png?seed=3',
  'https://api.dicebear.com/7.x/adventurer/png?seed=4',
  'https://api.dicebear.com/7.x/adventurer/png?seed=5',
  'https://api.dicebear.com/7.x/adventurer/png?seed=6',
  'https://api.dicebear.com/7.x/adventurer/png?seed=7',
  'https://api.dicebear.com/7.x/adventurer/png?seed=8',
  'https://api.dicebear.com/7.x/adventurer/png?seed=9',
  'https://api.dicebear.com/7.x/adventurer/png?seed=10',
  'https://api.dicebear.com/7.x/adventurer/png?seed=11',
  'https://api.dicebear.com/7.x/adventurer/png?seed=12',
];

const Profile: React.FC<ProfileProps> = ({ navigation }) => {
  const user = useSelector((state: RootState) => state.user.user);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [avatar, setAvatar] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const dispatch = useDispatch();
  const [modalVisibility, setModalVisibility] = useState(false);

    const closeModal = () => {
        setModalVisibility(!modalVisibility);
    };

    function logout() {
      dispatch(showPreloader());
      setTimeout(() => {
        dispatch(hidePreloader());
        navigation.replace("Welcome");
      }, 3000);
    }
    

  useEffect(() => {
    if (!user?.avatar) {
      const randomIndex = Math.floor(Math.random() * avatarImages.length);
      setAvatar(avatarImages[randomIndex]);
    } else {
      setAvatar(user?.avatar);
    }
  }, [user]);

  const handleAvatarSelection = (selectedAvatar: string) => {
    setAvatar(selectedAvatar);
    setModalVisible(false);

    dispatch(setUser({ ...user, avatar: selectedAvatar }));
  };

  const renderAvatar = ({ item }: { item: string }) => (
    <TouchableOpacity onPress={() => handleAvatarSelection(item)}>
      <Image
        source={{ uri: item }}
        style={{ width: 80, height: 80, borderRadius: 40, margin: 5 }}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme === 'dark' ? '#000' : '#E94E1B' }}
>

      <ScrollView>
        <View className=' mt-14 mx-5 rounded-lg mb-6 p-3 flex items-center' style={{ backgroundColor: theme === 'dark' ? '#343434' : '#fff'}}>
          {avatar && (
            <Image
              source={{ uri: avatar }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
          )}
          <Text style={{ color: theme === 'dark' ? '#E94E1B' : '#000' }} className='font-soraBold text-xl'>
            Hello! {user?.displayName}
          </Text>

          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={{ color: theme === 'dark' ? '#fff' : '#E94E1B' }}>Change Avatar</Text>
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme === 'dark' ? '#000' : '#fff' }}>
              <View style={{ width: '90%', padding: 20, borderRadius: 10,  backgroundColor: theme === 'dark' ? '#343434' : '#f2f4f5',}}>
                <Text style={{ fontSize: 16, marginBottom: 10, color: theme === 'dark' ? '#fff' : '#000' }}>Select an Avatar:</Text>

                <FlatList
                  data={avatarImages}
                  renderItem={renderAvatar}
                  keyExtractor={(item) => item}
                  numColumns={3}
                  showsHorizontalScrollIndicator={false}
                />
                <Button title="Close" color="#E94E1B" onPress={() => setModalVisible(false)} />
              </View>
            </View>
          </Modal>
        </View>

        <View className='bg-white p-3 mx-5 rounded-lg' style={{ backgroundColor: theme === 'dark' ? '#343434' : '#fff'}}>
          <Text className='font-soraBold mb-2' style={{ color: theme === 'dark' ? '#E94E1B' : '#000' }}>Full Name</Text>
          <TextInput
            value={user?.fullname ?? ''}
            editable={false}
            className='border border-gray-300 font-sora text-sm pl-4 py-1 mb-3'
            style={{ color: theme === 'dark' ? '#fff' : '#000' }}
            
          />

          <Text className='font-soraBold mb-2'style={{ color: theme === 'dark' ? '#E94E1B' : '#000' }}>Email</Text>
          <TextInput
            value={user?.email ?? ''}
            editable={false}
            className='border border-gray-300 font-sora text-sm pl-4 py-1 mb-3'
            style={{ color: theme === 'dark' ? '#fff' : '#000' }}
            
          />
        </View>

        <View className='bg-white p-3 mx-5 rounded-lg' style={{ backgroundColor: theme === 'dark' ? '#343434' : '#fff', marginVertical:20}} >

          <TouchableOpacity className='flex flex-row gap-2 items-center justify-between border-b-hairline border-dashed py-2 mb-2'>
            <View className='flex flex-row gap-2 items-center'>
              <Feather name="settings" size={18}  style={{ color: theme === 'dark' ? '#E94E1B' : 'green' }}/>
              <Text className='font-soraBold text-sm' style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Settings</Text>
            </View>
          <FontAwesome6 name="kitchen-set" size={16} style={{ color: theme === 'dark' ? '#fff' : '#E94E1B' }} />
          </TouchableOpacity>

          <TouchableOpacity className='flex flex-row gap-2 items-center justify-between border-b-hairline border-dashed py-2 mb-2'>
            <View className='flex flex-row gap-2 items-center'>
              <FontAwesome6 name="contact-card" size={16} style={{ color: theme === 'dark' ? '#E94E1B' : 'green' }}/>
              <Text className='font-soraBold text-sm' style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Help & Support</Text>
            </View>
          <FontAwesome6 name="kitchen-set" size={16} style={{ color: theme === 'dark' ? '#fff' : '#E94E1B' }} />
          </TouchableOpacity>

          <TouchableOpacity
              onPress={toggleTheme}
              className='flex flex-row gap-2 items-center justify-between border-b-hairline border-dashed py-2 mb-2'
            >
              <View className='flex flex-row gap-2 items-center'>
                <MaterialIcons
                  name="dark-mode"
                  size={20}
                  color={theme === 'dark' ? '#fff' : 'black'}
                />
                <Text className='font-soraBold text-sm' style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                  {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </Text>
              </View>
              <FontAwesome6 name="kitchen-set" size={16} style={{ color: theme === 'dark' ? '#fff' : '#E94E1B' }} />
            </TouchableOpacity>


          <TouchableOpacity className='flex flex-row gap-2 items-center justify-between border-b-hairline border-dashed py-2 mb-2'>
            <View className='flex flex-row gap-2 items-center'>
              <AntDesign name="delete" size={16} style={{ color: theme === 'dark' ? '#E94E1B' : 'green' }} />
              <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }} className='font-soraBold text-sm'>Deactivate Account</Text>
            </View>
            <FontAwesome6 name="kitchen-set" size={16} style={{ color: theme === 'dark' ? '#fff' : '#E94E1B' }} />

          </TouchableOpacity>

          <TouchableOpacity className='flex flex-row gap-2 items-center justify-between  py-2' onPress={closeModal}>
            <View className='flex flex-row gap-2 items-center'>
              <SimpleLineIcons name="logout" size={16} style={{ color: theme === 'dark' ? '#E94E1B' : 'green' }} />
              <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }} className='font-soraBold text-sm'>Log Out</Text>
            </View>
            <FontAwesome6 name="kitchen-set" size={16} style={{ color: theme === 'dark' ? '#fff' : '#E94E1B' }} />
          </TouchableOpacity>
          
        </View>
        
        <Modal
                visible={modalVisibility}
                animationType="slide"
                transparent={true}
            >
                <View style={{ flex: 1, backgroundColor: "#000000cc" }}>
                    <Pressable style={{ flex: 1 }} onPress={closeModal} >
                    </Pressable>
                    <View style={{ height: 200, backgroundColor: theme === 'dark' ? '#E94E1B' : '#fff', borderTopRightRadius: 20, borderTopLeftRadius: 20 }}>
                        <View style={{ alignItems: 'flex-end', margin: 10 }}>
                            <TouchableOpacity onPress={closeModal}>
                            <FontAwesome name="close" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
                            </TouchableOpacity>
                        </View>
                        <View>

                            <View style={{ alignItems: 'center', marginBottom: 10,  }}>
                                <Text style={{ fontSize: 16, color:theme === 'dark' ? '#fff' : '#000' }} className='font-soraBold'>
                                  Are you sure you want to log out?</Text>
                            </View>

                            <View style={{
                                marginTop: 20, margin: 15,
                            }}>

                                <TouchableOpacity onPress={() => { closeModal(); logout() }} style={{ borderColor: "red", backgroundColor: theme === 'dark' ? '#fff' : '#000', borderWidth: 1 }} >
                                  <Text className='text-center font-soraBold py-2' style={{color:theme === 'dark' ? '#000' : 'red'}}>Yes, Sign Out</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                </View>
            </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
