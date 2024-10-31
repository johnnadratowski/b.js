import b from '/b.js'
import { faker } from 'https://esm.sh/@faker-js/faker'

function createRandomUser() {
  return {
    _id: faker.string.uuid(),
    avatar: faker.image.avatar(),
    birthday: faker.date.birthdate(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    sex: faker.person.sexType(),
    subscriptionTier: faker.helpers.arrayElement(['free', 'basic', 'business']),
  }
}

const createNumUsers = (num) =>
  faker.helpers.multiple(createRandomUser, {
    count: num,
  })
let data = b.ob(createNumUsers(5), true)

function timeIt(name, cb) {
  return (...args) => {
    const t0 = performance.now()
    const ret = cb.apply(this, args)
    const t1 = performance.now()
    console.log(`Call to ${name} took ${t1 - t0} milliseconds.`)
    return ret
  }
}

const insertUsersWhere = timeIt('name', (numRows, where) => {
  const toInsert = createNumUsers(numRows)
  data.insert(toInsert, where)
})

const insertUsers = (numRows) => insertUsersWhere(numRows, 0)
const insertUsers1000 = () => insertUsers(1000)
const insertUsers10000 = () => insertUsers(10000)

const removeUsersWhere = timeIt('remove', (numRows, where) => {
  data.splice(where, numRows)
})

const splice = timeIt('splice', (where, toDelete, numRows) => {
  data.splice(where, toDelete, numRows)
})

const removeUsers = (numRows) => removeUsersWhere(numRows, 0)
const removeUsers1000 = () => removeUsers(1000)
const removeUsers10000 = () => removeUsers(10000)

b.body.build(({ div, button }) => [
  div.$button_wrapper(
    button.$insert(
      {
        onclick: () => {
          const numRows = parseInt(prompt('Number of rows: '))
          const where = parseInt(
            prompt(`Index of insert (Max: ${data.value.length}): `),
          )
          insertUsersWhere(numRows, where)
        },
      },
      'Insert',
    ),
    button['#insert-1000'](
      {
        onclick: insertUsers1000,
      },
      'Insert 1000',
    ),
    button['#insert-10000'](
      {
        onclick: insertUsers10000,
      },
      'Insert 10000',
    ),
    button.$remove(
      {
        onclick: () => {
          const numRows = parseInt(prompt('Number of rows: '))
          const where = parseInt(
            prompt(`Index of remove (Max: ${data.value.length - numRows}): `),
          )
          removeUsersWhere(numRows, where)
        },
      },
      'Remove',
    ),
    button['#remove-1000'](
      {
        onclick: removeUsers1000,
      },
      'Remove 1000',
    ),
    button['#remove-10000'](
      {
        onclick: removeUsers10000,
      },
      'Remove 10000',
    ),
    button['#splice'](
      {
        onclick: () => {
          const where = parseInt(
            prompt(`Index of splice (Max: ${data.value.length - numRows}): `),
          )
          const toDelete = parseInt(
            prompt('Number of rows to delete at index: '),
          )
          const numRows = parseInt(prompt('Number of rows: '))
          splice(where, toDelete, numRows)
        },
      },
      'Splice',
    ),
  ),
  div.$wrapper(
    b.for(data, (x) =>
      div.user(
        div.name(`${x.firstName} ${x.lastName}`),
        div.sex(x.sex),
        div.birthday(x.birthday.toDateString()),
      ),
    ),
  ),
])
