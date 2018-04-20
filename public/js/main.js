var selection_xy = [];
var tag_error_raised = false;
var new_zone_created = false;
var init_finished = false;
var current_area = null;
MESSAGE_EMPTY_TAG = "You need to enter a tag here"
RED_COLOR = "#C70039"
GREEN_COLOR = "#80A60E"
var changeStatusMessage = false;

var json_annotations = [];
var list_of_tags = [];
var current_visible_area_id = -1;

/*$("#image_to_process").on('load', function() {
 alert("On Load");
 })*/

/*$(window).load(function(){

 alert($("#image_to_process").width());

 });*/

var user_id = "";
var image_info = {
  url: "",
  id: "",
  folder: "",
  width: 0,
  height: 0,
  annotations: [],
};

var lastLoadedWidth = 0;
var lastLoadedHeight = 0;
var firstWidth = 0;

$(document).ready(function () {
  $('#image_to_process').on("load", function () {

    console.log("INFO: " + "on('load', function() ");
    changeStatusMessage = false;

    lastLoadedWidth = $('#image_to_process').get(0).naturalWidth;
    lastLoadedHeight = $('#image_to_process').get(0).naturalHeight;

    image_info.width = lastLoadedWidth;
    image_info.height = lastLoadedHeight;

    console.log("INFO: " + "image_info.width = " + image_info.width);
    console.log("INFO: " + "image_info.height = " + image_info.height);

    if (firstWidth == 0) {
      firstWidth = $('#image_to_process').get(0).width;
    }

    ratio = lastLoadedWidth / lastLoadedHeight;

    col2_width = 2 * $(window).width() / 3;
    // Image is to large
    if (image_info.width < col2_width) {
      col2_width = image_info.width;
    }

    image_screen_width = col2_width;
    image_screen_height = image_screen_width / ratio;

    // Image is to high
    if (image_screen_height > $(window).height() * 0.75) {
      image_screen_height = parseInt($(window).height() * 0.75, 10);
      image_screen_width = parseInt(image_screen_height * ratio, 10);
      col2_width = image_screen_width;

    }

    // alert("New image size = " + image_screen_width + "px , " + image_screen_height + "px");

    remaining_x_space = $(window).width() - col2_width;
    col1_width = 1 * remaining_x_space / 6;
    col3_width = 4 * remaining_x_space / 6;
    col4_width = 1 * remaining_x_space / 6;

    $("#image_to_process").attr({width: image_screen_width + "px"});
    $("#image_to_process").attr({height: image_screen_height + "px"});

    // col1_width = ($(window).width() - $('#image_to_process').get(0).width - 350) /2;
    // col2_width = $('#image_to_process').get(0).width;
    // col3_width = ($(window).width() - $('#image_to_process').get(0).width - 350) /2;

    console.log("INFO: " + "$(window).width() = " + $(window).width());
    console.log("INFO: " + "$(window).height() = " + $(window).height());

    console.log("INFO: " + "col1_width = " + col1_width);
    console.log("INFO: " + "col2_width = " + col2_width);
    console.log("INFO: " + "col3_width = " + col3_width);
    console.log("INFO: " + "col4_width = " + col4_width);

    $("#col1").css("width", col1_width + "px");
    $("#col2").css("width", col2_width + "px");
    $("#col3").css("width", col3_width + "px");
    $("#col4").css("width", col4_width + "px");

    // image_screen_width = 600;
    // image_screen_height = image_screen_width/ratio;
    // Set image dimension
    //$("#image_to_process").attr({width:image_screen_width+"px"});
    //$("#image_to_process").attr({height:image_screen_height+"px"});

    ratio_original_to_screen_x = image_screen_width / lastLoadedWidth;
    ratio_original_to_screen_y = image_screen_height / lastLoadedHeight;

    /*$('#image_to_process').selectAreas(
     {
     allowNudge: false,
     // onChanged:onAreaChanged,
     onDeleted:onAreaDeleted,
     });		*/

    // Loop on tag info
    json_annotations.forEach(function (element) {
      var areaOptions = {
        x: (element.x * ratio_original_to_screen_x),
        y: (element.y * ratio_original_to_screen_y),
        width: (element.width * ratio_original_to_screen_x),
        height: (element.height * ratio_original_to_screen_y),
        tag: element.tag,
      };

      // We have to convert x, y and size to image in the HTML page
      $('#image_to_process').selectAreas('add', areaOptions);
    });

    // Get list of areas
    var areas = $('#image_to_process').selectAreas('areas');
    if (areas.length > 0) {
      // Selected area is the first one
      current_area = areas[0];
      // Select first area
      onAreaChanged(null, current_area.id, areas)
      $('#image_to_process').selectAreas('set', current_area.id);
    }
    else {
      current_area = null;
    }

  });

  $('#image_to_process').on("changed", function (event, id, areas) {
    // console.log("INFO: " + "index.html on(changed)");

    for (var i = 0; i < areas.length; i++) {
      // console.log("INFO: " + "area " + areas[i].id);
      if (areas[i].id == id) {
        area = areas[i];
        current_area = area;
      }
    }

    if (area == null) {
      console.log("INFO: area is null return");
      current_area = null;
      return;
    }

    new_zone_created = false

    // Check region size
    if (isAreaTooSmall(area)) {
      setStatusAndColor("The region is too small (must be >80px).", RED_COLOR)

      newWidth = area.width;
      newHeight = area.height;

      if (newWidth < 80) {
        newWidth = 80;
      }

      if (newHeight < 80) {
        newHeight = 80;
      }

      $('#image_to_process').selectAreas('resizeArea', current_area.id, newWidth, newHeight);
    }
    else {
      if (changeStatusMessage) {
        setStatus("Region has been selected.");
      }
    }

  });

  new_zone_created = false

  $('#add_region').click(function (e) {
    // Sets a random selection
    setTagAndRegion();
  });

  $('#validate_button').click(function (e) {
    // Sets a random selection
    validateTagsAndRegions();
  });

  $('#ignore_button').click(function (e) {
    window.location.reload();
  });

  $('#all_annotations_button').click(function (e) {
    // Show all annotations
    current_visible_area_id = -1;
    var areas = $('#image_to_process').selectAreas('areas');

    for (var i = 0; i < areas.length; i++) {
      $('#image_to_process').selectAreas('setVisibility', areas[i].id, 1);
    }
  });

  $('#none_annotation_button').click(function (e) {
    // Hide annotations
    var areas = $('#image_to_process').selectAreas('areas');
    current_visible_area_id = -1;

    for (var i = 0; i < areas.length; i++) {
      $('#image_to_process').selectAreas('setVisibility', areas[i].id, 0);
    }
  });

  $('#one_annotation_button').click(function (e) {

    // Hide annotations
    var areas = $('#image_to_process').selectAreas('areas');
    current_visible_area_id++;

    /*if (areas.length==0)
     {
     $('#one_annotation_button').button( "option", "label", "");
     }*/

    if (current_visible_area_id + 1 > areas.length) {
      current_visible_area_id = 0;
    }

    for (var i = 0; i < areas.length; i++) {
      // alert("i " + i);
      // alert("current_visible_area_id " + current_visible_area_id);

      if (i == current_visible_area_id) {
        $('#image_to_process').selectAreas('setVisibility', areas[i].id, 1);
        // $('#one_annotation_button').button( "option", "label", "areas[i].tag");
      }
      else {
        $('#image_to_process').selectAreas('setVisibility', areas[i].id, 0);
      }
    }

  });

  init_finished = true;

  loadTags();
})

