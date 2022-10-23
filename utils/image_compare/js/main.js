function get_url() {
  let url = location.search; // url
  let target_cpp = "";
  let index = url.indexOf("?");
  if (index != -1) {
    return url.substr(index + 1, url.length - index);
  } else {
    return "";
  }
}

function refresh_images() {
  // remove all
  let f = $("#comp1");
  f.children().remove();

  $("table").remove();

  // insert
  let txt = $("#ImagesLink").val();
  let img_arr = txt.split("\n").filter((x) => x !== "");

  let img1;
  for (let i = 0; i < img_arr.length && i < 4; ++i) {
    let img_link = img_arr[i];
    let idx1 = img_link.lastIndexOf("/") + 1;
    let idx2 = img_link.lastIndexOf(".");
    idx2 = idx2 === -1 ? img_link.length : idx2;

    let img_div = $("<img>");
    img_div.attr("src", img_link).attr("alt", img_link.substring(idx1, idx2));
    f.append(img_div);

    // set div size
    if (i == 0) {
      img1 = new Image();
      img1.onload = function () {
        // set size
        f.css("width", img1.width).css("height", img1.height);
        // update
        GenerateCompareBox();
      };
      img1.src = img_link;
    }
  }
}

function main() {
  let default_images = [
    "/2022/03/28/CG/Kits/rtyl-2/10spp-mixture_pdf.png",
    "/2022/03/28/CG/Kits/rtyl-2/10spp.png",
    "/2022/03/28/CG/Kits/rtyl-2/10spp-sample-the-light-directly.png",
  ];
  // TODO set "" when release
  let prefix_host = "";

  // get
  let url = get_url();
  if (url !== "") {
    let url_images = url.split(";").filter((x) => x !== "");
    if (url_images.length !== 0) {
      prefix_host = url_images[0];
      url_images.shift();
      default_images = url_images;
    }
  }

  let s = "";
  for (let i = 0; i < default_images.length; ++i) {
    s += prefix_host + default_images[i] + "\n";
  }
  $("#ImagesLink").val(s);

  refresh_images();
}
