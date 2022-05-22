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
  balanceType: 'Bank' | 'Cash on Hand';
  refetch: Function;
};

const UpdateBalance: React.FC<AddTodoItemProps> = ({
  setClose,
  balanceType,
  refetch,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    date: new Date(),
  });
  const [selectedIndex, setSelectedIndex] = useState(
    new IndexPath(balanceType === 'Bank' ? 1 : 0),
  );
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

  const updateBalance = async () => {
    setClose();
    const uid = auth.currentUser?.uid;
    const user = await getDoc(doc(firestore, 'users', uid));
    let bankBalance = 0;
    let onHandBalance = parseInt(user.data().onHandBalance);
    if (balanceType === 'Bank' && selectedIndex.row === 1) {
      bankBalance = user.data().bankBalance - formData.amount;
      onHandBalance = parseInt(formData.amount) + onHandBalance;
      setDoc(doc(firestore, 'withdrawals', uuidv4()), {
        amount: parseInt(formData.amount),
        date: formData.date,
        uid: auth.currentUser?.uid
      });
    } else {
      bankBalance = formData.amount;
    }
    updateDoc(doc(firestore, 'users', uid), {
      bankBalance: parseInt(bankBalance),
      onHandBalance: parseInt(onHandBalance),
    }).then(() => {
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title:
          selectedIndex.row === 1
            ? 'Balance has been Updated'
            : 'Cash have been withdrawn',
        button: 'OK',
      });
      refetch();
    });
  };

  const transactionOptions = ['Balance Update', 'Cash Withdrawl'];

  return (
    <View>
      <Text style={styles.heading}>Update {balanceType} Balance</Text>
      {balanceType === 'Bank' && (
        <Select
          selectedIndex={selectedIndex}
          onSelect={index => setSelectedIndex(index)}
          size="large"
          value={transactionOptions[selectedIndex.row]}
          style={styles.input}>
          {transactionOptions.map(option => (
            <SelectItem title={option} />
          ))}
        </Select>
      )}
      {balanceType === 'Bank' && selectedIndex.row === 1 && (
        <Input
          value={moment(formData.date).format('YYYY-MM-DD')}
          style={styles.input}
          editable={false}
          accessoryRight={props => <Icon {...props} name="calendar-outline" />}
          onPressIn={() =>
            DateTimePickerAndroid.open({
              onChange: (event, date) => setFormData({...formData, date}),
              value: formData.date,
              display: 'spinner',
            })
          }
          multiline={true}
          size="large"
        />
      )}
      <Input
        placeholder={selectedIndex.row === 1 ? 'Withdrawl Amount' : 'Balance'}
        style={styles.input}
        onChangeText={text => setFormData({...formData, amount: text})}
        multiline={true}
        size="large"
      />
      <View style={{alignItems: 'flex-end'}}>
        <Button onPress={() => updateBalance()} style={styles.button}>
          Update Current {balanceType} Balance
        </Button>
      </View>
    </View>
  );
};

export default UpdateBalance;
