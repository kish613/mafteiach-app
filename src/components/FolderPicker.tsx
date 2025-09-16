import React, { useState } from "react";
import { View, Text, Modal, TextInput, Pressable, ScrollView } from "react-native";
import { useSearchStore } from "../state/searchStore";

interface Props {
  visible: boolean;
  onClose: () => void;
  onAssign: (folderId: string | null) => void;
}

export default function FolderPicker({ visible, onClose, onAssign }: Props) {
  const folders = useSearchStore(s => s.folders);
  const createFolder = useSearchStore(s => s.createFolder);
  const [newName, setNewName] = useState("");

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const id = createFolder(name);
    setNewName("");
    onAssign(id);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/70 items-center justify-center">
        <View className="bg-neutral-900 rounded-2xl p-6 w-11/12 max-w-md">
          <Text className="text-lg mb-3" style={{ color: "#E7D1A8" }}>Add to folder</Text>
          <ScrollView className="max-h-64">
            {folders.map(f => (
              <Pressable key={f.id} onPress={() => onAssign(f.id)} className="py-2">
                <Text style={{ color: "#C7B08B" }}>{f.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View className="mt-4">
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="New folder name"
              placeholderTextColor="#E7D1A899"
              className="rounded-xl px-3 py-2"
              style={{ backgroundColor: "#3B1D0F", color: "#E7D1A8", borderColor: "#8A5B2A", borderWidth: 1 }}
            />
            <View className="flex-row justify-end mt-3">
              <Pressable onPress={onClose} className="px-4 py-2 mr-2 rounded-lg" style={{ backgroundColor: "#2F150B", borderColor: "#8A5B2A", borderWidth: 1 }}>
                <Text style={{ color: "#E7D1A8" }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleCreate} className="px-4 py-2 rounded-lg" style={{ backgroundColor: "#7A3F19" }}>
                <Text style={{ color: "#E7D1A8" }}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
