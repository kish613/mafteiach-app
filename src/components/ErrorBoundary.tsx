import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("Unhandled app error:", error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: "#160A06" }}>
          <View className="w-full max-w-md rounded-2xl overflow-hidden border" style={{ backgroundColor: "#31170D", borderColor: "#8A5B2A" }}>
            <Text className="px-5 pt-5 text-lg font-semibold" style={{ color: "#E7D1A8" }}>Something went wrong</Text>
            <ScrollView className="px-5 mt-2 max-h-48">
              <Text className="text-xs" style={{ color: "#C7B08B" }}>{this.state.error?.message || "Unexpected error"}</Text>
            </ScrollView>
            <View className="flex-row justify-end px-4 py-3 border-t" style={{ borderColor: "#8A5B2A" }}>
              <Pressable onPress={this.handleRetry} className="px-4 py-2 rounded-lg" style={{ backgroundColor: "#7A3F19" }}>
                <Text style={{ color: "#E7D1A8" }}>Retry</Text>
              </Pressable>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
