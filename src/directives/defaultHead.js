import "@/common/pinyin_dict_notone.js";
import "@/tools/pinyinUtil.js";

let color = ["#92d39b", "#ffaa50", "#4579de", "#a9a9a9", "#8fd4c5"];

function letterSort(letter) {
  let num = 4;
  switch (letter) {
    case "0":
    case "5":
    case "A":
    case "F":
    case "K":
    case "P":
    case "U":
    case "Z":
      num = 0;
      break;
    case "1":
    case "6":
    case "B":
    case "G":
    case "L":
    case "Q":
    case "V":
      num = 1;
      break;
    case "2":
    case "7":
    case "C":
    case "H":
    case "M":
    case "R":
    case "W":
      num = 2;
      break;
    case "3":
    case "8":
    case "D":
    case "I":
    case "N":
    case "S":
    case "X":
      num = 3;
      break;
    case "5":
    case "9":
    case "E":
    case "J":
    case "O":
    case "T":
    case "Y":
    default:
      num = 4;
      break;
  }
  return num;
}

export const defaultHead = {
  inserted(el, binding) {
    let firstLetter = el.innerHTML.charAt(0);
    el.innerHTML = firstLetter;

    let py = pinyinUtil.getFirstLetter(firstLetter, false),
      num = letterSort(py.toUpperCase());

    el.style.background = color[num];
  },
  update(el, binding) {
    let firstLetter = el.innerHTML.charAt(0);
    el.innerHTML = firstLetter;

    let py = pinyinUtil.getFirstLetter(firstLetter, false),
      num = letterSort(py.toUpperCase());

    el.style.background = color[num];
  }
};
