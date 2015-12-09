# grunt-cordova-sectv
Grunt task for prepare and build the cordova project with `sectv-***` platforms.

# About this project
This project would help who makes Samsung Tizen TV or Legacy Samsung Smart TV web application using cordova.
It provides several grunt task:
* `sectv-prepare`: Creates application project for each platforms from your cordova project. The target must be one of `sectv-orsay` and `sectv-tizen`.
    * Options for the task:

        ```js
        'sectv-prepare': {    // task
            'sectv-orsay': {    // target
                dest: 'platforms/sectv-orsay/www',  // Destination path to create the application project.
                platformRepos: '../cordova-sectv-orsay',    // Path to 'sectv-***` cordova platform's repository.
                scripts: {  // copy the scripts to the application project. <destination>: <source>.
                    'cordova.js': '../cordova-js/pkg/cordova.sectv-orsay.js',
                    'toast.js': '../cordova-plugin-toast/platform_www/sectv-orsay/toast.js'
                }
            }
        }
        ```
* `sectv-build`: Packaging the application project into each platforms package file format like `.zip` or `.wgt`. The target must be one of `sectv-orsay` and `sectv-tizen`.
    * Options for the task:

        ```js
        'sectv-build': {  // task
            'sectv-orsay': {    // target
                www: 'platforms/sectv-orsay/www', // Path to Application project
                dest: 'platforms/sectv-orsay/build' // Directory to create the package
            }
        }
        ```

# Associated Projects
* [cordova-sectv-orsay](http://github.com/Samsung/cordova-sectv-orsay) is an application library that allows for [Cordova](http://cordova.apache.org)-based projects to be built for the Legacy Samsung Smart TV (A.K.A Orsay) Platform.
* [cordova-sectv-tizen](http://github.com/Samsung/cordova-sectv-tizen) is an application library that allows for [Cordova](http://cordova.apache.org)-based projects to be built for the 2015's Samsung Tizen TV Platform.
* [cordova-plugin-toast](http://github.com/Samsung/cordova-plugin-toast) is an [Cordova](http://cordova.apache.org) plugin that provides TV Specific functionalities for Smart TV application.

# Installation
```sh
$ npm install grunt-cordova-sectv
```

# How to set up to use
1. Make a cordova project using cordova CLI.

    ```
    ./
     |- cordova-js
     |- cordova-plugin-toast
     |- cordova-sectv-orsay
     |- cordova-sectv-tizen
     `- MyApplication
    ```

2. Copy the contents in `sample/*` of this project to the root directory of your cordova project.
3. In the cordova project's root:

    ```js
    $ npm install
    ```
    `grunt-cordova-sectv` will be installed also since the `sample/pacakge.json` defines it as a dependency.

# Supported platform
* sectv-orsay
* sectv-tizen

# How to prepare the application by platforms
* In the cordova project's root:

    ```sh
    $ grunt sectv-prepare:<platform>
    ```

* `<platform>` can be one of supported platforms. If you want to prepare all platforms:

    ```sh
    $ grunt sectv-prepare
    ```

* For more details, please see the `sample/Gruntfile.js` of this project.

# How to build and package the application by platforms
* Packaging for `sectv-tizen`
    - Set the path of environment variables

        ```./
        C:\tizen-sdk\tools\ide\bin
        ```
    - In the cordova project's root/Gruntfile.js:

        ```js
        // Fill out your 'filePath' and 'profileName'
        'sectv-tizen': {
            filePath: '/home/TizenSDK/.metadata/.plugins/org.tizen.common.sign/profiles.xml',
            profileName: 'myprofile',
            www: 'platforms/sectv-tizen/www',
            dest: 'platforms/sectv-tizen/build'
        }
        ```
    - filePath
        - In the SDK workspace:

        ```./
        <yourWorkspace>/.metadata/.plugins/org.tizen.common.sign/profiles.xml
        ```
    - profileName
        - In the SDK:  
            - window > Preferences > Tizen SDK > Security Profiles
            - `profileName`: Activated Profile name
    - If you couldn't find `profiles.xml`, please refer [How to share Author Certificate](http://www.samsungdforum.com/TizenGuide/?FolderName=tizen3531&FileName=index.html)
 
* In the cordova project's root:

    ```sh
    $ grunt sectv-build:<platform>
    ```

* `<platform>` can be one of supported platforms. If you want to package all platforms:

    ```sh
    $ grunt sectv-build
    ```
    
* For more details, please see the `sample/Gruntfile.js` of this project.

# Known Issues
Not yet

[![Analytics](https://ga-beacon.appspot.com/UA-70262254-1/grunt-cordova-sectv/README)](https://github.com/igrigorik/ga-beacon)
