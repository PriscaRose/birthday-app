// Grab element that are needed
const list = document.querySelector('.list');
const addBtn = document.querySelector('.add-person');
const filterSearchInput = document.querySelector('#searchInput');
const filterMonthInput = document.querySelector('#filtered-month');
const formEl = document.querySelector('.form');
const resetBtn = document.querySelector('.reset-btn');

// Fetch data from people.json file
async function fetchPerson() {
  const response = await fetch("./people.json");
  let data = await response.json();

  const filterList = e => {
    displayPerson(e, filterSearchInput.value, filterMonthInput.value);
  };

  const resetForm = e => {
    formEl.reset();
    displayPerson();
  };

  // Display person list
  const displayPerson = (event, filterPerson, filterMonth) => {
    let sortedBirt = data.sort((a, b) => a.birthday - b.birthday);

    // Filtered the firstName here
    if (filterPerson) {
      sortedBirt = sortedBirt.filter(person => {
        let lowerCaseTitle = person.lastName.toLowerCase();

        let lowerCaseFilter = filterPerson.toLowerCase();
        if (lowerCaseTitle.includes(lowerCaseFilter)) {
          return true;
        } else {
          return false;
        }
      });
    }

  // Filter the birthday month
    if (filterMonth) {
      sortedBirt = sortedBirt.filter(person => {
        let myMonth = new Date(person.birthday);
        let myBirthMonth = myMonth.toLocaleString('en-us', { month: 'long' });
        let toLowerCaseMonth = myBirthMonth.toLowerCase();
        let toLowerCaseFilterMonth = filterMonth.toLowerCase();

        if(toLowerCaseMonth == toLowerCaseFilterMonth) {
          return true;
        }else {
          return false;
        }
      })
    }

    //Display the date
    const html = sortedBirt.map(person => {
      const personBirt = new Date(person.birthday);
      let newDay = personBirt.getDay() + 1;
      const newMonth = personBirt.toLocaleString('en-us', { month: 'long' });
      const newYear = new Date();
      const year = newYear.getFullYear();
      const birthday = `${newDay + 1}-${newMonth}-${year}`;
      const personAge = newYear.getFullYear() - personBirt.getFullYear();
      if (newDay == 1 || newDay == 21 || newDay == 31) {
        newDay += "st";
      }
      else if (newDay == 2 || newDay == 22) {
        newDay += "nd";
      }
      else {
        newDay += "th";
      }

      const birthdayPers = `Turns ${personAge + 1} on the ${newMonth} ${newDay}`;
      const days = new Date(birthday).getTime();
      const numberOfDays = Math.floor(-(newYear - days) / 86400000);

      //Generate html
      return `
                <li class="items" id="${person.id}">
                  <img class="image" src="${person.picture}" alt="">
                  <div class="wrapper">
                    <div class="name-wrapper"
                      <span class="first-name">${person.firstName}</span>
                      <span class="last-name">${person.lastName}</span>
                    </div>
                    <span class="birth_date">${birthdayPers}</span>
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
    let peopleBirthday = new Date(findId.birthday);
    let newDay = peopleBirthday.getDay();
    const newMonth = peopleBirthday.toLocaleString('en-us', { month: 'long' });
    const year = peopleBirthday.getFullYear();
    const birthday = `${newDay}-${newMonth}-${year}`;
    return new Promise(async function (resolve) {
      const popup = document.createElement('form');
      popup.classList.add('popup');
      popup.insertAdjacentHTML('afterbegin', `
              <fieldset>
                <label for="name"></label>
                <input type="text" name="lastName" id="name" value="${findId.lastName}"/>
              </fieldset>
              <fieldset>
                <label for="firstName"></label>
                <input type="text" name="firstName" id="firstName" value="${findId.firstName}"/>
              </fieldset>
              <fieldset>
                <label for="birthday"></label>
                <input type="text" name="birthday" id="birthday" value="${birthday}" id="birthday"/>
              </fieldset>
              <div>
                <button type="submit" class="submit-btn">Save the form</button>
                <button type="button" class="cancelForm">Cancel the form</button>
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

  // Handle the cancel button the items from local storage
  const handleClick = (e) => {
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
      console.log(e.target)
      const btn = document.querySelector('.delete');
      const id = btn.value;
      deleteBtn(id);
      const div = document.querySelector('.deleteBtnContainer');
      destroyPopup(div)
    }
  }

  const deleteBtn = (id) => {
    data = data.filter(person => person.id !== id || person.id != id);
    console.log(data);
    list.dispatchEvent(new CustomEvent('listUpdated'));
  };

  // Add a person in the list
  const addPerson = () => {
    const form = document.createElement('form');
    form.classList.add('addPopup');
    form.insertAdjacentHTML('afterbegin', `
              <h2> Add a new person's birthday here</h2>
              <fieldset>
                <label for="picture">Add a picture</label>
                <input type="url" class="picture" id="picture" name="picture" value="" required/>
              </fieldset>
              <fieldset>
                <label for="name">Your last name</label>
                <input type="text" id="name" name="lastName" value="" required/>
              </fieldset>
              <fieldset>
                <label for="firstName">Your first name</label>
                <input type="text" id="firstName" name="firstName" value="" required/>
              </fieldset>
              <fieldset>
                <label for="birthday">Your birthday</label>
                <input type="date" id="birthday" name="birthday" value="" required/>
              </fieldset>
              <div>
                <button type="submit" class="submit-btn">Save the form</button>
                <button type="button" class="cancelAddForm">Cancel the form</button>
              </div>
            `);

    document.body.appendChild(form);

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
      destroyPopup(formEl);
    };

    form.addEventListener('submit', displayNewPer);
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

  // Listen to the events
  window.addEventListener('click', handleDeleteBtn);
  window.addEventListener('click', handleClick);
  addBtn.addEventListener('click', addPerson);
  list.addEventListener('click', editPopupPartener);
  list.addEventListener('listUpdated', displayPerson);
  list.addEventListener('listUpdated', setToLocalStorage);
  filterSearchInput.addEventListener('keyup', filterList);
  filterMonthInput.addEventListener('change', filterList);
  resetBtn.addEventListener('click', resetForm);
  restoreFromLocalStorage();

}; fetchPerson();



