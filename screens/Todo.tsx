import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import {useIsFocused} from '@react-navigation/native';
import {Button, Card, Icon, Modal, Text} from '@ui-kitten/components';
import {collection, getDocs, orderBy, query, where} from 'firebase/firestore';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {Image, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import Animated, {
  FadeIn,
  ZoomInDown,
  ZoomInLeft,
  ZoomInUp,
} from 'react-native-reanimated';
import AddTodoItem from '../components/AddTodo';
import Loader from '../components/Loader';
import TodoItem from '../components/TodoItem';
import {auth, firestore} from '../firebase/config';
import TodoIcon from '../resources/Todo';
import globalStyle from '../styles/global';
import {floatButton, topBarEnter} from '../util/animation';
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

const Todo: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [todos, setTodos] = useState<never[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const isFocused = useIsFocused();
  const toast = useToast();

  const getTodos = () => {
    var today = currentDate;
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
        setTodos(data.docs.map(doc => ({...doc.data(), id: doc.id})));
      })
      .catch(err =>
        toast.show('Data Loading Failed!.Check Your Internet Connection', {
          type: 'warning',
        }),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    getTodos();
  }, [isFocused === true, currentDate]);

  return (
    <View style={styles.container}>
      <Animated.View entering={topBarEnter} style={styles.topBar}>
        <Animated.Text entering={FadeIn.delay(300)} style={styles.header}>
          Let's make some Job Done.
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
          <TodoIcon width="100%" height="100%" />
        </Animated.View>
      </Animated.View>
      <View style={{flex: 1}}>
        <Animated.ScrollView
          entering={FadeIn.delay(3100)}
          style={{
            paddingHorizontal: 20,
            marginTop: 40,
            paddingBottom: 50,
            height: 850,
            marginBottom:0
          }}>
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
          {isLoading ? (
            <Loader />
          ) : todos.length === 0 ? (
            <Text style={globalStyle.noData}>Nothing to do Today</Text>
          ) : (
            todos.map((todo, index) => {
              return (
                <TodoItem
                  id={todo.id}
                  completed={
                    todo.completed === undefined ? false : todo.completed
                  }
                  key={index}
                  refetch={getTodos}
                  totalItems={todos.length}
                  index={index}
                  name={todo.name}
                  date={todo.date.toDate()}
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
          style={styles.addButton}
          onPress={() => setOpen(true)}
          accessoryLeft={props => <Icon {...props} name="plus" />}>
          Add New Activity
        </Button>
      </Animated.View>
      <Modal
        style={{width: 350}}
        onBackdropPress={() => setOpen(false)}
        backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
        visible={open}>
        <Card style={{borderRadius: 10}}>
          <AddTodoItem refetch={getTodos} setClose={() => setOpen(false)} />
        </Card>
      </Modal>
    </View>
  );
};

export default Todo;
