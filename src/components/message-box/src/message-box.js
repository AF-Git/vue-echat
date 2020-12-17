import Vue from "vue";
import MessageBox from "./message-box.vue";

let defaults = {
  title: "提示",
  message: "",
  showInput: false,
  inputValue: null,
  inputPlaceholder: "",
  inputValidator: null,
  inputErrorMessage: "",
  showConfirmButton: true,
  showCancelButton: true,
  confirmButtonText: "确定",
  cancelButtonText: "取消"
};

let currentMsg = {},
  instance = null;

function merge(target) {
  for (let i = 1, j = arguments.length; i < j; i++) {
    let source = arguments[i];
    for (let prop in source) {
      if (source.hasOwnProperty(prop)) {
        let value = source[prop];
        if (value !== undefined) target[prop] = value;
      }
    }
  }
  return target;
}

function defaultCallback(action) {
  if (currentMsg.resolve) {
    if (action === "confirm") {
      if (instance.showInput) {
        currentMsg.resolve({ value: instance.inputValue, action });
      } else {
        currentMsg.resolve(action);
      }
    } else if (action === "cancel" && currentMsg.reject) {
      currentMsg.reject(action);
    }
  }
}

function Message(options) {
  if (typeof options === "string") {
    options = {
      title: options
    };
    if (arguments[1]) options.message = arguments[1];
  }
  const MessageConstructor = Vue.extend(MessageBox);
  instance = new MessageConstructor();
  options = merge(defaults, options);
  options.callback = defaultCallback;
  for (var prop in options) {
    if (options.hasOwnProperty(prop)) instance[prop] = options[prop];
  }
  instance.$mount();
  document.body.appendChild(instance.$el);
  if (typeof Promise !== "undefined") {
    return new Promise((resolve, reject) => {
      currentMsg = {
        resolve: resolve,
        reject: reject
      };
    });
  }
}

export default Message;
