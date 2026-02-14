const { withPodfile } = require('@expo/config-plugins');

const FOLLY_FIX_CODE = `    # Fix for folly/coro/Coroutine.h file not found (react-native-reanimated)
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        flags = config.build_settings['OTHER_CPLUSPLUSFLAGS'] || '$(inherited)'
        config.build_settings['OTHER_CPLUSPLUSFLAGS'] = "\#{flags} -DFOLLY_CFG_NO_COROUTINES=1" unless flags.include?('FOLLY_CFG_NO_COROUTINES')
      end
    end
`;

/**
 * Config plugin to add compiler flag to disable Folly coroutines via Podfile post_install.
 * This fixes the 'folly/coro/Coroutine.h' file not found error (avoids pbxproj parsing issues).
 */
const withFollyCoroutineFix = (config) => {
  return withPodfile(config, (config) => {
    let podfileContent = config.modResults;

    if (podfileContent.includes('FOLLY_CFG_NO_COROUTINES')) {
      config.modResults = podfileContent;
      return config;
    }

    // Inject into post_install: insert after react_native_post_install(...) and before "  end"
    const postInstallIdx = podfileContent.indexOf('post_install do |installer|');
    if (postInstallIdx === -1) {
      config.modResults = podfileContent;
      return config;
    }

    // Find "  end" that closes the post_install block (2-space indent before "end")
    const afterPostInstall = podfileContent.slice(postInstallIdx);
    const endMatch = afterPostInstall.match(/\n  end\n/);
    if (!endMatch) {
      config.modResults = podfileContent;
      return config;
    }

    const insertPos = postInstallIdx + endMatch.index;
    podfileContent =
      podfileContent.slice(0, insertPos) +
      FOLLY_FIX_CODE +
      '\n' +
      podfileContent.slice(insertPos);

    config.modResults = podfileContent;
    return config;
  });
};

module.exports = withFollyCoroutineFix;
