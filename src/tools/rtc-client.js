import AgoraRTC from "agora-rtc-sdk";
import { addView, removeView, changeVideo } from "./rtc-common";
import store from "../store";

console.log( "agora sdk version: " + AgoraRTC.VERSION + " compatible: " + AgoraRTC.checkSystemRequirements() );

class RTCClient {
  constructor() {
    this._client = null;
    this._joined = false;
    this._published = false;
    this._localStream = null;
    this._remoteStreams = [];
    this._params = {};
    this._showProfile = false;
  }

  handleEvents() {
    this._client.on("error", err => {
      console.error(err);
    });
    // 对方挂断
    this._client.on("peer-leave", evt => {
      const id = evt.uid;
      if (id != this._params.uid) {
        removeView(id);
      }
      store.commit("UPDATE_VIDEO_INFO", {
        status: 8
      });
      // close stream
      this._localStream.close();
      // stop stream
      this._localStream.stop();
      this._localStream = null;
      this._remoteStreams = [];
      this._client = null;
      this._published = false;
      this._joined = false;
      console.error("peer-leave", id);
    });
    // 对方切换成语音
    this._client.on("mute-video", evt => {
      changeVideo(true);
      this._localStream.muteVideo();
      console.error("mute video", evt);
    });
    // 推送我方视频流
    this._client.on("stream-published", evt => {
      console.log("stream-published");
    });
    // 对方加入
    this._client.on("peer-online", evt => {
      const id = evt.uid;
      if (id !== this._params.uid) {
        addView(id).then(() => {});
      }
      console.log("peer-online", id);
    });
    this._client.on("stream-added", evt => {
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      if (id !== this._params.uid) {
        this._client.subscribe(remoteStream, err => {
          console.log("stream subscribe failed", err);
        });
      }
      console.log("stream-added remote-uid: ", id);
    });
    // 接收对方视频流
    this._client.on("stream-subscribed", evt => {
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      this._remoteStreams.push(remoteStream);
      addView(id).then(() => {
        remoteStream.play("remote_video_" + id, {
          fit: "cover"
        });
      });
      console.log("stream-subscribed remote-uid: ", id);
    });
    // 对方关闭视频流推送
    this._client.on("stream-removed", evt => {
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      changeVideo(true);
      remoteStream.stop();
      this._remoteStreams = this._remoteStreams.filter(stream => {
        return stream.getId() !== id;
      });
      console.log("stream-removed remote-uid: ", id);
    });
    this._client.on("onTokenPrivilegeWillExpire", () => {
      // After requesting a new token
      // this._client.renewToken(token);
      console.log("onTokenPrivilegeWillExpire");
    });
    this._client.on("onTokenPrivilegeDidExpire", () => {
      // After requesting a new token
      // client.renewToken(token);
      console.log("onTokenPrivilegeDidExpire");
    });
  }

  join(data) {
    return new Promise((resolve, reject) => {
      if (this._joined) return;
      this._client = AgoraRTC.createClient({
        mode: data.mode,
        codec: data.codec
      });
      this._params = data;
      // handle AgoraRTC client event
      this.handleEvents();
      // init client
      this._client.init(
        data.appID,
        () => {
          console.log("init success");
          console.log(data);
          this._client.join(
            data.token ? data.token : null,
            data.channel,
            data.uid ? +data.uid : null,
            uid => {
              this._params.uid = uid;
              console.log(
                "join channel: " + data.channel + " success, uid: " + uid
              );
              this._joined = true;
              // create local stream
              this._localStream = AgoraRTC.createStream({
                streamID: this._params.uid,
                audio: true,
                video: true,
                screen: false,
                microphoneId: data.microphoneId,
                cameraId: data.cameraId
              });
              this._localStream.on("player-status-change", evt => {
                console.log("player status change", evt);
              });
              if (data.cameraResolution && data.cameraResolution != "default") {
                // set local video resolution
                this._localStream.setVideoProfile(data.cameraResolution);
              }
              // init local stream
              this._localStream.init(
                () => {
                  console.log("init local stream success");
                  // play stream with html element id "local_stream"
                  this._localStream.play("local_stream", {
                    fit: "cover"
                  });
                  // run callback
                  resolve();
                },
                err => {
                  console.error("init local stream failed ", err);
                }
              );
            },
            function (err) {
              console.error("client join failed", err);
            }
          );
        },
        err => {
          console.error(err);
        }
      );
    });
  }

  publish() {
    if (!this._client) return;
    if (this._published) return;
    const oldState = this._published;
    // publish localStream
    this._client.publish(this._localStream, err => {
      this._published = oldState;
      console.log("publish failed");
      console.error(err);
    });
    this._published = true;
  }

  unpublish() {
    if (!this._client) return;
    if (!this._published) return;
    const oldState = this._published;
    this._client.unpublish(this._localStream, err => {
      this._published = oldState;
      console.log("unpublish failed");
      console.error(err);
    });
    this._published = false;
  }

  muteVideo() {
    this._localStream.muteVideo();
    console.log("mute video");
  }

  muteAudio(mute) {
    if (mute) {
      this._localStream.muteAudio();
      console.log("mute audio");
    } else {
      this._localStream.unmuteAudio();
      console.log("unmute audio");
    }
  }

  changeAudio(i) {
    this._localStream.setAudioVolume(i);
  }

  leave() {
    if (!this._client) return;
    if (!this._joined) return;
    // leave channel
    this._client.leave(
      () => {
        while (this._remoteStreams.length > 0) {
          const stream = this._remoteStreams.shift();
          const id = stream.getId();
          removeView(id);
          changeVideo(false);
        }
        // close stream
        this._localStream.close();
        // stop stream
        this._localStream.stop();
        this._localStream = null;
        this._remoteStreams = [];
        this._client = null;
        console.log("client leaves channel success");
        this._published = false;
        this._joined = false;
      },
      err => {
        console.log("channel leave failed");
        console.error(err);
      }
    );
  }

  _getLostRate(lostPackets, arrivedPackets) {
    let lost = lostPackets ? +lostPackets : 0;
    let arrived = arrivedPackets ? +arrivedPackets : 0;
    if (arrived == 0) return 0;
    const result = (lost / (lost + arrived)).toFixed(2) * 100;
    return result;
  }
}

const rtc = new RTCClient();

export default rtc;
