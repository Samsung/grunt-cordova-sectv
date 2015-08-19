module.exports = {
    build: function (successCallback, errorCallback, wwwSrc, dest, platformRepos) {
        console.log("Build Tizen: " + JSON.stringify(Array.prototype.slice.call(arguments, 0)));
    },
    package: function (successCallback, errorCallback, wwwSrc, dest, platformRepos) {
        console.log("Package Tizen: " + JSON.stringify(Array.prototype.slice.call(arguments, 0)));

    }
};