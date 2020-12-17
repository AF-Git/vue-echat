import AgoraRTC from "agora-rtc-sdk";
import store from "../store";

export const resolutions = [{
    name: "default",
    value: "default"
  },
  {
    name: "480p",
    value: "480p"
  },
  {
    name: "720p",
    value: "720p"
  },
  {
    name: "1080p",
    value: "1080p"
  }
];

export function validator(formData, fields) {
  const keys = Object.keys(formData);
  for (let key of keys) {
    if (fields.indexOf(key) != -1) {
      if (!formData[key]) return false;
    }
  }
  return true;
}

export function serializeFormData() {
  const obj = {};
  for (var item of formData) {
    var key = item.name;
    var val = item.value;
    obj[key] = val;
  }
  if (obj.uid != undefined && !Number.isNaN(+obj.uid)) {
    obj.uid = +obj.uid;
  }
  return obj;
}

export function addView(id) {
  return new Promise(resolve => {
    store.commit("ADD_VIDEO_VIEW", id);
    resolve();
  });
}

export function removeView(id) {
  store.commit("DELETE_VIDEO_VIEW", id);
}

export function changeVideo(type) {
  store.commit("MUTE_VIDEO", type);
}

export function getDevices(next) {
  AgoraRTC.getDevices(function (items) {
    items
      .filter(function (item) {
        return (
          ["audioinput", "videoinput", "audiooutput"].indexOf(item.kind) !== -1
        );
      })
      .map(function (item) {
        return {
          name: item.label,
          value: item.deviceId,
          kind: item.kind
        };
      });
    var videos = [];
    var audios = [];
    var speaker = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if ("videoinput" == item.kind) {
        let name = item.label;
        let value = item.deviceId;
        if (!name) {
          name = "camera-" + videos.length;
        }
        videos.push({
          name: name,
          value: value,
          kind: item.kind
        });
      }
      if ("audioinput" == item.kind || "audiooutput" == item.kind) {
        let name = item.label;
        let value = item.deviceId;
        if (!name) {
          name = "microphone-" + audios.length;
        }
        audios.push({
          name: name,
          value: value,
          kind: item.kind
        });
      }
    }
    next({
      videos: videos,
      audios: audios
    });
  });
}
