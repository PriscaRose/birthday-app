import { list, addBtn, filterSearchInput, filterMonthInput } from './elements.js';
import { displayPerson} from './displayList';

// Fetch data from people.json file
export async function fetchPerson() {
  const response = await fetch('https://gist.githubusercontent.com/Pinois/e1c72b75917985dc77f5c808e876b67f/raw/b17e08696906abeaac8bc260f57738eaa3f6abb1/birthdayPeople.json');
  let people = await response.json();

  // Display person list
  function displayList() {
    const html = displayPerson(people)
    list.innerHTML = html;
  }

  displayList();

  function filterByName(peopleToFilter) {
    if(filterSearchInput.value !== "") {
      return peopleToFilter.filter(person => {
        const fullNameLowercase =
            person.firstName.toLowerCase() + ' ' + person.lastName.toLowerCase();
        return fullNameLowercase.includes(filterSearchInput.value.toLowerCase());
    });
  }
  return peopleToFilter;
  }

  function filterByMonth(peopleToFilter) {
    console.log(filterMonthInput.value)
    if(filterMonthInput.value !== "month") {
       return peopleToFilter.filter(person => {
          let birthday = new Date(person.birthday);
          const birthdayMonth = birthday.getMonth() + 1;
          const selectedMonth = Number(filterMonthInput.value);
          const condition = birthdayMonth === selectedMonth;
          // debugger;
          return condition;
      });
  }
  return peopleToFilter;
  }

  function filterBothNameAndMonth() {
    console.log('I am called');
    const getPeopleByName = filterByName(people);
    const getPeopleByNameAndMonth = filterByMonth(getPeopleByName);
    const filteredPeople = displayPerson(getPeopleByNameAndMonth);
    list.innerHTML = filteredPeople;
  }

  // Set the time that you want to run another people
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
    const findId = people.find(person => person.id == id);
    let peopleBirthday = new Date(findId.birthday);
    let days = peopleBirthday.getDay();
    const month = peopleBirthday.getMonth();
    const year = peopleBirthday.getFullYear();
    const birthday = `${days}/${month}/${year}`;
    return new Promise(async function () {
      const popup = document.createElement('form');
      popup.classList.add('popup');
      popup.insertAdjacentHTML('afterbegin', `
              <div class="popup--container">
                <div class="heading--wrapper">
                  <button class="cancelForm close-edit-popup">X</button>
                  <h2 class="popup__heading">Edit ${findId.lastName} ${findId.firstName}</h2>
                </div>
                <div class="popup--wrapper">
                  <fieldset class="popup__fieldset">
                    <label class="popup__label" for="name">LastName</label>
                    <input type="text" class="popup__input" name="lastName" id="name" value="${findId.lastName}"/>
                  </fieldset>
                  <fieldset class="popup__fieldset">
                    <label class="popup__label" for="firstName">Firstname</label>
                    <input type="text" class="popup__input" name="firstName" id="firstName" value="${findId.firstName}"/>
                  </fieldset>
                  <feldset class="popup__fieldset">
                    <label class="popup__label" for="birthday">Birthday</label>
                    <input type="text" class="popup__input" name="birthday" id="birthday" value="${birthday}" />
                  </feldset>
                </div>
                <div class="popup__button--wrapper">
                  <button type="submit" class="submit-btn">Save changes</button>
                  <button type="button" class="cancelForm">Cancel</button>
                </div>
              </div>
            `);

      // Submit form that have been edited
      popup.addEventListener('submit', (e) => {
        e.preventDefault();
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

  // Handle the delete button
  const handleDeleteBtn = e => {
    const deleteBtnEl = e.target.matches('button.confirm');
    if (deleteBtnEl) {
      const btn = document.querySelector('.delete');
      const id = btn.value;
      deleteBtn(id);
      const div = document.querySelector('.deleteBtnContainer');
      destroyPopup(div)
    }
  }

  const deleteBtn = (id) => {
    people = people.filter(person => person.id != id);
    list.dispatchEvent(new CustomEvent('listUpdated'));
  };

  // Add a person in the list
  const addPerson = (e) => {
    e.preventDefault();

    const form = document.createElement('form');
    form.classList.add('addPopup');
    form.insertAdjacentHTML('afterbegin', `
            <div class="addPopup--container">
              <h2 class="addPopup__heading"> Add a new person's birthday here</h2>
              <div class="addPopup--wrapper">
                <fieldset class="addPopup__fieldset">
                  <label class="popup__label" for="picture">Add a picture</label>
                  <input type="url"  class="addPopup__input"class="picture" id="picture" name="picture" value="" required/>
                </fieldset>
                <fieldset class="addPopup__fieldset">
                  <label class="popup__label" for="name">Your last name</label>
                  <input type="text" class="addPopup__input" id="name" name="lastName" value="" required/>
                </fieldset>
                <fieldset class="addPopup__fieldset">
                  <label class="popup__label" for="firstName">Your first name</label>
                  <input type="text" class="addPopup__input" id="firstName" name="firstName" value="" required/>
                </fieldset>
                <fieldset class="addPopup__fieldset">
                  <label class="popup__label" for="birthday">Your birthday</label>
                  <input type="date" class="addPopup__input" id="birthday" name="birthday" value="" required/>
                </fieldset>
              </div>
              <div class="addPopup__button--wrapper">
                <button type="submit" class="submit-btn">Save</button>
                <button type="button" class="cancelAddForm">Cancel</button>
              </div>
            </div>
            `);

    document.body.appendChild(form);
    const dateInput = document.querySelector('input[type=date]');
    //Converts from Timestamp
    const date = new Date().toISOString().slice(0, 10)
    dateInput.max = date

    const displayNewPer = e => {
      e.preventDefault();
      const formEl = e.target;
      const newPerson = {
        lastName: formEl.lastName.value,
        firstName: formEl.firstName.value,
        birthday: formEl.birthday.value,
        picture: formEl.picture.value,
        id: Date.now(),
      };
      people.push(newPerson);
      list.dispatchEvent(new CustomEvent('listUpdated'));
      formEl.reset();
      destroyPopup(formEl);
    };

    form.addEventListener('submit', displayNewPer);
  };

  // Handle click buttons
  const handleClick = (e) => {
    const buttons = e.target;
    const deleteBtn = e.target.closest('button.delete');
    const findIdToDelete = people.find(person => person.id == buttons.value);

    if (deleteBtn) {
      return new Promise(async function (resolve) {
        const div = document.createElement('div');
        div.classList.add('deleteBtnContainer');
        div.insertAdjacentHTML('afterbegin', `
          <div class="deleteBtnWrapper">
            <p class="confirmParagraph">Are you sure you want to delete ${findIdToDelete.lastName} ${findIdToDelete.firstName}?</p>
            <div class="btnWrapper">
              <button type="button" class="confirm">Yes</button>
              <button type="button" class="cancel">No</button>
            </div>
          </div>
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

  // Store the songs in the local storage
  const setToLocalStorage = () => {
    const objectStringyfy = JSON.stringify(people);
    localStorage.setItem('people', objectStringyfy);
  };

  const restoreFromLocalStorage = () => {
    const personLs = JSON.parse(localStorage.getItem('data'));
    console.log(personLs);
    if (personLs) {
    people = personLs;
      list.dispatchEvent(new CustomEvent('listUpdated'));
    };
  }

  // Listen to the events
  window.addEventListener('click', handleDeleteBtn);
  window.addEventListener('click', handleClick);
  addBtn.addEventListener('click', addPerson);
  list.addEventListener('click', editPopupPartener);
  list.addEventListener('listUpdated', displayList);
  list.addEventListener('listUpdated', setToLocalStorage);
  filterSearchInput.addEventListener('keyup',()=> filterBothNameAndMonth());
  filterMonthInput.addEventListener('change', () => filterBothNameAndMonth());
  restoreFromLocalStorage();
  displayList(people)

};
fetchPerson();



