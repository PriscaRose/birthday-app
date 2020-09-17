// const { set } = require("date-fns");

// Grab element that are needed
const list = document.querySelector('.list');
const addBtn = document.querySelector('.add-person');

const endpoint = "./people.json";

// Fetch data from people.json file
async function fetchPerson() {
  const response = await fetch("./people.json");
  let data = await response.json();

  // Display person list
  const displayPerson = () => {
    const sortedPerson = data.sort((a, b) => b.birthday - a.birthday);
    //Generate html
    // format(new Date(person.birthday), 'yyy-MM-dd'
    const html = sortedPerson.map(person => {
      const personBirt = new Date(person.birthday);
      const newDay = personBirt.getDay() + 1;
      const newMonth = personBirt.getMonth() + 1;
      const newYear = new Date();
      const year = newYear.getFullYear();
      const birthday = `Turns ${newDay}-${newMonth}-${year}`;
      const days = new Date(birthday).getTime();
      const numberOfDays = Math.floor((newYear - days) / 86400000);
      return `
              <li class="items" id="${person.id}">
                <img class="image" src="${person.picture}" alt="">
                <div class="wrapper">
                  <div class="name-wrapper"
                    <span class="first-name">${person.firstName}</span>
                    <span class="last-name">${person.lastName}</span>
                  </div>
                  <span class="birth_date">${birthday}</span>
                </div>
                <div>
                  <span class="days">${numberOfDays} days</span>
                </div>
                <button class="edit" value="${person.id}" aria-label="">
                  <img class="edit-icon" src="./assets/edit-icon.png" alt="edit">
                </button>
                <button class="delete" value="${person.id}">
                  <img src="./assets/trash.svg">
                </button>
              </li>
          `;
    });

    //Append the html into the DOM
    list.innerHTML = html.join('');
  };

  // Set the time that you want to run another data
  const setTimeOut = (ms = 0) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  // This function destroy the popup
   async function destroyPopup(popup) {
    await setTimeOut(100);
    // remove it from the DOM
    popup.remove();
    // remove it from the js memory
    popup = null;
  }

  // edit the popup
  function editPopup(id) {
    const findId = data.find(person => person.id === id);
    console.log(findId);
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
                <label for="birthday"></label>
                <input type="date" name="birthday" value="${findId.birthday}" id="birthday"/>
              </fieldset>
              <fieldset>
                <label for="days"></label>
                <input type="date" name="days" value="" id="days"/>
              </fieldset>
              <div>
                <button type="submit" class="submit-btn">Save the form</button>
                <button type="button" class="cancelForm">Cancel the form</button>
              </div>
            `);

      // Submit form that have been edited
      popup.addEventListener('submit', (e) => {
        console.log(e.target);
        e.preventDefault();
        // let people = displayPerson()
        findId.lastName = popup.lastName.value;
        findId.firstName = popup.firstName.value;
        findId.birthday = popup.birthday.value;
        displayPerson(findId);
        destroyPopup(popup);
        list.dispatchEvent(new CustomEvent('listUpdated'));
      });
      // insert tht popup in the DOM
      document.body.appendChild(popup);
      //put a very small titmeout before we add the open class
      await setTimeOut(10);
      popup.classList.add('open');
    });
  }

  const editPopupPartener = (e) => {
    const btnEdit = e.target.closest('.edit');
    if (btnEdit) {
      const id = btnEdit.value;
      editPopup(id);
    }
  }

  // Handle the cancel button the items from local storage
  const handleClick = (e) => {
    const deleteBtn = e.target.closest('button.delete');
    if (deleteBtn) {
      return new Promise(async function (resolve) {
        const div = document.createElement('div');
        div.classList.add('deleteBtnContainer');
        div.insertAdjacentHTML('Afterbegin', `
          <p>Are you sure you want to delete it</p>
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
      displayPerson();
    };

    if (e.target.matches('button.cancelAddForm')) {
      const addForm = document.querySelector('.addPopup');
      destroyPopup(addForm);
      displayPerson();
    };
  }

  // Handle the delete button
  const handleDeleteBtn = e => {
    const deleteBtnEl = e.target.closest('button.confirm');
    if (deleteBtnEl) {
      console.log('deleted');
      const btn = document.querySelector('.delete');
      console.log(btn);
      const id = btn.value;
      deleteBtn(id);
      const div = document.querySelector('.deleteBtnContainer');
      setTimeOut(10);
      destroyPopup(div)
    }
  }

  const deleteBtn = (id) => {
    data = data.filter(person => person.id !== id);
    console.log(data);
    list.dispatchEvent(new CustomEvent('listUpdated'));
  };

  const addPerson = () => {
    const form = document.createElement('form');
    form.classList.add('addPopup');
      form.insertAdjacentHTML('afterbegin', `
              <h2> Add a new person's birthday here</h2>
              <fieldset>
                <label for="picture"></label>
                <input type="url" class="picture" name="picture" value="" required/>
              </fieldset>
              <fieldset>
                <label for="name"></label>
                <input type="text" name="lastName" value="" required/>
              </fieldset>
              <fieldset>
                <label for="firstName"></label>
                <input type="text" name="firstName" value="" required/>
              </fieldset>
              <fieldset>
                <label for="birthday"></label>
                <input type="date" name="birthday" value="" required/>
              </fieldset>
              <fieldset>
                <label for="days"></label>
                <input type="date" name="days" value="" required/>
              </fieldset>
              <div>
                <button type="submit" class="submit-btn">Save the form</button>
                <button type="button" class="cancelAddForm">Cancel the form</button>
              </div>
            `);
    document.body.appendChild(form);
  };

  const displayNewPer = e => {
    e.preventDefault();
    const formEl = e.target;
    console.log(formEl);
    const newPerson = {
      lastName: formEl.lastName.value,
      firstName: formEl.firstName.value,
      birthday: formEl.birthday.value,
      picture: formEl.picture.value,
      id: Date.now(),
    };
    data.push(newPerson);
    list.dispatchEvent(new CustomEvent('listUpdated'));
    formEl.reset();
  };

  // Store the songs in the local storage
  const setToLocalStorage = () => {
    const objectStringyfy = JSON.stringify(data);
    localStorage.setItem('data', objectStringyfy);
  };

  const restoreFromLocalStorage = () => {
    const personLs = JSON.parse(localStorage.getItem('data'));
    console.log(personLs);
    if (personLs) {
      data = personLs;
      list.dispatchEvent(new CustomEvent('listUpdated'));
    };
  }

  // const form = document.querySelector('.addNewPersForm');
  window.addEventListener('click', handleDeleteBtn);
  window.addEventListener('click', handleClick);
  addBtn.addEventListener('click', addPerson);
  list.addEventListener('submit', displayNewPer)
  list.addEventListener('click', editPopupPartener);
  list.addEventListener('listUpdated', displayPerson);
  list.addEventListener('listUpdated', setToLocalStorage);


  restoreFromLocalStorage();

};fetchPerson();
