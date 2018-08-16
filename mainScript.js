const fs = require("fs");
const path = require("path");
const tinycolor = require("tinycolor2");
const mkdirp = require('mkdirp');
const requireContext = require('require-context');

const themesPath = path.join(__dirname, ".", "preset-themes");
let counter = 0;

const makeTinycolor = colorIn => {
    const color = { ...colorIn
    };
    if ("s" in color) {
        color.s = Math.floor(color.s) / 100.0;
    }
    if ("a" in color) {
        if (color.a > 1.0) {
            color.a = Math.floor(color.a) / 100.0;
        }
        color.a = Math.ceil(color.a * 100) / 100.0;
    }
    return tinycolor(color);
};

const colorToCSS = colorIn => makeTinycolor(colorIn).toRgbString();

fs.readdirSync(themesPath)
    .filter(filename => path.extname(filename) === ".json")
    .forEach(filename => {
        const data = fs.readFileSync(path.join(themesPath, filename), "utf8");
        const defaultTheme = JSON.parse(data);
        //defining a demo theme
        const theme = {
            properties: {
                additional_backgrounds_alignment: ["top"],
                additional_backgrounds_tiling: ["repeat"],
                additional_images_tiling: ["repeat"],
                additional_images_alignment: ["top"]
            },
            colors: {}
        }
        const background = defaultTheme.images;
        //Check if additional background properties exist or not.
        if (background) {
            theme.images = {
                additional_backgrounds: '../../images/patterns' + defaultTheme.images.additional_backgrounds[0]
            };
        }
        //iterates over each object of the preset theme's color.
        Object.keys(defaultTheme.colors).forEach(key => {
            theme.colors[key] = colorToCSS(defaultTheme.colors[key]);
        });

        if (!defaultTheme.colors.hasOwnProperty("tab_loading")) {
            theme.colors.tab_loading = colorToCSS(defaultTheme.colors.tab_line);
        }

        const themeFileContents = 'export const theme =' + JSON.stringify(theme);
        const manifestObj = {
            "description": "stand alone add-on",
            "manifest_version": 2,
            "name": "add-on",
            "icons": {
                "48": "./../../images/icon.svg"
            },
            "permissions": ["theme", "activeTab"],
            "background": {
                "scripts": ["theme.js", "background.js"]
            },
            "version": "1.0",
            "applications": {
                "gecko": {
                    "strict_min_version": "55.0a2"
                }
            }
        }
        const manifestFileContents = JSON.stringify(manifestObj);

        const backgroundFileContents = fs.readFileSync('./backgroundTemp.js', "utf8");
        //Increasing counter while iterating each json file of preset themes
        counter++;
        //Creating new directory for each preset theme
        mkdirp('/home/shruti/Desktop/PresetAdd/themeDir/00' + counter, function(err) {
            if (err) {
                console.error(err);
            } else {
                //creating and writing contents of theme.js
                fs.writeFileSync('/home/shruti/Desktop/PresetAdd/themeDir/00' + counter + '/theme.js', themeFileContents);
                //creating and writing contents of manifest.json
                fs.writeFileSync('/home/shruti/Desktop/PresetAdd/themeDir/00' + counter + '/manifest.json', manifestFileContents);
                //creating and writing contents of background.js
                fs.writeFileSync('/home/shruti/Desktop/PresetAdd/themeDir/00' + counter + '/background.js', backgroundFileContents);
            }
        });

    });