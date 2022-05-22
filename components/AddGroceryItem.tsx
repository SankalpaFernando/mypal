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
import {doc, setDoc} from 'firebase/firestore';
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
};

const AddGroceryItem: React.FC<AddTodoItemProps> = ({setClose, refetch}) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    quantityType: 'kg',
  });
  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
  const styles = StyleSheet.create({
    input: {
      marginVertical: 10,
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

  const addItem = () => {
    setClose();
    setDoc(doc(firestore, 'grocery', uuidv4()), {
      ...formData,
      uid: auth.currentUser ? auth.currentUser.uid : '',
    }).then(response => {
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Grocery Item Added',
        button: 'OK',
      });
      refetch();
    });
  };

  const quantityTypeOptions = ['Kg', 'g', 'ltr', 'ml', 'items'];

  return (
    <View>
      <Text style={styles.heading}>Add New Grocery Item</Text>

      <Input
        placeholder="Grocery Item"
        style={styles.input}
        onChangeText={text => setFormData({...formData, name: text})}
        multiline={true}
        size="large"
      />
      <View style={{width: '100%', flexDirection: 'row'}}>
        <Input
          placeholder="Quantity"
          style={[{width: '40%', marginRight: 14}]}
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
          style={{width: '55%'}}>
          {quantityTypeOptions.map(option => (
            <SelectItem title={option} />
          ))}
        </Select>
      </View>
      <View style={{alignItems: 'flex-end'}}>
        <Button style={styles.button} onPress={addItem}>
          Add Grocery
        </Button>
      </View>
    </View>
  );
};

export default AddGroceryItem;
