// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Simple configuration - let Expo handle caching internally
// This avoids the metro-cache deep import issues

module.exports = withNativeWind(config, { input: "./global.css" });
