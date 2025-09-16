import React, { useState, useRef } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { transcribeAudio } from "../api/transcribe-audio";
import { cn } from "../utils/cn";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  className?: string;
}

export default function VoiceRecorder({ onTranscription, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant microphone permission to use voice input.");
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Recording Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      setIsRecording(false);
      setIsTranscribing(true);

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (uri) {
        // Transcribe the audio
        const transcription = await transcribeAudio(uri);
        onTranscription(transcription);
      }
    } catch (error) {
      console.error("Failed to stop recording or transcribe:", error);
      Alert.alert("Transcription Error", "Failed to transcribe audio. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View className={cn("items-center", className)}>
      <Pressable
        onPress={handlePress}
        disabled={isTranscribing}
        className={cn(
          "w-16 h-16 rounded-full items-center justify-center",
          isRecording ? "bg-red-600" : "bg-yellow-600",
          isTranscribing && "opacity-50"
        )}
      >
        {isTranscribing ? (
          <Ionicons name="hourglass" size={24} color="black" />
        ) : isRecording ? (
          <Ionicons name="stop" size={24} color="white" />
        ) : (
          <Ionicons name="mic" size={24} color="black" />
        )}
      </Pressable>
      
      <Text className="text-neutral-400 text-xs mt-2 text-center">
        {isTranscribing 
          ? "Transcribing..." 
          : isRecording 
            ? "Tap to stop" 
            : "Tap to record"
        }
      </Text>
      
      {isRecording && (
        <View className="flex-row items-center mt-1">
          <View className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1" />
          <Text className="text-red-500 text-xs">Recording</Text>
        </View>
      )}
    </View>
  );
}