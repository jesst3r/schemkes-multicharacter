var selectedChar = null;
var WelcomePercentage = "30vh"
schemkesMultiCharacters = {}
var Loaded = false;

$(document).ready(function (){
    window.addEventListener('message', function (event) {
        var data = event.data;

        if (data.action == "ui") {
            if (data.toggle) {
                $('.container').show();
                $(".welcomescreen").fadeIn(150);
                schemkesMultiCharacters.resetAll();

                var originalText = "Spelersgegevens ophalen";
                var loadingProgress = 0;
                var loadingDots = 0;
                $("#loading-text").html(originalText);
                var DotsInterval = setInterval(function() {
                    $("#loading-text").append(".");
                    loadingDots++;
                    loadingProgress++;
                    if (loadingProgress == 3) {
                        originalText = "Spelersgegevens valideren"
                        $("#loading-text").html(originalText);
                    }
                    if (loadingProgress == 4) {
                        originalText = "Spelerskarakters ophalen"
                        $("#loading-text").html(originalText);
                    }
                    if (loadingProgress == 6) {
                        originalText = "Spelerskarakters valideren"
                        $("#loading-text").html(originalText);
                    }
                    if(loadingDots == 4) {
                        $("#loading-text").html(originalText);
                        loadingDots = 0;
                    }
                }, 500);
            
                setTimeout(function(){
                    $.post('http://schemkes-multicharacter/setupCharacters');
                    setTimeout(function(){
                        clearInterval(DotsInterval);
                        loadingProgress = 0;
                        originalText = "Data ophalen";
                        $(".welcomescreen").fadeOut(150);
                        schemkesMultiCharacters.fadeInDown('.character-info', '20%', 400);
                        schemkesMultiCharacters.fadeInDown('.characters-list', '20%', 400);
                        $.post('http://schemkes-multicharacter/removeBlur');
                    }, 2000);
                }, 2000);
            } else {
                $('.container').fadeOut(250);
                schemkesMultiCharacters.resetAll();
            }
        }

        if (data.action == "setupCharacters") {
            setupCharacters(event.data.characters)
        }

        if (data.action == "setupCharInfo") {
            setupCharInfo(event.data.chardata)
        }
    });

    $('.datepicker').datepicker();
});

$('.continue-btn').click(function(e){
    e.preventDefault();

    // schemkesMultiCharacters.fadeOutUp('.welcomescreen', undefined, 400);
    // schemkesMultiCharacters.fadeOutDown('.server-log', undefined, 400);
    // setTimeout(function(){
    //     schemkesMultiCharacters.fadeInDown('.characters-list', '20%', 400);
    //     schemkesMultiCharacters.fadeInDown('.character-info', '20%', 400);
    //     $.post('http://schemkes-multicharacter/setupCharacters');
    // }, 400)
});

$('.disconnect-btn').click(function(e){
    e.preventDefault();

    $.post('http://schemkes-multicharacter/closeUI');
    $.post('http://schemkes-multicharacter/disconnectButton');
});

function setupCharInfo(cData) {
    if (cData == 'empty') {
        $('.character-info-valid').html('<span id="no-char">Het geselecteerde karakter slot is nog niet in gebruik.<br><br>Dit karakter heeft dus nog geen informatie.</span>');
    } else {
        var gender = "Man"
        if (cData.charinfo.gender == 1) { gender = "Vrouw" }
        $('.character-info-valid').html(
        '<div class="character-info-box"><span id="info-label">Naam: </span><span class="char-info-js">'+cData.charinfo.firstname+' '+cData.charinfo.lastname+'</span></div>' +
        '<div class="character-info-box"><span id="info-label">Geboortedatum: </span><span class="char-info-js">'+cData.charinfo.birthdate+'</span></div>' +
        '<div class="character-info-box"><span id="info-label">Geslacht: </span><span class="char-info-js">'+gender+'</span></div>' +
        '<div class="character-info-box"><span id="info-label">Nationaliteit: </span><span class="char-info-js">'+cData.charinfo.nationality+'</span></div>' +
        '<div class="character-info-box"><span id="info-label">Baan: </span><span class="char-info-js">'+cData.job.label+'</span></div>' +
        '<div class="character-info-box"><span id="info-label">Cash: </span><span class="char-info-js">&euro; '+cData.money.cash+'</span></div>' +
        '<div class="character-info-box"><span id="info-label">Bank: </span><span class="char-info-js">&euro; '+cData.money.bank+'</span></div><br>' +
        '<div class="character-info-box"><span id="info-label">Telefoonnummer: </span><span class="char-info-js">'+cData.charinfo.phone+'</span></div>' +
        '<div class="character-info-box"><span id="info-label">Rekeningnummer: </span><span class="char-info-js">'+cData.charinfo.account+'</span></div>');
    }
}

