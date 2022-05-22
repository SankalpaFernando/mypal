import {CheckBox, Layout, Radio} from '@ui-kitten/components';
import {collection, doc, getDoc, updateDoc} from 'firebase/firestore';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import AnimatedCheckbox from 'react-native-checkbox-reanimated';
import Animated, {
  FadeIn,
  SlideInRight,
  SlideOutRight,
} from 'react-native-reanimated';
import {firestore} from '../firebase/config';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    marginHorizontal: 20,
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    elevation: 5,
  },
  itemText: {
    textAlign: 'left',
    width: '150%',
    marginLeft: 10,
  },
});

type TodoItemProps = {
  name: string;
  date: any;
  index: number;
  totalItems: number;
  id: string;
  completed: boolean;
  refetch: Function;
};

const TodoItem: React.FC<TodoItemProps> = ({
  name,
  date,
  index,
  totalItems,
  id,
  refetch,
  completed,
}) => {
  const [checkboxState, setCheckboxState] = useState(completed);

  const onComplete = () => {
    const prevState = checkboxState;
    setCheckboxState(!checkboxState);
    updateDoc(doc(firestore, 'todos', id), {completed: !prevState}).then(() => {
      console.log('Updated');
      refetch()
    });
  };

  useEffect(() => {
    setCheckboxState(completed);
  }, [completed]);

  useEffect(() => {
    console.log('🚀 ~ file: TodoItem.tsx ~ line 73 ~ checkboxState',name, checkboxState);
  }, [checkboxState]);

  return (
    <Animated.View
      entering={SlideInRight.delay(1000 * index)}
      exiting={SlideOutRight.delay(100 * (totalItems - index))}>
      <Layout
        style={[styles.item, {marginBottom: totalItems == index + 1 ? 70 : 10}]}>
        <BouncyCheckbox
          size={25}
          fillColor="#f9a927"
          style={{flex: 1}}
          isChecked={checkboxState}
          unfillColor="#FFFFFF"
          disableBuiltInState={true}
          iconStyle={{borderColor: '#f9a927', borderWidth: 2}}
          onPress={(isChecked: boolean) => onComplete()}
        />
        <Text
          style={{
            flex: 5,
            textDecorationLine: checkboxState ? 'line-through' : 'none',
          }}>
          {name}
        </Text>
        <Text style={{flex: 1}}>{moment(date).format('HH:mm')}</Text>
      </Layout>
    </Animated.View>
  );
};

export default TodoItem;
