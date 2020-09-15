// import { compareAsc, format } from 'date-fns';
// console.log('works!');


// Grab element that are needed
const list = document.querySelector('.list');
const addBtn = document.querySelector('.add-person');

// Fetch data from people.json file
async function fetchPerson() {
  const response = await fetch("./people.json", {
    headers: {
      Accept: 'application/json',
    },
  })
  const data = await response.json();
  return data;
};

// Display person list
async function displayPerson() {
  let personLs = await fetchPerson();
  const sortedPerson = personLs.sort((a, b) => b.birthday - a.birthday);
  //Generate html
  // format(new Date(person.birthday), 'yyy-MM-dd'
  const html = sortedPerson.map(person => {
    return `
            <li class="items" id="${person.id}">
              <img class="image" src="${person.picture}" alt="">
              <div class="wrapper">
                <div class="name-wrapper"
                  <span class="person_name">${person.firstName}</span>
                  <span class="person_name">${person.lastName}</span>
                </div>
                <span class="birth_date"></span>
              </div>
              <span class="days">days</span>
              <button class="edit" value="${person.id}" aria-label="">
                <img class="edit-icon" src="./assets/edit-icon.png" alt="edit">
              </button>
              <button class="delete" aria-label="" value="${person.id}">
                <img src="./assets/trash.svg">
              </button>
            </li>
        `;
  });

  //Append the html into the DOM
  list.innerHTML = html.join('');
}; displayPerson()

const setTimeOut = (ms = 0) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

async function destroyPopup(popup) {
  popup.classList.remove('open');
  await setTimeOut(100);
  // remove it from the DOM
  popup.remove();
  // remove it from the js memory
  popup = null;
}

async function editPopup(id) {
  let arr = await fetchPerson();
  const findId = arr.find(person => person.id === id)
  return new Promise(async function (resolve) {
    const popup = document.createElement('form');
    popup.classList.add('popup');
    popup.insertAdjacentHTML('afterbegin', `
            <fieldset>
              <label for="name"></label>
              <input type="text" name="lastName" value="${findId.lastName}"/>
            </fieldset>
            <fieldset>
              <label for="firstName"></label>
              <input type="text" name="firstName" value="${findId.firstName}"/>
            </fieldset>
            <fieldset>
              <label for="jobTitle">Job title</label>
              <input type="date" name="birthday" value="${findId.birthday}"/>
            </fieldset>
            <fieldset>
              <label for="jobArea">Job area</label>
              <input type="date" name="days" value=""/>
            </fieldset>
            <div>
              <button type="submit" class="submit-btn">Save the form</button>
              <button type="button" class="cancelForm">Cancel the form</button>
            </div>
          `);

    // Submit form that have been edited
    popup.addEventListener('submit', async (e) => {
      e.preventDefault();
      let people = await fetchPerson();
      const form = e.target;
      findId.lastName = form.lastName.value;
      findId.firstName = form.firstName.value;
      findId.birthday = form.birthday.value;
      displayPerson(people);
      destroyPopup(popup);
      list.dispatchEvent(new CustomEvent('listUpdated'));
    });
    // insert tht popup in the DOM
    document.body.appendChild(popup);
    //put a very small titmeout before we add the open class
    await setTimeOut(10);
    popup.classList.add('open');
    list.dispatchEvent(new CustomEvent('listUpdated'));
  });
}

const editPopupPartener = (e) => {
  const btnEdit = e.target.closest('.edit');
  if (btnEdit) {
    const id = btnEdit.value;
    editPopup(id);
  }
}

// add new person birthday in the list
const addPerson = () => {
  const html =
    `<form class="addNewPersForm">
          <h2> Add your birthday here</h2>
          <fieldset>
            <label for="picture"></label>
            <input type="url" class="picture" value="" id="picture"/>
          </fieldset>
          <fieldset>
            <label for="name"></label>
            <input type="text" class="lastName" value="" id="name"/>
          </fieldset>
          <fieldset>
            <label for="firstName"></label>
            <input type="text" class="firstName" value="" id="firstName"/>
          </fieldset>
          <fieldset>
            <label for="birthday"></label>
            <input type="date" class="birthday" value="" id="birthday"/>
          </fieldset>
          <fieldset>
            <label for="days"></label>
            <input type="date" class="days" value="" id="days"/>
          </fieldset>
          <div>
            <button type="submit" class="addForm">Save</button>
            <button type="button" class="cancelForm">Cancel</button>
          </div>
        </form>
  `
  list.innerHTML = html;

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

};

// Delete the items from local storage
 const handleClick = async (e) => {
  let arr = await fetchPerson();
  const deleteBtn = e.target.closest('button.delete');
  if (deleteBtn) {
    return new Promise(async function (resolve) {
      const div = document.createElement('div');
      div.classList.add('deleteBtnContainer');
      div.insertAdjacentHTML('Afterbegin', `
         <p>Are you sure you want to delete it</p>
         <button type="button" class="confirm" value="${arr.id}">Yes</button>
         <button type="button" class="cancel">No</button>
     `);
      document.body.appendChild(div);
      //put a very small titmeout before we add the open class
      await setTimeOut(10);
      div.classList.add('open');
    });
  };

  if (e.target.closest('.cancel')) {
    const divEl = document.querySelector('.deleteBtnContainer');
    destroyPopup(divEl);
  }

  if (e.target.matches('button.cancelForm')) {
    const form = document.querySelector('.popup');
    destroyPopup(form);
    displayPerson();
  };

}

const handleDeleteBtn = e => {
  const deleteBtnEl = e.target.closest('.confirm');
  if (deleteBtnEl) {
    console.log('deleted')
    const id = deleteBtnEl.value;
    deleteBtn(id);
  }
}

const deleteBtn = async (id) => {
  let people = await fetchPerson();
  people = people.filter(person => person.id !== id);
  list.dispatchEvent(new CustomEvent('listUpdated'));
};

// Store the songs in the local storage
async function setToLocalStorage() {
  const people = await fetchPerson();
  const objectStringyfy = JSON.stringify(people);
  localStorage.setItem('data', objectStringyfy);
};

const restoreFromLocalStorage = async () => {
  const people = await fetchPerson();
  const peopleLs = await JSON.parse(localStorage.getItem('people'));

  if (peopleLs) {
    people.push(...peopleLs);
    list.dispatchEvent(new CustomEvent('listUpdated'));
  };
}


window.addEventListener('click', handleClick);
list.addEventListener('click', editPopupPartener);
list.addEventListener('click', handleDeleteBtn);
addBtn.addEventListener('click', addPerson);
list.addEventListener('listUpdated', displayPerson);
list.addEventListener('listUpdated', setToLocalStorage);
restoreFromLocalStorage();
