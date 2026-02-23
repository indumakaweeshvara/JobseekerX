import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    secureTextEntry?: boolean;
    label?: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    icon?: keyof typeof Ionicons.glyphMap;
    multiline?: boolean;
    numberOfLines?: number;
}

export const Input: React.FC<InputProps> = ({
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    label,
    keyboardType = 'default',
    icon,
    multiline = false,
    numberOfLines = 1,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <View
                style={[
                    styles.inputWrapper,
                    isFocused ? styles.inputWrapperFocused : null,
                ]}
                pointerEvents="auto"
            >
                {icon ? (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={isFocused ? '#4F46E5' : '#94A3B8'}
                        style={styles.icon}
                    />
                ) : null}
                <TextInput
                    style={[
                        styles.input,
                        icon ? { paddingLeft: 10 } : null,
                        multiline ? styles.inputMultiline : null,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    editable={true}
                    contextMenuHidden={false}
                    returnKeyType="done"
                    blurOnSubmit={!multiline}
                    underlineColorAndroid="transparent"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    label: {
        fontSize: 13,
        color: '#475569',
        marginBottom: 6,
        fontWeight: '600',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        minHeight: 50,
    },
    inputWrapperFocused: {
        borderColor: '#4F46E5',
        backgroundColor: '#FFFFFF',
    },
    icon: {
        marginLeft: 14,
    },
    input: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === 'ios' ? 14 : 10,
        fontSize: 15,
        color: '#1E293B',
    },
    inputMultiline: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
});
