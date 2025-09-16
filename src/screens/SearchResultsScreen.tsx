import React, { useRef, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import WoodBackground from "../components/WoodBackground";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSearchStore } from "../state/searchStore";
import SourceCard from "../components/SourceCard";
import { TorahSource } from "../state/searchStore";
import TypographyControls from "../components/TypographyControls";
import CompareSheet from "../components/CompareSheet";
import SugyaMap from "../components/SugyaMap";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import ExportPack from "../components/ExportPack";
import FolderPicker from "../components/FolderPicker";

export default function SearchResultsScreen() {
  const navigation = useNavigation();
  const { currentQuery, currentResults, favorites, addToFavorites, removeFromFavorites } = useSearchStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const exportRef = useRef<View | null>(null);
  const [folderModal, setFolderModal] = useState<{open:boolean, target?: TorahSource}>({open:false});
  const assignToFolder = useSearchStore(s => s.assignToFolder);

  const handleFavoritePress = (source: TorahSource) => {
    const isFavorite = favorites.some(fav => fav.id === source.id);
    if (isFavorite) {
      removeFromFavorites(source.id);
    } else {
      addToFavorites(source);
    }
  };

  const isFavorite = (source: TorahSource) => {
    return favorites.some(fav => fav.id === source.id);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1">
      <WoodBackground>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-neutral-800">
          <Pressable onPress={handleBack} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#C7954B" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-lg font-semibold" style={{ color: "#E5CDA4" }}>Search Results</Text>
            <Text className="text-sm" style={{ color: "#C7B08B" }} numberOfLines={1}>
              "{currentQuery}"
            </Text>
          </View>
          <View className="flex-row items-center" style={{ gap: 12 }}>
            <Pressable onPress={() => setShowMap(true)}>
              <Ionicons name="map-outline" size={20} color="#C7954B" />
            </Pressable>
            <TypographyControls />
          </View>
        </View>
 
        {/* Results */}
        <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 24 }}>
          {currentResults.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="search" size={64} color="#8B8B8B" />
              <Text className="text-lg mt-4" style={{ color: "#C7B08B" }}>No sources found</Text>
              <Text className="text-sm text-center mt-2" style={{ color: "#B89367" }}>
                Try adjusting your search query or check your connection
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-sm mb-4" style={{ color: "#C7B08B" }}>
                Found {currentResults.length} sources
              </Text>
              {currentResults.map((source, idx) => (
                <Animated.View key={source.id} entering={FadeInDown.delay(idx * 60).duration(400)}>
                  <SourceCard
                    source={source}
                    onFavoritePress={handleFavoritePress}
                    onFolderPress={(s)=> setFolderModal({ open: true, target: s })}
                    onLongPress={(s)=>{
                      setSelected(prev => prev.includes(s.id) ? prev.filter(id=>id!==s.id) : [...prev, s.id]);
                    }}
                    selected={selected.includes(source.id)}
                    className="mb-4"
                    animate
                    animateDelayMs={idx * 80}
                  />
                </Animated.View>
              ))}
            </>
          )}
        </ScrollView>

        {/* Export hidden view */}
        <View style={{ position: "absolute", left: -9999 }}>
          <ExportPack ref={exportRef as any} query={currentQuery} sources={currentResults.filter(s=> selected.length? selected.includes(s.id): true)} />
        </View>

        {/* Bottom bar for compare/export */}
        {selected.length >= 2 && (
          <View className="flex-row items-center justify-between px-4 py-3 border-t" style={{ borderColor: "#8A5B2A", backgroundColor: "#2F1B12" }}>
            <Text style={{ color: "#E7D1A8" }}>{selected.length} selected</Text>
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <Pressable onPress={() => setShowCompare(true)} className="px-4 py-2 rounded-lg" style={{ backgroundColor: "#7A3F19" }}>
                <Text style={{ color: "#E7D1A8" }}>Compare</Text>
              </Pressable>
              <Pressable onPress={async ()=>{
                if (!exportRef.current) return;
                const uri = await captureRef(exportRef, { format: "png", quality: 0.95 });
                await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share Pack" });
              }} className="px-4 py-2 rounded-lg" style={{ backgroundColor: "#3B1D0F", borderColor: "#8A5B2A", borderWidth: 1 }}>
                <Text style={{ color: "#E7D1A8" }}>Export</Text>
              </Pressable>
            </View>
          </View>
        )}

        <CompareSheet visible={showCompare} onClose={()=>setShowCompare(false)} sources={currentResults.filter(s=> selected.includes(s.id)).slice(0,3)} />
        <SugyaMap visible={showMap} onClose={()=>setShowMap(false)} sources={currentResults} />
        <FolderPicker
          visible={folderModal.open}
          onClose={()=> setFolderModal({ open: false })}
          onAssign={(folderId)=>{
            if (folderModal.target && folderId) assignToFolder(folderModal.target.id, folderId);
            setFolderModal({ open: false });
          }}
        />

      </WoodBackground>
    </SafeAreaView>
  );
}