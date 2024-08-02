// var util = require('util');
// var OAuth2Strategy = require('passport-oauth2');
// const { linkedInHosts } = require('../config/connection');
// var InternalOAuthError = require('passport-oauth2').InternalOAuthError;

// var profileUrl = 'https://api.linkedin.com/v2/userinfo';

// function Strategy(options, verify) {
//   options = options || {};
//   options.authorizationURL =
   
//     options.authorizationURL ||
//     // 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86bv26n5h5bvsl&scope=email,profile,openid&redirect_uri=http%3A%2F%2F127.0.0.1%3A3001%2Fauth%2Flinkedin%2Fcallback';
//     `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86bv26n5h5bvsl&scope=email,profile,openid&redirect_uri=https%3A%2F%2Ftest.logiglo.com%2Fapi%2Fauth%2Flinkedin%2Fcallback`;
  
  
  
//     options.tokenURL =
//     options.tokenURL || 'https://www.linkedin.com/oauth/v2/accessToken';
//   options.scope = options.scope || ['profile', 'email', 'openid'];

//   //By default we want data in JSON
//   options.customHeaders = options.customHeaders || { 'x-li-format': 'json' };

//   OAuth2Strategy.call(this, options, verify);

//   this.options = options;
//   this.name = 'linkedin';
//   this.profileUrl = profileUrl;
// }

// util.inherits(Strategy, OAuth2Strategy);

// Strategy.prototype.userProfile = function (accessToken, done) {

//   // Print access token
// console.log('Access Token:', accessToken,"Token available");

//   //LinkedIn uses a custom name for the access_token parameter
//   this._oauth2.setAccessTokenName('oauth2_access_token');

//   this._oauth2.get(this.profileUrl, accessToken, function (err, body, _res) {
//     if (err) {
//       return done(
//         new InternalOAuthError('failed to fetch user profile', err)
        
//       );
//     }
   
//     var profile;
//     try {
//       profile = parseProfile(body);
//     } catch (e) {
//       return done(
//         new InternalOAuthError('failed to parse profile response', e)
//       );
//     }

//     done(null, profile);
//   }.bind(this)
//   );
// };

// Strategy.prototype.authorizationParams = function (options) {
//   var params = {};

//   // LinkedIn requires state parameter. It will return an error if not set.
//   if (options.state) {
//     params['state'] = options.state;
//   }

//   return params;
// };

// function parseProfile(body) {
//   var json = JSON.parse(body);

//   return {
//     provider: 'linkedin',
//     id: json.sub,
//     email: json.email,
//     givenName: json.given_name,
//     familyName: json.family_name,
//     displayName: `${json.given_name} ${json.family_name}`,
//     picture: json.picture,
//     _raw: body,
//     _json: json,
//   };
// }

// module.exports = Strategy;








var util = require('util');
var OAuth2Strategy = require('passport-oauth2');
const { linkedInHost } = require('../config/connection');
var InternalOAuthError = require('passport-oauth2').InternalOAuthError;

var profileUrl = 'https://api.linkedin.com/v2/userinfo';

function Strategy(options, verify) {
options = options || {};
options.authorizationURL =

    options.authorizationURL ||
    // 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86bv26n5h5bvsl&scope=email,profile,openid&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2Fauth%2Flinkedin%2Fcallback';
    `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86bv26n5h5bvsl&scope=email,profile,openid&redirect_uri=http%3A%2F%2F${linkedInHost}%2Fapi%2Fauth%2Flinkedin%2Fcallback`;
  
  
    options.tokenURL =
    options.tokenURL || 'https://www.linkedin.com/oauth/v2/accessToken';
options.scope = options.scope || ['profile', 'email', 'openid'];

//By default we want data in JSON
options.customHeaders = options.customHeaders || { 'x-li-format': 'json' };

OAuth2Strategy.call(this, options, verify);

this.options = options;
this.name = 'linkedin';
this.profileUrl = profileUrl;
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function (accessToken, done) {
// Print access token
console.log('Access Token:', accessToken,"Token available");
//LinkedIn uses a custom name for the access_token parameter
this._oauth2.setAccessTokenName('oauth2_access_token');

this._oauth2.get(this.profileUrl, accessToken, function (err, body, _res) {
    if (err) {
     return done(
        new InternalOAuthError('failed to fetch user profile', err)
     );
    }
    var profile;
    try {   
      profile = parseProfile(body);   
    } catch (e) {
     return done(
        new InternalOAuthError('failed to parse profile response', e)
     );
    }

    done(null, profile);
}.bind(this)
);
};

Strategy.prototype.authorizationParams = function (options) {
var params = {};

// LinkedIn requires state parameter. It will return an error if not set.
if (options.state) {
    params['state'] = options.state;
}

return params;
};

function parseProfile(body) {
var json = JSON.parse(body);

console.log("Hello In Auth");
return {
    provider: 'linkedin',
    id: json.sub,
    email: json.email,
    givenName: json.given_name,
    familyName: json.family_name,
    displayName: `${json.given_name} ${json.family_name}`,
    picture: json.picture,
    _raw: body,
    _json: json,
    // accessToken : json.accessToken,
    // accessToken : json.accessToken,
};
}

module.exports = Strategy;