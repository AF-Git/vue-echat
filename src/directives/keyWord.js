import "@/common/pinyin";
export const keyWord = {
  inserted(el, binding) {
    let content = el.innerHTML;
    let key = binding.value;
    let m = PinyinMatch.match(content, key);
    if(m) content = redFont(content, m[0], m[1]);
    el.innerHTML = content;
  },
  update(el, binding) {
    let content = el.innerHTML;
    let key = binding.value;
    let m = PinyinMatch.match(content, key);
    if(m) content = redFont(content, m[0], m[1]);
    el.innerHTML = content;
  },
}

let redFont = function(str, start, end){
  return (
    str.substring(0, start) +
    '<span class="search-key">' +
    str.substring(start, end + 1) +
    "</span>" +
    str.substring(end + 1)
  );
}