function onAreaDeleted(event, id, areas) {
  if (current_area != null) {
    if (current_area.id == id) {
      current_area = null;
      setNotYetValidInputTag("");
    }
  }
  // if current unset tag @todo later
}


function onAreaChanged(event, id, areas) {
  // alert(id);

  // console.log("INFO: " + "onAreaChanged() " + event);
  // Find area by id
  for (var i = 0; i < areas.length; i++) {
    // console.log("INFO: " + "area " + areas[i].id);
    if (areas[i].id == id) {
      area = areas[i];
      current_area = area;
    }
  }

  if (area == null) {
    console.log("INFO: area is null return");
    current_area = null;
    return;
  }

  new_zone_created = false

  // Check region size
  if (isAreaTooSmall(area)) {
    setStatusAndColor("The region is too small (must be >80px).", RED_COLOR)

    newWidth = area.width;
    newHeight = area.height;

    if (newWidth < 80) {
      newWidth = 80;
    }

    if (newHeight < 80) {
      newHeight = 80;
    }

    $('#image_to_process').selectAreas('resizeArea', current_area.id, newWidth, newHeight);
  }
  else {
    if (changeStatusMessage) {
      setStatus("Region has been selected.");
    }
  }
}

function isAreaTooSmall(area) {
  if ((area.width < 80) || (area.height < 80)) {
    return true;
  }
  else {
    return false;
  }

}

function px(n) {
  return Math.round(n) + 'px';
}

function setStatusAndColor(status_text, color) {
  $('#status').css('color', color);
  $("#status").text(status_text);
}

// Default color is black
function setStatus(status_text) {
  setStatusAndColor(status_text, "#000");
}