function setupCharacters(characters) {
    $.each(characters, function(index, char){
        $('#char-'+char.cid).html("");
        $('#char-'+char.cid).data("citizenid", char.citizenid);
        setTimeout(function(){
            $('#char-'+char.cid).html('<span id="slot-name">'+char.charinfo.firstname+' '+char.charinfo.lastname+'<span id="cid">' + char.citizenid + '</span></span>');
            $('#char-'+char.cid).data('cData', char)
            $('#char-'+char.cid).data('cid', char.cid)
        }, 100)
    })
}

$(document).on('click', '#close-log', function(e){
    e.preventDefault();
    selectedLog = null;
    $('.welcomescreen').css("filter", "none");
    $('.server-log').css("filter", "none");
    $('.server-log-info').fadeOut(250);
    logOpen = false;
});

$(document).on('click', '.character', function(e) {
    var cDataPed = $(this).data('cData');
    e.preventDefault();
    if (selectedChar === null) {
        selectedChar = $(this);
        if ((selectedChar).data('cid') == "") {
            $(selectedChar).addClass("char-selected");
            setupCharInfo('empty')
            $("#play-text").html("Aanmaken");
            $("#play").css({"display":"block"});
            $("#delete").css({"display":"none"});
            $.post('http://schemkes-multicharacter/cDataPed', JSON.stringify({
                cData: cDataPed
            }));
        } else {
            $(selectedChar).addClass("char-selected");
            setupCharInfo($(this).data('cData'))
            $("#play-text").html("Spelen");
            $("#delete-text").html("Verwijder");
            $("#play").css({"display":"block"});
            $("#delete").css({"display":"block"});
            $.post('http://schemkes-multicharacter/cDataPed', JSON.stringify({
                cData: cDataPed
            }));
        }
    } else if ($(selectedChar).attr('id') !== $(this).attr('id')) {
        $(selectedChar).removeClass("char-selected");
        selectedChar = $(this);
        if ((selectedChar).data('cid') == "") {
            $(selectedChar).addClass("char-selected");
            setupCharInfo('empty')
            $("#play-text").html("Aanmaken");
            $("#play").css({"display":"block"});
            $("#delete").css({"display":"none"});
            $.post('http://schemkes-multicharacter/cDataPed', JSON.stringify({
                cData: cDataPed
            }));
        } else {
            $(selectedChar).addClass("char-selected");
            setupCharInfo($(this).data('cData'))
            $("#play-text").html("Spelen");
            $("#delete-text").html("Verwijder");
            $("#play").css({"display":"block"});
            $("#delete").css({"display":"block"});
            $.post('http://schemkes-multicharacter/cDataPed', JSON.stringify({
                cData: cDataPed
            }));
        }
    }
});

$(document).on('click', '#create', function(e){
    e.preventDefault();
    $.post('http://schemkes-multicharacter/createNewCharacter', JSON.stringify({
        firstname: $('#first_name').val(),
        lastname: $('#last_name').val(),
        nationality: $('#nationality').val(),
        birthdate: $('#birthdate').val(),
        gender: $('select[name=gender]').val(),
        cid: $(selectedChar).attr('id').replace('char-', ''),
    }));
    $(".container").fadeOut(150);
    $('.characters-list').css("filter", "none");
    $('.character-info').css("filter", "none");
    schemkesMultiCharacters.fadeOutDown('.character-register', '125%', 400);
    refreshCharacters()
});

