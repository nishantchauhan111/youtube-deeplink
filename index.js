/*
========================================================
YOUTUBE DEEP LINK GENERATOR
========================================================

Supports:
- YouTube Video
- YouTube Live
- YouTube Shorts
- YouTube Channel
- @Handle
- /channel/UC...
- /c/ChannelName
- youtu.be links

Generated links:
?type=video&id=XXXXXXXXXXX
?type=live&id=XXXXXXXXXXX
?type=shorts&id=XXXXXXXXXXX
?type=channel&path=%2F%40MustacheMandala

Tracking parameters such as:
utm_source
utm_medium
utm_campaign
utm_content
fbclid

are automatically ignored.

========================================================
*/


/* ======================================================
   HELPER: GET GENERATOR ELEMENT
====================================================== */

const generatorApp =
  document.getElementById("generatorApp");


/* ======================================================
   CHECK IF CURRENT URL IS A GENERATED DEEP LINK
====================================================== */

const currentParams =
  new URLSearchParams(
    window.location.search
  );

const currentType =
  currentParams.get("type");


/*
--------------------------------------------------------
If this is a generated link, hide the generator
immediately.
--------------------------------------------------------
*/

if (currentType) {

  if (generatorApp) {

    generatorApp.style.display = "none";

  }

}


/* ======================================================
   VIDEO ID VALIDATION
====================================================== */

function isValidVideoId(id) {

  return (
    typeof id === "string" &&
    /^[A-Za-z0-9_-]{11}$/.test(id)
  );

}


/* ======================================================
   CLEAN CHANNEL PATH
====================================================== */

function cleanChannelPath(path) {

  if (!path) {
    return null;
  }


  let cleaned =
    String(path).trim();


  /*
  Decode repeatedly if someone accidentally
  double-encoded the URL.

  Example:

  %252F%2540MustacheMandala

  becomes:

  %2F%40MustacheMandala

  becomes:

  /@MustacheMandala
  */

  for (let i = 0; i < 3; i++) {

    try {

      const decoded =
        decodeURIComponent(cleaned);

      if (decoded === cleaned) {
        break;
      }

      cleaned = decoded;

    } catch {

      break;

    }

  }


  /*
  Make sure channel path begins with /
  */

  if (!cleaned.startsWith("/")) {

    cleaned =
      "/" + cleaned;

  }


  /*
  Remove duplicate slashes
  */

  cleaned =
    cleaned.replace(
      /^\/+/,
      "/"
    );


  /*
  Only allow valid YouTube channel paths.
  */

  if (
    cleaned.startsWith("/@") ||
    cleaned.startsWith("/channel/") ||
    cleaned.startsWith("/c/")
  ) {

    return cleaned;

  }


  return null;

}


/* ======================================================
   PARSE YOUTUBE URL
====================================================== */