function setTagAndRegion(tag) {

  changeStatusMessage = true;

  if (tag_error_raised) {
    return false;
  }

  if (current_area == null) {
    onAreaChanged(null, current_area.id, areas);
  }

  if (isAreaTooSmall(current_area)) {
    setStatusAndColor("Tag was not set, the region is too small.", RED_COLOR)
    return false;
  }

  // Just change the tag, get area, id, ...
  $('#image_to_process').selectAreas('setTag', current_area.id, tag.name);
  setStatus("Tag has been set.");

  // Selection another box
  new_zone_created = true;

  return true;
}

function validateTagsAndRegions() {

  // Process the list of tags
  var areas = $('#image_to_process').selectAreas('areas');

  if (areas.length == 0) {
    setStatusAndColor("Create at least one region with a tag before submitting.", RED_COLOR);
    return false;
  }

  index_tag = 0;
  ratioX = lastLoadedWidth / $('#image_to_process').width();
  ratioY = lastLoadedHeight / $('#image_to_process').height();
  tmp_annotations = [];

  var error_occurs = false;
  $.each(areas, function (id, area) {
    var tag_info = {tag: "", x: 0, y: 0, width: 0, height: 0};
    tag_info.tag = area.tag;
    tag_info.x = area.x * ratioX;
    tag_info.y = area.y * ratioY;
    tag_info.width = area.width * ratioX;
    tag_info.height = area.height * ratioY;
    // To be checked
    tmp_annotations.push(tag_info);
    // image_info.annotations[index_tag] = tag_info;
    index_tag = index_tag + 1;

    if (area.tag.length < 3) {
      if (areas.length == 1) {
        setStatusAndColor("You should add a tag to the region.", RED_COLOR);
      }
      else {
        setStatusAndColor("You should add a tag to each region.", RED_COLOR);
      }
      error_occurs = true;
      return false;
    }

  });

  if (error_occurs) return false;

  // image_info.annotations = JSON.stringify(tmp_annotations);
  image_info.annotations = tmp_annotations;
  //alert(image_info.annotations);
  console.log("INFO: annotations : " + image_info.annotations);
  console.log("INFO: annotations : " + JSON.stringify(image_info));

  $.ajax({
    url: '/annotation/save',
    type: 'POST',
    data: {sendInfo: JSON.stringify(image_info)},
    cache: false,
    dataType: "json",
    success: function (data, status) {
      // Reload a page but with a message
      setStatusAndColor("Data has been sent.", GREEN_COLOR);
      window.location.reload();
    },
    error: function (data, status, error) {
      setStatusAndColor("Unable to send data, please retry or check your connection.", RED_COLOR)
    }
  });

}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function getOrCreateUserId() {

  user_id = getCookie("user_id");

  if (user_id != "") {
    // The user is known
    $("#message").text("Welcome back !");
  }
  else {
    // Create a cookie to identify user
    var date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000)); // ms
    expires = "; expires=" + date.toUTCString();
    user_id = getRandomToken();
    document.cookie = "user_id=" + user_id + expires + "; path=/";
    $("#message").text("Welcome !");
  }

}

function getRandomToken() {
  // E.g. 8 * 32 = 256 bits token
  var randomPool = new Uint8Array(32);

  var crypto = window.crypto || window.msCrypto;

  crypto.getRandomValues(randomPool);
  var hex = '';
  for (var i = 0; i < randomPool.length; ++i) {
    hex += randomPool[i].toString(16);
  }
  // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
  return hex;
}

function loadImage() {

  var dataString = JSON.stringify(user_id);
  console.log("INFO: " + "loadImage() from php");

  $.ajax({
    type: 'POST',
    url: '/annotation/next',
    data: {user_id: dataString},
    dataType: "json",
    success: function (data) {
      var dataJson = JSON.parse(data);
      image_info.url = dataJson.url;
      image_info.id = dataJson.id;
      image_info.folder = dataJson.folder;
      image_id = dataJson.id;
      json_annotations = dataJson.annotations;
      $('#image_id').text(image_id);
      $('#image_to_process').attr("src", image_info.url);

      /*$('#image_to_process').selectAreas(
       {
       allowNudge: false,
       // onChanged:onAreaChanged,
       onDeleted:onAreaDeleted,
       });*/


    },
    dataType: 'html'
  });
}

function loadTags() {
  $.ajax({
    type: 'GET',
    url: '/tag',
    success: function onSuccess(data) {
      var $tagsContainer = $('.tags-container');
      var $tagPrototype = $('.tag-button', $tagsContainer);
      $tagPrototype.remove();
      _.each(data, function (tag) {
        var $tag = $tagPrototype.clone();
        $('span.tooltiptext', $tag).text(tag.name);
        $('img', $tag)
          .attr('src', tag.icon)
          .attr('alt', tag.name);
        $tag.click(function () {
          setTagAndRegion(tag);
        })
        $tag.appendTo($tagsContainer);
      })
    },
  });
}
