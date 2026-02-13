const { withXcodeProject } = require('@expo/config-plugins');

/**
 * Config plugin to add compiler flag to disable Folly coroutines
 * This fixes the 'folly/coro/Coroutine.h' file not found error
 */
const withFollyCoroutineFix = (config) => {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;

    // Add OTHER_CPLUSPLUSFLAGS to all build configurations
    const configurations = xcodeProject.pbxXCBuildConfigurationSection();

    Object.keys(configurations).forEach((configKey) => {
      const buildSettings = configurations[configKey];
      if (buildSettings && buildSettings.buildSettings) {
        const existingFlags = buildSettings.buildSettings.OTHER_CPLUSPLUSFLAGS || '';
        // Check if flag already exists to avoid duplicates
        if (!existingFlags.includes('FOLLY_CFG_NO_COROUTINES')) {
          const newFlags = existingFlags
            ? `${existingFlags} -DFOLLY_CFG_NO_COROUTINES=1`
            : '-DFOLLY_CFG_NO_COROUTINES=1';
          buildSettings.buildSettings.OTHER_CPLUSPLUSFLAGS = newFlags;
        }
      }
    });

    return config;
  });
};

module.exports = withFollyCoroutineFix;