function parseYouTubeURL(input) {

  let url;


  try {

    /*
    If user enters without https://
    */

    let value =
      input.trim();


    if (
      !/^https?:\/\//i.test(value)
    ) {

      value =
        "https://" + value;

    }


    url =
      new URL(value);

  } catch {

    return null;

  }


  /*
  Normalize hostname
  */

  const hostname =
    url.hostname
      .toLowerCase()
      .replace(/^www\./, "");


  /* ====================================================
     YOUTU.BE VIDEO
  ==================================================== */

  if (
    hostname === "youtu.be"
  ) {

    const parts =
      url.pathname
        .split("/")
        .filter(Boolean);


    const id =
      parts[0];


    if (
      isValidVideoId(id)
    ) {

      return {
        type: "video",
        id: id
      };

    }

  }


  /* ====================================================
     YOUTUBE DOMAIN CHECK
  ==================================================== */

  if (
    hostname !== "youtube.com" &&
    hostname !== "m.youtube.com"
  ) {

    return null;

  }


  const parts =
    url.pathname
      .split("/")
      .filter(Boolean);


  /* ====================================================
     NORMAL VIDEO

     youtube.com/watch?v=XXXXXXXXXXX
  ==================================================== */

  if (
    parts[0] === "watch"
  ) {

    const id =
      url.searchParams.get("v");


    if (
      isValidVideoId(id)
    ) {

      return {
        type: "video",
        id: id
      };

    }

  }


  /* ====================================================
     SHORTS

     youtube.com/shorts/XXXXXXXXXXX
  ==================================================== */

  if (
    parts.length >= 2 &&
    parts[0] === "shorts"
  ) {

    const id =
      parts[1];


    if (
      isValidVideoId(id)
    ) {

      return {
        type: "shorts",
        id: id
      };

    }

  }


  /* ====================================================
     LIVE

     youtube.com/live/XXXXXXXXXXX
  ==================================================== */

  if (
    parts.length >= 2 &&
    parts[0] === "live"
  ) {

    const id =
      parts[1];


    if (
      isValidVideoId(id)
    ) {

      return {
        type: "live",
        id: id
      };

    }

  }


  /* ====================================================
     CHANNEL HANDLE

     youtube.com/@MustacheMandala
  ==================================================== */

  if (
    parts.length >= 1 &&
    parts[0].startsWith("@")
  ) {

    return {
      type: "channel",
      path:
        "/" + parts.join("/")
    };

  }


  /* ====================================================
     CHANNEL ID

     youtube.com/channel/UCXXXXXXXX
  ==================================================== */

  if (
    parts.length >= 2 &&
    parts[0] === "channel"
  ) {

    return {
      type: "channel",
      path:
        "/" + parts.join("/")
    };

  }


  /* ====================================================
     CUSTOM CHANNEL

     youtube.com/c/ChannelName
  ==================================================== */

  if (
    parts.length >= 2 &&
    parts[0] === "c"
  ) {

    return {
      type: "channel",
      path:
        "/" + parts.join("/")
    };

  }


  return null;

}


/* ======================================================
   CREATE GENERATED DEEP LINK
====================================================== */

function createDeepLink(data) {

  /*
  Use current website URL.

  Example:

  https://nishantchauhan111.github.io/youtube-deeplink/
  */

  const base =
    window.location.origin +
    window.location.pathname;


  /* ====================================================
     VIDEO / LIVE / SHORTS
  ==================================================== */

  if (
    data.type === "video" ||
    data.type === "live" ||
    data.type === "shorts"
  ) {

    const params =
      new URLSearchParams();


    params.set(
      "type",
      data.type
    );


    params.set(
      "id",
      data.id
    );


    return (
      base +
      "?" +
      params.toString()
    );

  }


  /* ====================================================
     CHANNEL
  ==================================================== */

  if (
    data.type === "channel"
  ) {

    const channelPath =
      cleanChannelPath(
        data.path
      );


    if (!channelPath) {

      return null;

    }


    /*
    IMPORTANT:

    URLSearchParams handles the encoding
    automatically.

    DO NOT use encodeURIComponent()
    here.

    This prevents:

    %252F%2540

    and produces:

    %2F%40
    */

    const params =
      new URLSearchParams();


    params.set(
      "type",
      "channel"
    );


    params.set(
      "path",
      channelPath
    );


    return (
      base +
      "?" +
      params.toString()
    );

  }


  return null;

}


/* ======================================================
   READABLE TYPE
====================================================== */

function readableType(type) {

  const types = {

    video:
      "🎬 YouTube Video",

    live:
      "🔴 YouTube Live",

    shorts:
      "📱 YouTube Shorts",

    channel:
      "👤 YouTube Channel"

  };


  return (
    types[type] ||
    "YouTube"
  );

}


/* ======================================================
   GENERATOR UI
======================================================

Only initialize the generator when this is NOT
a generated deep link.
====================================================== */

