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
  ZoomInDown,
  ZoomInEasyUp,
  ZoomInLeft,
  ZoomInRight,
  ZoomInUp,
} from 'react-native-reanimated';
import AddCookingItem from '../components/AddCookingItem';
import AddGroceryItem from '../components/AddGroceryItem';
import AddTodoItem from '../components/AddTodo';
import CookingItem from '../components/CookingItem';
import GroceryItem from '../components/GroceryItem';
import TodoItem from '../components/TodoItem';
import {auth, firestore} from '../firebase/config';
import CookingIcon from '../resources/Cooking';
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

const Cooking: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [cookingItems, setCookingItems] = useState<never[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const toast = useToast();

  const isFocused = useIsFocused();

  const getCookingItems = () => {
    var today = currentDate;

    getDocs(
      query(
        collection(firestore, 'cooking'),
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
      ),
    )
      .then(data => {
        return setCookingItems(
          data.docs.map(doc => ({...doc.data(), id: doc.id})),
        );
      })
      .catch(err =>
        toast.show('Data Loading Failed!.Check Your Internet Connection', {
          type: 'warning',
        }),
      );
  };

  useEffect(() => {
    getCookingItems();
  }, [currentDate, isFocused === true]);

  return (
    <View style={styles.container}>
      <Animated.View entering={topBarEnter} style={styles.topBar}>
        <Animated.Text entering={FadeIn.delay(300)} style={styles.header}>
          What we do? We Cook
        </Animated.Text>
        <Animated.View
          entering={FadeIn.delay(300)}
          style={{
            height: 600,
            alignItems: 'flex-end',
            width: '100%',
            position: 'absolute',
            top: 140,
            zIndex: 0.5,
          }}>
          <CookingIcon width="100%" height="100%" />
        </Animated.View>
      </Animated.View>
      <View style={{flex: 1}}>
        <Animated.ScrollView
          entering={FadeIn.delay(3100)}
          style={{paddingHorizontal: 20, marginTop: 40}}>
          <Pressable
            onPress={() => {
              DateTimePickerAndroid.open({
                onChange: (event, date) => setCurrentDate(date),
                value: currentDate,
                display: 'spinner',
              });
            }}>
            <Text style={styles.date}>
              {currentDate.toDateString() == new Date().toDateString()
                ? 'Today'
                : moment(currentDate).format('dddd DD MMMM YYYY')}
            </Text>
          </Pressable>
          {cookingItems.map((cookingItem, index) => {
            return (
              <CookingItem
                refetch={getCookingItems}
                totalItems={cookingItem.length}
                index={index}
                key={index}
                id={cookingItem.id}
                name={cookingItem.name}
                quantity={`${cookingItem.quantity} ${cookingItem.quantityType}`}
              />
            );
          })}
        </Animated.ScrollView>
      </View>
      <Animated.View
        entering={ZoomInDown.delay(1000)}
        style={styles.addButtonContainer}>
        <Button
          style={styles.addButton}
          onPress={() => setOpen(true)}
          accessoryLeft={props => <Icon {...props} name="plus" />}>
          Add Cooking Item
        </Button>
      </Animated.View>
      <Modal
        style={{width: 350}}
        onBackdropPress={() => setOpen(false)}
        backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
        visible={open}>
        <Card style={{borderRadius: 10}}>
          <AddCookingItem
            date={currentDate}
            refetch={getCookingItems}
            setClose={() => setOpen(false)}
          />
        </Card>
      </Modal>
    </View>
  );
};

export default Cooking;
