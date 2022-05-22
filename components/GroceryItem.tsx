import {CheckBox, Layout, Radio} from '@ui-kitten/components';
import { collection, deleteDoc, doc, getDoc } from 'firebase/firestore';
import moment from 'moment';
import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import AnimatedCheckbox from 'react-native-checkbox-reanimated';
import Animated, {
  FadeIn,
  SlideInRight,
  SlideOutRight,
} from 'react-native-reanimated';
import { firestore } from '../firebase/config';

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

const GroceryItem: React.FC<TodoItemProps> = ({
  name,
  quantity,
  index,
  totalItems,
  id,
  refetch
}) => {
  const [checkboxState, setCheckboxState] = useState(false);


  const onRemove = () => {
    deleteDoc(doc(firestore, 'grocery', id)).then(() => {
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Grocery Item Completed',
        button: 'OK',
      });
      setCheckboxState(true);
      setTimeout(()=>refetch(),5000)
    })
  }

  return (
    <Animated.View
      entering={SlideInRight.delay(1000 * index)}
      exiting={SlideOutRight.delay(100 * (totalItems - index))}>
      <Layout style={styles.item}>
        <BouncyCheckbox
          size={25}
          fillColor="#f9a927"
          style={{flex: 1}}
          unfillColor="#FFFFFF"
          iconStyle={{borderColor: '#f9a927', borderWidth: 2}}
          onPress={(isChecked: boolean) => onRemove()}
        />
        <Text
          style={{
            flex: 5,
            textDecorationLine: checkboxState ? 'line-through' : 'none',
          }}>
          {name}
        </Text>
        <Text style={{flex: 1}}>{quantity}</Text>
      </Layout>
    </Animated.View>
  );
};

export default GroceryItem;