if (!currentType) {


  const youtubeUrlInput =
    document.getElementById(
      "youtubeUrl"
    );


  const generateBtn =
    document.getElementById(
      "generateBtn"
    );


  const clearBtn =
    document.getElementById(
      "clearBtn"
    );


  const result =
    document.getElementById(
      "result"
    );


  const deepLinkInput =
    document.getElementById(
      "deepLink"
    );


  const copyBtn =
    document.getElementById(
      "copyBtn"
    );


  const openBtn =
    document.getElementById(
      "openBtn"
    );


  const errorBox =
    document.getElementById(
      "error"
    );


  const copyMessage =
    document.getElementById(
      "copyMessage"
    );


  const detectedType =
    document.getElementById(
      "detectedType"
    );



  /* ====================================================
     GENERATE BUTTON
  ==================================================== */

  if (generateBtn) {

    generateBtn.addEventListener(
      "click",
      function () {

        errorBox.textContent = "";

        copyMessage.textContent = "";

        result.classList.add(
          "hidden"
        );


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


        if (!link) {

          errorBox.textContent =
            "Unable to create deep link.";

          return;

        }


        detectedType.textContent =
          readableType(
            data.type
          );


        deepLinkInput.value =
          link;


        result.classList.remove(
          "hidden"
        );

      }
    );

  }



  /* ====================================================
     COPY BUTTON
  ==================================================== */

  if (copyBtn) {

    copyBtn.addEventListener(
      "click",
      async function () {

        const link =
          deepLinkInput.value;


        if (!link) {
          return;
        }


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

  }



  /* ====================================================
     CLEAR BUTTON
  ==================================================== */

  if (clearBtn) {

    clearBtn.addEventListener(
      "click",
      function () {

        youtubeUrlInput.value =
          "";

        deepLinkInput.value =
          "";

        result.classList.add(
          "hidden"
        );

        errorBox.textContent =
          "";

        copyMessage.textContent =
          "";

        youtubeUrlInput.focus();

      }
    );

  }



  /* ====================================================
     OPEN GENERATED LINK
  ==================================================== */

  if (openBtn) {

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

  }



  /* ====================================================
     ENTER KEY
  ==================================================== */

  if (youtubeUrlInput) {

    youtubeUrlInput.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Enter"
        ) {

          generateBtn.click();

        }

      }
    );

  }

}


/* ======================================================
   DEEP LINK REDIRECT
====================================================== */

