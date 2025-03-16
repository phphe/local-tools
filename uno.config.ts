import { defineConfig, transformerDirectives } from "unocss";

export default defineConfig({
  transformers: [transformerDirectives()],
  rules: [
    [
      "bg-primary",
      {
        background:
          "linear-gradient(90deg, #5acdcd 0%, #10a8a8 50%, #34d5d5 100%)",
      },
    ],
    [
      "bg-primary-dark",
      {
        background: `linear-gradient(90deg, #296565 0%, #4ab4b4 50%, #206363 100%)`,
      },
    ],
  ],
  shortcuts: {},
});
