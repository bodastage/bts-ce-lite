"use strict";

const builder = require("electron-builder");
const Platform = builder.Platform;

builder.build({
    targets: Platform.WINDOWS.createTarget(),
    config: {
    "appId": "com.bodastage.bodalite",
    "productName": "Boda-Lite",
    "copyright": "Copyright © 2023 ${author}",
    "files": [
      "./build/**/*",
      "./main.js",
      "package.json"
    ],
	"extraMetadata": {
		"main": "./main.js"
	},
    "dmg": {
      "contents": [
        {
          "x": 110,
          "y": 150
        },
        {
          "x": 240,
          "y": 150,
          "type": "link",
          "path": "/Applications"
        }
      ]
    },
    "linux": {
      "target": [
        "AppImage",
        "deb"
      ]
    },
    "win": {
      "target": "NSIS",
      "icon": "build/icon.ico"
    },
    "directories": {
      "buildResources": "assets"
    },
    "publish": {
      "provider": "github",
      "owner": "bodastage",
      "repo": "bts-ce-lite",
      "private": false
    }
  }
})
.then(() => {
    console.log('Build OK!');
})
.catch((error) => {
    // handle error
    console.log(error);
})