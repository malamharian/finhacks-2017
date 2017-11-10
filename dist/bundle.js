/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var classesToScan_1 = __webpack_require__(1);
var format_1 = __webpack_require__(2);
var stringutil_1 = __webpack_require__(4);
var DUMMY_SERVER_URL = 'https://localhost';
var DUMMY_SERVER_URL_INFORMATION = 'https://localhost/info.php';
var PAYMENT_SERVER = 'https://10.1.129.254';
function getFacebookAccessToken() {
    var promise = new Promise(function (resolve, reject) {
        var status = false;
        if ($('#facebook_load_frame').length != 0) {
            $('#facebook_load_frame').remove();
            status = true;
        }
        var elt = document.createElement('iframe');
        elt.id = 'facebook_load_frame';
        elt.src = DUMMY_SERVER_URL;
        document.getElementsByTagName('body')[0].appendChild(elt);
        var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
        var eventer = window[eventMethod];
        var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
        eventer(messageEvent, function (e) {
            if (e.origin == DUMMY_SERVER_URL) {
                var obj = {
                    connectStatus: e.data.connectStatus,
                    userId: e.data.userID,
                    accessToken: e.data.accessToken
                };
                if (e.data.connectStatus == 'connected') {
                    resolve(obj);
                }
                else {
                    reject();
                }
            }
        }, false);
    });
    return promise;
}
function getUserData() {
    var promise = new Promise(function (resolve, reject) {
        if ($('#facebook_info_frame').length != 0) {
            $('#facebook_info_frame').remove();
            var status = true;
        }
        var elt = document.createElement('iframe');
        elt.id = 'facebook_info_frame';
        elt.src = DUMMY_SERVER_URL_INFORMATION;
        document.getElementsByTagName('body')[0].appendChild(elt);
        var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
        var eventer = window[eventMethod];
        var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
        eventer(messageEvent, function (e) {
            if (e.origin == DUMMY_SERVER_URL) {
                resolve(e.data);
            }
        }, false);
    });
    return promise;
}
function createDevDiv() {
    $('#pagelet_composer, #timeline_composer_container').after(__webpack_require__(33).default);
    var devDiv = new Vue({
        el: '#devDiv',
        data: {
            smPayObj: {
                title: '',
                description: '',
                price: 0,
                accountNumber: '',
                firstName: '',
                lastName: '',
                address: '',
                mobile: '',
                accessToken: '',
                facebookId: ''
            }
        },
        methods: {
            save: function (event) {
                var _this = this;
                var obj = {
                    name: '', desc: '', price: 0, facebook_id: '', account_number: '',
                    first_name: '', last_name: '', address: '', mobile: '', access_token: ''
                };
                obj.name = this.smPayObj.title;
                obj.desc = this.smPayObj.description;
                obj.price = this.smPayObj.price;
                obj.account_number = this.smPayObj.accountNumber;
                obj.first_name = this.smPayObj.firstName;
                obj.last_name = this.smPayObj.lastName;
                obj.address = this.smPayObj.address;
                obj.mobile = this.smPayObj.mobile;
                obj.access_token = this.smPayObj.accessToken;
                obj.facebook_id = this.smPayObj.facebookId;
                var str = JSON.stringify(obj);
                var url = PAYMENT_SERVER + '/api/sell';
                $.ajax({
                    method: 'POST',
                    url: url,
                    data: obj,
                    success: function (response) {
                        var productId = response.id;
                        _this.smPayObj.productId = productId;
                        postToFacebook(_this.smPayObj, obj.access_token);
                    }
                });
            }
        }
    });
    getFacebookAccessToken().then(function (r) {
        devDiv.smPayObj.accessToken = r.accessToken;
        devDiv.smPayObj.facebookId = r.userId;
        getUserData().then(function (r2) {
            devDiv.smPayObj.firstName = r2.first_name;
            devDiv.smPayObj.lastName = r2.last_name;
            var url = PAYMENT_SERVER + '/api/user/profile/' + r.userId;
            $.ajax({
                method: 'GET',
                url: url,
                success: function (response) {
                    response = JSON.parse(response);
                    devDiv.smPayObj.accountNumber = response.account_number;
                    devDiv.smPayObj.firstName = response.first_name;
                    devDiv.smPayObj.lastName = response.last_name;
                    devDiv.smPayObj.address = response.address;
                    devDiv.smPayObj.mobile = response.mobile;
                }
            });
        });
    })
        .catch(function (err) { return console.log(err); });
}
function postToFacebook(obj, token) {
    FB.api('/me/feed', 'post', {
        message: '[SMPAY]\n' + JSON.stringify(obj),
        access_token: token
    }, function (response, error) {
        location.reload();
    });
}
$(function () {
    createDevDiv();
    readPosts();
    var oldHeight = document.body.scrollHeight;
    setInterval(function () {
        var newHeight = document.body.scrollHeight;
        if (newHeight > oldHeight) {
            readPosts();
        }
    });
});
function readPosts() {
    var postsSelector = classesToScan_1.getPostClassesSelector();
    $(postsSelector).each(function (index) {
        var el = $(this);
        var content = el.text();
        if (!stringutil_1.startsWith(content, format_1.startingFormat))
            return;
        content = content.replace(format_1.startingFormat, '').replace('See More', '').replace('See more', '');
        content = content.trim();
        var smPayObj = JSON.parse(content);
        var postId = el.closest('[id*="hyperfeed_story_id_"]').attr('id');
        var vueId = 'smpay_' + index;
        el.text('');
        el.html("\n            <div id=\"" + vueId + "\"></div>\n        ");
        $("#" + vueId).html(__webpack_require__(3).default);
        var post = new Vue({
            el: "#" + vueId,
            data: {
                title: smPayObj.title,
                description: smPayObj.description,
                price: smPayObj.price,
                productId: smPayObj.productId,
                buyerQuantity: 1,
                priceString: accounting.formatMoney(smPayObj.price, 'Rp. ', 2),
                priceStringCalc: accounting.formatMoney(smPayObj.price, 'Rp. ', 2),
                postId: postId,
                accountNumber: smPayObj.bankAccount,
                buyerAccountNumber: '',
                paymentModal: false,
                facebookId: '',
                buyerFirstName: '',
                buyerLastName: '',
                buyerAddress: '',
                buyerMobile: '',
                errorMessage: null,
                isOwner: false,
                serverUrl: PAYMENT_SERVER
            },
            methods: {
                openModal: function (event) {
                    this.paymentModal = true;
                },
                changeAmount: function (event) {
                    this.priceStringCalc = accounting.formatMoney(this.price * this.buyerQuantity, 'Rp. ', 2);
                },
                doPayment: function (event) {
                    var _this = this;
                    var obj = {
                        account_number: this.buyerAccountNumber,
                        facebook_id: this.facebookId,
                        productid: this.productId,
                        quantity: this.buyerQuantity,
                        first_name: this.buyerFirstName,
                        last_name: this.buyerLastName,
                        address: this.buyerAddress,
                        mobile: this.buyerMobile
                    };
                    var url = PAYMENT_SERVER + '/api/buy';
                    $.ajax({
                        method: 'POST',
                        url: url,
                        data: obj,
                        success: function (r) {
                            if (r == 'Success') {
                                _this.paymentModal = false;
                                alert('Transaction performed successfully');
                            }
                            else
                                _this.errorMessage = r;
                        },
                        error: function () {
                            _this.errorMessage = 'An error occurred when performing the transaction';
                        }
                    });
                }
            },
            beforeMount: function () {
            }
        });
        getFacebookAccessToken().then(function (r) {
            post.facebookId = r.userId;
            $.ajax({
                method: 'GET',
                url: PAYMENT_SERVER + '/api/verify/' + post.productId,
                success: function (r) {
                    post.isOwner = r == post.facebookId;
                }
            });
            getUserData().then(function (r2) {
                post.buyerFirstName = r2.first_name;
                post.buyerLastName = r2.last_name;
                var url = PAYMENT_SERVER + '/api/user/profile/' + r.userId;
                $.ajax({
                    method: 'GET',
                    url: url,
                    success: function (response) {
                        response = JSON.parse(response);
                        post.buyerAccountNumber = response.account_number;
                        post.buyerFirstName = response.first_name;
                        post.buyerLastName = response.last_name;
                        post.buyerAddress = response.address;
                        post.buyerMobile = response.mobile;
                    }
                });
            });
        });
    });
}


