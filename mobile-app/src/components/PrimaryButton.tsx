import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { theme } from "../theme";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
};

export default function PrimaryButton({ title, onPress, disabled, variant = "primary" }: PrimaryButtonProps) {
  const textStyle = [
    styles.text,
    variant === "primary" && styles.primaryText,
    variant === "danger" && styles.dangerText
  ];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, styles[variant], disabled && styles.disabled]}
    >
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center"
  },
  primary: {
    backgroundColor: theme.colors.primary
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  danger: {
    backgroundColor: theme.colors.danger
  },
  disabled: {
    opacity: 0.5
  },
  text: {
    color: theme.colors.secondaryText,
    fontSize: 16,
    fontWeight: "600"
  },
  primaryText: {
    color: theme.colors.primaryText
  },
  dangerText: {
    color: theme.colors.dangerText
  }
});
