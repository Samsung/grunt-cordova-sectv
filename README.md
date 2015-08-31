# grunt-cordova-sectv
Grunt task for build and package the cordova project with cordova-sectv-*** platforms.

# About this project
This project would help who makes Samsung Tizen TV or Legacy Samsung Smart TV web application using cordova.
It supports several functions like build, package, emulate project of each platforms.

# Installation
```shell
$ npm install {{Local or git path to this project}}
```

# How to set up to use
1. Make project using cordova
2. Copy the grunt-cordova-sectv/sample/* to the root directory of your cordova project
3. `npm install`
4. `npm install {{Local or git path to this project}}`

# How to Build and Package at the time
1. `grunt` at the root directory of your cordova project

# How to Build
## Samsung Tizen TV
In the 2015's TV
1. `grunt sectv-build:tizen`

## Legacy Samsung Smart TV
In the 2014's TV
1. `grunt sectv-build:orsay`

# How to Package
## Samsung Tizen TV
In the 2015's TV
1. `grunt sectv-package:tizen`

## Legacy Samsung Smart TV
In the 2014's TV
1. `grunt sectv-package:orsay`

# Known Issues
