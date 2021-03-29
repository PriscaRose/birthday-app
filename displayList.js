import {
  differenceInCalendarDays,
  isPast,
  addYears,
  setYear,
  isToday,
  format
} from 'date-fns';

const getAge = (date1, date2) => {
  // This is a condition like if statement
  date2 = date2 || new Date();
  //Calculation
  const diff = date2.getTime() - date1.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function calculateDaysToBirhtday(personToCalculate) {
  const birthday = new Date(personToCalculate.birthday);
  const today = new Date();
  let nextBirthday = setYear(birthday, today.getFullYear())

  // if the date is already behind us, we add + 1 to the year
  if (isPast(nextBirthday)) {
    nextBirthday = addYears(nextBirthday, 1);
  }
  if (isToday(nextBirthday)) {
    return `<li class="items" id="${person.id}">
    <img class="image" src="${person.picture}" alt="">
    <div class="birthdaay-wrapper">
    <h2>Happy birthady <span class="birthday">${person.firstName}  ${person.lastName}<span></h2>
    <p class="person-ages-desc">You turn <span class="birthday">${ages}</span> years old today</p>
    </div>
    <div>
    <div class="btn--wrapper">
    <button class="edit" value="${person.id}">edit</button>
    <button class="delete" value="${person.id}">delete</button>
    </div>
    </div>
    </li>`;
  }

  const numberOfDays = differenceInCalendarDays(nextBirthday, today)
  return numberOfDays;
}

export const displayPerson = (people) => {
  //Display the date
  const sortedPeople = people.sort(function(person1, person2) {
    return calculateDaysToBirhtday(person1) - calculateDaysToBirhtday(person2)
  });
    // debugger;
     return sortedPeople.map(person => {
      const ages = getAge(new Date(person.birthday));

      const newbirthday = new Date(person.birthday);
      const today = new Date();
      let nextBirthday = setYear(newbirthday, today.getFullYear())
      const monthOfBirthday = format(new Date(nextBirthday), 'MMMM')
      let dayOfNextBirthday = nextBirthday.getDate();

      if (dayOfNextBirthday == 1 || dayOfNextBirthday == 21 || dayOfNextBirthday == 31) {
        dayOfNextBirthday += "st";
      }
      else if (dayOfNextBirthday == 2 || dayOfNextBirthday == 22) {
        dayOfNextBirthday += "nd";
      }
      else {
        dayOfNextBirthday += "th";
      }

      const numberOfDays = calculateDaysToBirhtday(person);

      //Generate html
      return `
      <li class="items" id="${person.id}">
      <div class="wrapper">
      <img class="image" src="${person.picture}" alt="image">
      <div class="name-wrapper">
      <span class="person-name">${person.firstName} ${person.lastName}</span>
      <p class="birth_date">Turns <span class="age">${ages}</span> on ${monthOfBirthday} ${dayOfNextBirthday}</p>
      </div>
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
    }).join('');
  };
