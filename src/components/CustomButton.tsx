import React from 'react';
import { Text, TouchableOpacity, View, type ViewStyle, type TextStyle } from 'react-native';

interface CustomButtonProps {
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  containerStyle,
  textStyle,
  label,
  onPress,
  children,
}) => {
  return (
    <View style={containerStyle}>
      <TouchableOpacity onPress={onPress}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
          }}
        >
          <Text style={textStyle}>{label}</Text>
        </View>
      </TouchableOpacity>
      {children}
    </View>
  );
};

export default CustomButton;
