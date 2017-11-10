declare var $;
declare var location;
declare var Vue;
declare var chrome;
declare var require;
declare var accounting;
declare var FB;

import { getPostClassesSelector } from './consts/classesToScan';
import { startingFormat } from './config/format';
import { startsWith, cleanString } from './util/stringutil';

const DUMMY_SERVER_URL = 'https://localhost';
const DUMMY_SERVER_URL_INFORMATION = 'https://localhost/info.php';
const PAYMENT_SERVER = 'https://10.1.129.254';

function getFacebookAccessToken() {

    var promise = new Promise((resolve, reject) => {

        var status = false;

        if($('#facebook_load_frame').length != 0) {
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
        
        eventer(messageEvent,function(e) {
    
            if(e.origin == DUMMY_SERVER_URL) {
                let obj = {
                    connectStatus: e.data.connectStatus,
                    userId: e.data.userID,
                    accessToken: e.data.accessToken
                };

                if(e.data.connectStatus == 'connected') {
                    resolve(obj);
                } else {
                    reject();
                }
            }
        },false);

    });

    return promise;
}

function getUserData() {

    var promise = new Promise((resolve, reject) => {
        
        if($('#facebook_info_frame').length != 0) {
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
        
        eventer(messageEvent,function(e) {
    
            if(e.origin == DUMMY_SERVER_URL) {
                
                resolve(e.data);
            }
        },false);

    });

    return promise;
}

function createDevDiv() {
    $('#pagelet_composer, #timeline_composer_container').after(require('./dev/postingcomponent.html').default);   

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
            save: function(event) {
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

                let str = JSON.stringify(obj);
    
                let url = PAYMENT_SERVER + '/api/sell';
                
                $.ajax({
                    method: 'POST',
                    url: url,
                    data: obj,
                    success: (response) => {
                        let productId = response.id;
                        this.smPayObj.productId = productId;
    
                        postToFacebook(this.smPayObj, obj.access_token);
                    }
                });
                
            }
        }
    });

    getFacebookAccessToken().then(r => {
        devDiv.smPayObj.accessToken=r.accessToken;
        devDiv.smPayObj.facebookId=r.userId;
        getUserData().then(r2 => {

            devDiv.smPayObj.firstName=r2.first_name;
            devDiv.smPayObj.lastName=r2.last_name;

            let url = PAYMENT_SERVER + '/api/user/profile/'+r.userId;
            $.ajax({
                method: 'GET',
                url: url,
                success: (response) => {
                    response = JSON.parse(response);
                    
                    devDiv.smPayObj.accountNumber=response.account_number;
                    devDiv.smPayObj.firstName=response.first_name;
                    devDiv.smPayObj.lastName=response.last_name;
                    devDiv.smPayObj.address=response.address;
                    devDiv.smPayObj.mobile=response.mobile;
                }
            });
            
        });

        
    })
    .catch(err => console.log(err));
}

function postToFacebook(obj, token) {

    FB.api('/me/feed', 'post', {
        message: '[SMPAY]\n' + JSON.stringify(obj),
        access_token: token
    }, function(response, error) {

        location.reload();
    });
}

$(function() {
    createDevDiv();
    readPosts();

    var oldHeight = document.body.scrollHeight;
    setInterval(() => {
        var newHeight = document.body.scrollHeight;
        if (newHeight > oldHeight) {
            readPosts();
        }
    });
});

function readPosts() {
    var postsSelector = getPostClassesSelector();
    $(postsSelector).each(function(index) {
        let el = $(this);
        let content: string = el.text();
    
        if(!startsWith(content, startingFormat))
            return;
    
        content = content.replace(startingFormat, '').replace('See More', '').replace('See more', '');
        content = content.trim();
    
        let smPayObj = JSON.parse(content);
    
        let postId = el.closest('[id*="hyperfeed_story_id_"]').attr('id');
        let vueId = 'smpay_' + index;
    
        el.text('');
        el.html(`
            <div id="${vueId}"></div>
        `);
    
        $(`#${vueId}`).html(require('./components/buyer_ui.component.html').default);
    
        var post = new Vue({
            el: `#${vueId}`,
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
                openModal: function(event) {
                    this.paymentModal = true;
                },
                changeAmount:function(event){
                    this.priceStringCalc = accounting.formatMoney(this.price * this.buyerQuantity, 'Rp. ', 2);
                },
                doPayment: function(event) {

                    //productid, accountnumber, quantity, facebookid

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

                    let url = PAYMENT_SERVER + '/api/buy';

                    $.ajax({
                        method: 'POST',
                        url: url,
                        data: obj,
                        success: (r) => {
                            if(r == 'Success') {
                                this.paymentModal = false;
                                alert('Transaction performed successfully');
                            }
                            else
                                this.errorMessage = r;
                        },
                        error: () => {
                            this.errorMessage = 'An error occurred when performing the transaction';
                        }
                    });
                    
                }
            },
            beforeMount() {

            }
        });

        getFacebookAccessToken().then(r => {
            post.facebookId = r.userId;

            $.ajax({
                method: 'GET',
                url: PAYMENT_SERVER + '/api/verify/' + post.productId,
                success: (r) => {
                    post.isOwner = r == post.facebookId;
                }
            });

            getUserData().then(r2 => {
                post.buyerFirstName=r2.first_name;
                post.buyerLastName=r2.last_name;

                let url = PAYMENT_SERVER + '/api/user/profile/'+r.userId;
                $.ajax({
                    method: 'GET',
                    url: url,
                    success: (response) => {
                        response = JSON.parse(response);
                        post.buyerAccountNumber=response.account_number;
                        post.buyerFirstName=response.first_name;
                        post.buyerLastName=response.last_name;
                        post.buyerAddress=response.address;
                        post.buyerMobile=response.mobile;
                    }
                });

            });
        });

    });
}