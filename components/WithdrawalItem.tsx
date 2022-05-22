import {CheckBox, Layout, Radio} from '@ui-kitten/components';
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
  amount: number;
  date: Date;
  totalItems: number;
  index: number;
};

const WithdrawalItem: React.FC<TodoItemProps> = ({
  amount,
  date,
  totalItems,
  index
}) => {
  const dateObj = new Date(date.seconds * 1000 + date.nanoseconds / 1000000);;

  return (
    <Animated.View
      entering={SlideInRight.delay(1000 * index)}
      exiting={SlideOutRight.delay(100 * (totalItems - index))}>
      <Layout style={styles.item}>
        <Text
          style={{
            flex: 5,
          }}>
          {moment(dateObj).format("YYYY-MM-DD")}
        </Text>
        <Text style={{flex: 2}}>Rs. {amount}</Text>
      </Layout>
    </Animated.View>
  );
};

export default WithdrawalItem;
