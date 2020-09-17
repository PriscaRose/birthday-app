
// add new person birthday in the list

  const form = document.querySelector('.addNewPersForm');
  form.addEventListener('submit', e => {
    // let arr = await fetchPerson();
  e.preventDefault();
  const form = e.target.closest('.addNewPersForm');
  const picture = form.querySelector('.picture');
  const firstName = form.querySelector('.firstName');
  const lastName = form.querySelector('.lastName');
  const birthday = form.querySelector('.birthday');
  const days = form.querySelector('.days');

  const html = `<li class="items">
                      <img class="picture" src="${picture.value}" alt="">
                      <div class="wrapper">
                        <div class="name-wrapper"
                          <span class="person_name">${firstName.value}</span>
                          <span class="person_name">${lastName.value}</span>
                        </div>
                        <span class="birth_date">${birthday.value}</span>
                      </div>
                      <span class="days">${days.value}</span>
                      <button class="edit" value="" aria-label="">
                        <img class="edit-icon" src="./assets/edit-icon.png" alt="edit">
                      </button>
                      <button class="delete" aria-label="" value="">
                        <img src="./assets/trash.svg">
                      </button>
                    </li>`
  // list.innerHTML = html;
  console.log(html);
  list.dispatchEvent(new CustomEvent('listUpdated'));

  })


// Delete the items from local storage


displayPerson();
restoreFromLocalStorage();
