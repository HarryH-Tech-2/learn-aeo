import * as fs from "fs";
import * as path from "path";

const API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

const STYLE_PREFIX =
  "Stylized game art, vibrant colors, slightly fantastical, Zelda meets Indiana Jones aesthetic. Ancient Egyptian theme.";

async function generateImage(prompt: string, outputPath: string): Promise<void> {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(outputPath)) {
    console.log(`  skip ${outputPath} (already exists)`);
    return;
  }

  console.log(`  generating ${outputPath}...`);

  const response = await fetch(
    `${BASE_URL}/models/gemini-2.5-flash-image:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Generate an image: ${STYLE_PREFIX} ${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["image"],
        },
      }),
    }
  );

  const data = await response.json();
  const imagePart = data.candidates?.[0]?.content?.parts?.find(
    (p: any) => p.inlineData
  );

  if (!imagePart) {
    console.error(`  FAILED: ${outputPath}`, JSON.stringify(data).slice(0, 300));
    return;
  }

  const buffer = Buffer.from(imagePart.inlineData.data, "base64");
  fs.writeFileSync(outputPath, buffer);
  console.log(`  done ${outputPath}`);

  // Rate limit delay
  await new Promise((r) => setTimeout(r, 2000));
}

const SCENE_PROMPTS: Record<string, string> = {
  "expedition-begins": "An archaeological base camp at the entrance to an ancient Egyptian temple at dusk, with tents and equipment, a massive stone entrance with hieroglyphs, dramatic lighting",
  "outer-courtyard": "An overgrown courtyard of an ancient Egyptian temple with walls carved with animal and plant hieroglyphs, vines growing over stone columns, golden sunlight filtering through",
  "pilgrims-gallery": "A long gallery hallway inside an Egyptian temple with walls showing carved human figures making offerings, oil lamps flickering, mysterious atmosphere",
  "the-treasury": "A treasure room in an Egyptian temple filled with clay tablets, scrolls, and counting stones, shelves carved into walls, golden artifacts catching lamplight",
  "royal-hall": "A grand ceremonial hall with massive cartouches of pharaohs carved on the walls, golden throne, monumental statues flanking the entrance",
  "sacred-chapel": "A sacred chapel deep inside an Egyptian temple with walls covered in Book of the Dead spells, ethereal blue light, canopic jars on an altar",
  "hypostyle-hall": "A massive hypostyle hall with towering decorated columns, hieroglyphic inscriptions on every surface, shafts of light from above",
  "inner-sanctum": "The inner sanctum of the Temple of Thoth, a mysterious chamber with a golden ibis statue, glowing hieroglyphs on the walls, ancient power emanating",
};

const BADGE_PROMPTS: Record<string, string> = {
  "base-camp": "Small icon of a tent and campfire, archaeological expedition theme",
  "courtyard": "Small icon of a stone archway with vines",
  "gallery": "Small icon of a torch lighting a hallway",
  "treasury": "Small icon of golden coins and a clay tablet",
  "royal-hall": "Small icon of a golden cartouche ring",
  "chapel": "Small icon of an ankh symbol glowing blue",
  "hypostyle": "Small icon of a decorated column",
  "sanctum": "Small icon of a golden ibis bird",
  "perfect-report": "Small icon of a scroll with a golden star",
  "sharp-memory": "Small icon of a brain with hieroglyphs",
  "streak-3": "Small icon showing number 3 with a flame",
  "streak-7": "Small icon showing number 7 with a larger flame",
  "streak-30": "Small icon showing number 30 with a blazing fire",
  "first-glyph": "Small icon of a single hieroglyph on stone",
  "half-alphabet": "Small icon of a half-filled scroll",
  "all-glyphs": "Small icon of a completed golden scroll with a seal",
};

async function main() {
  if (!API_KEY) {
    console.error("Set GEMINI_API_KEY environment variable");
    process.exit(1);
  }

  console.log("Generating scene images...");
  for (const [id, prompt] of Object.entries(SCENE_PROMPTS)) {
    await generateImage(prompt, `public/lessons/${id}/scene.webp`);
    for (let g = 1; g <= 3; g++) {
      await generateImage(
        `Close-up detail of ancient Egyptian wall carving showing hieroglyphs, part ${g} of temple ${id}, archaeological discovery`,
        `public/lessons/${id}/group-${g}.webp`
      );
    }
  }

  console.log("\nGenerating badge icons...");
  for (const [id, prompt] of Object.entries(BADGE_PROMPTS)) {
    await generateImage(prompt, `public/badges/${id}.webp`);
  }

  console.log("\nGenerating temple map...");
  await generateImage(
    "Top-down illustrated map of an ancient Egyptian temple complex, showing multiple connected areas from entrance to inner sanctum, game map style with pathways",
    "public/map/temple-map.webp"
  );

  console.log("\nDone!");
}

main().catch(console.error);
