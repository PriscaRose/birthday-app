// Set the time that you want to run another data
export const setTimeOut = (ms = 0) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// This function destroy the popup
export async function destroyPopup(popup) {
  await setTimeOut(100);
  // remove it from the DOM
  popup.remove();
  // remove it from the js memory
  popup = null;
}
