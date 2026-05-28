import React from 'react';
import { Text, View, TextInput, StyleSheet, type ViewStyle, type TextStyle, type KeyboardTypeOptions } from 'react-native';

interface CustomTextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
  },
});

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  textStyle,
  containerStyle,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
}) => {
  return (
    <View style={containerStyle}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[
          textStyle,
          styles.input,
        ]}
      />
    </View>
  );
};

export default CustomTextInput;