function handleDeepLink() {

  /*
  Read parameters.

  URLSearchParams automatically decodes:

  %2F%40MustacheMandala

  into:

  /@MustacheMandala
  */

  const params =
    new URLSearchParams(
      window.location.search
    );


  const type =
    params.get("type");


  /*
  No generated link.

  Keep generator page.
  */

  if (!type) {

    return;

  }


  let youtubeWeb =
    null;


  let youtubeApp =
    null;



  /* ====================================================
     VIDEO
  ==================================================== */

  if (
    type === "video"
  ) {

    const id =
      params.get("id");


    if (
      isValidVideoId(id)
    ) {

      youtubeWeb =
        "https://www.youtube.com/watch?v=" +
        encodeURIComponent(id);


      youtubeApp =
        "youtube://www.youtube.com/watch?v=" +
        encodeURIComponent(id);

    }

  }



  /* ====================================================
     LIVE
  ==================================================== */

  else if (
    type === "live"
  ) {

    const id =
      params.get("id");


    if (
      isValidVideoId(id)
    ) {

      /*
      Use the video URL because
      YouTube Live is also a video.
      */

      youtubeWeb =
        "https://www.youtube.com/watch?v=" +
        encodeURIComponent(id);


      youtubeApp =
        "youtube://www.youtube.com/watch?v=" +
        encodeURIComponent(id);

    }

  }



  /* ====================================================
     SHORTS
  ==================================================== */

  else if (
    type === "shorts"
  ) {

    const id =
      params.get("id");


    if (
      isValidVideoId(id)
    ) {

      youtubeWeb =
        "https://www.youtube.com/shorts/" +
        encodeURIComponent(id);


      youtubeApp =
        "youtube://www.youtube.com/shorts/" +
        encodeURIComponent(id);

    }

  }



  /* ====================================================
     CHANNEL
  ==================================================== */

  else if (
    type === "channel"
  ) {

    /*
    This works with:

    %2F%40MustacheMandala

    and even accidentally double encoded:

    %252F%2540MustacheMandala
    */

    const rawPath =
      params.get("path");


    const channelPath =
      cleanChannelPath(
        rawPath
      );


    if (channelPath) {

      youtubeWeb =
        "https://www.youtube.com" +
        channelPath;


      youtubeApp =
        "youtube://www.youtube.com" +
        channelPath;

    }

  }



  /* ====================================================
     INVALID GENERATED LINK
  ==================================================== */

  if (!youtubeWeb) {

    /*
    Keep generator hidden.

    Show a simple invalid message instead.
    */

    document.body.innerHTML = `

      <div
        style="
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:30px;
          box-sizing:border-box;
          font-family:Arial,sans-serif;
          background:#0b0b0b;
          color:white;
          text-align:center;
        "
      >

        <div>

          <div
            style="
              font-size:50px;
              margin-bottom:15px;
            "
          >
            ⚠️
          </div>

          <h2>
            Invalid YouTube Link
          </h2>

          <p
            style="
              color:#999;
              margin-bottom:25px;
            "
          >
            This generated link is invalid
            or incomplete.
          </p>

          <a
            href="${window.location.origin + window.location.pathname}"
            style="
              display:inline-block;
              padding:12px 22px;
              background:#ff0033;
              color:white;
              text-decoration:none;
              border-radius:8px;
              font-weight:bold;
            "
          >
            Create New Link
          </a>

        </div>

      </div>

    `;


    return;

  }



  /* ====================================================
     DEVICE DETECTION
  ==================================================== */

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
      navigator.platform ===
      "MacIntel" &&
      navigator.maxTouchPoints > 1
    );



  /* ====================================================
     DESKTOP
  ==================================================== */

  if (
    !isAndroid &&
    !isIOS
  ) {

    window.location.replace(
      youtubeWeb
    );

    return;

  }



  /* ====================================================
     ANDROID
  ==================================================== */

  if (isAndroid) {


    /*
    Android Intent URL.

    This attempts to open the
    official YouTube app.

    If unavailable, Android uses
    the browser fallback.
    */

    const intentUrl =

      "intent://" +

      youtubeWeb.replace(
        /^https?:\/\//,
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


    /*
    Safety fallback.
    */

    setTimeout(
      function () {

        window.location.replace(
          youtubeWeb
        );

      },
      2500
    );


    return;

  }



  /* ====================================================
     iPHONE / iPAD
  ==================================================== */

  if (isIOS) {


    /*
    Attempt YouTube app.
    */

    window.location.href =
      youtubeApp;


    /*
    If app doesn't open,
    return to YouTube website.
    */

    setTimeout(
      function () {

        window.location.replace(
          youtubeWeb
        );

      },
      2500
    );


    return;

  }

}


/* ======================================================
   START
====================================================== */

handleDeepLink();

// OLD CODE

// const youtubeUrlInput =
//   document.getElementById("youtubeUrl");

// const generateBtn =
//   document.getElementById("generateBtn");

// const clearBtn =
//   document.getElementById("clearBtn");

// const result =
//   document.getElementById("result");

// const deepLinkInput =
//   document.getElementById("deepLink");

// const copyBtn =
//   document.getElementById("copyBtn");

// const openBtn =
//   document.getElementById("openBtn");

// const errorBox =
//   document.getElementById("error");

// const copyMessage =
//   document.getElementById("copyMessage");

// const detectedType =
//   document.getElementById("detectedType");



// /*
// ====================================================
// CONFIGURATION
// ====================================================
// */

// const SITE_URL =
//   window.location.origin +
//   window.location.pathname;



// /*
// ====================================================
// VIDEO ID VALIDATION
// ====================================================
// */

// function isValidVideoId(id) {

