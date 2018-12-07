$(document).ready(initialize);

function initialize() {
    console.log('wassup');
    $('.login').click(login);
    $('.submit').click(search);
}

function login() {
    window.location.href = "http://localhost:8888/login";
    // window.location.replace = "http://localhost:8888/login";
}

function search() {
    var userName = $('.usernameInput').val();
    window.location.href = "http://localhost:8888/search?username="+userName;
}









