/** 滚轮每滑过一项时的轻触反馈（Android 等支持 vibrate 的设备） */
export function triggerWheelHaptic(): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(8);
  } catch {
    /* ignore */
  }
}
