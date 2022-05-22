import {CheckBox, Icon, Layout, Radio} from '@ui-kitten/components';
import {collection, deleteDoc, doc, getDoc} from 'firebase/firestore';
import moment from 'moment';
import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {ALERT_TYPE, Dialog} from 'react-native-alert-notification';
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
  quantity: string;
  id: string;
  index: number;
  totalItems: number;
  refetch: Function;
};

const CookingItem: React.FC<TodoItemProps> = ({
  name,
  quantity,
  index,
  totalItems,
  id,
  refetch,
}) => {
  const onRemove = () => {
    Dialog.show({
      type: ALERT_TYPE.WARNING,
      title: 'Do You Want to Delete the Item',
      button: 'Yes,I want',
      onPressButton: () => {
        deleteDoc(doc(firestore, 'cooking', id)).then(() => {
          refetch();
          Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Cooking Item Deleted',
            button: 'OK',
          });
        });
      },
    });
  };

  return (
    <Animated.View
      entering={SlideInRight.delay(1000 * index)}
      exiting={SlideOutRight.delay(100 * (totalItems - index))}>
      <Layout style={styles.item}>
        <Text
          style={{
            flex: 5,
          }}>
          {name}
        </Text>
        <Text style={{flex: 2}}>{quantity}</Text>
        <Pressable onPress={onRemove}>
          <DeleteIcon />
        </Pressable>
      </Layout>
    </Animated.View>
  );
};

const DeleteIcon = props => (
  <Icon
    fill="#8F9BB3"
    style={{width: 20, height: 20, flex: 1}}
    {...props}
    name="trash-outline"
  />
);

export default CookingItem;
