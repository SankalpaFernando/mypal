import 'react-native-get-random-values';
import {Button, Datepicker, Icon, Input, Text} from '@ui-kitten/components';
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

const AddTodoItem: React.FC<AddTodoItemProps> = ({setClose, refetch}) => {
  const [formData, setFormData] = useState<{
    name: string;
    date: Date | undefined;
    time: Date | undefined;
  }>({
    name: '',
    date: new Date(),
    time: new Date(),
  });

  const styles = StyleSheet.create({
    input: {
      margin: 10,
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
    const date = moment(
      `${moment(formData.date).format('YYYY-MM-DD')} ${moment(
        formData.time,
      ).format('HH:mm:ss')}`,
    );
    console.log(date);
    setDoc(doc(firestore, 'todos', uuidv4()), {
      ...formData,
      date:date.toDate(),
      uid: auth.currentUser ? auth.currentUser.uid : '',
    }).then(response => {
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Todo Item Added',
        button: 'OK',
      });
      refetch();
    });
  };

  return (
    <View>
      <Text style={styles.heading}>Add New Activity</Text>

      <Input
        value={
          moment(formData.date).format('YYYY-MM-DD') +
          ' ' +
          moment(formData.time).format('HH:mm')
        }
        style={styles.input}
        editable={false}
        accessoryRight={props => <Icon {...props} name="calendar-outline" />}
        onPressIn={() =>
          DateTimePickerAndroid.open({
            onChange: (event, date) => {
              setFormData({...formData, date});
              DateTimePickerAndroid.open({
                onChange: (_event, time) => {
                  setFormData({...formData, time});
                  console.log('Date ');
                },
                value: formData.time,
                display: 'spinner',
                mode: 'time',
              });
            },
            value: formData.date,
            display: 'spinner',
          })
        }
        multiline={true}
        size="large"
      />
      <Input
        placeholder="Task"
        style={styles.input}
        onChangeText={text => setFormData({...formData, name: text})}
        multiline={true}
        size="large"
      />
      <View style={{alignItems: 'flex-end'}}>
        <Button style={styles.button} onPress={addItem}>
          Add Activity
        </Button>
      </View>
    </View>
  );
};

export default AddTodoItem;
