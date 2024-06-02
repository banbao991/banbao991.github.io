const ASSETS_DIR = 'assets/bmw/';
const SPINE_ATLAS = ASSETS_DIR + 'spine.atlas';
const SPINE_JSON = ASSETS_DIR + 'spine.json';

function load_atlas(atlas_path) {
  return fetch(atlas_path)
      .then(response => response.text())
      .then(data => {
        const lines = data.split('\n');
        let result = [];
        let currentImage = null;
        let currentTexture = null;

        lines.forEach(line => {
          line = line.trim();
          if (!line) return;

          if (line.endsWith('.png')) {
            if (currentImage) {
              result.push(currentImage);
            }
            currentImage = {image: line, textures: {}};
            currentTexture = null;
          } else if (line.includes(':')) {
            const [key, value] = line.split(':').map(item => item.trim());
            if (currentTexture) {
              currentImage.textures[currentTexture][key] = value;
            } else {
              currentImage[key] = value;
            }
          } else {
            currentTexture = line;
            currentImage.textures[currentTexture] = {};
          }
        });

        if (currentImage) {
          result.push(currentImage);
        }

        return result;
      })
      .catch(error => {
        console.error('Error loading the file:', error);
      });
}


function main(ctx) {
  task1 = load_atlas(SPINE_ATLAS);
  task2 = fetch(SPINE_JSON).then(response => response.json());
  Promise.all([task1, task2]).then(([atlas, json]) => {
    deal(atlas, json, ctx);
  });
}

function deal(atlas, json, ctx) {
  console.log(atlas);
  console.log(json);
  // TODO: Implement the logic here
}
