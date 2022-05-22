import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {Button, Icon, Text} from '@ui-kitten/components';
import {collection, getDocs, orderBy, query, where} from 'firebase/firestore';
import moment from 'moment-timezone';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import Animated, { ZoomInDown } from 'react-native-reanimated';
import Chip from '../components/Chip';
import WithdrawalItem from '../components/WithdrawalItem';
import {auth, firestore} from '../firebase/config';
import {useToast} from 'react-native-toast-notifications';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  dateRangeContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
    alignSelf: 'center',
  },
  date: {
    fontSize: 15,
    marginHorizontal: 20,
    fontFamily: 'MPLUSRounded1c-Light',
  },
  header: {
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 20,
    marginTop: 30,
    fontFamily: 'MPLUSRounded1c-Medium',
    alignItems: 'center',
  },
  addButtonContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 30,
    paddingVertical: 15,
    position: 'absolute',
    bottom: 10,
  },
  addButton: {
    width: 250,
    borderRadius: 10,
    fontFamily: 'MPLUSRounded1c-Bold',
  },
});

const Withdrawal: React.FC = () => {
  const [withDrawals, setWithDrawals] = useState([]);
  const [dateRange, setDateRange] = useState({
    end: moment(),
    start: moment().subtract(7, 'days'),
  });
  const isFocused = useIsFocused();
  const { navigate } = useNavigation();
  const toast = useToast();
  

  const getWithdrawals = (rangeStart, rangeEnd) => {
    //  setIsLoading(true);
    getDocs(
      query(
        collection(firestore, 'withdrawals'),
        where(
          'date',
          '>',
          new Date(`${rangeStart.format('YYYY/MM/DD')} 00:00`),
        ),
        where('date', '<', new Date(`${rangeEnd.format('YYYY/MM/DD')} 23:59`)),
        where('uid', '==', auth.currentUser?.uid),
        orderBy('date'),
      ),
    )
      .then(data => {
        console.log(
          '🚀 ~ file: CashOut.tsx ~ line 35 ~ getWithdrawals ~ data',
          data.docs,
        );
        setWithDrawals(data.docs.map(doc => ({...doc.data(), id: doc.id})));
      })
      .catch(err =>
        toast.show('Data Loading Failed!.Check Your Internet Connection', {
          type: 'warning',
        }),
      );
    // .finally(() => setIsLoading(false));
  };
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    let subtractDays = {amount: 7, type: 'days'};
    if (selectedIndex === 1) {
      subtractDays = {amount: 1, type: 'months'};
    } else if (selectedIndex === 2) {
      subtractDays = {amount: 1, type: 'years'};
    }
    var rangeEnd = moment();
    var rangeStart = moment(rangeEnd).subtract(
      subtractDays.amount,
      subtractDays.type,
    );
    setDateRange({start: rangeStart, end: rangeEnd});
  }, [isFocused === true, selectedIndex]);

  useEffect(() => {
    console.log(
      '🚀 ~ file: Withdrawals.tsx ~ line 92 ~ useEffect ~ dateRange',
      dateRange,
    );
    getWithdrawals(dateRange.start, dateRange.end);
  }, [dateRange]);

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', marginTop: 60}}>
        <Chip
          selected={selectedIndex === 0}
          onSelect={() => setSelectedIndex(0)}
          name="This Week"
        />
        <Chip
          selected={selectedIndex === 1}
          onSelect={() => setSelectedIndex(1)}
          name="This Month"
        />
        <Chip
          selected={selectedIndex === 2}
          onSelect={() => setSelectedIndex(2)}
          name="This Year"
        />
      </View>
      <View>
        <Chip
          selected={selectedIndex === 3}
          onSelect={() => {
            DateTimePickerAndroid.open({
              onChange: (event, start) => {
                console.log(
                  '🚀 ~ file: Withdrawals.tsx ~ line 119 ~ start',
                  start,
                );
                setDateRange({...dateRange, start: moment(start)});
                DateTimePickerAndroid.open({
                  onChange: (event, end) =>
                    setDateRange({start: moment(start), end: moment(end)}),
                  value: new Date(dateRange.end),
                  display: 'spinner',
                });
              },
              value: new Date(dateRange.start),
              display: 'spinner',
            });
          }}
          name="Custom"
          style={{width: '95%', marginTop: 10, alignSelf: 'center'}}
        />
      </View>
      <Text style={styles.header}>Cash Withdrawals</Text>
      <View style={styles.dateRangeContainer}>
        <Text style={styles.date}>{dateRange.start.format('YYYY-MM-DD')}</Text>
        <Text>-</Text>
        <Text style={styles.date}>{dateRange.end.format('YYYY-MM-DD')}</Text>
      </View>
      <ScrollView style={{marginTop: 20}}>
        {withDrawals.map(({amount, date}, index) => (
          <WithdrawalItem
            amount={amount}
            key={index}
            index={index}
            totalItems={withDrawals.length}
            date={date}
          />
        ))}
      </ScrollView>
      <Animated.View
        entering={ZoomInDown.duration(1000)}
        style={styles.addButtonContainer}>
        <Button
          style={styles.addButton}
          onPress={() => navigate('Root', {screen: 'Analysis'})}
          accessoryLeft={props => (
            <Icon {...props} name="arrow-back-outline" />
          )}>
          Back to Expenses
        </Button>
      </Animated.View>
    </View>
  );
};

export default Withdrawal;