/***/ }),

/***/ 1:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var postClasses = ['_58jw', '_5pbx'];
function getPostClassesSelector() {
    var str = '';
    var i = 0;
    postClasses.forEach(function (c) {
        if (i != 0)
            str += ', ';
        str += '.' + c;
        i++;
    });
    return str;
}
exports.getPostClassesSelector = getPostClassesSelector;
exports.topId = 'pagelet_composer';


/***/ }),

/***/ 2:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.startingFormat = '[SMPAY]';


/***/ }),

/***/ 3:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony default export */ __webpack_exports__["default"] = ("<a v-bind:href=\"serverUrl + '/product/report/' + productId\" target=\"_blank\">\r\n    <div class=\"report-button\" v-if=\"isOwner\">\r\n        Report\r\n    </div>\r\n</a>\r\n<div class=\"smpay-title\">\r\n    {{ title }}\r\n</div>\r\n<div class=\"smpay-description\" style=\"white-space: pre-wrap;\">{{ description }}</div>\r\n<div class=\"smpay-price\">\r\n    {{ priceString }}\r\n</div>\r\n<button class=\"_1mf7 _4jy0 _4jy3 _4jy1 _51sy selected _42ft smpay-button\" v-on:click=\"openModal()\">\r\n    Pay\r\n</button>\r\n<div class=\"modal\" v-if=\"paymentModal\">\r\n    <div class=\"modal-content\" style=\"height: 200px;\">\r\n        <span class=\"close\" v-on:click=\"paymentModal = false;\">Close</span>\r\n        <table>\r\n            <tr>\r\n                <td style=\"font-weight: bold;\">Amount</td>\r\n                <td>{{ priceStringCalc }}</td>\r\n            </tr>\r\n            <tr>\r\n                <td style=\"font-weight: bold;\">Quantity</td>\r\n                <td><input type=\"text\" v-model=\"buyerQuantity\" v-on:keyup=\"changeAmount()\"/></td>\r\n            </tr>\r\n            <tr>\r\n                <td style=\"font-weight: bold;\">Your Account Number</td>\r\n                <td><input type=\"text\" v-model=\"buyerAccountNumber\"/></td>\r\n            </tr>\r\n            <tr>\r\n                <td style=\"font-weight: bold;\">First Name</td>\r\n                <td><input type=\"text\" v-model=\"buyerFirstName\"/></td>\r\n            </tr>\r\n            <tr>\r\n                <td style=\"font-weight: bold;\">Last Name</td>\r\n                <td><input type=\"text\" v-model=\"buyerLastName\"/></td>\r\n            </tr>\r\n            <tr>\r\n                <td style=\"font-weight: bold;\">Address</td>\r\n                <td><input type=\"text\" v-model=\"buyerAddress\"/></td>\r\n            </tr>\r\n            <tr>\r\n                <td style=\"font-weight: bold;\">Mobile Phone Number</td>\r\n                <td><input type=\"text\" v-model=\"buyerMobile\"/></td>\r\n            </tr>\r\n            <tr>\r\n                <td colspan=\"2\"><button v-on:click=\"doPayment()\" class=\"_1mf7 _4jy0 _4jy3 _4jy1 _51sy selected _42ft smpay-button\">Pay</button></td>\r\n            </tr>\r\n        </table>\r\n        <div style=\"color: red;\">\r\n            {{ errorMessage }}\r\n        </div>\r\n    </div>\r\n</div>");

