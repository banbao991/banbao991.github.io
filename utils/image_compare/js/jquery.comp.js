// modified from: https://cgg.mff.cuni.cz/~jirka/papers/2014/olpm/js/jquery.comp.js

var tempBackgrounds = Array();
var tempTexts = Array();
var tempDisable = false;
var tempText, tempBackground;

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function divideMove(element, imgs, x, y) {
  if (tempDisable) {
    return;
  }
  switch (element.children().length) {
    case 4:
      imgs[0].width(x);
      imgs[0].height(y);
      imgs[1].height(y);
      imgs[2].width(x);
      imgs[1].children("div").css("margin-left", x);
      imgs[2].children("div").css("margin-top", y);
      imgs[3].children("div").css("margin-top", y);
      imgs[3].children("div").css("margin-left", x);
      break;
    case 3:
      imgs[0].width(x);
      imgs[0].height(y);
      imgs[1].width(x);
      imgs[1].children("div").css("margin-top", y);
      imgs[2].children("div").css("margin-top", y);
      imgs[2].children("div").css("margin-left", x);

      break;
    case 2:
      imgs[0].width(x);
      imgs[1].children("div").css("margin-left", x + 1);
      imgs[1].children("div").css("margin-top", y + 1);
      imgs[0].children("div").css("margin-top", y + 1);
      break;
  }
}

function GenerateCompareBox() {
  $(".hline_for_help").remove();
  $("div.comp").each(function () {
    var pane = $(this);
    $(this).css("clear", "both");
    $(this).css("cursor", "crosshair");
    var width = $($(this).children()[0]).width();
    var height = $($(this).children()[0]).height();

    var numImg = $(this).children().size();

    var displayImg = Math.min(numImg, 4);

    if (displayImg < 2) {
      alert("Wrong image count");
      return;
    }

    var beforeTable = $("<table/>")
      .css("text-align", "center")
      .addClass("comp");
    beforeTable.append($("<tbody/>"));
    for (var i = 0; i < numImg; i += 3) {
      beforeTable.children().append($("<tr/>"));
      beforeTable.children().append($("<tr/>"));
    }

    var rows = beforeTable.children().children("tr");

    beforeTable.insertBefore($(this));

    $("<div>")
      .addClass("hline")
      .addClass("hline_for_help")
      .insertBefore($(this));

    var offset = 0;

    var imgs = Array();
    for (var i = 0; i < numImg; i++) {
      if (i != 0 && i % 3 == 0) {
        offset += 2;
      }
      var img = $($(this).children()[i]);
      var title = img.attr("alt");

      var beforeImg = new Image();
      beforeImg.src = img.attr("src");
      beforeImg.width = width / 3 - 5;
      beforeImg.height = height / 3 - 5;
      beforeImg.alt = title;
      $(beforeImg).draggable({
        revert: true,
        revertDuration: 100,
        start: function () {
          tempText = $(this).attr("alt");
          tempBackground = $(this).attr("src");
          var i = 0;
          $(this).css("z-index", 9999);
          pane.children("div").each(function () {
            tempTexts[i] = $(this).children().html();
            $(this).children().html("Place img here");
            tempBackgrounds[i++] = $(this).css("background-image");
            $(this).css("opacity", 0.5);
          });
          divideMove(pane, imgs, width / 2, height / 2);
          tempDisable = true;
        },
        stop: function () {
          tempDisable = false;
          var i = 0;
          pane.children("div").each(function () {
            $(this).children().html(tempTexts[i]);
            $(this).css("background-image", tempBackgrounds[i++]);
            $(this).css("opacity", 1);
          });
        },
      });
      $(rows[offset + 0]).append($("<td>" + title + "</td>"));
      $(rows[offset + 1]).append(
        $("<td>").append(
          $("<a/>").attr("href", beforeImg.src).append(beforeImg)
        )
      );

      if (i < displayImg) {
        var div = $("<div/>");
        $(this).width(width);
        $(this).height(height);
        div.width(width);
        div.height(height);
        div.css("position", "absolute");
        div.css("overflow", "hidden");
        div.css("z-index", 10 - i);
        div.css("border", "1px solid black");
        div.css("background", "url(" + img.attr("src") + ")");

        var inset = $("<div/>");
        inset.html(title);
        inset.css("position", "absolute");
        inset.css("color", "white");
        inset.css("padding", "2px");
        //inset.css("font-weight", "bold");
        inset.css("font-family", "sans-serif");
        inset.css("font-size", "90%");
        inset.css("opacity", 0.85);

        switch (i) {
          case 0:
            inset.css("float", "right");
            if (displayImg == 4 || displayImg == 3) {
              inset.css("bottom", "1px");
            }
            inset.css("right", "1px");
            break;
          case 1:
            if (displayImg == 4) {
              inset.css("bottom", "1px");
            }
            if (displayImg == 3) {
              inset.css("float", "right");
              inset.css("right", "1px");
            }
            break;
          case 2:
            if (displayImg == 3) {
            } else {
              inset.css("float", "right");
              inset.css("right", "1px");
            }

            break;
        }
        div.append(inset);
        imgs[i] = div;
      }
    }
    $(this).empty();

    for (var i = 0; i < displayImg; i++) {
      $(this).append(imgs[i]);
    }

    $(this).mousemove(function (e) {
      var parentOffset = $(this).offset();
      var relX = clamp(e.pageX - parentOffset.left, 0, $(this).width());
      var relY = clamp(e.pageY - parentOffset.top, 0, $(this).height());
      divideMove($(this), imgs, relX, relY);
    });

    divideMove($(this), imgs, width / 2, height / 2);

    $(this).droppable({
      drop: function (e, ui) {
        var parentOffset = $(this).offset();
        var relX = clamp(e.pageX - parentOffset.left, 0, $(this).width());
        var relY = clamp(e.pageY - parentOffset.top, 0, $(this).height());
        var target;
        if (relX < $(this).width() / 2) {
          if (relY < $(this).height() / 2) {
            target = 0;
          } else {
            target = 2;
          }
        } else {
          if (relY < $(this).height() / 2) {
            target = 1;
          } else {
            target = 3;
          }
        }
        tempTexts[target] = tempText;
        tempBackgrounds[target] = "url(" + tempBackground + ")";
      },
    });

    $(window).keypress(function (event) {
      changed = $($("div.comp")[0]);
      var width = changed.width();
      var height = changed.height();
      //alert(event.which);
      switch (event.which) {
        case 114:
          divideMove(changed, imgs, width / 2, height / 2);
          event.preventDefault();
          break;
        case 49:
        case 97:
          divideMove(changed, imgs, width, height);
          event.preventDefault();
          break;
        case 50:
        case 115:
          divideMove(changed, imgs, 0, height);
          event.preventDefault();
          break;
        case 51:
        case 100:
          divideMove(changed, imgs, width, 0);
          event.preventDefault();
          break;
        case 52:
        case 102:
          divideMove(changed, imgs, 0, 0);
          event.preventDefault();
          break;
      }
    });
  });
}