//   return (
//     typeof id === "string" &&
//     /^[a-zA-Z0-9_-]{11}$/.test(id)
//   );

// }



// /*
// ====================================================
// PARSE YOUTUBE URL
// ====================================================
// */

// function parseYouTubeURL(input) {

//   let url;

//   try {

//     url =
//       new URL(input.trim());

//   } catch {

//     return null;

//   }


//   const hostname =
//     url.hostname
//       .toLowerCase()
//       .replace(/^www\./, "");



//   /*
//   --------------------------------------------
//   YOUTUBE SHORT DOMAIN
//   --------------------------------------------
//   */

//   if (hostname === "youtu.be") {

//     const parts =
//       url.pathname
//         .split("/")
//         .filter(Boolean);

//     const id = parts[0];

//     if (isValidVideoId(id)) {

//       return {
//         type: "video",
//         id: id
//       };

//     }

//   }



//   /*
//   --------------------------------------------
//   YOUTUBE DOMAINS
//   --------------------------------------------
//   */

//   if (
//     hostname !== "youtube.com" &&
//     hostname !== "m.youtube.com"
//   ) {

//     return null;

//   }


//   const path =
//     url.pathname
//       .split("/")
//       .filter(Boolean);



//   /*
//   --------------------------------------------
//   NORMAL VIDEO
//   --------------------------------------------
  
//   youtube.com/watch?v=XXXXXXXXXXX
//   */

//   if (
//     path.length > 0 &&
//     path[0] === "watch"
//   ) {

//     const id =
//       url.searchParams.get("v");

//     if (isValidVideoId(id)) {

//       return {
//         type: "video",
//         id: id
//       };

//     }

//   }



//   /*
//   --------------------------------------------
//   SHORTS
//   --------------------------------------------
  
//   youtube.com/shorts/XXXXXXXXXXX
//   */

//   if (
//     path.length >= 2 &&
//     path[0] === "shorts"
//   ) {

//     const id = path[1];

//     if (isValidVideoId(id)) {

//       return {
//         type: "shorts",
//         id: id
//       };

//     }

//   }



//   /*
//   --------------------------------------------
//   LIVE
//   --------------------------------------------
  
//   youtube.com/live/XXXXXXXXXXX
//   */

//   if (
//     path.length >= 2 &&
//     path[0] === "live"
//   ) {

//     const id = path[1];

//     if (isValidVideoId(id)) {

//       return {
//         type: "live",
//         id: id
//       };

//     }

//   }



//   /*
//   --------------------------------------------
//   CHANNEL HANDLE
//   --------------------------------------------
  
//   youtube.com/@MustacheMandala
//   */

//   if (
//     path.length >= 1 &&
//     path[0].startsWith("@")
//   ) {

//     return {
//       type: "channel",
//       path: "/" + path.join("/")
//     };

//   }



//   /*
//   --------------------------------------------
//   CHANNEL ID
//   --------------------------------------------
  
//   youtube.com/channel/UCxxxxxxxx
//   */

//   if (
//     path.length >= 2 &&
//     path[0] === "channel"
//   ) {

//     return {
//       type: "channel",
//       path: "/" + path.join("/")
//     };

//   }



//   /*
//   --------------------------------------------
//   CUSTOM CHANNEL
//   --------------------------------------------
  
//   youtube.com/c/ChannelName
//   */

//   if (
//     path.length >= 2 &&
//     path[0] === "c"
//   ) {

//     return {
//       type: "channel",
//       path: "/" + path.join("/")
//     };

//   }


//   return null;

// }



// /*
// ====================================================
// READABLE TYPE
// ====================================================
// */

// function readableType(type) {

//   const names = {

//     video: "🎬 YouTube Video",

//     live: "🔴 YouTube Live",

//     shorts: "📱 YouTube Shorts",

//     channel: "👤 YouTube Channel"

//   };

//   return (
//     names[type] || "YouTube"
//   );

// }



// /*
// ====================================================
// CREATE DEEP LINK
// ====================================================
// */

