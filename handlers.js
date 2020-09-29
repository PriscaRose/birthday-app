import { setTimeOut, destroyPopup } from './utils.js';

// Handle the cancel button the items from local storage
export const handleClick = (e) => {
  const deleteBtn = e.target.closest('button.delete');
  if (deleteBtn) {
    return new Promise(async function (resolve) {
      const div = document.createElement('div');
      div.classList.add('deleteBtnContainer');
      div.insertAdjacentHTML('afterbegin', `
        <p>Are you sure you want to delete it?</p>
        <button type="button" class="confirm">Yes</button>
        <button type="button" class="cancel">No</button>
    `);
      document.body.appendChild(div);
      //put a very small titmeout before we add the open class
      await setTimeOut(10);
      div.classList.add('open');
    });
  }

  if (e.target.closest('.cancel')) {
    const divEl = document.querySelector('.deleteBtnContainer');
    destroyPopup(divEl);
  }

  if (e.target.matches('button.cancelForm')) {
    const form = document.querySelector('.popup');
    destroyPopup(form);
  };

  if (e.target.matches('button.cancelAddForm')) {
    const addForm = document.querySelector('.addPopup');
    destroyPopup(addForm);
  };

}