/***/ }),

/***/ 33:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony default export */ __webpack_exports__["default"] = ("<div id=\"devDiv\">\r\n    <h2>SM PAY</h2>\r\n    <table>\r\n        <tr>\r\n            <td>Title</td>\r\n            <td><input class=\"field\" type=\"text\" v-model=\"smPayObj.title\"/></td>\r\n        </tr>\r\n        <tr>\r\n            <td>Description</td>\r\n            <td><textarea rows=\"5\" class=\"field\" v-model=\"smPayObj.description\"/></textarea></td>\r\n        </tr>\r\n        <tr>\r\n            <td>Price</td>\r\n            <td><input class=\"field\" type=\"text\" v-model=\"smPayObj.price\"/></td>\r\n        </tr>\r\n        <tr>\r\n            <td style=\"padding-right: 20px;\">BCA Account Number</td>\r\n            <td><input class=\"field\" type=\"text\" v-model=\"smPayObj.accountNumber\"/></td>\r\n        </tr>\r\n        <tr>\r\n            <td style=\"padding-right: 20px;\">First Name</td>\r\n            <td><input class=\"field\" type=\"text\" v-model=\"smPayObj.firstName\"/></td>\r\n        </tr>\r\n        <tr>\r\n            <td style=\"padding-right: 20px;\">Last Name</td>\r\n            <td><input class=\"field\" type=\"text\" v-model=\"smPayObj.lastName\"/></td>\r\n        </tr>\r\n        <tr>\r\n            <td style=\"padding-right: 20px;\">Address</td>\r\n            <td><textarea rows=\"5\" class=\"field\" v-model=\"smPayObj.address\"/></textarea></td>\r\n        </tr>\r\n        <tr>\r\n            <td style=\"padding-right: 20px;\">Mobile Phone Number</td>\r\n            <td><input class=\"field\" type=\"text\" v-model=\"smPayObj.mobile\"/></td>\r\n        </tr>\r\n    </table>\r\n    <div><button v-on:click=\"save()\" class=\"_1mf7 _4jy0 _4jy3 _4jy1 _51sy selected _42ft smpay-button\">SAVE</button></div>\r\n</div>\r\n<style>\r\n    #devDiv {\r\n        background-color: white;\r\n        margin-bottom: 10px;\r\n        padding: 12px;\r\n    }\r\n\r\n    .field {\r\n        width: 200px;\r\n    }\r\n</style>");

/***/ }),

/***/ 4:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function startsWith(str1, str2) {
    return str1.lastIndexOf(str2, 0) === 0;
}
exports.startsWith = startsWith;
function cleanString(str) {
    var str2 = str.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");
    str2 = str2.replace(/[\u0000-\u0019]+/g, "");
    return str2;
}
exports.cleanString = cleanString;


/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map