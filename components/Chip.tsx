import {Button} from '@ui-kitten/components';
import React from 'react';

type ChipProps = {
  name: string;
  selected: boolean;
  onSelect: Function;
  style: Object;
};

const Chip: React.FC<ChipProps> = ({name, selected = false,style,onSelect}) => {
  return (
    <Button
      style={[
        {
          alignSelf: 'flex-start',
          borderRadius: 20,
          padding: 0,
          margin: 0,
          marginHorizontal: 10,
          ...style
        },
        !selected && {backgroundColor: '#FFF'},
      ]}
      onPress={onSelect}
      appearance={selected ? 'filled' : 'outline'}>
      {name}
    </Button>
  );
};

export default Chip;
