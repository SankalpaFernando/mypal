import { Spinner } from "@ui-kitten/components";
import React from "react";
import { View } from "react-native";

const Loader: React.FC = () => {
  return (
    <View style={{alignItems: 'center',marginTop:50,zIndex:0.5}}>
      <Spinner
        size="large"
        style={{width: 64, height: 64,borderRadius:32,borderWidth:5.5}}
        status="warning"
      />
    </View>
  );
}

export default Loader;