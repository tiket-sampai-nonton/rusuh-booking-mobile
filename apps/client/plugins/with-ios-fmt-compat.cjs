// Temporary fmt 11 compatibility for Xcode 26.4+ / React Native 0.79.
// Remove when the bundled fmt version is upgraded to an upstream fixed version.
const { withPodfile } = require("expo/config-plugins");

const marker = "# RBT fmt Xcode 26 compatibility";
const patch = `
    ${marker}
    fmt_base = File.join(installer.sandbox.pod_dir('fmt'), 'include', 'fmt', 'base.h')
    raise 'fmt base.h was not found; review the Xcode compatibility patch' unless File.file?(fmt_base)
    fmt_source = File.read(fmt_base)
    fmt_patched = fmt_source.gsub(/^#\\s*define FMT_USE_CONSTEVAL 1$/, '# define FMT_USE_CONSTEVAL 0')
    if fmt_patched == fmt_source && !fmt_source.include?('RBT fmt compatibility applied')
      raise 'fmt compatibility patch pattern not found; review the installed fmt version'
    end
    if fmt_patched != fmt_source
      File.chmod(0644, fmt_base)
      File.write(fmt_base, "// RBT fmt compatibility applied\\n" + fmt_patched)
    end
`;

module.exports = (config) =>
  withPodfile(config, (result) => {
    if (result.modResults.contents.includes(marker)) return result;
    const anchor = "  post_install do |installer|";
    if (!result.modResults.contents.includes(anchor)) {
      throw new Error(
        "Podfile post_install not found; cannot apply fmt compatibility patch",
      );
    }
    result.modResults.contents = result.modResults.contents.replace(
      anchor,
      anchor + "\n" + patch,
    );
    return result;
  });
