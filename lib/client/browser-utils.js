'use strict';

var lastOpenedDrawer = null;

function init ($) {

  // Tooltips can remain in the way on touch screens.
  if (!isTouch()) {
    $('.tip').tipsy();
  } else {
    // Drawer info tips should be displayed on touchscreens.
    $('#drawer').find('.tip').tipsy();
  }
  $.fn.tipsy.defaults = {
    fade: true,
    gravity: 'n',
    opacity: 0.75
  };

  var querystring = queryParms();

  if (querystring.notify) {
    showNotification(querystring.notify, querystring.notifytype);
  }

  if (querystring.drawer) {
    openDrawer('#drawer');
  }

  $('#drawerToggle').click(function(event) {
    toggleDrawer('#drawer');
    event.preventDefault();
  });

  $('#notification').click(function(event) {
    closeNotification();
    event.preventDefault();
  });

  $('.navigation a').click(function navigationClick ( ) {
    closeDrawer('#drawer');
  });

  function reload() {
    //strip '#' so form submission does not fail
    var url = window.location.href;
    url = url.replace(/#$/, '');
    window.location = url;
  }


  function queryParms() {
    var params = {};
    if (location.search) {
      location.search.substr(1).split('&').forEach(function(item) {
        params[item.split('=')[0]] = item.split('=')[1].replace(/[_\+]/g, ' ');
      });
    }
    return params;
  }

  function isTouch() {
    try { document.createEvent('TouchEvent'); return true; }
    catch (e) { return false; }
  }

  function closeDrawer(id, callback) {
    lastOpenedDrawer = null;
    $('html, body').css({ scrollTop: 0 });
    $(id).css({display: 'none', right: '-300px'});
    if (callback) { callback(); }
  }

  function openDrawer(id, prepare) {
    function closeOpenDraw(callback) {
      if (lastOpenedDrawer) {
        closeDrawer(lastOpenedDrawer, callback);
      } else {
        callback();
      }
    }

    closeOpenDraw(function () {
      lastOpenedDrawer = id;
      if (prepare) { prepare(); }
      $(id).css({display:'block', right: '0'});
    });

  }

  function toggleDrawer(id, openPrepare, closeCallback) {
    if (lastOpenedDrawer === id) {
      closeDrawer(id, closeCallback);
    } else {
      openDrawer(id, openPrepare);
    }
  }

  function closeNotification() {
    var notify = $('#notification');
    notify.hide();
    notify.find('span').html('');
  }

  function showNotification(note, type)  {
    var notify = $('#notification');
    notify.hide();

    // Notification types: 'info', 'warn', 'success', 'urgent'.
    // - default: 'urgent'
    notify.removeClass('info warn urgent');
    notify.addClass(type ? type : 'urgent');

    notify.find('span').html(note);
    notify.css('left', 'calc(50% - ' + (notify.width() / 2) + 'px)');
    notify.show();
  }

  return {
    reload: reload
    , queryParms: queryParms
    , closeDrawer: closeDrawer
    , toggleDrawer: toggleDrawer
    , closeNotification: closeNotification
    , showNotification: showNotification
  };
}

module.exports = init;