$(document).on('click', '#accept-delete', function(e){
    $.post('http://schemkes-multicharacter/removeCharacter', JSON.stringify({
        citizenid: $(selectedChar).data("citizenid"),
    }));
    $('.character-delete').fadeOut(150);
    $('.characters-block').css("filter", "none");
    refreshCharacters()
});

function refreshCharacters() {
    $('.characters-list').html('<div class="character" id="char-1" data-cid=""><span id="slot-name">Empty Slot<span id="cid"></span></span></div><div class="character" id="char-2" data-cid=""><span id="slot-name">Empty Slot<span id="cid"></span></span></div><div class="character" id="char-3" data-cid=""><span id="slot-name">Empty Slot<span id="cid"></span></span></div><div class="character" id="char-4" data-cid=""><span id="slot-name">Empty Slot<span id="cid"></span></span></div><div class="character" id="char-5" data-cid=""><span id="slot-name">Empty Slot<span id="cid"></span></span></div><div class="character-btn" id="play"><p id="play-text">Select a character</p></div><div class="character-btn" id="delete"><p id="delete-text">Select a character</p></div>')
    setTimeout(function(){
        $(selectedChar).removeClass("char-selected");
        selectedChar = null;
        $.post('http://schemkes-multicharacter/setupCharacters');
        $("#delete").css({"display":"none"});
        $("#play").css({"display":"none"});
        schemkesMultiCharacters.resetAll();
    }, 100)
}

$("#close-reg").click(function (e) {
    e.preventDefault();
    $('.characters-list').css("filter", "none")
    $('.character-info').css("filter", "none")
    schemkesMultiCharacters.fadeOutDown('.character-register', '125%', 400);
})

$("#close-del").click(function (e) {
    e.preventDefault();
    $('.characters-block').css("filter", "none");
    $('.character-delete').fadeOut(150);
})

$(document).on('click', '#play', function(e) {
    e.preventDefault();
    var charData = $(selectedChar).data('cid');

    if (selectedChar !== null) {
        if (charData !== "") {
            $.post('http://schemkes-multicharacter/selectCharacter', JSON.stringify({
                cData: $(selectedChar).data('cData')
            }));
            // schemkesMultiCharacters.fadeInDown('.welcomescreen', WelcomePercentage, 400);
            // schemkesMultiCharacters.fadeInDown('.server-log', '25%', 400);
            setTimeout(function(){
                schemkesMultiCharacters.fadeOutDown('.characters-list', "-40%", 400);
                schemkesMultiCharacters.fadeOutDown('.character-info', "-40%", 400);
                schemkesMultiCharacters.resetAll();
            }, 1500);
        } else {
            $('.characters-list').css("filter", "blur(2px)")
            $('.character-info').css("filter", "blur(2px)")
            schemkesMultiCharacters.fadeInDown('.character-register', '25%', 400);
        }
    }
});

$(document).on('click', '#delete', function(e) {
    e.preventDefault();
    var charData = $(selectedChar).data('cid');

    if (selectedChar !== null) {
        if (charData !== "") {
            $('.characters-block').css("filter", "blur(2px)")
            $('.character-delete').fadeIn(250);
        }
    }
});

schemkesMultiCharacters.fadeOutUp = function(element, time) {
    $(element).css({"display":"block"}).animate({top: "-80.5%",}, time, function(){
        $(element).css({"display":"none"});
    });
}

schemkesMultiCharacters.fadeOutDown = function(element, percent, time) {
    if (percent !== undefined) {
        $(element).css({"display":"block"}).animate({top: percent,}, time, function(){
            $(element).css({"display":"none"});
        });
    } else {
        $(element).css({"display":"block"}).animate({top: "103.5%",}, time, function(){
            $(element).css({"display":"none"});
        });
    }
}

schemkesMultiCharacters.fadeInDown = function(element, percent, time) {
    $(element).css({"display":"block"}).animate({top: percent,}, time);
}

schemkesMultiCharacters.resetAll = function() {
    $('.characters-list').hide();
    $('.characters-list').css("top", "-40");
    $('.character-info').hide();
    $('.character-info').css("top", "-40");
    // $('.welcomescreen').show();
    $('.welcomescreen').css("top", WelcomePercentage);
    $('.server-log').show();
    $('.server-log').css("top", "25%");
}