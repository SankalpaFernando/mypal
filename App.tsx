import 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect} from 'react';
import {ApplicationProvider} from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import Home from './screens/Home';
import {
  DefaultTheme,
  NavigationContainer,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {ToastProvider} from 'react-native-toast-notifications';
import {
  createStackNavigator,
  TransitionPresets,
  TransitionSpecs,
} from '@react-navigation/stack';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import {LogBox} from 'react-native';
import {Root} from 'react-native-alert-notification';
import {setCustomView} from 'react-native-global-props';
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  IconRegistry,
} from '@ui-kitten/components';
import {default as theme} from './theme.json';
import {StyleSheet} from 'react-native';
import Login from './screens/Login';
import Todo from './screens/Todo';
import Grocery from './screens/Grocery';
import Cooking from './screens/Cooking';
import Analysis from './screens/Analysis';
import {auth} from './firebase/config';
import Expense from './screens/Expense';
import {onAuthStateChanged} from 'firebase/auth';
import Withdrawals from './screens/Withdrawals';
import Animated, {Easing, EasingNode} from 'react-native-reanimated';

const {Navigator, Screen} = createBottomTabNavigator();
const Stack = createStackNavigator();
// setCustomView({style:{backgroundColor:"#FFF"}})

const BottomTabBar = ({navigation, state}) => (
  <BottomNavigation
    selectedIndex={state.index}
    appearance="noIndicator"
    onSelect={index =>
      navigation.navigate(state.routeNames[index], {transition: 'vertical'})
    }>
    <BottomNavigationTab
      key="1"
      title="Home"
      icon={props => <Icon {...props} name="home" />}
    />
    <BottomNavigationTab
      key="2"
      title="Todo"
      icon={props => <Icon {...props} name="list-outline" />}
    />
    <BottomNavigationTab
      key="3"
      title="Grocery"
      icon={props => <Icon {...props} name="shopping-cart-outline" />}
    />
    <BottomNavigationTab
      key="4"
      title="Cooking"
      icon={props => <Icon {...props} name="square-outline" />}
    />
    <BottomNavigationTab
      key="4"
      title="Expense"
      icon={props => <Icon {...props} name="shopping-bag-outline" />}
    />
    <BottomNavigationTab
      key="4"
      title="Analysis"
      icon={props => <Icon {...props} name="pie-chart-outline" />}
    />
  </BottomNavigation>
);
const config = {
  animation: 'spring',
  config: {
    stiffness: 1000,
  },
};
const RootNavigator = () => {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => <BottomTabBar {...props} />}>
      <Stack.Screen name="User" component={WithAnimation(Home)} />
      <Stack.Screen name="Todo" component={WithAnimation(Todo)} />
      <Screen name="Grocery" component={WithAnimation(Grocery)} />
      <Screen name="Cooking" component={WithAnimation(Cooking)} />
      <Screen name="Expense" component={WithAnimation(Expense)} />
      <Screen name="Analysis" component={WithAnimation(Analysis)} />
      <Stack.Screen name="Withdrawal" component={WithAnimation(Withdrawals)} />
    </Navigator>
  );
};

const WithAnimation = Component => {
  class WithAnimationComponent extends React.Component {
    render(): React.ReactNode {
      return (
        <FadeInView>
          <Component />
        </FadeInView>
      );
    }
  }
  return WithAnimationComponent;
};

const FadeInView = (props, {navigation}) => {
  const fadeAnim = React.useRef(new Animated.Value(100)).current;
  useFocusEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 550,
      easing: EasingNode.ease,
    }).start();
    return easing => {
      Animated.timing(fadeAnim, {
        toValue: 100,
        duration: 550,
        easing: EasingNode.ease,
      }).start();
    };
  });
  return (
    <Animated.View
      style={{
        flex: 1,
        marginTop: fadeAnim,
      }}>
      {props.children}
    </Animated.View>
  );
};

const TabNavigator = () => {
  const {navigate} = useNavigation();

  onAuthStateChanged(auth, user => {
    if (user?.uid === undefined) {
      navigate('Login');
    } else {
      navigate('Root', {screen: 'Home'});
    }
  });

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Screen name="Login" component={Login} />
      <Screen name="Root" component={RootNavigator} />
    </Stack.Navigator>
  );
};

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'rgb(255, 255, 255)',
    card: 'rgb(255, 255, 255)',
    background: '#f9a927',
  },
};

const AppNavigator = () => (
  <NavigationContainer theme={appTheme}>
    <TabNavigator />
  </NavigationContainer>
);

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#FFF',
  },
  image: {
    resizeMode: 'cover',
  },
});
const App: React.FC = () => {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={{...eva.light, ...theme}}>
        <ToastProvider>
          <Root
            colors={[
              {
                label: '#666',
                card: '#FFF',
                overlay: '#000',
                success: '#ffc52a',
                danger: '#000',
                warning: '#000',
              },
              {
                label: '#000',
                card: '#000',
                overlay: '#000',
                success: '#000',
                danger: '#000',
                warning: '#000',
              },
            ]}>
            <AppNavigator />
          </Root>
        </ToastProvider>
      </ApplicationProvider>
    </>
  );
};

LogBox.ignoreLogs([
  'Warning: Async Storage has been extracted from react-native core',
]);

export default App;
