import {
	lightFormat,
	differenceInCalendarYears,
	isPast,
	differenceInCalendarDays,
	compareAsc,
	addYears,
	setYear,
	isToday,
} from 'date-fns';
import wait from 'waait';

// *******

import peopleData from '../data/people.json';
import { editSVG, deleteSVG } from './svg';

// ***** MAIN PERSONS OBJECT *****

let persons = [];

// ***** FILTERS *****

const container = document.querySelector('main');
const searchNameFilter = document.querySelector('.searchName');
const filterMonthFilter = document.querySelector('.filterMonth');

searchNameFilter.addEventListener('input', () => showPeople(persons));
filterMonthFilter.addEventListener('change', () => showPeople(persons));

// ***** UTILS FUNCTION TO COMPUTE NEXT BIRTHDAY *****

function getNextBirthday(birthday) {
	const birthdayDate = new Date(birthday);
	const today = new Date();

	// we check when is their next birthday. we check the date with the same month and day as their birthday, and add this year.
	let nextBirthDay = setYear(birthdayDate, today.getFullYear());

	// if it's today, we return the value
	if (isToday(nextBirthDay)) {
		return nextBirthDay;
	}
	// if the date is already behind us, we add + 1 to the year
	if (isPast(nextBirthDay)) {
		nextBirthDay = addYears(nextBirthDay, 1);
	}
	return nextBirthDay;
}

// **** SHOW PEOPLE FUNCTION *****

function showPeople(peopleList) {
	let personsFilteredAndSorted = peopleList;

	if (searchNameFilter.value !== '') {
		personsFilteredAndSorted = personsFilteredAndSorted.filter(person => {
			const fullNameLowercase =
				person.firstName.toLowerCase() + ' ' + person.lastName.toLowerCase();
			return fullNameLowercase.includes(searchNameFilter.value.toLowerCase());
		});
	}

	if (filterMonthFilter.value !== '') {
		personsFilteredAndSorted = personsFilteredAndSorted.filter(person => {
			let birthday = new Date(person.birthday);
			return birthday.getMonth() === Number(filterMonthFilter.value);
		});
	}

	// we sort from the soonest birthday to the last.
	personsFilteredAndSorted.sort((a, b) => {
		let dayToBirthdayA = differenceInCalendarDays(getNextBirthday(a.birthday), new Date());
		let dayToBirthdayB = differenceInCalendarDays(getNextBirthday(b.birthday), new Date());
		return compareAsc(dayToBirthdayA, dayToBirthdayB);
	});

	let html = personsFilteredAndSorted
		.map(person => {
			const birthdayDate = new Date(person.birthday);
			console.log('birthday date', birthdayDate);
			const today = new Date();
			const nextBirthDay = getNextBirthday(birthdayDate);
			// we do the difference between this date and the next
			let daysToBirthday = differenceInCalendarDays(nextBirthDay, today);

			return `
				<article>
					<img src="${person.picture}" alt="${person.firstName} ${person.lastName} picture" />
					<section>
						<div class="name">${person.firstName} ${person.lastName}</div>
						<div class="when">
							${
								daysToBirthday === 0
									? `He/She is ${
											differenceInCalendarYears(new Date(), birthdayDate) + 1
									  }</b> today`
									: `Turns <b>${
											differenceInCalendarYears(new Date(), birthdayDate) + 1
									  }</b> on the ${lightFormat(nextBirthDay, 'dd/MM')}`
							}
						</div>
					</section>
					<section class="days">
						${daysToBirthday === 0 ? `🎂🎂🎂` : `🎂 in ${daysToBirthday} days`}
					</section>
					<section class="icons">
						<button class="edit" data-id="${person.id}">
							${editSVG}
						</button>
						<button class="delete" data-id="${person.id}">
							${deleteSVG}
						</button>
					</section>
				</article>
	`;
		})
		.join('');

	if (personsFilteredAndSorted.length === 0) {
		html = `<p><i>Nobody matches that filter options.</p>`;
	}

	container.innerHTML = html;
}

// ***** UTILS FUNCTION for popup management ****

async function destroyPopup(popup) {
	popup.classList.remove('open');
	// wait for 1 second, to let the animation do its work
	await wait(1000);
	// remove it from the dom
	popup.remove();
	// remove it from the javascript memory
	popup = null;
}

// ***** DELETE PERSON FROM LIST *****

const deletePerson = async id => {
	const person = persons.find(person => person.id === id);
	const result = await deletePopup(person);
	if (result) {
		persons = persons.filter(person => person.id !== result.id);
		showPeople(persons);
		updateLocalStorage();
	}
};

