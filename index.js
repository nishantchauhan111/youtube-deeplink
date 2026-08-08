const youtubeUrlInput =
  document.getElementById("youtubeUrl");

const generateBtn =
  document.getElementById("generateBtn");

const clearBtn =
  document.getElementById("clearBtn");

const result =
  document.getElementById("result");

const deepLinkInput =
  document.getElementById("deepLink");

const copyBtn =
  document.getElementById("copyBtn");

const openBtn =
  document.getElementById("openBtn");

const errorBox =
  document.getElementById("error");

const copyMessage =
  document.getElementById("copyMessage");

const detectedType =
  document.getElementById("detectedType");



/*
====================================================
CONFIGURATION
====================================================
*/

const SITE_URL =
  window.location.origin +
  window.location.pathname;



/*
====================================================
VIDEO ID VALIDATION
====================================================
*/

function isValidVideoId(id) {

  return (
    typeof id === "string" &&
    /^[a-zA-Z0-9_-]{11}$/.test(id)
  );

}



/*
====================================================
PARSE YOUTUBE URL
====================================================
*/

function parseYouTubeURL(input) {

  let url;

  try {

    url =
      new URL(input.trim());

  } catch {

    return null;

  }


  const hostname =
    url.hostname
      .toLowerCase()
      .replace(/^www\./, "");



  /*
  --------------------------------------------
  YOUTUBE SHORT DOMAIN
  --------------------------------------------
  */

  if (hostname === "youtu.be") {

    const parts =
      url.pathname
        .split("/")
        .filter(Boolean);

    const id = parts[0];

    if (isValidVideoId(id)) {

      return {
        type: "video",
        id: id
      };

    }

  }



  /*
  --------------------------------------------
  YOUTUBE DOMAINS
  --------------------------------------------
  */

  if (
    hostname !== "youtube.com" &&
    hostname !== "m.youtube.com"
  ) {

    return null;

  }


  const path =
    url.pathname
      .split("/")
      .filter(Boolean);



  /*
  --------------------------------------------
  NORMAL VIDEO
  --------------------------------------------
  
  youtube.com/watch?v=XXXXXXXXXXX
  */

  if (
    path.length > 0 &&
    path[0] === "watch"
  ) {

    const id =
      url.searchParams.get("v");

    if (isValidVideoId(id)) {

      return {
        type: "video",
        id: id
      };

    }

  }



  /*
  --------------------------------------------
  SHORTS
  --------------------------------------------
  
  youtube.com/shorts/XXXXXXXXXXX
  */

  if (
    path.length >= 2 &&
    path[0] === "shorts"
  ) {

    const id = path[1];

    if (isValidVideoId(id)) {

      return {
        type: "shorts",
        id: id
      };

    }

  }



  /*
  --------------------------------------------
  LIVE
  --------------------------------------------
  
  youtube.com/live/XXXXXXXXXXX
  */

  if (
    path.length >= 2 &&
    path[0] === "live"
  ) {

    const id = path[1];

    if (isValidVideoId(id)) {

      return {
        type: "live",
        id: id
      };

    }

  }



  /*
  --------------------------------------------
  CHANNEL HANDLE
  --------------------------------------------
  
  youtube.com/@MustacheMandala
  */

  if (
    path.length >= 1 &&
    path[0].startsWith("@")
  ) {

    return {
      type: "channel",
      path: "/" + path.join("/")
    };

  }



  /*
  --------------------------------------------
  CHANNEL ID
  --------------------------------------------
  
  youtube.com/channel/UCxxxxxxxx
  */

  if (
    path.length >= 2 &&
    path[0] === "channel"
  ) {

    return {
      type: "channel",
      path: "/" + path.join("/")
    };

  }



  /*
  --------------------------------------------
  CUSTOM CHANNEL
  --------------------------------------------
  
  youtube.com/c/ChannelName
  */

  if (
    path.length >= 2 &&
    path[0] === "c"
  ) {

    return {
      type: "channel",
      path: "/" + path.join("/")
    };

  }


  return null;

}



/*
====================================================
READABLE TYPE
====================================================
*/

function readableType(type) {

  const names = {

    video: "🎬 YouTube Video",

    live: "🔴 YouTube Live",

    shorts: "📱 YouTube Shorts",

    channel: "👤 YouTube Channel"

  };

  return (
    names[type] || "YouTube"
  );

}



/*
====================================================
CREATE DEEP LINK
====================================================
*/

function createDeepLink(data) {


  /*
  --------------------------------------------
  VIDEO / LIVE / SHORTS
  --------------------------------------------
  */

  if (
    data.type === "video" ||
    data.type === "live" ||
    data.type === "shorts"
  ) {

    return (
      SITE_URL +
      "?type=" +
      encodeURIComponent(data.type) +
      "&id=" +
      encodeURIComponent(data.id)
    );

  }



  /*
  --------------------------------------------
  CHANNEL
  --------------------------------------------
  */

  if (data.type === "channel") {

    return (
      SITE_URL +
      "?type=channel&path=" +
      encodeURIComponent(data.path)
    );

  }


  return null;

}



/*
====================================================
GENERATE BUTTON
====================================================
*/

generateBtn.addEventListener(
  "click",
  function () {

    errorBox.textContent = "";

    result.classList.add("hidden");

    copyMessage.textContent = "";


    const input =
      youtubeUrlInput.value.trim();


    if (!input) {

      errorBox.textContent =
        "Please paste a YouTube URL.";

      return;

    }


    const data =
      parseYouTubeURL(input);


    if (!data) {

      errorBox.textContent =
        "Unsupported or invalid YouTube URL.";

      return;

    }


    const link =
      createDeepLink(data);


    detectedType.textContent =
      readableType(data.type);


    deepLinkInput.value =
      link;


    result.classList.remove(
      "hidden"
    );

  }
);