// function createDeepLink(data) {


//   /*
//   --------------------------------------------
//   VIDEO / LIVE / SHORTS
//   --------------------------------------------
//   */

//   if (
//     data.type === "video" ||
//     data.type === "live" ||
//     data.type === "shorts"
//   ) {

//     return (
//       SITE_URL +
//       "?type=" +
//       encodeURIComponent(data.type) +
//       "&id=" +
//       encodeURIComponent(data.id)
//     );

//   }



//   /*
//   --------------------------------------------
//   CHANNEL
//   --------------------------------------------
//   */

//   if (data.type === "channel") {

//     return (
//       SITE_URL +
//       "?type=channel&path=" +
//       encodeURIComponent(data.path)
//     );

//   }


//   return null;

// }



// /*
// ====================================================
// GENERATE BUTTON
// ====================================================
// */

// generateBtn.addEventListener(
//   "click",
//   function () {

//     errorBox.textContent = "";

//     result.classList.add("hidden");

//     copyMessage.textContent = "";


//     const input =
//       youtubeUrlInput.value.trim();


//     if (!input) {

//       errorBox.textContent =
//         "Please paste a YouTube URL.";

//       return;

//     }


//     const data =
//       parseYouTubeURL(input);


//     if (!data) {

//       errorBox.textContent =
//         "Unsupported or invalid YouTube URL.";

//       return;

//     }


//     const link =
//       createDeepLink(data);


//     detectedType.textContent =
//       readableType(data.type);


//     deepLinkInput.value =
//       link;


//     result.classList.remove(
//       "hidden"
//     );

//   }
// );



// /*
// ====================================================
// COPY BUTTON
// ====================================================
// */

// copyBtn.addEventListener(
//   "click",
//   async function () {

//     const link =
//       deepLinkInput.value;


//     if (!link) return;


//     try {

//       await navigator.clipboard
//         .writeText(link);

//     } catch {

//       deepLinkInput.select();

//       document.execCommand(
//         "copy"
//       );

//     }


//     copyMessage.textContent =
//       "Copied successfully!";


//     copyBtn.textContent =
//       "Copied";


//     setTimeout(
//       function () {

//         copyBtn.textContent =
//           "Copy";

//       },
//       1500
//     );

//   }
// );



// /*
// ====================================================
// CLEAR BUTTON
// ====================================================
// */

// clearBtn.addEventListener(
//   "click",
//   function () {

//     youtubeUrlInput.value = "";

//     deepLinkInput.value = "";

//     result.classList.add(
//       "hidden"
//     );

//     errorBox.textContent = "";

//     copyMessage.textContent = "";

//     youtubeUrlInput.focus();

//   }
// );



// /*
// ====================================================
// OPEN BUTTON
// ====================================================
// */

// openBtn.addEventListener(
//   "click",
//   function () {

//     const link =
//       deepLinkInput.value;


//     if (link) {

//       window.location.href =
//         link;

//     }

//   }
// );



// /*
// ====================================================
// ENTER KEY
// ====================================================
// */

// youtubeUrlInput.addEventListener(
//   "keydown",
//   function (event) {

//     if (event.key === "Enter") {

//       generateBtn.click();

//     }

//   }
// );



// /*
// ====================================================
// DEEP LINK REDIRECT SYSTEM
// ====================================================

// When somebody opens:

// ?type=video&id=XXXXXXXXXXX

// or

// ?type=live&id=XXXXXXXXXXX

// or

// ?type=shorts&id=XXXXXXXXXXX

// or

// ?type=channel&path=%2F%40MustacheMandala

// the generator UI is bypassed and this
// function opens the appropriate YouTube
// destination.
// ====================================================
// */

// function handleDeepLink() {


//   const params =
//     new URLSearchParams(
//       window.location.search
//     );


//   const type =
//     params.get("type");


//   const id =
//     params.get("id");


//   const channelPath =
//     params.get("path");



//   /*
//   No deep-link parameters.
//   Normal generator page.
//   */

