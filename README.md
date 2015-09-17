# grunt-cordova-sectv
Grunt task for build and package the cordova project with `sectv-***` platforms.

# About this project
This project would help who makes Samsung Tizen TV or Legacy Samsung Smart TV web application using cordova.
It supports several functions like build(`sectv-build`) and package(`sectv-package`) project of each platforms.

# Installation
```shell
$ npm install {{Local or git path to this project}}
```

# How to set up to use
1. Make a cordova project using cordova CLI. This project's directory should be created as sibling of `cordova-sectv-orsay` and `cordova-sectv-tizen`.
```
    ./
     |- cordova-js
     |- cordova-plugin-toast
     |- cordova-sectv-orsay
     |- cordova-sectv-tizen
     `- MyApplication
```
2. Copy the contents in `./sample/*` of this project to the root directory of your cordova project.
3. In the cordova project's root:
```
$ npm install
$ npm install {{Local or git path to this project}}
```

# How to build the application by platforms
* In the cordova project's root:
```
$ grunt sectv-build:<platform>
```
* `<platform>` can be one of `sectv-orsay` and `sectv-tizen`. If you want to build both of them:
```
$ grunt sectv-build
```
* For more details, please see the `sample/Gruntfile.js` of this project, Not `Gruntfile.js` in this project's root :).

# Known Issues
Not yet