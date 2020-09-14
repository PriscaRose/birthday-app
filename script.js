// import  distanceInWordsStrict  from "date-fns";

console.log('works!');

// Grab element that are needed
const list = document.querySelector('.list');

// Fetch data from people.json file
async function fetchPerson() {
  const response = await fetch("./people.json", {
    headers: {
      Accept: 'application/json',
    },
  })
  const persons = await response.json();
  return persons;
};

// Display person list
async function displayPerson () {

  let personLs = await fetchPerson();
  const sortedPerson = personLs.sort((a,b) => b.birthday - a.birthday);
  // var result = distanceInWordsStrict(
  //   new Date(2014, 6, 2),
  //   new Date(2015, 0, 2)
  // );
  //Generate html
  const html = sortedPerson.map(person => {
    return `
            <li class="items" id="${person.id}">
              <img class="image" src="${person.picture}" alt="">
              <div class="wrapper">
                <div class="name-wrapper"
                  <span class="person_name">${person.firstName}</span>
                  <span class="person_name">${person.lastName}</span>
                </div>
                <span class="birth_date">${person.birthday}</span>
              </div>
              <span class="days">days</span>
              <button class="edit" value="${person.id}" aria-label="">
                <img class="edit-icon" src="./assets/edit-icon.png" alt="edit">
              </button>
              <button class="delete" value="" aria-label="" value="${person.id}">
                <img src="./assets/trash.svg">
              </button>
            </li>
        `;
  });

  //Append the html into the DOM
  list.innerHTML = html.join('');
};

const editPartner = (ms = 0) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

async function destroyPopup(popup) {
  popup.classList.remove('open');
  await editPartner(100);
  // remove it from the DOM
  popup.remove();
// remove it from the js memory
  popup = null;
}

const btnEditPartner = (e) => {
  const btnEdit = e.target.closest('.edit');
  if(btnEdit) {
    const id = btnEdit.value;
    editPartnerPopup(id);
  }
};

 async function editPartnerPopup (id) {
  let arr = await fetchPerson();
  const findId = arr.find(person => person.id === id)
        return new Promise(async function(resolve) {
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
          popup.addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;
            findId.lastName = form.lastName.value;
            findId.firstName = form.firstName.value;
            findId.birthday = form.birthday.value;
            displayList();

       // await editPartner(10);
            destroyPopup(popup);
          });
         // insert tht popup in the DOM
          document.body.appendChild(popup);
     //put a very small titmeout before we add the open class
          await editPartner(10);
          popup.classList.add('open');
        });
 }

 const cancelForm = (e) => {
  if(e.target.matches('button.cancelForm')) {
    console.log('delete me');
    const form = document.querySelector('.popup');
      destroyPopup(form);
  }
}


window.addEventListener('click', btnEditPartner);
window.addEventListener('click', cancelForm);

displayPerson()