//   if (!type) {

//     return;

//   }



//   /*
//   --------------------------------------------
//   BUILD YOUTUBE WEB URL
//   --------------------------------------------
//   */

//   let youtubeWeb = null;

//   let youtubeApp = null;



//   /*
//   VIDEO
//   */

//   if (
//     type === "video" &&
//     isValidVideoId(id)
//   ) {

//     youtubeWeb =
//       "https://www.youtube.com/watch?v=" +
//       encodeURIComponent(id);


//     youtubeApp =
//       "youtube://www.youtube.com/watch?v=" +
//       encodeURIComponent(id);

//   }



//   /*
//   LIVE
//   */

//   else if (
//     type === "live" &&
//     isValidVideoId(id)
//   ) {

//     youtubeWeb =
//       "https://www.youtube.com/watch?v=" +
//       encodeURIComponent(id);


//     youtubeApp =
//       "youtube://www.youtube.com/watch?v=" +
//       encodeURIComponent(id);

//   }



//   /*
//   SHORTS
//   */

//   else if (
//     type === "shorts" &&
//     isValidVideoId(id)
//   ) {

//     youtubeWeb =
//       "https://www.youtube.com/shorts/" +
//       encodeURIComponent(id);


//     youtubeApp =
//       "youtube://www.youtube.com/shorts/" +
//       encodeURIComponent(id);

//   }



//   /*
//   CHANNEL
//   */

//   else if (
//     type === "channel" &&
//     channelPath &&
//     channelPath.startsWith("/")
//   ) {

//     youtubeWeb =
//       "https://www.youtube.com" +
//       channelPath;


//     youtubeApp =
//       "youtube://www.youtube.com" +
//       channelPath;

//   }



//   /*
//   Invalid deep link
//   */

//   if (!youtubeWeb) {

//     return;

//   }



//   /*
//   --------------------------------------------
//   DEVICE DETECTION
//   --------------------------------------------
//   */

//   const userAgent =
//     navigator.userAgent ||
//     navigator.vendor ||
//     window.opera;


//   const isAndroid =
//     /Android/i.test(
//       userAgent
//     );


//   const isIOS =
//     /iPhone|iPad|iPod/i.test(
//       userAgent
//     ) ||
//     (
//       navigator.platform === "MacIntel" &&
//       navigator.maxTouchPoints > 1
//     );



//   /*
//   --------------------------------------------
//   DESKTOP
//   --------------------------------------------
//   */

//   if (
//     !isAndroid &&
//     !isIOS
//   ) {

//     window.location.replace(
//       youtubeWeb
//     );

//     return;

//   }



//   /*
//   --------------------------------------------
//   MOBILE FALLBACK
//   --------------------------------------------
//   */

//   let fallbackTimer;



//   /*
//   --------------------------------------------
//   ANDROID
//   --------------------------------------------
//   */

//   if (isAndroid) {


//     const intentUrl =

//       "intent://" +

//       youtubeWeb.replace(
//         "https://",
//         ""
//       ) +

//       "#Intent;" +

//       "scheme=https;" +

//       "package=com.google.android.youtube;" +

//       "S.browser_fallback_url=" +

//       encodeURIComponent(
//         youtubeWeb
//       ) +

//       ";end";


//     window.location.href =
//       intentUrl;



//     fallbackTimer =
//       setTimeout(
//         function () {

//           window.location.replace(
//             youtubeWeb
//           );

//         },
//         2500
//       );

//   }



//   /*
//   --------------------------------------------
//   iPHONE / iPAD
//   --------------------------------------------
//   */

//   else if (isIOS) {


//     window.location.href =
//       youtubeApp;



//     fallbackTimer =
//       setTimeout(
//         function () {

//           window.location.replace(
//             youtubeWeb
//           );

//         },
//         2500
//       );

//   }

// }



// /*
// ====================================================
// START DEEP LINK HANDLER
// ====================================================
// */

// handleDeepLink();