const deletePopup = person => {
	return new Promise(async resolve => {
		// create the html form
		const popup = document.createElement('form');
		popup.classList.add('popup');
		popup.insertAdjacentHTML(
			'afterbegin',
			`<fieldset>
				<h5>Delete ${person.firstName} ${person.lastName} 🙈</h5>
				<p>Are you sure you want to delete this person from the list?</p>
				<button type="submit">Bye 👋 🗑</button>
            </fieldset>
		`
		);

		const skipButton = document.createElement('button');
		skipButton.type = 'button'; // so it doesn't submit
		skipButton.textContent = 'Cancel';
		skipButton.classList.add('cancel');
		popup.lastElementChild.appendChild(skipButton);
		skipButton.addEventListener(
			'click',
			() => {
				resolve(null);
				destroyPopup(popup);
			},
			{ once: true }
		);

		popup.addEventListener(
			'submit',
			e => {
				e.preventDefault();
				resolve(person);
				destroyPopup(popup);
			},
			{ once: true }
		);

		document.body.appendChild(popup);
		await wait(50);
		popup.classList.add('open');
	});
};

// ***** EDIT PERSONS FROM LIST *****

const editPerson = async id => {
	const person = persons.find(person => person.id === id);
	const result = await editPersonPopup(person);
	if (result) {
		showPeople(persons);
		updateLocalStorage();
	}
};

const editPersonPopup = person => {
	return new Promise(async resolve => {
		// create the html form
		const popup = document.createElement('form');
		popup.classList.add('popup');
		popup.insertAdjacentHTML(
			'afterbegin',
			`<fieldset>
				<h5>${person.birthday ? `${person.firstName + ' ' + person.lastName}` : 'Add somebody new 🤗'}</h5>
                <label>Last name</label>
				<input required type="text" name="lastName" placeholder="Person's last name" value="${
					person.lastName ? person.lastName : ''
				}"/>
                <label>First name</label>
				<input required type="text" name="firstName" placeholder="Person's first name" value="${
					person.firstName ? person.firstName : ''
				}"/>
                <label>Birthday</label>
				<input required type="date" name="birthday" value="${
					// https://stackoverflow.com/questions/14245339/pre-populating-date-input-field-with-javascript
					person.birthday ? new Date(person.birthday).toISOString().substring(0, 10) : ''
				}"/>
				<button type="submit">Submit</button>
            </fieldset>
		`
		);

		const skipButton = document.createElement('button');
		skipButton.type = 'button'; // so it doesn't submit
		skipButton.textContent = 'Cancel';
		skipButton.classList.add('cancel');
		popup.firstElementChild.appendChild(skipButton);
		skipButton.addEventListener(
			'click',
			() => {
				resolve(null);
				destroyPopup(popup);
			},
			{ once: true }
		);

		popup.addEventListener(
			'submit',
			e => {
				e.preventDefault();
				// popup.input.value;
				person.firstName = e.target.firstName.value;
				person.lastName = e.target.lastName.value;
				// use this date conversion to get a timestamp back (just like the birthday inside people.json)
				person.birthday = new Date(e.target.birthday.value).getTime();
				resolve(person);
				destroyPopup(popup);
			},
			{ once: true }
		);

		document.body.appendChild(popup);
		await wait(50);
		popup.classList.add('open');
	});
};

// ***** ADD PERSON TO LIST *****

const addPerson = async () => {
	const newPerson = {};
	const result = await editPersonPopup(newPerson);
	if (result) {
		result.id = Date.now().toString();
		result.picture = 'https://www.fillmurray.com/100/100';
		persons.push(result);
		showPeople(persons);
		updateLocalStorage();
	}
};

// EVENT DELEGATION FOR EVENTS ON LIST

const handleClick = e => {
	const deleteButton = e.target.closest('button.delete');
	if (deleteButton) {
		const idToDelete = deleteButton.dataset.id;
		deletePerson(idToDelete);
	}

	const editButton = e.target.closest('button.edit');
	if (editButton) {
		const idToEdit = editButton.dataset.id;
		editPerson(idToEdit);
	}

	const addButton = e.target.closest('button.add');
	if (addButton) {
		addPerson();
	}
};

document.body.addEventListener('click', handleClick);

// ***** LOCALSTORAGE FUNCTIONS *****

const initLocalStorage = () => {
	const stringFromLS = localStorage.getItem('persons');
	const lsItems = JSON.parse(stringFromLS);
	if (lsItems) {
		persons = lsItems;
	} else {
		// used fetch here. or peopleData, that was imported from the people.json
		persons = peopleData;
	}
	// launch a custom event,
	showPeople(persons);
	updateLocalStorage();
};

// we want to update the local storage each time we update, delete or add an attribute
const updateLocalStorage = () => {
	localStorage.setItem('persons', JSON.stringify(persons));
};

// STARTER FUNCTION FOR THE PROJET
initLocalStorage();

export const editSVG = `<svg
class="w-6 h-6"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
xmlns="http://www.w3.org/2000/svg"
>
<path
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
></path>
</svg>`;

export const deleteSVG = `<svg
class="w-6 h-6"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
xmlns="http://www.w3.org/2000/svg"
>
<path
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
></path>
</svg>`;
