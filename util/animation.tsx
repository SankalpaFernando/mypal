import {withTiming} from 'react-native-reanimated';

export const topBarEnter = () => {
  'worklet';
  const animations = {
    originY: withTiming(0, {duration: 3000}),
  };
  const initialValues = {
    originY: -500,
    opacity: 1,
  };
  return {
    initialValues,
    animations,
  };
};

export const floatButton = () => {
  'worklet';
  const animations = {
    bottom: withTiming(0, {duration: 3000}),
  };
  const initialValues = {
    bottom: 80,
    opacity: 1,
  };
  return {
    initialValues,
    animations,
  };
};