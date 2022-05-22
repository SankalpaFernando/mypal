import 'react-native-get-random-values';
import {
  Button,
  Datepicker,
  Icon,
  IndexPath,
  Input,
  Select,
  SelectItem,
  Text,
} from '@ui-kitten/components';
import {getAuth} from 'firebase/auth';
import {doc, getDoc, setDoc, updateDoc} from 'firebase/firestore';
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {auth, firestore} from '../firebase/config';
import {v4 as uuidv4} from 'uuid';
import {ALERT_TYPE, Dialog} from 'react-native-alert-notification';
import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import moment from 'moment';
import Animated from 'react-native-reanimated';

type AddTodoItemProps = {
  setClose: Function;
  refetch: Function;
  currentDate: Date;
};

const AddGroceryItem: React.FC<AddTodoItemProps> = ({
  setClose,
  refetch,
  currentDate,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    quantityType: 'kg',
    categoryType: 'Food',
    price: 0,
  });
  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
  const [selectedIndexCategory, setSelectedIndexCategory] = useState(
    new IndexPath(0),
  );
  const styles = StyleSheet.create({
    input: {
      marginVertical: 5,
    },
    button: {
      width: '100%',
      marginTop: 20,
    },
    heading: {
      fontFamily: 'Nunito-Medium',
      fontSize: 20,
      marginBottom: 10,
    },
  });

  const quantityTypeOptions = ['Kg', 'g', 'ltr', 'ml', 'items'];
  const categoryOptions = ['Food', 'Stationery', 'Room', 'Medicine', 'Other'];

  const addItem = () => {
    setClose();
    setDoc(doc(firestore, 'expense', uuidv4()), {
      ...formData,
      quantityType: quantityTypeOptions[selectedIndex.row],
      categoryType: categoryOptions[selectedIndexCategory.row],
      currentDate,
      uid: auth.currentUser ? auth.currentUser.uid : '',
    }).then(async response => {
      const user = await getDoc(doc(firestore, 'users', auth.currentUser?.uid));
      updateDoc(doc(firestore, 'users', auth.currentUser?.uid), {
        onHandBalance:
          parseInt(user.data().onHandBalance) - parseInt(formData.price),
      }).then(() => {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Grocery Item Added',
          button: 'OK',
        });
        refetch();
      });
    });
  };

  return (
    <View>
      <Text style={styles.heading}>Add New Expense</Text>

      <Input
        placeholder="Expense Item"
        style={styles.input}
        onChangeText={text => setFormData({...formData, name: text})}
        multiline={true}
        size="large"
      />
      <Select
        selectedIndex={selectedIndexCategory}
        onSelect={index => setSelectedIndexCategory(index)}
        size="large"
        value={categoryOptions[selectedIndexCategory.row]}
        style={styles.input}>
        {categoryOptions.map(option => (
          <SelectItem title={option} />
        ))}
      </Select>
      <View style={{width: '100%', flexDirection: 'row'}}>
        <Input
          placeholder="Quantity"
          style={[styles.input, {width: '40%', marginRight: 15}]}
          onChangeText={text =>
            setFormData({...formData, quantity: parseInt(text)})
          }
          multiline={true}
          keyboardType="numeric"
          size="large"
        />
        <Select
          selectedIndex={selectedIndex}
          onSelect={index => setSelectedIndex(index)}
          size="large"
          value={quantityTypeOptions[selectedIndex.row]}
          style={[styles.input, {width: '55%'}]}>
          {quantityTypeOptions.map(option => (
            <SelectItem title={option} />
          ))}
        </Select>
      </View>
      <Input
        placeholder="Price"
        onChangeText={text => setFormData({...formData, price: parseInt(text)})}
        multiline={true}
        keyboardType="numeric"
        style={styles.input}
        size="large"
      />
      <View style={{alignItems: 'flex-end'}}>
        <Button style={styles.button} onPress={addItem}>
          Add Expense
        </Button>
      </View>
    </View>
  );
};

export default AddGroceryItem;