/*
====================================================
COPY BUTTON
====================================================
*/

copyBtn.addEventListener(
  "click",
  async function () {

    const link =
      deepLinkInput.value;


    if (!link) return;


    try {

      await navigator.clipboard
        .writeText(link);

    } catch {

      deepLinkInput.select();

      document.execCommand(
        "copy"
      );

    }


    copyMessage.textContent =
      "Copied successfully!";


    copyBtn.textContent =
      "Copied";


    setTimeout(
      function () {

        copyBtn.textContent =
          "Copy";

      },
      1500
    );

  }
);



/*
====================================================
CLEAR BUTTON
====================================================
*/

clearBtn.addEventListener(
  "click",
  function () {

    youtubeUrlInput.value = "";

    deepLinkInput.value = "";

    result.classList.add(
      "hidden"
    );

    errorBox.textContent = "";

    copyMessage.textContent = "";

    youtubeUrlInput.focus();

  }
);



/*
====================================================
OPEN BUTTON
====================================================
*/

openBtn.addEventListener(
  "click",
  function () {

    const link =
      deepLinkInput.value;


    if (link) {

      window.location.href =
        link;

    }

  }
);



/*
====================================================
ENTER KEY
====================================================
*/

youtubeUrlInput.addEventListener(
  "keydown",
  function (event) {

    if (event.key === "Enter") {

      generateBtn.click();

    }

  }
);



/*
====================================================
DEEP LINK REDIRECT SYSTEM
====================================================

When somebody opens:

?type=video&id=XXXXXXXXXXX

or

?type=live&id=XXXXXXXXXXX

or

?type=shorts&id=XXXXXXXXXXX

or

?type=channel&path=%2F%40MustacheMandala

the generator UI is bypassed and this
function opens the appropriate YouTube
destination.
====================================================
*/

function handleDeepLink() {


  const params =
    new URLSearchParams(
      window.location.search
    );


  const type =
    params.get("type");


  const id =
    params.get("id");


  const channelPath =
    params.get("path");



  /*
  No deep-link parameters.
  Normal generator page.
  */

  if (!type) {

    return;

  }



  /*
  --------------------------------------------
  BUILD YOUTUBE WEB URL
  --------------------------------------------
  */

  let youtubeWeb = null;

  let youtubeApp = null;



  /*
  VIDEO
  */

  if (
    type === "video" &&
    isValidVideoId(id)
  ) {

    youtubeWeb =
      "https://www.youtube.com/watch?v=" +
      encodeURIComponent(id);


    youtubeApp =
      "youtube://www.youtube.com/watch?v=" +
      encodeURIComponent(id);

  }



  /*
  LIVE
  */

  else if (
    type === "live" &&
    isValidVideoId(id)
  ) {

    youtubeWeb =
      "https://www.youtube.com/watch?v=" +
      encodeURIComponent(id);


    youtubeApp =
      "youtube://www.youtube.com/watch?v=" +
      encodeURIComponent(id);

  }



  /*
  SHORTS
  */

  else if (
    type === "shorts" &&
    isValidVideoId(id)
  ) {

    youtubeWeb =
      "https://www.youtube.com/shorts/" +
      encodeURIComponent(id);


    youtubeApp =
      "youtube://www.youtube.com/shorts/" +
      encodeURIComponent(id);

  }



  /*
  CHANNEL
  */

  else if (
    type === "channel" &&
    channelPath &&
    channelPath.startsWith("/")
  ) {

    youtubeWeb =
      "https://www.youtube.com" +
      channelPath;


    youtubeApp =
      "youtube://www.youtube.com" +
      channelPath;

  }



  /*
  Invalid deep link
  */

  if (!youtubeWeb) {

    return;

  }



  /*
  --------------------------------------------
  DEVICE DETECTION
  --------------------------------------------
  */

  const userAgent =
    navigator.userAgent ||
    navigator.vendor ||
    window.opera;


  const isAndroid =
    /Android/i.test(
      userAgent
    );


  const isIOS =
    /iPhone|iPad|iPod/i.test(
      userAgent
    ) ||
    (
      navigator.platform === "MacIntel" &&
      navigator.maxTouchPoints > 1
    );



  /*
  --------------------------------------------
  DESKTOP
  --------------------------------------------
  */

  if (
    !isAndroid &&
    !isIOS
  ) {

    window.location.replace(
      youtubeWeb
    );

    return;

  }



  /*
  --------------------------------------------
  MOBILE FALLBACK
  --------------------------------------------
  */

  let fallbackTimer;



  /*
  --------------------------------------------
  ANDROID
  --------------------------------------------
  */

  if (isAndroid) {


    const intentUrl =

      "intent://" +

      youtubeWeb.replace(
        "https://",
        ""
      ) +

      "#Intent;" +

      "scheme=https;" +

      "package=com.google.android.youtube;" +

      "S.browser_fallback_url=" +

      encodeURIComponent(
        youtubeWeb
      ) +

      ";end";


    window.location.href =
      intentUrl;



    fallbackTimer =
      setTimeout(
        function () {

          window.location.replace(
            youtubeWeb
          );

        },
        2500
      );

  }



  /*
  --------------------------------------------
  iPHONE / iPAD
  --------------------------------------------
  */

  else if (isIOS) {


    window.location.href =
      youtubeApp;



    fallbackTimer =
      setTimeout(
        function () {

          window.location.replace(
            youtubeWeb
          );

        },
        2500
      );

  }

}



/*
====================================================
START DEEP LINK HANDLER
====================================================
*/

handleDeepLink();
