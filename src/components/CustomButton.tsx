import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';

interface CustomButtonProps {
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

const styles = StyleSheet.create({
  buttonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
});

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
        <View style={styles.buttonInner}>
          <Text style={textStyle}>{label}</Text>
        </View>
      </TouchableOpacity>
      {children}
    </View>
  );
};

export default CustomButton;
