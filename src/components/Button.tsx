import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    disabled?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    loading = false,
    variant = 'primary',
    disabled = false,
    icon,
}) => {
    const getStyles = () => {
        if (disabled) return { bg: '#E2E8F0', text: '#94A3B8' };
        switch (variant) {
            case 'primary': return { bg: '#4F46E5', text: '#FFFFFF' };
            case 'secondary': return { bg: '#7C3AED', text: '#FFFFFF' };
            case 'danger': return { bg: '#EF4444', text: '#FFFFFF' };
            case 'outline': return { bg: 'transparent', text: '#4F46E5' };
            default: return { bg: '#4F46E5', text: '#FFFFFF' };
        }
    };

    const colors = getStyles();
    const isOutline = variant === 'outline';

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: colors.bg },
                isOutline && styles.outlineButton,
                disabled && styles.disabled,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={colors.text} size="small" />
            ) : (
                <View style={styles.content}>
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={20}
                            color={colors.text}
                            style={styles.icon}
                        />
                    )}
                    <Text style={[styles.text, { color: colors.text }]}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 15,
        paddingHorizontal: 24,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 6,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    outlineButton: {
        borderWidth: 2,
        borderColor: '#4F46E5',
        shadowOpacity: 0,
        elevation: 0,
    },
    disabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
