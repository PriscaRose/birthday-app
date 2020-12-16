import { list, addBtn, filterSearchInput, filterMonthInput, formEl } from './elements.js';
import {
	lightFormat,
	differenceInCalendarYears,
	differenceInCalendarDays,
	compareAsc,
  isPast, 
  addYears, 
  setYear, 
  isToday,
} from 'date-fns';

// Fetch data from people.json file
export async function fetchPerson() {
  const response = await fetch('https://gist.githubusercontent.com/Pinois/e1c72b75917985dc77f5c808e876b67f/raw/b17e08696906abeaac8bc260f57738eaa3f6abb1/birthdayPeople.json');
  let data = await response.json();

  const filterList = e => {
    displayPerson(e, filterSearchInput.value, filterMonthInput.value);
  };

  const getAge = (date1, date2) => {
    // This is a condition like if statement
    date2 = date2 || new Date();
    //Calculation
    const diff = date2.getTime() - date1.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
 }

  // Display person list
  const displayPerson = (event, filterPerson, filterMonth) => {
    let sortedBirt = data.sort((a, b) => a.birthday - b.birthday);
    // Filtered the data here
    if (filterPerson) {
      sortedBirt = sortedBirt.filter(person => {
        let lowerCaseTitle = person.lastName.toLowerCase() || person.firstName.toLowerCase();
        let lowerCaseFilter = filterPerson.toLowerCase();
        if (lowerCaseTitle.includes(lowerCaseFilter)) {
          return true;
        } else {
          return false;
        }
      });
    }
    else if (filterMonth) {
      sortedBirt = sortedBirt.filter(person => {
        let month = new Date(person.birthday);
        let newMonth = month.toLocaleString('en-us', { month: 'long' });
        let toLowerCAseNewMonth = newMonth.toLowerCase();
        let lowerCaseFilterMonth = filterMonth.toLowerCase();

        if (toLowerCAseNewMonth == lowerCaseFilterMonth) {
          return true;
        } else {
          return false;
        }
      });
    }

    //Display the date
    const html = sortedBirt.map(person => {
      const birthdate = getAge(new Date(person.birthday));
      const birthday = new Date(person.birthday);
      let newDay = birthday.getDay() + 1;
      const month =  birthday.toLocaleString('en-us', { month: 'long' });
      const year = birthday.getFullYear();
      const today = new Date();
      let nextBirthday = setYear(birthday, today.getFullYear())
      if (isToday(nextBirthday)) {
        return nextBirthday;
      }
      // if the date is already behind us, we add + 1 to the year
      if (isPast(nextBirthday)) {
        nextBirthday = addYears(nextBirthday, 1);
      }

      if (newDay == 1 || newDay == 21 || newDay == 31) {
        newDay += "st";
      }
      else if (newDay == 2 || newDay == 22) {
        newDay += "nd";
      }
      else {
        newDay += "th";
      }
      const numberOfDays = differenceInCalendarDays(nextBirthday, today)

      //Generate html
      return `
                <li class="items" id="${person.id}">
                  <img class="image" src="${person.picture}" alt="">
                  <div class="wrapper">
                    <div class="name-wrapper">
                      <span class="first-name">${person.firstName}</span>
                      <span class="last-name">${person.lastName}</span>
                    </div>
                    <p class="birth_date">Turns <span class="age">${birthdate}</span> on ${month} ${newDay}</p>
                  </div>
                  <div>
                    <span class="days">${numberOfDays} days</span>
                    <div class="btn--wrapper">
                      <button class="edit" value="${person.id}">edit</button>
                      <button class="delete" value="${person.id}">delete</button>
                    </div>
                  </div>
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
    const findId = data.find(person => person.id == id);
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
                <h2 class="popup__heading">Edit ${findId.lastName} ${findId.firstName}</h2>
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
    data = data.filter(person => person.id != id);
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
      data.push(newPerson);
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
    const findIdToDelete = data.find(person => person.id == buttons.value);

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

  // Listen to the events
  window.addEventListener('click', handleDeleteBtn);
  window.addEventListener('click', handleClick);
  addBtn.addEventListener('click', addPerson);
  list.addEventListener('click', editPopupPartener);
  list.addEventListener('listUpdated', displayPerson);
  list.addEventListener('listUpdated', setToLocalStorage);
  filterSearchInput.addEventListener('keyup', filterList);
  filterMonthInput.addEventListener('change', filterList);
  restoreFromLocalStorage();

}; fetchPerson();



