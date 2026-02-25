const appJson = require('./app.json');
const expoConfig = appJson.expo || {};

module.exports = {
  expo: {
    ...expoConfig,
    plugins: (expoConfig.plugins || []).map((p) => {
      if (Array.isArray(p) && p[0] === 'expo-build-properties') {
        return ['expo-build-properties', { ...p[1], android: { ...(p[1].android || {}), usesCleartextTraffic: true } }];
      }
      return p;
    }),
  },
};
