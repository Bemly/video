// WinterJS 小工具实机演示
console.log("semver :", WinterJS.semver.satisfies("26.9.27", "^26.9.0"));
console.log("yaml   :", WinterJS.yaml.parse("engine: SpiderMonkey\nlang: Rust"));
console.log("ip     :", WinterJS.ip.contains("10.0.0.0/8", "10.9.9.9"));
console.log("image  :", WinterJS.image.formats().length, "种格式");
console.log(WinterJS.qrcode("https://github.com/Bemly/winterjs"));
