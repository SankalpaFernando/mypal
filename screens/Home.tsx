import {useIsFocused, useNavigation} from '@react-navigation/native';
import {
  Button,
  Card,
  Layout,
  Modal,
  Spinner,
  Text,
} from '@ui-kitten/components';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import Animated, {FadeIn, withDelay, withTiming} from 'react-native-reanimated';
import thousands from 'thousands';
import Loader from '../components/Loader';
import TodoItem from '../components/TodoItem';
import UpdateBalance from '../components/UpdateBalance';
import {auth, firestore} from '../firebase/config';
import HomeIcon from '../resources/Home';
import globalStyle from '../styles/global';
import {topBarEnter} from '../util/animation';
import {useToast} from 'react-native-toast-notifications';

const styles = StyleSheet.create({
  balance: {
    justifyContent: 'center',
    marginTop: 50,
    flex: 1,
  },
  balanceText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#fff',
  },
  balanceNumber: {
    color: '#FFF',
    fontSize: 70,
    fontFamily: 'MPLUSRounded1c-Medium',
  },
  image: {
    resizeMode: 'clip',
    display: 'flex',
  },
  drawer: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingVertical: 45,
    backgroundColor: '#FFF',
    marginTop: 80,
    flex: 2,
  },
  drawerTitle: {
    fontSize: 30,
    textAlign: 'center',
    fontFamily: 'MPLUSRounded1c-Medium',
    color: '#444',
    marginLeft: 20,
    paddingTop: 30,
  },
  loader: {
    alignItems: 'center',
  },
});

const Home: React.FC = () => {
  const [todos, setTodos] = useState([]);
  const [open, setOpen] = useState(false);
  const [balanceType, setBalanceType] = useState<'Bank' | 'Cash on Hand'>(
    'Bank',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [balanceData, setBalanceData] = useState({
    bankBalance: 0,
    onHandCash: 0,
  });
  const isFocused = useIsFocused();

  const toast = useToast();

  useEffect(() => {
    getTodos();
    getBalance();
  }, [isFocused === true]);

  const getBalance = () => {
    getDoc(doc(firestore, 'users', auth.currentUser?.uid)).then(data => {
      setBalanceData({
        bankBalance: data.data().bankBalance,
        onHandCash: data.data().onHandBalance,
      });
    });
  };

  const getTodos = () => {
    var today = new Date();
    setIsLoading(true);
    getDocs(
      query(
        collection(firestore, 'todos'),
        where(
          'date',
          '>',
          new Date(
            `${today.getFullYear()}/${
              today.getMonth() + 1
            }/${today.getDate()} 00:00`,
          ),
        ),
        where(
          'date',
          '<',
          new Date(
            `${today.getFullYear()}/${
              today.getMonth() + 1
            }/${today.getDate()} 23:59`,
          ),
        ),
        where('uid', '==', auth.currentUser?.uid),
        orderBy('date'),
      ),
    )
      .then(data => {
        return setTodos(
          data.docs
            .map(doc => ({...doc.data(), id: doc.id}))
            .filter(doc => {
              if (!doc.completed) {
                return doc;
              }
            })
            .slice(0, 6),
        );
      })
      .catch(err =>
        toast.show('Data Loading Failed!.Check Your Internet Connection', {
          type: 'warning',
        }),
      )
      .finally(() => {
        setIsLoading(false);
      });
  };

  const entering = targetValues => {
    'worklet';
    const animations = {
      originY: withTiming(310, {duration: 6000}),
    };
    const initialValues = {
      originY: 2000,
      opacity: 1,
    };
    return {
      initialValues,
      animations,
    };
  };

  return (
    <View style={{flex: 3}}>
      <View style={styles.balance}>
        <Text style={styles.balanceText}>Your Bank Balance 🏦</Text>
        <Pressable
          onPress={() => {
            setOpen(true);
            setBalanceType('Bank');
          }}>
          <Animated.Text
            entering={FadeIn.delay(1000)}
            style={[styles.balanceText, styles.balanceNumber]}>
            {thousands(balanceData.bankBalance)}
          </Animated.Text>
        </Pressable>
        <Animated.View entering={FadeIn.delay(1000)}>
          <Text style={styles.balanceText}>Cash on Hand 💵</Text>
          <Pressable
            onPress={() => {
              setOpen(true);
              setBalanceType('Cash on Hand');
            }}>
            <Text
              style={[
                styles.balanceText,
                styles.balanceNumber,
                {fontSize: 20},
              ]}>
              {thousands(balanceData.onHandCash)}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
      <Animated.View entering={entering} style={styles.drawer}>
        <Animated.View
          entering={FadeIn.delay(300)}
          style={{
            height: 450,
            alignItems: 'flex-end',
            width: '100%',
            position: 'absolute',
            top: -70,
          }}>
          <HomeIcon width="100%" height="100%" />
        </Animated.View>
        <Text style={styles.drawerTitle}>Upcoming</Text>
        <ScrollView style={{marginTop: 20, marginBottom: 50}}>
          {isLoading ? (
            <Loader />
          ) : todos.length === 0 ? (
            <Text style={globalStyle.noData}>No Upcoming Events</Text>
          ) : (
            todos.map((todo, index) => {
              return (
                <TodoItem
                  id={todo.id}
                  refetch={getTodos}
                  completed={
                    todo.completed === undefined ? false : todo.completed
                  }
                  totalItems={todos.length}
                  index={index}
                  key={index}
                  name={todo.name}
                  date={todo.date.toDate()}
                />
              );
            })
          )}
        </ScrollView>
      </Animated.View>
      <Modal
        style={{width: 350}}
        onBackdropPress={() => setOpen(false)}
        backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
        visible={open}>
        <Card style={{borderRadius: 10}}>
          <UpdateBalance
            refetch={getBalance}
            setClose={() => setOpen(false)}
            balanceType={balanceType}
          />
        </Card>
      </Modal>
    </View>
  );
};

export default Home;
