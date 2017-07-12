'use strict';
export const apiBase = 
(location.hostname === 'localhost') ? 'http://192.168.1.3:21112/' : 'http://nyaData.nyagportal.com/';

// export const tokenEndpoint = 'https://localhost:44301/identity/connect/token';
export const tokenEndpoint = 'https://rdwIdentityServer.absolution1.com/identity/connect/token';
// export const authorizationEndpoint = 'https://localhost:44301/identity/connect/authorize?';
export const authorizationEndpoint = 'https://rdwIdentityServer.absolution1.com/identity/connect/authorize?';
