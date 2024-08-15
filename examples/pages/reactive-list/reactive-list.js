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
let data = b.ob(createNumUsers(5))

b.body.build(({ div, button }) => [
  div.$button_wrapper(
    button.$insert(
      {
        onclick: () => {
          const numRows = parseInt(prompt('Number of rows: '))
          const where = parseInt(
            prompt(`Index of insert (Max: ${data.value.length}): `),
          )
          const toInsert = createNumUsers(numRows)
          const t0 = performance.now()
          data.insert(toInsert, where)
          const t1 = performance.now()
          console.log(`Call to doSomething took ${t1 - t0} milliseconds.`)
        },
      },
      'Insert',
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
