import PerfectScrollbar from 'perfect-scrollbar';
/**
 * @description 自动判断该更新PerfectScrollbar还是创建它
 * @param {HTMLElement} el - 必填。dom元素
 */
const el_scrollBar = (el) => {
  if (el._ps instanceof PerfectScrollbar) el._ps.update();
  else el._ps = new PerfectScrollbar(el, {
      swipeEasing: true,
      minScrollbarLength: 24
  });
};

export const scrollBar = {
  inserted(el, binding, vnode) {
    el_scrollBar(el);
  },
  //更新dom的时候
  componentUpdated(el, binding, vnode, oldVnode) {
    try {
      vnode.context.$nextTick(
        () => {
          el_scrollBar(el);
        }
      )
    } catch (error) {
      console.error(error);
      el_scrollBar(el);
    }
  }
}