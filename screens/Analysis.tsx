import {Button, Icon, Layout, Text} from '@ui-kitten/components';
import {collection, getDocs, query, where} from 'firebase/firestore';
import React, {useEffect, useState} from 'react';
import {Dimensions, Pressable, StyleSheet, View} from 'react-native';
import {
  VictoryBar,
  VictoryChart,
  VictoryPie,
  VictoryTheme,
} from 'victory-native';
import {auth, firestore} from '../firebase/config';
import thousands from 'thousands';
import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import moment from 'moment';
import {isEmpty} from 'lodash';
import {ScrollView} from 'react-native-gesture-handler';
import ExpenseItem from '../components/ExpenseItem';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Animated, {
  FadeIn,
  ZoomInDown,
  ZoomInEasyUp,
} from 'react-native-reanimated';
import {useToast} from 'react-native-toast-notifications';

const styles = StyleSheet.create({
  totalText: {

  },
  chartContainer: {
    alignItems: 'center',
    marginTop: -160,
  },
  date: {
    fontSize: 20,
    fontFamily: 'MPLUSRounded1c-Medium',
    color: '#555',
    marginTop: 40,
    textAlign: 'center',
  },
  description: {
    marginTop: -160,
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
  noData: {
    textAlign: 'center',
    top: '42%',
    position: 'absolute',
    fontFamily: 'MPLUSRounded1c-Medium',
    fontSize: 20,
    alignSelf:"center"
  },
});

const Analysis: React.FC = ({navigation}) => {
  const [expenses, setExpenses] = useState([]);
  const [categorizedExpenses, setCategorizedExpenses] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('Food');
  const {height, width} = Dimensions.get('screen');
  const isFocused = useIsFocused();
  const toast = useToast();

  const {navigate} = useNavigation();
  const getExpenses = () => {
    const today = currentDate;
    getDocs(
      query(
        collection(firestore, 'expense'),
        where(
          'currentDate',
          '>',
          new Date(
            `${today.getFullYear()}/${
              today.getMonth() + 1
            }/${today.getDate()} 00:00`,
          ),
        ),
        where(
          'currentDate',
          '<',
          new Date(
            `${today.getFullYear()}/${
              today.getMonth() + 1
            }/${today.getDate()} 23:59`,
          ),
        ),
        where('uid', '==', auth.currentUser?.uid),
      ),
    )
      .then(async data => {
        const categories = {
          Food: 0,
          Stationery: 0,
          Room: 0,
          Medicine: 0,
          Other: 0,
        };
        for await (let doc of data.docs) {
          categories[doc.data().categoryType] =
            parseInt(categories[doc.data().categoryType]) +
            parseInt(doc.data().price);
        }

        setExpenses(data.docs.map(doc => ({...doc.data(), id: doc.id})));
        setCategorizedExpenses(
          Object.keys(categories).map(category => ({
            name: category,
            value: categories[category],
            label: category,
          })),
        );
      })
      .catch(err =>
        toast.show('Data Loading Failed!.Check Your Internet Connection', {
          type: 'warning',
        }),
      );
  };
  useEffect(() => {
    getExpenses();
  }, [isFocused === true, currentDate]);
  useEffect(() => {
    console.log('Categorized ', categorizedExpenses);
  }, [categorizedExpenses]);
  return (
    <View
      style={{
        backgroundColor: '#FFF',
        flex: 1,
      }}>
      <View>
        <Pressable
          onPress={() => {
            DateTimePickerAndroid.open({
              onChange: (event, date) => setCurrentDate(date),
              value: currentDate,
              display: 'spinner',
            });
          }}
          style={{zIndex: 100}}>
          <Text style={styles.date}>
            {currentDate.toDateString() == new Date().toDateString()
              ? 'Today'
              : moment(currentDate).format('dddd DD MMMM YYYY')}
          </Text>
        </Pressable>
      </View>
      {categorizedExpenses.some(category => category.value !== 0) ? (
        <Layout>
          <View style={styles.totalText}>
            <Animated.Text
              entering={ZoomInEasyUp.duration(3000)}
              style={{
                textAlign: 'center',
                fontFamily: 'MPLUSRounded1c-Medium',
                fontSize: 30,
                marginTop: 15,
              }}>
              {thousands(
                categorizedExpenses.reduce((total, categoryExpense) => {
                  console.log(categoryExpense, total);
                  return parseInt(total) + parseInt(categoryExpense.value);
                }, 0),
              )}
            </Animated.Text>
          </View>
          <View style={styles.chartContainer}>
            <VictoryPie
              colorScale={[
                '#F79D65',
                '#F7B267',
                '#F4845F',
                '#F27059',
                '#F25C54',
              ]}
              data={categorizedExpenses}
              animate={{
                duration: 2000,
              }}
              radius={({datum}) =>
                datum.name === selectedCategory
                  ? width * 0.35
                  : width * 0.35 - 10
              }
              style={{labels: {display: 'none'}}}
              y="value"
              padAngle={({datum}) => datum.y}
              innerRadius={70}
              width={width * 0.8}
              height={height * 0.8}
              labelRadius={500}
              events={[
                {
                  target: 'data',
                  eventHandlers: {
                    onPress: () => {
                      return [
                        {
                          target: 'labels',
                          mutation: props => {
                            setSelectedCategory(
                              categorizedExpenses[props.index].name,
                            );
                          },
                        },
                      ];
                    },
                  },
                },
              ]}
            />
          </View>
          <Animated.View
            entering={ZoomInDown.duration(2000)}
            style={styles.description}>
            <Text
              style={{
                textAlign: 'center',
                fontFamily: 'MPLUSRounded1c-Regular',
                fontSize: 20,
              }}>
              {selectedCategory} Expenses
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontFamily: 'MPLUSRounded1c-Medium',
                fontSize: 30,
              }}>
              {!isEmpty(categorizedExpenses)
                ? thousands(
                    categorizedExpenses.filter(
                      category => category.name === selectedCategory,
                    )[0].value,
                  )
                : ''}
            </Text>
            <ScrollView>
              {expenses
                .filter(expense => expense.categoryType === selectedCategory)
                .map((expense, index) => (
                  <ExpenseItem
                    refetch={() => {}}
                    totalItems={expenses.length}
                    index={index}
                    key={index}
                    id={expense.id}
                    name={expense.name}
                    price={expense.price}
                  />
                ))}
            </ScrollView>
          </Animated.View>
        </Layout>
      ) : (
        <Animated.Text entering={FadeIn.duration(1000)} style={styles.noData}>
          No Expenses
        </Animated.Text>
      )}
      <Animated.View
        entering={ZoomInDown.duration(1000)}
        style={styles.addButtonContainer}>
        <Button
          style={styles.addButton}
          onPress={() => navigate('Root', {screen: 'Withdrawal'})}
          accessoryRight={props => (
            <Icon {...props} name="arrow-forward-outline" />
          )}>
          View Cash Withdrawal
        </Button>
      </Animated.View>
    </View>
  );
};

export default Analysis;
