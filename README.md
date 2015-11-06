# grunt-cordova-sectv
Grunt task for build and package the cordova project with `sectv-***` platforms.

# About this project
This project would help who makes Samsung Tizen TV or Legacy Samsung Smart TV web application using cordova.
It provides several grunt task:
* `sectv-build`: Creates application project for each platforms from your cordova project. The target must be one of `sectv-orsay` and `sectv-tizen`.
    * Options for the task:

        ```js
        'sectv-build': {    // task
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
* `sectv-package`: Packaging the application project into each platforms package file format like `.zip` or `.wgt`. The target must be one of `sectv-orsay` and `sectv-tizen`.
    * Options for the task:

        ```js
        'sectv-package': {  // task
            'sectv-orsay': {    // target
                build: 'platforms/sectv-orsay/www', // Path to Application project
                dest: 'platforms/sectv-orsay/build' // Directory to create the package
            }
        }
        ```

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

# How to build the application by platforms
* In the cordova project's root:

    ```sh
    $ grunt sectv-build:<platform>
    ```

* `<platform>` can be one of `sectv-orsay` and `sectv-tizen`. If you want to build both of them:

    ```sh
    $ grunt sectv-build
    ```

* For more details, please see the `sample/Gruntfile.js` of this project.

# How to package the application by platforms
* Preparing for packaging `sectv-tizen`
    - Install Tizen SDK 2.0 or higher
        * http://www.samsungdforum.com/TizenDevtools/SdkDownload
    - Set the path and environment variables
        * C:\tizen-sdk\tools\ide\bin
    - Fill out your `filePath` and `profileName`
        * In the cordova project's root/Gruntfile.js:

        ```js
        'sectv-tizen': {
            filePath: '/home/TizenSDK/.metadata/.plugins/org.tizen.common.sign/profiles.xml',
            profileName: 'myprofile',
            build: 'platforms/sectv-tizen/www',
            dest: 'platforms/sectv-tizen/build'
        }
        ```

        1. `filePath`
            - In the IDE workspace:
                - replace path to `<yourWorkspace>/.metadata/.plugins/org.tizen.common.sign/profiles.xml`
        2. `profileName`
            - In the IDE:
                - Window > Preferences > Tizen SDK > Security Profiles
                - profileName : Activated Profiles name
        - If you couldn't find `profiles.xml`, please refer `How to share Author Certificate` 
            - http://www.samsungdforum.com/TizenGuide/?FolderName=tizen3531&FileName=index.html
 
* In the cordova project's root:

    ```sh
    $ grunt sectv-package:<platform>
    ```

* `<platform>` can be one of `sectv-orsay` and `sectv-tizen`. If you want to package both of them:
    ```sh
    $ grunt sectv-package
    ```
* For more details, please see the `sample/Gruntfile.js` of this project.

# Known Issues
Not yet
