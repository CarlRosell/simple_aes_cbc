import { build, emptyDir } from "https://deno.land/x/dnt@0.38.1/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {},
  test: false,
  compilerOptions: {
    lib: ["ES2021", "DOM"],
  },
  package: {
    // package.json properties
    name: "simple-aes-cbc",
    version: Deno.args[0],
    description:
      "A simple wrapper for WebCrypto which uses the AES-CBC algorithm.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/CarlRosell/simple_aes_cbc.git",
    },
    bugs: {
      url: "https://github.com/CarlRosell/simple_aes_cbc/issues",
    },
    engines: {
      node: ">=15.0.0",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
