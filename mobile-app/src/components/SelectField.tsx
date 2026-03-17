import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { theme } from "../theme";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onChangeValue: (value: string) => void;
  placeholder?: string;
};

export default function SelectField({
  label,
  value,
  options,
  onChangeValue,
  placeholder = "Select"
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => {
      return option.label.toLowerCase().includes(normalizedQuery)
        || option.value.toLowerCase().includes(normalizedQuery);
    });
  }, [options, query]);

  const selectedLabel = options.find((option) => option.value === value)?.label || value;

  function close() {
    setIsOpen(false);
    setQuery("");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={() => setIsOpen(true)} style={styles.trigger}>
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {value ? selectedLabel : placeholder}
        </Text>
      </Pressable>

      <Modal visible={isOpen} animationType="slide" transparent onRequestClose={close}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable onPress={close}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search..."
              placeholderTextColor={theme.colors.placeholder}
              style={styles.searchInput}
            />

            <ScrollView contentContainerStyle={styles.optionList}>
              {filteredOptions.map((option) => {
                const isSelected = option.value === value;

                return (
                  <Pressable
                    key={`${option.value}-${option.label}`}
                    onPress={() => {
                      onChangeValue(option.label);
                      close();
                    }}
                    style={[styles.option, isSelected && styles.optionSelected]}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textMuted
  },
  trigger: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: theme.colors.input
  },
  triggerText: {
    color: theme.colors.text
  },
  placeholder: {
    color: theme.colors.placeholder
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end"
  },
  sheet: {
    maxHeight: "80%",
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    gap: 12
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sheetTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700"
  },
  closeText: {
    color: theme.colors.primary,
    fontWeight: "700"
  },
  searchInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: theme.colors.input,
    color: theme.colors.text
  },
  optionList: {
    gap: 8,
    paddingBottom: 24
  },
  option: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: theme.colors.input
  },
  optionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceAlt
  },
  optionText: {
    color: theme.colors.text
  },
  optionTextSelected: {
    color: theme.colors.primary
  }
});
