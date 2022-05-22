import {Button, Icon, Input, Text} from '@ui-kitten/components';
import React, {useState} from 'react';
import {ALERT_TYPE, Dialog, Root, Toast} from 'react-native-alert-notification';

import {
  Image,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {firestore, auth, firebaseApp} from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {doc, getDoc, setDoc} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingTop: 100,
  },
  input: {
    height: 48,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 30,
    marginRight: 30,
  },
  logo: {
    height: 100,
    width: 100,
    resizeMode: 'stretch',
  },
  logoContainer: {
    backgroundColor: '#FAFAFA',
    padding: 20,
    borderRadius: 100,
    marginBottom: 10,
  },
  button: {
    alignItems: 'center',
    marginLeft: 30,
    marginRight: 30,
    marginTop: 20,
  },
  link: {
    textAlign: 'center',
    marginTop: 10,
    color: '#FDC81F',
    fontFamily: 'MPLUSRounded1c-Medium',
  },
});

const Login: React.FC = () => {
  const [type, setType] = useState<'login' | 'register' | 'reset'>('login');
  const [formData, setFormData] = useState({email: '', password: ''});
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const navigate = useNavigation();
  const onFormTypeChange = (formType: 'login' | 'register' | 'reset') => {
    setType(formType);
    setFormData({email: '', password: ''});
  };

  onAuthStateChanged(auth, user => {
    if (user) {
      const uid = user.uid;
    } else {
      navigate.navigate("Login");
    }
  });

  const onLogin = () => {
    signInWithEmailAndPassword(auth, formData.email, formData.password)
      .then(res => {
        const uid = res.user?.uid;
        getDoc(doc(firestore, 'users', uid)).then(document => {
          if (!document.exists()) {
            if (!res.user.emailVerified) {
              Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Email Should be Verified',
                button: 'Got it',
              });
              return;
            }
            setDoc(doc(firestore, 'users', uid), {email: res.user.email});
          }
        });
      })
      .catch(_err => console.log(_err));
  };

  const onRegister = () => {
    createUserWithEmailAndPassword(auth, formData.email, formData.password)
      .then(res => {
        sendEmailVerification(res.user);
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Email Confirmation Sent',
          button: 'Got it',
        });
        setType('login');
      })
      .catch(_err => {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Email Already Exists',
          button: 'Got it',
        });
      });
  };

  const onReset = () => {
    sendPasswordResetEmail(auth, formData.email)
      .then(() => {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Password Reset Link Sent',
          button: 'Got it',
        });
      })
      .catch(_err => {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'No Account Detected',
          button: 'Got it',
        });
      });
  };

  return (
    <View style={style.container}>
      <View style={style.logoContainer}>
        <Image
          style={style.logo}
          source={{uri: 'https://thetodo.net/_nuxt/img/icon.fedfcdd.png'}}
        />
      </View>
      <KeyboardAwareScrollView
        style={{flex: 1, width: '100%'}}
        keyboardShouldPersistTaps="always">
        <Input
          value={formData.email}
          size="large"
          style={style.input}
          placeholder="Email"
          onChangeText={text => setFormData({...formData, email: text})}
        />
        {type !== 'reset' ? (
          <View>
            <Input
              value={formData.password}
              size="large"
              secureTextEntry={secureTextEntry}
              accessoryRight={props => (
                <TouchableWithoutFeedback
                  onPress={() => setSecureTextEntry(!secureTextEntry)}>
                  <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
                </TouchableWithoutFeedback>
              )}
              style={style.input}
              placeholder="Password"
              onChangeText={text => setFormData({...formData, password: text})}
            />
            {type === 'login' ? (
              <View>
                <Button onPress={onLogin} style={style.button}>
                  Login
                </Button>
                <Pressable
                  style={{zIndex: 0.5}}
                  onPress={() => onFormTypeChange('register')}>
                  <Text style={style.link}>Don't have an Account? Sign Up</Text>
                </Pressable>
                <Pressable
                  style={{zIndex: 0.5}}
                  onPress={() => onFormTypeChange('reset')}>
                  <Text style={style.link}>Forget Password</Text>
                </Pressable>
              </View>
            ) : (
              <View>
                <Button onPress={onRegister} style={style.button}>
                  Register
                </Button>
                <Pressable
                  style={{zIndex: 0.5}}
                  onPress={() => onFormTypeChange('login')}>
                  <Text style={style.link}>
                    Already have an Account? Sign In
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : (
          <View>
            <Button onPress={onReset} style={style.button}>
              Send Password Reset
            </Button>
            <Pressable
              style={{zIndex: 0.5}}
              onPress={() => onFormTypeChange('login')}>
              <Text style={style.link}>Try Login Again</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
};

export default Login;
