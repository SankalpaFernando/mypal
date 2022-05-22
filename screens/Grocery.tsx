import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import {useIsFocused} from '@react-navigation/native';
import {Button, Card, Icon, Modal, Text} from '@ui-kitten/components';
import {collection, getDocs, orderBy, query, where} from 'firebase/firestore';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {Image, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import Animated, {
  FadeIn,
  SpringAnimation,
  SpringUtils,
  withTiming,
  ZoomInDown,
  ZoomInEasyUp,
  ZoomInLeft,
  ZoomInRight,
} from 'react-native-reanimated';
import AddGroceryItem from '../components/AddGroceryItem';
import AddTodoItem from '../components/AddTodo';
import GroceryItem from '../components/GroceryItem';
import TodoItem from '../components/TodoItem';
import {auth, firestore} from '../firebase/config';
import ShoppingIcon from '../resources/Shopping';
import shortid from 'shortid';
import Loader from '../components/Loader';
import globalStyle from '../styles/global';
import {topBarEnter} from '../util/animation';
import {useToast} from 'react-native-toast-notifications';

const styles = StyleSheet.create({
  container: {
    flex: 3,
    backgroundColor: '#FFF',
  },
  date: {
    fontSize: 20,
    fontFamily: 'MPLUSRounded1c-Medium',
    color: '#555',
    marginLeft: 10,
    marginVertical: 10,
    textAlign: 'center',
  },
  addButtonContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 30,
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
  },
  addButton: {
    width: 250,
    borderRadius: 10,
    fontFamily: 'MPLUSRounded1c-Bold',
  },
  heading: {
    fontSize: 25,
    fontFamily: 'MPLUSRounded1c-Bold',
    marginHorizontal: 50,
    marginTop: 5,
    color: '#FFF',
  },
  topBar: {
    backgroundColor: '#f9a927',
    flex: 1,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    // flexDirection: 'row',
  },
  header: {
    fontSize: 40,
    fontFamily: 'MPLUSRounded1c-Bold',
    color: '#FFF',
    marginHorizontal: 30,
    marginTop: 20,
  },
});

const getRandomKey = () => {
  return shortid.generate();
};

const Grocery: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [randomKey, setRandomKey] = useState<string>();
  const [groceries, setGroceries] = useState<never[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const isFocused = useIsFocused();

  const getGroceries = () => {
    setIsLoading(true);
    where('uid', '==', auth.currentUser?.uid),
      getDocs(query(collection(firestore, 'grocery')))
        .then(data => {
          return setGroceries(
            data.docs.map(doc => ({...doc.data(), id: doc.id})),
          );
        })
        .catch(err =>
          toast.show('Data Loading Failed!.Check Your Internet Connection', {
            type: 'warning',
          }),
        )
        .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    getGroceries();
    setRandomKey(getRandomKey());
  }, [isFocused === true]);

  return (
    <View style={styles.container}>
      <Animated.View entering={topBarEnter} style={styles.topBar}>
        <Animated.Text entering={FadeIn.delay(300)} style={styles.header}>
          Grab these on the Way
        </Animated.Text>
        <Animated.View
          entering={FadeIn.delay(300)}
          style={{
            height: 450,
            alignItems: 'flex-end',
            width: '100%',
            position: 'absolute',
            top: 140,
            zIndex: 0.5,
          }}>
          <ShoppingIcon width="100%" height="100%" />
        </Animated.View>
      </Animated.View>
      <View style={{flex: 1}}>
        <Animated.ScrollView
          entering={FadeIn.delay(3100)}
          style={{paddingHorizontal: 20, marginTop: 40}}>
          {isLoading ? (
            <Loader />
          ) : groceries.length === 0 ? (
            <Text style={globalStyle.noData}>No Groceries</Text>
          ) : (
            groceries.map((grocery, index) => {
              return (
                <GroceryItem
                  refetch={getGroceries}
                  totalItems={groceries.length}
                  index={index}
                  key={index}
                  id={grocery.id}
                  name={grocery.name}
                  quantity={`${grocery.quantity} ${grocery.quantityType}`}
                />
              );
            })
          )}
        </Animated.ScrollView>
      </View>
      <Animated.View
        entering={ZoomInDown.duration(1000)}
        style={styles.addButtonContainer}>
        <Button
          key={getRandomKey()}
          style={styles.addButton}
          onPress={() => setOpen(true)}
          accessoryLeft={props => <Icon {...props} name="plus" />}>
          Add New Grocery Item
        </Button>
      </Animated.View>
      <Modal
        style={{width: 350}}
        onBackdropPress={() => setOpen(false)}
        backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
        visible={open}>
        <Card style={{borderRadius: 10}}>
          <AddGroceryItem
            refetch={getGroceries}
            setClose={() => setOpen(false)}
          />
        </Card>
      </Modal>
    </View>
  );
};

export default Grocery;
