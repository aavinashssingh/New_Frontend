const { zip } = require("zip-a-folder");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const packageJson = require("./package.json");

async function zipBuild() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "zip-"));
  const distFolder = path.join(__dirname, "dist");
  const procfilePath = path.join(__dirname, "Procfile");
  const zipPath = path.join(
    __dirname,
    "out",
    `nectar_${packageJson.version}.zip`
  );

  console.log(`Preparing to zip...`);

  try {
    // Copy dist folder and Procfile to temporary directory
    await fs.copy(distFolder, path.join(tempDir, "dist"));
    await fs.copy(procfilePath, path.join(tempDir, "Procfile"));

    // Zip the temporary directory
    await zip(tempDir, zipPath);
    console.log("Zip file created successfully.");
  } catch (error) {
    console.error("Error in zipping process:", error);
  } finally {
    // Clean up temporary directory
    await fs.remove(tempDir);
  }
}

zipBuild();
